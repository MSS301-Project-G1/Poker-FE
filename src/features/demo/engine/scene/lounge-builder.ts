import * as THREE from 'three';
import { createCarpetTexture, createFeltTexture } from './procedural-textures';
import { FELT_RX, FELT_RZ, RAIL_RADIUS } from './table-layout';

const FLOOR_Y = -1.55;

function ellipseShape(rx: number, rz: number, segments = 96): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * rz;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
}

function ellipseCurve(rx: number, rz: number, y: number, points = 96): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < points; i += 1) {
    const a = (i / points) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * rx, y, Math.sin(a) * rz));
  }
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal');
}

/** Hero poker table: purple felt, padded leather rail, gold trim, wood apron, pedestal. */
export function buildPokerTable(): THREE.Group {
  const table = new THREE.Group();
  table.name = 'pokerTable';

  const feltTexture = createFeltTexture();
  // ExtrudeGeometry cap UVs are raw shape coordinates; remap ellipse bounds to 0..1.
  feltTexture.repeat.set(1 / (FELT_RX * 2), 1 / (FELT_RZ * 2));
  feltTexture.offset.set(0.5, 0.5);
  const feltMaterial = new THREE.MeshStandardMaterial({ map: feltTexture, roughness: 0.94, metalness: 0 });
  const feltSide = new THREE.MeshStandardMaterial({ color: '#1b0b2d', roughness: 0.9 });
  const felt = new THREE.Mesh(
    new THREE.ExtrudeGeometry(ellipseShape(FELT_RX + 0.05, FELT_RZ + 0.05), { depth: 0.14, bevelEnabled: false }),
    [feltMaterial, feltSide],
  );
  felt.rotation.x = -Math.PI / 2;
  felt.position.y = -0.14;
  felt.receiveShadow = true;
  felt.name = 'felt';
  table.add(felt);

  const leather = new THREE.MeshPhysicalMaterial({
    color: '#2b1140',
    roughness: 0.48,
    metalness: 0.0,
    clearcoat: 0.45,
    clearcoatRoughness: 0.35,
    sheen: 0.4,
    sheenColor: new THREE.Color('#b0129b'),
  });
  const rail = new THREE.Mesh(
    new THREE.TubeGeometry(ellipseCurve(FELT_RX + RAIL_RADIUS * 0.8, FELT_RZ + RAIL_RADIUS * 0.8, 0.04), 220, RAIL_RADIUS, 20, true),
    leather,
  );
  rail.castShadow = true;
  rail.receiveShadow = true;
  rail.name = 'leatherRail';
  table.add(rail);

  const gold = new THREE.MeshStandardMaterial({ color: '#e5c457', roughness: 0.28, metalness: 0.92 });
  const innerTrim = new THREE.Mesh(
    new THREE.TubeGeometry(ellipseCurve(FELT_RX - 0.02, FELT_RZ - 0.02, 0.012), 220, 0.022, 8, true),
    gold,
  );
  innerTrim.name = 'goldTrimInner';
  table.add(innerTrim);

  const wood = new THREE.MeshStandardMaterial({ color: '#3a1630', roughness: 0.42, metalness: 0.08 });
  const apronShape = ellipseShape(FELT_RX + 0.5, FELT_RZ + 0.5);
  apronShape.holes.push(ellipseShape(FELT_RX - 0.1, FELT_RZ - 0.1));
  const apron = new THREE.Mesh(
    new THREE.ExtrudeGeometry(apronShape, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 }),
    wood,
  );
  apron.rotation.x = -Math.PI / 2;
  apron.position.y = -0.42;
  apron.castShadow = true;
  apron.name = 'woodApron';
  table.add(apron);

  const outerTrim = new THREE.Mesh(
    new THREE.TubeGeometry(ellipseCurve(FELT_RX + 0.53, FELT_RZ + 0.53, -0.2), 220, 0.03, 8, true),
    gold,
  );
  outerTrim.name = 'goldTrimOuter';
  table.add(outerTrim);

  const pedestalMaterial = new THREE.MeshStandardMaterial({ color: '#160628', roughness: 0.35, metalness: 0.6 });
  const pedestal = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0.0, FLOOR_Y),
        new THREE.Vector2(1.5, FLOOR_Y),
        new THREE.Vector2(1.45, FLOOR_Y + 0.12),
        new THREE.Vector2(0.55, FLOOR_Y + 0.3),
        new THREE.Vector2(0.38, -0.7),
        new THREE.Vector2(0.9, -0.48),
        new THREE.Vector2(0.0, -0.46),
      ],
      48,
    ),
    pedestalMaterial,
  );
  pedestal.scale.set(1.25, 1, 0.8);
  pedestal.castShadow = true;
  pedestal.name = 'pedestal';
  table.add(pedestal);

  const pedestalRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 48), gold);
  pedestalRing.rotation.x = Math.PI / 2;
  pedestalRing.position.y = -0.95;
  pedestalRing.scale.set(1.25, 0.8, 1);
  table.add(pedestalRing);

  return table;
}

/** Chair behind a seat: padded back, seat cushion, gold piping. Faces +z in local space. */
export function buildChair(): THREE.Group {
  const chair = new THREE.Group();
  const leather = new THREE.MeshStandardMaterial({ color: '#3e1650', roughness: 0.5 });
  const gold = new THREE.MeshStandardMaterial({ color: '#c9a43a', roughness: 0.3, metalness: 0.9 });
  const back = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.55, 6, 16), leather);
  back.scale.set(1, 1, 0.32);
  back.position.set(0, 0.15, -0.38);
  back.castShadow = true;
  chair.add(back);
  const piping = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.022, 6, 32, Math.PI), gold);
  piping.position.set(0, 0.42, -0.38);
  chair.add(piping);
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.42, 0.16, 24), leather);
  seat.position.set(0, -0.48, -0.15);
  seat.castShadow = true;
  chair.add(seat);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.9, 10), gold);
  stem.position.set(0, -1.0, -0.15);
  chair.add(stem);
  return chair;
}

type LoungeResult = { root: THREE.Group; animated: (elapsed: number) => void };

/** Room around the table: carpet, neon wall strips, pendant lamp, background tables. */
export function buildLounge(): LoungeResult {
  const root = new THREE.Group();
  root.name = 'lounge';

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(26, 64),
    new THREE.MeshStandardMaterial({ map: createCarpetTexture(), roughness: 0.95 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  floor.receiveShadow = true;
  root.add(floor);

  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 18, 14, 64, 1, true),
    new THREE.MeshStandardMaterial({ color: '#12051f', roughness: 0.9, side: THREE.BackSide }),
  );
  wall.position.y = FLOOR_Y + 7;
  root.add(wall);

  // Neon pilasters: one instanced mesh, two alternating tints via instance colour.
  const strips = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.12, 6, 0.12),
    new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }),
    28,
  );
  const m = new THREE.Matrix4();
  const tintA = new THREE.Color('#b0129b').multiplyScalar(1.4);
  const tintB = new THREE.Color('#6c2399').multiplyScalar(1.6);
  for (let i = 0; i < 28; i += 1) {
    const a = (i / 28) * Math.PI * 2;
    m.makeTranslation(Math.cos(a) * 17.7, FLOOR_Y + 3.6, Math.sin(a) * 17.7);
    strips.setMatrixAt(i, m);
    strips.setColorAt(i, i % 2 ? tintA : tintB);
  }
  root.add(strips);

  const ceilingGlow = new THREE.Mesh(
    new THREE.TorusGeometry(17.4, 0.06, 6, 128),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#e5c457').multiplyScalar(1.2), toneMapped: false }),
  );
  ceilingGlow.rotation.x = Math.PI / 2;
  ceilingGlow.position.y = FLOOR_Y + 6.8;
  root.add(ceilingGlow);

  // Pendant lamp: dark shade, warm emissive inner cone, gold rim and a cord.
  const lamp = new THREE.Group();
  lamp.name = 'pendantLamp';
  const shadeProfile = [
    new THREE.Vector2(0.12, 0.5),
    new THREE.Vector2(0.4, 0.42),
    new THREE.Vector2(1.5, 0.02),
    new THREE.Vector2(1.55, 0.0),
  ];
  const shade = new THREE.Mesh(
    new THREE.LatheGeometry(shadeProfile, 48),
    new THREE.MeshStandardMaterial({ color: '#1b0b2d', roughness: 0.4, metalness: 0.5, side: THREE.DoubleSide }),
  );
  shade.scale.set(1.25, 1, 0.75);
  lamp.add(shade);
  const innerGlow = new THREE.Mesh(
    new THREE.LatheGeometry(shadeProfile.map((p) => new THREE.Vector2(p.x * 0.97, p.y - 0.01)), 48),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9a0').multiplyScalar(1.6), side: THREE.BackSide, toneMapped: false }),
  );
  innerGlow.scale.copy(shade.scale);
  lamp.add(innerGlow);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.03, 6, 64),
    new THREE.MeshStandardMaterial({ color: '#e5c457', metalness: 0.9, roughness: 0.25 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.scale.set(1.25, 0.75, 1);
  lamp.add(rim);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 4, 6), new THREE.MeshBasicMaterial({ color: '#0a0216' }));
  cord.position.y = 2.5;
  lamp.add(cord);
  lamp.position.y = 3.6;
  root.add(lamp);

  // Background tables: cheap silhouettes with their own lamp pools for depth.
  const bgFelt = new THREE.MeshStandardMaterial({ color: '#3b1560', roughness: 0.9 });
  const bgRail = new THREE.MeshStandardMaterial({ color: '#1d0a2c', roughness: 0.6 });
  const bgTop = new THREE.ExtrudeGeometry(ellipseShape(2.2, 1.2), { depth: 0.12, bevelEnabled: false });
  const bgRailGeo = new THREE.TubeGeometry(ellipseCurve(2.3, 1.3, 0), 96, 0.14, 10, true);
  const bgPositions: [number, number, number][] = [
    [-9.5, -8, 0.5],
    [9.5, -8.5, -0.4],
    [-12.5, 1.5, 1.2],
    [12.5, 2, -1.1],
  ];
  const glowTexture = createGlowSprite();
  for (const [x, z, yaw] of bgPositions) {
    const g = new THREE.Group();
    const top = new THREE.Mesh(bgTop, bgFelt);
    top.rotation.x = -Math.PI / 2;
    g.add(top);
    g.add(new THREE.Mesh(bgRailGeo, bgRail));
    const pool = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTexture, color: '#ffbf7a', transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    pool.scale.set(4, 4, 1);
    pool.position.y = 2.6;
    g.add(pool);
    g.position.set(x, -0.1, z);
    g.rotation.y = yaw;
    root.add(g);
  }

  // Slow drifting dust in the lamp cone.
  const dustCount = 160;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    const f = (i * 0.618034) % 1;
    const a = i * 2.399963;
    const r = 0.4 + f * 3.1;
    dustPositions[i * 3] = Math.cos(a) * r;
    dustPositions[i * 3 + 1] = 0.4 + ((i * 0.37) % 1) * 3;
    dustPositions[i * 3 + 2] = Math.sin(a) * r * 0.6;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({ map: glowTexture, color: '#ffd9a0', size: 0.05, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  root.add(dust);

  return {
    root,
    animated: (elapsed) => {
      dust.rotation.y = elapsed * 0.02;
      lamp.rotation.z = Math.sin(elapsed * 0.4) * 0.004;
    },
  };
}

export function createGlowSprite(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function addTableLighting(scene: THREE.Scene): THREE.SpotLight {
  scene.add(new THREE.HemisphereLight('#c9a6ff', '#12051f', 0.55));

  const key = new THREE.SpotLight('#ffe2b8', 70, 12, 0.78, 0.55, 1.6);
  key.position.set(0, 3.45, 0);
  key.target.position.set(0, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 8;
  scene.add(key, key.target);

  const rimLeft = new THREE.PointLight('#b0129b', 18, 14, 1.8);
  rimLeft.position.set(-6, 2.5, -4);
  const rimRight = new THREE.PointLight('#6c2399', 20, 14, 1.8);
  rimRight.position.set(6, 2.2, -4.5);
  const front = new THREE.PointLight('#fface7', 6, 10, 2);
  front.position.set(0, 2.2, 5);
  scene.add(rimLeft, rimRight, front);
  return key;
}
