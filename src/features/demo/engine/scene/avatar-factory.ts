import * as THREE from 'three';
import type { AvatarStyle } from '../meta/bot-roster';

export type AvatarMood = 'idle' | 'thinking' | 'folded' | 'celebrate' | 'allin';

/**
 * Stylised seated bot: torso, head with eyes/brows, arms resting on the rail,
 * a signature accessory. Named pivots let the table animate posture by mood.
 * Local space faces +z (toward the table centre after placement).
 */
export class Avatar {
  readonly root = new THREE.Group();
  private readonly torso = new THREE.Group();
  private readonly head = new THREE.Group();
  private readonly leftArm = new THREE.Group();
  private readonly rightArm = new THREE.Group();
  private readonly phase: number;
  private mood: AvatarMood = 'idle';
  private moodTime = 0;
  private lean = 0;

  constructor(style: AvatarStyle, seed: number) {
    this.phase = seed * 1.7;
    const body = new THREE.MeshStandardMaterial({ color: style.body, roughness: 0.62 });
    const skin = new THREE.MeshStandardMaterial({ color: style.skin, roughness: 0.7 });
    const accent = new THREE.MeshStandardMaterial({ color: style.accent, roughness: 0.35, metalness: 0.4 });
    const dark = new THREE.MeshStandardMaterial({ color: '#0a0216', roughness: 0.4 });

    this.root.name = 'avatar';
    this.torso.name = 'torso';
    this.torso.position.y = -0.1;
    this.root.add(this.torso);

    const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.42, 6, 18), body);
    chest.scale.set(1.15, 1, 0.78);
    chest.castShadow = true;
    this.torso.add(chest);

    const lapelGeo = new THREE.BoxGeometry(0.06, 0.42, 0.04);
    for (const side of [-1, 1]) {
      const lapel = new THREE.Mesh(lapelGeo, accent);
      lapel.position.set(side * 0.12, 0.08, 0.27);
      lapel.rotation.z = side * 0.35;
      this.torso.add(lapel);
    }
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.045, 8, 24), accent);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.44;
    this.torso.add(collar);

    this.head.name = 'head';
    this.head.position.y = 0.72;
    this.torso.add(this.head);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.27, 28, 20), skin);
    skull.scale.set(1, 1.08, 0.96);
    skull.castShadow = true;
    this.head.add(skull);
    const eyeGeo = new THREE.SphereGeometry(0.035, 10, 8);
    const browGeo = new THREE.BoxGeometry(0.09, 0.018, 0.02);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, dark);
      eye.position.set(side * 0.09, 0.03, 0.245);
      this.head.add(eye);
      const brow = new THREE.Mesh(browGeo, dark);
      brow.position.set(side * 0.095, 0.1, 0.25);
      brow.rotation.z = side * -0.15;
      this.head.add(brow);
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), skin);
      ear.position.set(side * 0.265, 0, 0);
      this.head.add(ear);
    }
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 16, Math.PI), dark);
    smile.rotation.z = Math.PI;
    smile.position.set(0, -0.09, 0.245);
    this.head.add(smile);

    this.addAccessory(style, accent, dark);

    for (const [arm, side] of [
      [this.leftArm, -1],
      [this.rightArm, 1],
    ] as const) {
      arm.position.set(side * 0.38, 0.32, 0);
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.42, 4, 10), body);
      upper.position.set(0, -0.12, 0.2);
      upper.rotation.x = 1.15;
      upper.castShadow = true;
      arm.add(upper);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), skin);
      hand.position.set(-side * 0.04, -0.28, 0.48);
      arm.add(hand);
      this.torso.add(arm);
    }
  }

  setMood(mood: AvatarMood): void {
    if (mood === this.mood) return;
    this.mood = mood;
    this.moodTime = 0;
  }

  update(delta: number, elapsed: number): void {
    this.moodTime += delta;
    const t = elapsed + this.phase;
    const breathe = Math.sin(t * 1.6) * 0.012;
    this.torso.scale.set(1 + breathe, 1 - breathe * 0.5, 1 + breathe);

    const targetLean = this.mood === 'thinking' || this.mood === 'allin' ? 0.16 : this.mood === 'folded' ? -0.14 : 0;
    this.lean += (targetLean - this.lean) * Math.min(1, delta * 5);
    this.torso.rotation.x = this.lean;

    this.head.rotation.y = Math.sin(t * 0.45) * 0.22;
    this.head.rotation.z = this.mood === 'thinking' ? Math.sin(t * 2.2) * 0.06 + 0.08 : 0;

    if (this.mood === 'celebrate') {
      const lift = Math.min(1, this.moodTime * 4);
      const pump = Math.abs(Math.sin(this.moodTime * 7)) * 0.25;
      this.leftArm.rotation.x = -lift * (2.1 + pump);
      this.rightArm.rotation.x = -lift * (2.1 + pump);
      this.torso.position.y = -0.1 + Math.abs(Math.sin(this.moodTime * 7)) * 0.05;
    } else {
      this.leftArm.rotation.x += (0 - this.leftArm.rotation.x) * Math.min(1, delta * 6);
      this.rightArm.rotation.x += (0 - this.rightArm.rotation.x) * Math.min(1, delta * 6);
      this.torso.position.y += (-0.1 - this.torso.position.y) * Math.min(1, delta * 6);
    }
  }

  private addAccessory(style: AvatarStyle, accent: THREE.Material, dark: THREE.Material): void {
    switch (style.accessory) {
      case 'tophat': {
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.03, 28), dark);
        brim.position.y = 0.24;
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.34, 28), dark);
        crown.position.y = 0.42;
        const band = new THREE.Mesh(new THREE.CylinderGeometry(0.223, 0.223, 0.06, 28), accent);
        band.position.y = 0.29;
        this.head.add(brim, crown, band);
        break;
      }
      case 'shades': {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.03), dark);
        frame.position.set(0, 0.04, 0.26);
        this.head.add(frame);
        for (const side of [-1, 1]) {
          const lens = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 0.03), accent);
          lens.position.set(side * 0.1, 0.03, 0.272);
          this.head.add(lens);
        }
        const bun = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), dark);
        bun.position.set(0, 0.2, -0.18);
        this.head.add(bun);
        break;
      }
      case 'crown': {
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.1, 10, 1, true), accent);
        ring.position.y = 0.3;
        this.head.add(ring);
        for (let i = 0; i < 5; i += 1) {
          const a = (i / 5) * Math.PI * 2;
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), accent);
          spike.position.set(Math.cos(a) * 0.2, 0.4, Math.sin(a) * 0.2);
          this.head.add(spike);
        }
        break;
      }
      case 'headphones': {
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 8, 24, Math.PI), dark);
        band.position.y = 0.02;
        this.head.add(band);
        for (const side of [-1, 1]) {
          const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), accent);
          cup.rotation.z = Math.PI / 2;
          cup.position.set(side * 0.28, 0, 0);
          this.head.add(cup);
        }
        break;
      }
      case 'beanie': {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.285, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), accent);
        cap.position.y = 0.04;
        const fold = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.04, 8, 28), accent);
        fold.rotation.x = Math.PI / 2;
        fold.position.y = 0.06;
        const pom = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), dark);
        pom.position.y = 0.33;
        this.head.add(cap, fold, pom);
        break;
      }
      case 'visor': {
        const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.025, 24, 1, false, -Math.PI / 2, Math.PI), accent);
        visor.position.set(0, 0.16, 0.08);
        visor.rotation.x = 0.15;
        const strap = new THREE.Mesh(new THREE.TorusGeometry(0.275, 0.02, 6, 28), accent);
        strap.rotation.x = Math.PI / 2;
        strap.position.y = 0.15;
        this.head.add(visor, strap);
        break;
      }
    }
  }
}
