import * as THREE from 'three';

/** World-space layout of the table, shared by geometry, textures and animation targets. */
export const FELT_RX = 3.1;
export const FELT_RZ = 1.75;
export const RAIL_RADIUS = 0.2;
export const CARD_W = 0.36;
export const CARD_H = 0.5;
export const BOARD_Z = 0.15;
export const BOARD_SPACING = 0.42;
export const POT_POS = new THREE.Vector3(0, 0, -0.42);
export const DECK_POS = new THREE.Vector3(0.95, 0.02, -0.55);
export const MUCK_POS = new THREE.Vector3(-0.95, 0.01, -0.5);
export const SLOT_COUNT = 6;

/** Angle of seat slot k; slot 0 is the hero at the near edge, then clockwise seen from above. */
export function slotAngle(slot: number): number {
  return Math.PI / 2 + (slot * Math.PI * 2) / SLOT_COUNT;
}

/** Point on the felt ellipse grown by `inset` (negative = toward centre), with tangential shift. */
export function seatPoint(slot: number, inset: number, tangent = 0, y = 0): THREE.Vector3 {
  const a = slotAngle(slot);
  const p = new THREE.Vector3(Math.cos(a) * (FELT_RX + inset), y, Math.sin(a) * (FELT_RZ + inset));
  if (tangent !== 0) {
    // Tangent direction of the ellipse, clockwise seen from above.
    const t = new THREE.Vector3(-Math.sin(a) * FELT_RX, 0, Math.cos(a) * FELT_RZ).normalize();
    p.addScaledVector(t, tangent);
  }
  return p;
}

/** Yaw that makes an object at `pos` face the table centre. */
export function yawToCentre(pos: THREE.Vector3): number {
  return Math.atan2(-pos.x, -pos.z);
}

/** Spread N players across the six slots, hero always on slot 0. */
export function slotsForPlayers(count: number): number[] {
  return Array.from({ length: count }, (_, i) => Math.round((i * SLOT_COUNT) / count) % SLOT_COUNT);
}
