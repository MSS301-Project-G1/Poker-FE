import * as THREE from 'three';
import { isRedSuit, rankLabel, SUIT_SYMBOLS, type Card } from '../poker/cards';
import { createSeededRandom } from '../utils/random';
import { BOARD_Z, FELT_RZ } from './table-layout';

/** Canvas-drawn textures. Seeded noise keeps screenshots stable between runs. */

const FONT = "'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif";
export const CARD_TEX_W = 256;
export const CARD_TEX_H = 356;
const CARD_RADIUS = 20;

function canvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable for procedural textures.');
  return [c, ctx];
}

function finish(c: HTMLCanvasElement, anisotropy = 8): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  return texture;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function createCardFaceTexture(card: Card): THREE.CanvasTexture {
  const [c, ctx] = canvas(CARD_TEX_W, CARD_TEX_H);
  const ink = isRedSuit(card.suit) ? '#c8165f' : '#1b0b2d';
  const suit = SUIT_SYMBOLS[card.suit];
  const rank = rankLabel(card.rank);

  roundRect(ctx, 2, 2, CARD_TEX_W - 4, CARD_TEX_H - 4, CARD_RADIUS);
  const paper = ctx.createLinearGradient(0, 0, 0, CARD_TEX_H);
  paper.addColorStop(0, '#fffaff');
  paper.addColorStop(1, '#f1e6f7');
  ctx.fillStyle = paper;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#cdb6de';
  ctx.stroke();

  const drawCorner = () => {
    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `800 ${rank === '10' ? 50 : 58}px ${FONT}`;
    ctx.fillText(rank, 40, 16);
    ctx.font = `700 44px ${FONT}`;
    ctx.fillText(suit, 40, 76);
  };
  drawCorner();
  ctx.save();
  ctx.translate(CARD_TEX_W, CARD_TEX_H);
  ctx.rotate(Math.PI);
  drawCorner();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (card.rank >= 11 && card.rank <= 13) {
    // Court cards: framed panel with a gold rule and a large letter.
    roundRect(ctx, 66, 72, 124, 212, 14);
    const panel = ctx.createLinearGradient(66, 72, 190, 284);
    panel.addColorStop(0, isRedSuit(card.suit) ? '#ffe1ef' : '#ecdcff');
    panel.addColorStop(1, '#fff6fb');
    ctx.fillStyle = panel;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#c9a43a';
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.font = `800 104px ${FONT}`;
    ctx.fillText(rank, 128, 158);
    ctx.font = `700 54px ${FONT}`;
    ctx.fillText(suit, 128, 236);
  } else {
    ctx.fillStyle = ink;
    ctx.font = `700 ${card.rank === 14 ? 190 : 150}px ${FONT}`;
    ctx.fillText(suit, 128, 188);
  }
  return finish(c);
}

export function createCardBackTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(CARD_TEX_W, CARD_TEX_H);
  roundRect(ctx, 2, 2, CARD_TEX_W - 4, CARD_TEX_H - 4, CARD_RADIUS);
  ctx.fillStyle = '#fbf3ff';
  ctx.fill();

  roundRect(ctx, 14, 14, CARD_TEX_W - 28, CARD_TEX_H - 28, 14);
  const base = ctx.createLinearGradient(0, 0, CARD_TEX_W, CARD_TEX_H);
  base.addColorStop(0, '#741968');
  base.addColorStop(0.55, '#4a1460');
  base.addColorStop(1, '#2a0d3e');
  ctx.fillStyle = base;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(255, 172, 231, 0.28)';
  ctx.lineWidth = 2;
  for (let i = -CARD_TEX_H; i < CARD_TEX_W + CARD_TEX_H; i += 22) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + CARD_TEX_H, CARD_TEX_H);
    ctx.moveTo(i + CARD_TEX_H, 0);
    ctx.lineTo(i, CARD_TEX_H);
    ctx.stroke();
  }
  ctx.restore();

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#e5c457';
  roundRect(ctx, 24, 24, CARD_TEX_W - 48, CARD_TEX_H - 48, 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(128, 178, 52, 0, Math.PI * 2);
  ctx.fillStyle = '#1b0b2d';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#e5c457';
  ctx.stroke();
  ctx.fillStyle = '#fface7';
  ctx.font = `800 64px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♠', 128, 182);
  return finish(c);
}

/** Purple felt with a gold betting line and table mark. Mapped to the table ellipse bounds. */
export function createFeltTexture(): THREE.CanvasTexture {
  const w = 2048;
  const h = 1160;
  const [c, ctx] = canvas(w, h);
  const glow = ctx.createRadialGradient(w / 2, h * 0.48, 40, w / 2, h / 2, w * 0.55);
  glow.addColorStop(0, '#5d2a8a');
  glow.addColorStop(0.55, '#45196b');
  glow.addColorStop(1, '#2a0d44');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Fibre speckle so the felt reads as cloth, not plastic.
  const rng = createSeededRandom(77);
  for (let i = 0; i < 26000; i += 1) {
    const light = rng() > 0.5;
    ctx.fillStyle = light ? 'rgba(255, 210, 245, 0.05)' : 'rgba(10, 2, 22, 0.08)';
    ctx.fillRect(rng() * w, rng() * h, 1 + rng() * 2, 1 + rng() * 2);
  }

  ctx.strokeStyle = 'rgba(229, 196, 87, 0.55)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, w * 0.36, h * 0.33, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([22, 18]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 172, 231, 0.22)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, w * 0.4, h * 0.38, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Table mark sits under the board: visible between hands, covered once cards land.
  const markY = h / 2 + (BOARD_Z / (FELT_RZ * 2)) * h;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 208, 238, 0.14)';
  ctx.font = `800 96px ${FONT}`;
  ctx.fillText('POKER TÍM', w / 2, markY - 18);
  ctx.font = `600 34px ${FONT}`;
  ctx.fillStyle = 'rgba(229, 196, 87, 0.32)';
  ctx.fillText("TEXAS HOLD'EM · NO LIMIT", w / 2, markY + 58);
  return finish(c, 16);
}

export function createCarpetTexture(): THREE.CanvasTexture {
  const size = 512;
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = '#1a0a2a';
  ctx.fillRect(0, 0, size, size);
  const rng = createSeededRandom(19);
  for (let i = 0; i < 9000; i += 1) {
    ctx.fillStyle = rng() > 0.5 ? 'rgba(120, 50, 150, 0.08)' : 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(rng() * size, rng() * size, 2, 2);
  }
  ctx.strokeStyle = 'rgba(229, 196, 87, 0.16)';
  ctx.lineWidth = 3;
  const step = size / 4;
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 4; x += 1) {
      const cx = x * step + step / 2;
      const cy = y * step + step / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - step * 0.32);
      ctx.lineTo(cx + step * 0.32, cy);
      ctx.lineTo(cx, cy + step * 0.32);
      ctx.lineTo(cx - step * 0.32, cy);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(176, 18, 155, 0.14)';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = finish(c);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(9, 9);
  return texture;
}

/** Chip rim stripes. */
export function createChipSideTexture(color: string, stripe: string): THREE.CanvasTexture {
  const [c, ctx] = canvas(256, 16);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 16);
  ctx.fillStyle = stripe;
  for (let i = 0; i < 8; i += 1) ctx.fillRect(i * 32 + 6, 0, 12, 16);
  return finish(c, 4);
}

export function createChipTopTexture(color: string, stripe: string, label: string): THREE.CanvasTexture {
  const size = 128;
  const [c, ctx] = canvas(size, size);
  const mid = size / 2;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = stripe;
  for (let i = 0; i < 8; i += 1) {
    ctx.save();
    ctx.translate(mid, mid);
    ctx.rotate((i / 8) * Math.PI * 2);
    ctx.fillRect(-7, -mid, 14, 18);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(mid, mid, 38, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = stripe;
  ctx.stroke();
  ctx.fillStyle = stripe;
  ctx.font = `800 ${label.length > 3 ? 24 : 30}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, mid, mid + 2);
  return finish(c, 4);
}

export function createDealerButtonTexture(): THREE.CanvasTexture {
  const size = 128;
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = '#fbf6ff';
  ctx.fillRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(64, 64, 52, 0, Math.PI * 2);
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#e5c457';
  ctx.stroke();
  ctx.fillStyle = '#1b0b2d';
  ctx.font = `800 64px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('D', 64, 68);
  return finish(c, 4);
}
