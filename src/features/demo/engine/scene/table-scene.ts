import * as THREE from 'three';
import type { AvatarStyle } from '../meta/bot-roster';
import { cardKey, type Card } from '../poker/cards';
import { Avatar, type AvatarMood } from './avatar-factory';
import { ChipSystem, type ChipSpot } from './chip-system';
import { addTableLighting, buildChair, buildLounge, buildPokerTable, createGlowSprite } from './lounge-builder';
import { createCardBackTexture, createCardFaceTexture, createDealerButtonTexture } from './procedural-textures';
import {
  BOARD_SPACING,
  BOARD_Z,
  CARD_H,
  CARD_W,
  DECK_POS,
  MUCK_POS,
  POT_POS,
  seatPoint,
  yawToCentre,
} from './table-layout';
import { easeInOutCubic, easeOutBack, easeOutCubic, type Tweens } from './tweens';

const FACE_UP = -Math.PI / 2;
const FACE_DOWN = Math.PI / 2;
const HERO_TILT = -Math.PI / 2 + 0.95;

/** Two-sided card: front plane gets its face texture once the card is known. */
class CardMesh {
  readonly root = new THREE.Group();
  card: Card | null = null;
  private readonly front: THREE.Mesh;

  constructor(geometry: THREE.PlaneGeometry, back: THREE.Material, blank: THREE.Material) {
    this.root.rotation.order = 'YXZ';
    this.front = new THREE.Mesh(geometry, blank);
    this.front.position.z = 0.002;
    const backMesh = new THREE.Mesh(geometry, back);
    backMesh.rotation.y = Math.PI;
    backMesh.position.z = -0.002;
    this.front.receiveShadow = true;
    backMesh.receiveShadow = true;
    this.front.castShadow = true;
    this.root.add(this.front, backMesh);
  }

  setFace(card: Card, material: THREE.Material): void {
    this.card = card;
    this.front.material = material;
  }
}

type SeatVisual = {
  slot: number;
  avatar: Avatar | null;
  chair: THREE.Group | null;
  cards: CardMesh[];
};

export type ViewMode = 'lobby' | 'table';

export class TableScene {
  private readonly chips = new ChipSystem();
  private readonly cardGeometry = new THREE.PlaneGeometry(CARD_W, CARD_H);
  private readonly backMaterial: THREE.MeshStandardMaterial;
  private readonly blankMaterial: THREE.MeshStandardMaterial;
  private readonly faceMaterials = new Map<number, THREE.MeshStandardMaterial>();
  private readonly cardPool: CardMesh[] = [];
  private readonly seats: SeatVisual[] = [];
  private readonly seatGroup = new THREE.Group();
  private readonly board: CardMesh[] = [];
  private readonly dealerButton: THREE.Mesh;
  private readonly actorRing: THREE.Mesh;
  private readonly burst: THREE.Points;
  private readonly burstVelocities: Float32Array;
  private burstAge = Infinity;
  private actorSlot = -1;
  private readonly loungeAnimate: (elapsed: number) => void;
  private readonly lamp: THREE.Object3D | undefined;
  private view: ViewMode = 'lobby';
  private readonly camPos = new THREE.Vector3();
  private readonly camLook = new THREE.Vector3();
  private readonly desiredPos = new THREE.Vector3();
  private readonly desiredLook = new THREE.Vector3();
  private cameraSnapped = false;

  constructor(
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.PerspectiveCamera,
    private readonly tweens: Tweens,
  ) {
    scene.background = new THREE.Color('#0d0319');
    scene.fog = new THREE.Fog('#0d0319', 11, 30);
    addTableLighting(scene);
    const lounge = buildLounge();
    this.loungeAnimate = lounge.animated;
    this.lamp = lounge.root.getObjectByName('pendantLamp');
    scene.add(lounge.root, buildPokerTable(), this.seatGroup, this.chips.root);

    const back = createCardBackTexture();
    this.backMaterial = new THREE.MeshStandardMaterial({ map: back, roughness: 0.5, alphaTest: 0.5 });
    this.blankMaterial = this.backMaterial;

    this.dealerButton = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 32), [
      new THREE.MeshStandardMaterial({ color: '#e5c457', metalness: 0.8, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ map: createDealerButtonTexture(), roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ color: '#fbf6ff' }),
    ]);
    this.dealerButton.castShadow = true;
    this.dealerButton.visible = false;
    this.dealerButton.name = 'dealerButton';
    scene.add(this.dealerButton);

    this.actorRing = new THREE.Mesh(
      new THREE.RingGeometry(0.42, 0.5, 48),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#fface7').multiplyScalar(1.3), transparent: true, opacity: 0.8, toneMapped: false, depthWrite: false }),
    );
    this.actorRing.rotation.x = -Math.PI / 2;
    this.actorRing.scale.set(1.3, 0.85, 1);
    this.actorRing.visible = false;
    scene.add(this.actorRing);

    const burstCount = 70;
    this.burstVelocities = new Float32Array(burstCount * 3);
    const burstGeometry = new THREE.BufferGeometry();
    burstGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(burstCount * 3), 3));
    this.burst = new THREE.Points(
      burstGeometry,
      new THREE.PointsMaterial({ map: createGlowSprite(), color: '#ffe08a', size: 0.12, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    this.burst.visible = false;
    this.burst.frustumCulled = false;
    scene.add(this.burst);
  }

  /** Seat avatars for a new match. `styles[i]` null = the human seat (no avatar, camera sits there). */
  setupPlayers(styles: (AvatarStyle | null)[], slots: number[]): void {
    this.clearHand();
    for (const seat of this.seats) {
      if (seat.avatar) this.seatGroup.remove(seat.avatar.root);
      if (seat.chair) this.seatGroup.remove(seat.chair);
    }
    this.seats.length = 0;
    styles.forEach((style, i) => {
      const slot = slots[i];
      const seatPos = seatPoint(slot, 0.95, 0, -0.05);
      const yaw = yawToCentre(seatPos);
      let avatar: Avatar | null = null;
      let chair: THREE.Group | null = null;
      if (style) {
        avatar = new Avatar(style, i + 1);
        avatar.root.position.copy(seatPos);
        avatar.root.rotation.y = yaw;
        this.seatGroup.add(avatar.root);
        chair = buildChair();
        chair.position.copy(seatPos);
        chair.rotation.y = yaw;
        this.seatGroup.add(chair);
      }
      this.seats.push({ slot, avatar, chair, cards: [] });
    });
  }

  setView(view: ViewMode): void {
    this.view = view;
  }

  clearHand(): void {
    for (const seat of this.seats) {
      for (const card of seat.cards) this.releaseCard(card);
      seat.cards = [];
    }
    for (const card of this.board) this.releaseCard(card);
    this.board.length = 0;
    this.setActor(-1);
  }

  moveDealer(seat: number): void {
    const target = seatPoint(this.seats[seat].slot, -0.78, -0.48, 0.02);
    if (!this.dealerButton.visible) {
      this.dealerButton.visible = true;
      this.dealerButton.position.copy(target);
      return;
    }
    const start = this.dealerButton.position.clone();
    void this.tweens.to(0.5, (k) => {
      this.dealerButton.position.lerpVectors(start, target, k);
      this.dealerButton.position.y = 0.02 + Math.sin(k * Math.PI) * 0.15;
    }, easeInOutCubic);
  }

  async dealHole(order: number[], heroSeat: number, heroCards: Card[]): Promise<void> {
    for (let round = 0; round < 2; round += 1) {
      for (const seat of order) {
        const mesh = this.takeCard();
        this.seats[seat].cards.push(mesh);
        const isHero = seat === heroSeat;
        if (isHero) mesh.setFace(heroCards[round], this.faceMaterial(heroCards[round]));
        void this.flyCard(mesh, this.holeTarget(seat, round), FACE_DOWN, 0.32);
        await this.tweens.wait(0.09);
      }
    }
    await this.tweens.wait(0.3);
    // Hero peeks: lift and tilt both cards toward the camera.
    const hero = this.seats[heroSeat];
    await Promise.all(
      hero.cards.map((mesh, i) => {
        const from = mesh.root.position.clone();
        const to = this.holeTarget(heroSeat, i, true);
        const startPitch = mesh.root.rotation.x;
        return this.tweens.to(0.42, (k) => {
          mesh.root.position.lerpVectors(from, to.position, k);
          mesh.root.position.y += Math.sin(k * Math.PI) * 0.18;
          mesh.root.rotation.x = startPitch + (HERO_TILT - startPitch) * k;
          mesh.root.rotation.z = to.roll * k;
        }, easeOutBack);
      }),
    );
  }

  async revealHand(seat: number, cards: Card[]): Promise<void> {
    const visual = this.seats[seat];
    if (!visual || visual.avatar === null) return; // hero cards are already face up
    await Promise.all(
      visual.cards.map((mesh, i) => {
        mesh.setFace(cards[i], this.faceMaterial(cards[i]));
        const startPos = mesh.root.position.clone();
        return this.tweens.to(0.45, (k) => {
          mesh.root.rotation.x = FACE_DOWN + (FACE_UP - FACE_DOWN) * k;
          mesh.root.position.copy(startPos);
          mesh.root.position.y = startPos.y + Math.sin(k * Math.PI) * 0.2;
        }, easeInOutCubic);
      }),
    );
  }

  async dealBoard(cards: Card[]): Promise<void> {
    const flips: Promise<void>[] = [];
    for (const card of cards) {
      const index = this.board.length;
      const mesh = this.takeCard();
      mesh.setFace(card, this.faceMaterial(card));
      this.board.push(mesh);
      const target = new THREE.Vector3((index - 2) * BOARD_SPACING, 0.006, BOARD_Z);
      await this.flyCard(mesh, { position: target, yaw: 0, roll: 0 }, FACE_DOWN, 0.28);
      flips.push(
        this.tweens.to(0.34, (k) => {
          mesh.root.rotation.x = FACE_DOWN + (FACE_UP - FACE_DOWN) * k;
          mesh.root.position.y = 0.006 + Math.sin(k * Math.PI) * 0.16;
        }, easeInOutCubic),
      );
      await this.tweens.wait(0.08);
    }
    await Promise.all(flips);
  }

  async foldCards(seat: number): Promise<void> {
    const visual = this.seats[seat];
    if (!visual) return;
    const cards = visual.cards;
    visual.cards = [];
    await Promise.all(
      cards.map((mesh, i) => {
        const from = mesh.root.position.clone();
        const fromPitch = mesh.root.rotation.x;
        const to = MUCK_POS.clone().add(new THREE.Vector3(i * 0.03, 0.004 * i, 0));
        return this.tweens.to(0.36, (k) => {
          mesh.root.position.lerpVectors(from, to, k);
          mesh.root.position.y += Math.sin(k * Math.PI) * 0.12;
          mesh.root.rotation.x = fromPitch + (FACE_DOWN - fromPitch) * k;
          mesh.root.rotation.z *= 1 - k;
        }, easeInOutCubic);
      }),
    );
    for (const mesh of cards) this.releaseCard(mesh);
  }

  /** Lift the five winning cards so the payoff reads at a glance. */
  highlightCards(cards: Card[]): void {
    const keys = new Set(cards.map(cardKey));
    const all = [...this.board, ...this.seats.flatMap((s) => s.cards)];
    for (const mesh of all) {
      if (!mesh.card || !keys.has(cardKey(mesh.card))) continue;
      const base = mesh.root.position.y;
      void this.tweens.to(0.3, (k) => {
        mesh.root.position.y = base + 0.07 * k;
      }, easeOutCubic);
    }
  }

  layoutChips(stacks: number[], bets: number[], pot: number): void {
    const spots: ChipSpot[] = [];
    this.seats.forEach((_, i) => {
      const stackPos = this.stackPos(i);
      spots.push({ position: stackPos, yaw: yawToCentre(stackPos), amount: stacks[i] ?? 0 });
      const betPos = this.betPos(i);
      spots.push({ position: betPos, yaw: yawToCentre(betPos), amount: bets[i] ?? 0 });
    });
    spots.push({ position: POT_POS, yaw: 0, amount: pot });
    this.chips.layout(spots);
  }

  flyBet(seat: number, amount: number): Promise<void> {
    return this.chips.fly(this.tweens, this.stackPos(seat), this.betPos(seat), amount);
  }

  async flyCollect(bets: number[]): Promise<void> {
    await Promise.all(bets.map((amount, seat) => (amount > 0 ? this.chips.fly(this.tweens, this.betPos(seat), POT_POS, amount, 0.42) : Promise.resolve())));
  }

  flyAward(seat: number, amount: number): Promise<void> {
    return this.chips.fly(this.tweens, POT_POS, this.stackPos(seat), amount, 0.6);
  }

  setActor(seat: number): void {
    this.actorSlot = seat >= 0 && this.seats[seat] ? this.seats[seat].slot : -1;
    this.actorRing.visible = this.actorSlot >= 0;
    if (this.actorSlot >= 0) this.actorRing.position.copy(seatPoint(this.actorSlot, -0.62, 0, 0.004));
  }

  setMood(seat: number, mood: AvatarMood): void {
    this.seats[seat]?.avatar?.setMood(mood);
  }

  celebrate(seat: number): void {
    this.setMood(seat, 'celebrate');
    const origin = this.seats[seat] ? seatPoint(this.seats[seat].slot, -0.4, 0, 0.3) : POT_POS;
    const positions = this.burst.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i += 1) {
      positions.setXYZ(i, origin.x, origin.y, origin.z);
      const a = i * 2.399963;
      const up = 0.35 + ((i * 0.618) % 1) * 0.9;
      const speed = 0.6 + ((i * 0.381) % 1) * 1.2;
      this.burstVelocities.set([Math.cos(a) * speed, up * 2.2, Math.sin(a) * speed], i * 3);
    }
    positions.needsUpdate = true;
    this.burstAge = 0;
    this.burst.visible = true;
  }

  /** World points the DOM overlay projects to place seat plates and the pot label. */
  labelAnchor(seat: number): THREE.Vector3 {
    const visual = this.seats[seat];
    if (!visual) return new THREE.Vector3();
    if (!visual.avatar) return seatPoint(visual.slot, 0.35, 0, 0.1);
    // On the rail in front of the avatar: always on screen, never over the felt.
    return seatPoint(visual.slot, 0.3, 0, 0.2);
  }

  potAnchor(): THREE.Vector3 {
    return POT_POS.clone().add(new THREE.Vector3(0, 0.05, -0.28));
  }

  slotOf(seat: number): number {
    return this.seats[seat]?.slot ?? -1;
  }

  update(delta: number, elapsed: number, reducedMotion: boolean): void {
    const t = reducedMotion ? 0 : elapsed;
    this.loungeAnimate(t);
    for (const seat of this.seats) seat.avatar?.update(reducedMotion ? 0 : delta, t);

    if (this.actorRing.visible) {
      const pulse = 0.55 + Math.sin(t * 5) * 0.25;
      (this.actorRing.material as THREE.MeshBasicMaterial).opacity = pulse;
    }

    if (this.burst.visible) {
      this.burstAge += delta;
      const positions = this.burst.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < positions.count; i += 1) {
        this.burstVelocities[i * 3 + 1] -= 3.2 * delta;
        positions.setXYZ(
          i,
          positions.getX(i) + this.burstVelocities[i * 3] * delta,
          Math.max(0.02, positions.getY(i) + this.burstVelocities[i * 3 + 1] * delta),
          positions.getZ(i) + this.burstVelocities[i * 3 + 2] * delta,
        );
      }
      positions.needsUpdate = true;
      (this.burst.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - this.burstAge / 1.4);
      if (this.burstAge > 1.4) this.burst.visible = false;
    }

    this.updateCamera(delta, t);
  }

  private updateCamera(delta: number, t: number): void {
    const aspect = this.camera.aspect;
    const portrait = aspect < 0.9;
    if (this.view === 'lobby') {
      const a = t * 0.06 + 0.6;
      const radius = portrait ? 10.5 : 8.2;
      this.desiredPos.set(Math.sin(a) * radius, portrait ? 5.4 : 4.1, Math.cos(a) * radius);
      this.desiredLook.set(0, -0.2, 0);
      this.camera.fov = portrait ? 58 : 42;
    } else if (portrait) {
      // Narrow screens: pull back and widen so the side avatars stay in frame.
      // Same pitch as desktop (keeps the lamp out of view), just further back.
      this.desiredPos.set(0, 7.4, 9.6);
      this.desiredLook.set(0, -0.9, 0.1);
      this.camera.fov = 62;
    } else {
      const wide = Math.min(1, Math.max(0, (aspect - 1.2) / 0.8));
      this.desiredPos.set(0, 4.9 - wide * 0.5, 5.6 - wide * 0.4);
      this.desiredLook.set(0, -0.55, 0.15);
      this.camera.fov = 44 - wide * 4;
    }
    // The portrait table camera sits above the pendant lamp, whose shade would hide the far seat.
    if (this.lamp) this.lamp.visible = !(portrait && this.view === 'table');
    if (!this.cameraSnapped) {
      this.camPos.copy(this.desiredPos);
      this.camLook.copy(this.desiredLook);
      this.cameraSnapped = true;
    }
    const k = 1 - Math.exp(-delta * 2.6);
    this.camPos.lerp(this.desiredPos, k);
    this.camLook.lerp(this.desiredLook, k);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
    this.camera.updateProjectionMatrix();
  }

  private holeTarget(seat: number, index: number, heroPeek = false): { position: THREE.Vector3; yaw: number; roll: number } {
    const slot = this.seats[seat].slot;
    if (heroPeek) {
      const base = seatPoint(slot, -0.5, 0, 0.16);
      return {
        position: base.add(new THREE.Vector3((index - 0.5) * 0.3, index * 0.004, 0)),
        yaw: yawToCentre(base) + Math.PI,
        roll: (0.5 - index) * 0.12,
      };
    }
    const position = seatPoint(slot, -0.55, (index - 0.5) * 0.2, 0.005 + index * 0.003);
    return { position, yaw: yawToCentre(position) + Math.PI, roll: 0 };
  }

  private stackPos(seat: number): THREE.Vector3 {
    const slot = this.seats[seat]?.slot ?? 0;
    return seatPoint(slot, -0.42, 0.62, 0);
  }

  private betPos(seat: number): THREE.Vector3 {
    const slot = this.seats[seat]?.slot ?? 0;
    return seatPoint(slot, -1.0, 0.2, 0);
  }

  private flyCard(mesh: CardMesh, target: { position: THREE.Vector3; yaw: number; roll: number }, pitch: number, duration: number): Promise<void> {
    const from = DECK_POS.clone();
    mesh.root.visible = true;
    mesh.root.position.copy(from);
    mesh.root.rotation.set(FACE_DOWN, 0, 0);
    const startYaw = 0;
    return this.tweens.to(duration, (k) => {
      mesh.root.position.lerpVectors(from, target.position, k);
      mesh.root.position.y += Math.sin(k * Math.PI) * 0.22;
      mesh.root.rotation.y = startYaw + (target.yaw - startYaw) * k + (1 - k) * 2.4;
      mesh.root.rotation.x = pitch;
      mesh.root.rotation.z = target.roll * k;
    }, easeOutCubic);
  }

  private faceMaterial(card: Card): THREE.MeshStandardMaterial {
    const key = cardKey(card);
    let material = this.faceMaterials.get(key);
    if (!material) {
      material = new THREE.MeshStandardMaterial({ map: createCardFaceTexture(card), roughness: 0.42, alphaTest: 0.5 });
      this.faceMaterials.set(key, material);
    }
    return material;
  }

  private takeCard(): CardMesh {
    const mesh = this.cardPool.pop() ?? new CardMesh(this.cardGeometry, this.backMaterial, this.blankMaterial);
    mesh.card = null;
    mesh.root.visible = false;
    this.scene.add(mesh.root);
    return mesh;
  }

  private releaseCard(mesh: CardMesh): void {
    mesh.card = null;
    mesh.root.visible = false;
    mesh.root.rotation.set(0, 0, 0);
    this.scene.remove(mesh.root);
    this.cardPool.push(mesh);
  }
}
