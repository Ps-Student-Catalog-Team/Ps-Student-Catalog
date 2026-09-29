export interface WorkerInitMessage {
  type: 'init';
  count: number;
  width: number;
  height: number;
  connectionDistance: number;
  mouseLinks: number;
}

export interface WorkerResizeMessage {
  type: 'resize';
  width: number;
  height: number;
  count: number;
}

export interface WorkerConfigMessage {
  type: 'config';
  connectionDistance: number;
  mouseLinks: number;
}

export interface WorkerPointerMessage {
  type: 'pointer';
  x: number;
  y: number;
  active: boolean;
}

export interface WorkerTickMessage {
  type: 'tick';
  dt: number;
}

export type ParticleWorkerIn =
  | WorkerInitMessage
  | WorkerResizeMessage
  | WorkerConfigMessage
  | WorkerPointerMessage
  | WorkerTickMessage;

export interface ParticleWorkerFrame {
  type: 'frame';
  count: number;
  pos: Float32Array;
  pairs: Int16Array;
  pairAlpha: Uint8Array;
  mouse: Int16Array;
  mouseAlpha: Uint8Array;
}

const STEP = 1000 / 60;
const MAX_SUBSTEPS = 3;
const SPEED = 0.015;

let count = 0;
let width = 0;
let height = 0;
let connectionDistance = 150;
let mouseLinks = 5;

let pos = new Float32Array(0);
let vel = new Float32Array(0);
let head = new Int32Array(0);
let next = new Int32Array(0);
let pairBuf = new Int16Array(0);
let pairAlphaBuf = new Uint8Array(0);
let cols = 0;
let rows = 0;

const pointer = { x: -9999, y: -9999, active: false };
let pointerDirty = true;
let accumulator = 0;

function initParticles(newCount: number, w: number, h: number) {
  count = newCount;
  width = w;
  height = h;
  pos = new Float32Array(count * 2);
  vel = new Float32Array(count * 2);
  next = new Int32Array(count);

  for (let i = 0; i < count; i++) {
    pos[i * 2] = Math.random() * w;
    pos[i * 2 + 1] = Math.random() * h;
    vel[i * 2] = (Math.random() - 0.5) * 2 * SPEED;
    vel[i * 2 + 1] = (Math.random() - 0.5) * 2 * SPEED;
  }
  rebuildGrid(w, h);
}

function rebuildGrid(w: number, h: number) {
  width = w;
  height = h;
  cols = Math.max(1, Math.ceil(w / connectionDistance));
  rows = Math.max(1, Math.ceil(h / connectionDistance));
  head = new Int32Array(cols * rows);
  const maxPairs = Math.max(64, count * 8);
  pairBuf = new Int16Array(maxPairs * 2);
  pairAlphaBuf = new Uint8Array(maxPairs);
}

function rebuildHash() {
  head.fill(-1);
  for (let i = 0; i < count; i++) {
    const cx = Math.min(cols - 1, Math.max(0, (pos[i * 2] / connectionDistance) | 0));
    const cy = Math.min(rows - 1, Math.max(0, (pos[i * 2 + 1] / connectionDistance) | 0));
    const cell = cy * cols + cx;
    next[i] = head[cell];
    head[cell] = i;
  }
}

function integrate() {
  for (let i = 0; i < count; i++) {
    const ix = i * 2;
    let x = pos[ix] + vel[ix] * STEP;
    let y = pos[ix + 1] + vel[ix + 1] * STEP;

    if (x < 0) { x = 0; vel[ix] = -vel[ix]; }
    else if (x > width) { x = width; vel[ix] = -vel[ix]; }
    if (y < 0) { y = 0; vel[ix + 1] = -vel[ix + 1]; }
    else if (y > height) { y = height; vel[ix + 1] = -vel[ix + 1]; }

    pos[ix] = x;
    pos[ix + 1] = y;
  }
}

function buildFrame(): ParticleWorkerFrame {
  rebuildHash();

  const maxDistSq = connectionDistance * connectionDistance;
  let pairCount = 0;

  for (let i = 0; i < count; i++) {
    const ix = i * 2;
    const px = pos[ix];
    const py = pos[ix + 1];
    const cx = Math.min(cols - 1, Math.max(0, (px / connectionDistance) | 0));
    const cy = Math.min(rows - 1, Math.max(0, (py / connectionDistance) | 0));

    const x0 = Math.max(0, cx - 1);
    const x1 = Math.min(cols - 1, cx + 1);
    const y0 = Math.max(0, cy - 1);
    const y1 = Math.min(rows - 1, cy + 1);

    for (let cellY = y0; cellY <= y1; cellY++) {
      for (let cellX = x0; cellX <= x1; cellX++) {
        let j = head[cellY * cols + cellX];
        while (j !== -1) {
          if (j > i) {
            const jx = j * 2;
            const dx = px - pos[jx];
            const dy = py - pos[jx + 1];
            const distSq = dx * dx + dy * dy;

            if (distSq < maxDistSq) {
              const d = Math.sqrt(distSq) / connectionDistance;
              const alpha = ((1 - d) * 255) | 0;
              if (alpha >= 24 && pairCount < pairBuf.length / 2) {
                pairBuf[pairCount * 2] = i;
                pairBuf[pairCount * 2 + 1] = j;
                pairAlphaBuf[pairCount] = alpha;
                pairCount++;
              }
            }
          }
          j = next[j];
        }
      }
    }
  }

  const pairs = pairBuf.slice(0, pairCount * 2);
  const pairAlpha = pairAlphaBuf.slice(0, pairCount);

  let mouseCount = 0;
  const mouse = new Int16Array(mouseLinks);
  const mouseAlpha = new Uint8Array(mouseLinks);

  if (pointer.active && mouseLinks > 0) {
    const candidates: Array<{ i: number; d: number }> = [];
    for (let i = 0; i < count; i++) {
      const dx = pointer.x - pos[i * 2];
      const dy = pointer.y - pos[i * 2 + 1];
      const distSq = dx * dx + dy * dy;
      if (distSq < maxDistSq) {
        candidates.push({ i, d: Math.sqrt(distSq) });
      }
    }
    candidates.sort((a, b) => a.d - b.d);
    const n = Math.min(mouseLinks, candidates.length);
    for (let k = 0; k < n; k++) {
      mouse[k] = candidates[k].i;
      mouseAlpha[k] = ((1 - candidates[k].d / connectionDistance) * 255) | 0;
      mouseCount++;
    }
  }

  return {
    type: 'frame',
    count,
    pos: Float32Array.from(pos),
    pairs,
    pairAlpha,
    mouse: mouse.slice(0, mouseCount),
    mouseAlpha: mouseAlpha.slice(0, mouseCount),
  };
}

function tick(dt: number) {
  accumulator = Math.min(accumulator + dt, STEP * MAX_SUBSTEPS);
  let stepped = false;
  while (accumulator >= STEP) {
    integrate();
    accumulator -= STEP;
    stepped = true;
  }

  if (stepped || pointerDirty) {
    const frame = buildFrame();
    pointerDirty = false;
    postTransfer(frame);
  }
}

interface WorkerScope {
  postMessage(message: ParticleWorkerFrame, transfer: Transferable[]): void;
  onmessage: ((event: MessageEvent<ParticleWorkerIn>) => void) | null;
}

const scope = self as unknown as WorkerScope;

function postTransfer(frame: ParticleWorkerFrame) {
  scope.postMessage(frame, [
    frame.pos.buffer,
    frame.pairs.buffer,
    frame.pairAlpha.buffer,
    frame.mouse.buffer,
    frame.mouseAlpha.buffer,
  ]);
}

scope.onmessage = (event: MessageEvent<ParticleWorkerIn>) => {
  const msg = event.data;
  switch (msg.type) {
    case 'init':
      connectionDistance = msg.connectionDistance;
      mouseLinks = msg.mouseLinks;
      accumulator = 0;
      initParticles(msg.count, msg.width, msg.height);
      pointerDirty = true;
      tick(STEP);
      break;
    case 'resize':
      if (msg.count !== count) {
        initParticles(msg.count, msg.width, msg.height);
      } else {
        for (let i = 0; i < count; i++) {
          pos[i * 2] = Math.min(pos[i * 2], msg.width);
          pos[i * 2 + 1] = Math.min(pos[i * 2 + 1], msg.height);
        }
        rebuildGrid(msg.width, msg.height);
      }
      pointerDirty = true;
      tick(STEP);
      break;
    case 'config':
      connectionDistance = msg.connectionDistance;
      mouseLinks = msg.mouseLinks;
      rebuildGrid(width, height);
      pointerDirty = true;
      tick(0);
      break;
    case 'pointer':
      pointer.x = msg.x;
      pointer.y = msg.y;
      pointer.active = msg.active;
      pointerDirty = true;
      break;
    case 'tick':
      tick(Math.min(msg.dt, 100));
      break;
  }
};
