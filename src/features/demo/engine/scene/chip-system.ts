import * as THREE from 'three';
import { createChipSideTexture, createChipTopTexture } from './procedural-textures';
import { easeInOutCubic, type Tweens } from './tweens';

export const CHIP_RADIUS = 0.1;
export const CHIP_HEIGHT = 0.034;
const COLUMN_MAX = 10;
const SPOT_MAX_CHIPS = 40;
const INSTANCE_CAPACITY = 420;

type Denomination = { value: number; color: string; stripe: string; label: string };

const DENOMINATIONS: Denomination[] = [
  { value: 1000, color: '#e5c457', stripe: '#3c2f00', label: '1K' },
  { value: 500, color: '#b0129b', stripe: '#ffd0ee', label: '500' },
  { value: 100, color: '#1b0b2d', stripe: '#e5c457', label: '100' },
  { value: 25, color: '#2f5fd0', stripe: '#e8f0ff', label: '25' },
  { value: 5, color: '#d63a4a', stripe: '#fff1f2', label: '5' },
  { value: 1, color: '#efe6f5', stripe: '#6c2399', label: '1' },
];

/** Greedy split into denominations, capped so huge stacks stay cheap to draw. */
export function chipBreakdown(amount: number): number[] {
  const counts = DENOMINATIONS.map(() => 0);
  let rest = Math.max(0, Math.floor(amount));
  DENOMINATIONS.forEach((d, i) => {
    counts[i] = Math.floor(rest / d.value);
    rest -= counts[i] * d.value;
  });
  let total = counts.reduce((a, b) => a + b, 0);
  // Trim the largest columns first, keeping every colour that is present.
  while (total > SPOT_MAX_CHIPS) {
    const i = counts.indexOf(Math.max(...counts));
    counts[i] -= 1;
    total -= 1;
  }
  return counts;
}

export type ChipSpot = { position: THREE.Vector3; yaw: number; amount: number };

/**
 * Static chip stacks drawn with one InstancedMesh per denomination; flying
 * chips during bets/collects use a small pool of plain meshes.
 */
export class ChipSystem {
  readonly root = new THREE.Group();
  private readonly geometry = new THREE.CylinderGeometry(CHIP_RADIUS, CHIP_RADIUS, CHIP_HEIGHT, 28);
  private readonly materials: THREE.Material[][];
  private readonly stacks: THREE.InstancedMesh[];
  private readonly flyPool: THREE.Mesh[] = [];
  private readonly matrix = new THREE.Matrix4();
  private readonly quaternion = new THREE.Quaternion();
  private readonly euler = new THREE.Euler();
  private readonly scale = new THREE.Vector3(1, 1, 1);
  private readonly pos = new THREE.Vector3();

  constructor() {
    this.root.name = 'chips';
    this.materials = DENOMINATIONS.map((d) => {
      const side = new THREE.MeshStandardMaterial({ map: createChipSideTexture(d.color, d.stripe), roughness: 0.4, metalness: 0.1 });
      const top = new THREE.MeshStandardMaterial({ map: createChipTopTexture(d.color, d.stripe, d.label), roughness: 0.35, metalness: 0.1 });
      return [side, top, top];
    });
    this.stacks = this.materials.map((mats) => {
      const mesh = new THREE.InstancedMesh(this.geometry, mats, INSTANCE_CAPACITY);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.count = 0;
      mesh.frustumCulled = false;
      this.root.add(mesh);
      return mesh;
    });
  }

  /** Rebuild every resting stack (player stacks, bets, pot) from the authoritative amounts. */
  layout(spots: ChipSpot[]): void {
    const counts = this.stacks.map(() => 0);
    for (const spot of spots) {
      if (spot.amount <= 0) continue;
      const breakdown = chipBreakdown(spot.amount);
      let column = 0;
      const columns = breakdown.reduce((n, c) => n + Math.ceil(c / COLUMN_MAX), 0);
      const offset = ((columns - 1) * CHIP_RADIUS * 2.15) / 2;
      breakdown.forEach((count, denom) => {
        for (let placed = 0; placed < count; placed += COLUMN_MAX) {
          const height = Math.min(COLUMN_MAX, count - placed);
          const lateral = column * CHIP_RADIUS * 2.15 - offset;
          const dx = Math.cos(spot.yaw) * lateral;
          const dz = -Math.sin(spot.yaw) * lateral;
          for (let h = 0; h < height; h += 1) {
            const mesh = this.stacks[denom];
            const index = counts[denom]++;
            if (index >= INSTANCE_CAPACITY) continue;
            // Slight jitter so stacks look hand-placed, deterministic per slot.
            const jitter = Math.sin(index * 12.9898 + h * 78.233) * 0.006;
            this.pos.set(spot.position.x + dx + jitter, spot.position.y + CHIP_HEIGHT / 2 + h * CHIP_HEIGHT, spot.position.z + dz - jitter);
            this.euler.set(0, spot.yaw + index * 0.7, 0);
            this.quaternion.setFromEuler(this.euler);
            this.matrix.compose(this.pos, this.quaternion, this.scale);
            mesh.setMatrixAt(index, this.matrix);
          }
          column += 1;
        }
      });
    }
    this.stacks.forEach((mesh, denom) => {
      mesh.count = Math.min(INSTANCE_CAPACITY, counts[denom]);
      mesh.instanceMatrix.needsUpdate = true;
    });
  }

  /** Throw a small handful of chips representing `amount` along an arc. */
  async fly(tweens: Tweens, from: THREE.Vector3, to: THREE.Vector3, amount: number, duration = 0.38): Promise<void> {
    const breakdown = chipBreakdown(amount);
    const chips: THREE.Mesh[] = [];
    breakdown.forEach((count, denom) => {
      for (let i = 0; i < Math.min(count, 2) && chips.length < 6; i += 1) chips.push(this.takeFlyChip(denom));
    });
    if (!chips.length) return;
    const starts = chips.map((_, i) => from.clone().add(new THREE.Vector3(0, i * CHIP_HEIGHT, 0)));
    await tweens.to(
      duration,
      (k) => {
        chips.forEach((chip, i) => {
          const local = Math.min(1, Math.max(0, k * 1.25 - i * 0.05));
          chip.position.lerpVectors(starts[i], to, local);
          chip.position.y += Math.sin(local * Math.PI) * 0.35 + i * CHIP_HEIGHT * (1 - local);
          chip.rotation.x = local * Math.PI * 2;
        });
      },
      easeInOutCubic,
    );
    for (const chip of chips) chip.visible = false;
  }

  private takeFlyChip(denom: number): THREE.Mesh {
    let chip = this.flyPool.find((c) => !c.visible);
    if (!chip) {
      chip = new THREE.Mesh(this.geometry, this.materials[denom]);
      chip.castShadow = true;
      this.flyPool.push(chip);
      this.root.add(chip);
    }
    chip.material = this.materials[denom];
    chip.visible = true;
    chip.rotation.set(0, 0, 0);
    return chip;
  }
}
