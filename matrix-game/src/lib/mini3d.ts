/**
 * Motor 3D mínimo em WebGL puro (sem dependências): malhas paramétricas, iluminação
 * Phong com brilho de borda e modo "holograma" em wireframe.
 */

export type Shape = 'cube' | 'octa' | 'ico' | 'pyramid' | 'diamond' | 'sphere' | 'torus' | 'cylinder' | 'capsule' | 'knot';

type Vec3 = [number, number, number];
type Mesh = { pos: number[]; nor: number[]; idx: number[]; lines: number[] };

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Superfície paramétrica f(u, v) com u, v ∈ [0, 1]. Normais calculadas numericamente. */
function param(f: (u: number, v: number) => Vec3, nu: number, nv: number, lineEvery = 1): Mesh {
  const m: Mesh = { pos: [], nor: [], idx: [], lines: [] };
  const e = 1e-3;
  for (let j = 0; j <= nv; j++) {
    for (let i = 0; i <= nu; i++) {
      const u = i / nu;
      const v = j / nv;
      const p = f(u, v);
      const du = sub(f(Math.min(u + e, 1), v), f(Math.max(u - e, 0), v));
      const dv = sub(f(u, Math.min(v + e, 1)), f(u, Math.max(v - e, 0)));
      let n = cross(du, dv);
      if (Math.hypot(...n) < 1e-9) n = p; // polos
      m.pos.push(...p);
      m.nor.push(...norm(n));
    }
  }
  const at = (i: number, j: number) => j * (nu + 1) + i;
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) {
      m.idx.push(at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j), at(i + 1, j + 1), at(i, j + 1));
      if (j % lineEvery === 0) m.lines.push(at(i, j), at(i + 1, j));
      if (i % lineEvery === 0) m.lines.push(at(i, j), at(i, j + 1));
    }
  }
  return m;
}

/** Sólido de revolução a partir de um perfil [raio, altura]. */
function lathe(profile: [number, number][], segments = 32): Mesh {
  const n = profile.length - 1;
  return param(
    (u, v) => {
      const t = v * n;
      const k = Math.min(Math.floor(t), n - 1);
      const f = t - k;
      const r = profile[k][0] + (profile[k + 1][0] - profile[k][0]) * f;
      const y = profile[k][1] + (profile[k + 1][1] - profile[k][1]) * f;
      const a = u * Math.PI * 2;
      return [Math.cos(a) * r, y, Math.sin(a) * r];
    },
    segments,
    n * 4,
    4,
  );
}

/** Poliedro com sombreamento facetado. */
function poly(verts: Vec3[], faces: number[][]): Mesh {
  const m: Mesh = { pos: [], nor: [], idx: [], lines: [] };
  const edges = new Set<string>();
  for (const face of faces) {
    const n = norm(cross(sub(verts[face[1]], verts[face[0]]), sub(verts[face[2]], verts[face[0]])));
    const base = m.pos.length / 3;
    face.forEach((vi) => {
      m.pos.push(...verts[vi]);
      m.nor.push(...n);
    });
    for (let k = 1; k < face.length - 1; k++) m.idx.push(base, base + k, base + k + 1);
    face.forEach((vi, k) => {
      const a = vi;
      const b = face[(k + 1) % face.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edges.has(key)) {
        edges.add(key);
        m.lines.push(base + k, base + ((k + 1) % face.length));
      }
    });
  }
  return m;
}

function capsuleProfile(): [number, number][] {
  const pts: [number, number][] = [];
  const r = 0.55;
  const h = 0.75;
  for (let i = 0; i <= 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2);
    pts.push([Math.cos(a) * r, -h + Math.sin(a) * r]);
  }
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push([Math.cos(a) * r, h + Math.sin(a) * r]);
  }
  return pts;
}

export function buildMesh(shape: Shape): Mesh {
  const PHI = (1 + Math.sqrt(5)) / 2;
  switch (shape) {
    case 'cube': {
      const v: Vec3[] = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
      return poly(v.map((p) => p.map((c) => c * 0.75) as Vec3), [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 4, 7, 3]]);
    }
    case 'octa': {
      const v: Vec3[] = [[1.1, 0, 0], [-1.1, 0, 0], [0, 1.1, 0], [0, -1.1, 0], [0, 0, 1.1], [0, 0, -1.1]];
      return poly(v, [[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5]]);
    }
    case 'pyramid': {
      const v: Vec3[] = [[-0.9, -0.7, -0.9], [0.9, -0.7, -0.9], [0.9, -0.7, 0.9], [-0.9, -0.7, 0.9], [0, 1.0, 0]];
      return poly(v, [[0, 1, 2, 3], [0, 4, 1], [1, 4, 2], [2, 4, 3], [3, 4, 0]]);
    }
    case 'diamond': {
      const ring: Vec3[] = Array.from({ length: 8 }, (_, i) => [Math.cos((i / 8) * Math.PI * 2) * 0.9, 0.25, Math.sin((i / 8) * Math.PI * 2) * 0.9]);
      const v: Vec3[] = [...ring, [0, 0.75, 0], [0, -1.15, 0]];
      const faces: number[][] = [];
      for (let i = 0; i < 8; i++) {
        faces.push([i, 8, (i + 1) % 8]);
        faces.push([(i + 1) % 8, 9, i]);
      }
      return poly(v, faces);
    }
    case 'ico': {
      const s = 0.62;
      const v: Vec3[] = [[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0], [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI], [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]].map(
        (p) => p.map((c) => c * s) as Vec3,
      );
      return poly(v, [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
      ]);
    }
    case 'sphere':
      return param((u, v) => {
        const a = u * Math.PI * 2;
        const b = v * Math.PI;
        return [Math.cos(a) * Math.sin(b), Math.cos(b), Math.sin(a) * Math.sin(b)];
      }, 28, 18, 2);
    case 'torus':
      return param((u, v) => {
        const a = u * Math.PI * 2;
        const b = v * Math.PI * 2;
        const r = 0.82 + 0.32 * Math.cos(b);
        return [Math.cos(a) * r, 0.32 * Math.sin(b), Math.sin(a) * r];
      }, 36, 14, 2);
    case 'cylinder':
      return lathe([[0, -0.9], [0.75, -0.9], [0.75, 0.9], [0, 0.9]], 24);
    case 'capsule':
      return lathe(capsuleProfile(), 32);
    case 'knot': {
      const c = (t: number): Vec3 => {
        const a = t * Math.PI * 2;
        const r = 0.55 + 0.25 * Math.cos(3 * a);
        return [r * Math.cos(2 * a), 0.25 * Math.sin(3 * a) * 1.6, r * Math.sin(2 * a)];
      };
      return param(
        (u, v) => {
          const p = c(u);
          const t = norm(sub(c(u + 1e-3), c(u - 1e-3)));
          let n = cross(t, [0, 1, 0]);
          if (Math.hypot(...n) < 1e-6) n = [1, 0, 0];
          n = norm(n);
          const b = cross(t, n);
          const a = v * Math.PI * 2;
          const R = 0.13;
          return [p[0] + R * (Math.cos(a) * n[0] + Math.sin(a) * b[0]), p[1] + R * (Math.cos(a) * n[1] + Math.sin(a) * b[1]), p[2] + R * (Math.cos(a) * n[2] + Math.sin(a) * b[2])];
        },
        120,
        8,
        2,
      );
    }
  }
}

// ─────────── matrizes 4x4 (coluna-maior) ───────────
type M4 = Float32Array;
const ident = (): M4 => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
function mul(a: M4, b: M4): M4 {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
}
function perspective(fov: number, aspect: number, near: number, far: number): M4 {
  const f = 1 / Math.tan(fov / 2);
  const o = new Float32Array(16);
  o[0] = f / aspect;
  o[5] = f;
  o[10] = (far + near) / (near - far);
  o[11] = -1;
  o[14] = (2 * far * near) / (near - far);
  return o;
}
function rotX(a: number): M4 {
  const m = ident();
  m[5] = Math.cos(a);
  m[6] = Math.sin(a);
  m[9] = -Math.sin(a);
  m[10] = Math.cos(a);
  return m;
}
function rotY(a: number): M4 {
  const m = ident();
  m[0] = Math.cos(a);
  m[2] = -Math.sin(a);
  m[8] = Math.sin(a);
  m[10] = Math.cos(a);
  return m;
}
function rotZ(a: number): M4 {
  const m = ident();
  m[0] = Math.cos(a);
  m[1] = Math.sin(a);
  m[4] = -Math.sin(a);
  m[5] = Math.cos(a);
  return m;
}
function translate(x: number, y: number, z: number): M4 {
  const m = ident();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
}

const VS = `
attribute vec3 aPos; attribute vec3 aNor;
uniform mat4 uMvp; uniform mat4 uModel;
varying vec3 vN; varying vec3 vP;
void main() {
  vN = mat3(uModel) * aNor;
  vP = (uModel * vec4(aPos, 1.0)).xyz;
  gl_Position = uMvp * vec4(aPos, 1.0);
}`;
const FS_SOLID = `
precision mediump float;
uniform vec3 uColor; uniform float uAlpha; uniform float uSpec;
varying vec3 vN; varying vec3 vP;
void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(vec3(0.0, 0.0, 4.0) - vP);
  vec3 L = normalize(vec3(-0.5, 0.9, 0.7));
  float lam = abs(dot(N, L));
  float spec = pow(max(abs(dot(N, normalize(L + V))), 0.0), 40.0) * uSpec;
  float rim = pow(1.0 - abs(dot(N, V)), 2.2);
  vec3 c = uColor * (0.22 + 0.78 * lam) + vec3(spec) + uColor * rim * 1.3;
  gl_FragColor = vec4(c, uAlpha);
}`;
const FS_LINE = `
precision mediump float;
uniform vec3 uColor; uniform float uAlpha;
void main() { gl_FragColor = vec4(uColor, uAlpha); }`;

function program(gl: WebGLRenderingContext, fs: string) {
  const make = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, make(gl.VERTEX_SHADER, VS));
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  return p;
}

const hex = (h: string): Vec3 => {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export type SceneOptions = {
  shape: Shape;
  color: string;
  /** 'solid' (objeto brilhante), 'holo' (wireframe holográfico) ou 'both'. */
  style?: 'solid' | 'holo' | 'both';
  spin?: number;
  tilt?: number;
  /** Rotação inicial em Z (deixa a pílula deitada, por exemplo). */
  roll?: number;
};

/** Inicia a renderização em um canvas. Retorna funções para apontar (parallax) e encerrar. */
export function mount3D(canvas: HTMLCanvasElement, opts: SceneOptions) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
  if (!gl) return null;

  const mesh = buildMesh(opts.shape);
  const solid = program(gl, FS_SOLID);
  const line = program(gl, FS_LINE);
  const buf = (data: number[], target: number, Ctor: typeof Float32Array | typeof Uint16Array) => {
    const b = gl.createBuffer()!;
    gl.bindBuffer(target, b);
    gl.bufferData(target, new Ctor(data), gl.STATIC_DRAW);
    return b;
  };
  const pos = buf(mesh.pos, gl.ARRAY_BUFFER, Float32Array);
  const nor = buf(mesh.nor, gl.ARRAY_BUFFER, Float32Array);
  const idx = buf(mesh.idx, gl.ELEMENT_ARRAY_BUFFER, Uint16Array);
  const lines = buf(mesh.lines, gl.ELEMENT_ARRAY_BUFFER, Uint16Array);
  const color = hex(opts.color);
  const style = opts.style ?? 'holo';
  let spin = opts.spin ?? 0.6;
  let angle = 0;
  let lastT = performance.now();

  let pointer = [0, 0];
  let raf = 0;
  let visible = true;
  const t0 = performance.now();

  const bind = (p: WebGLProgram) => {
    gl.useProgram(p);
    const aPos = gl.getAttribLocation(p, 'aPos');
    gl.bindBuffer(gl.ARRAY_BUFFER, pos);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    const aNor = gl.getAttribLocation(p, 'aNor');
    if (aNor >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, nor);
      gl.enableVertexAttribArray(aNor);
      gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, 0, 0);
    }
  };

  const draw = (now: number) => {
    raf = requestAnimationFrame(draw);
    if (!visible || document.hidden) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const t = (now - t0) / 1000;
    angle += ((now - lastT) / 1000) * spin;
    lastT = now;
    const model = mul(
      translate(0, Math.sin(t * 1.3) * 0.06, 0),
      mul(rotX((opts.tilt ?? 0.35) + pointer[1] * 0.5), mul(rotY(angle + pointer[0] * 0.8), rotZ(opts.roll ?? 0))),
    );
    const view = translate(0, 0, -4);
    const mvp = mul(perspective(0.72, w / h, 0.1, 20), mul(view, model));

    const uniforms = (p: WebGLProgram, alpha: number) => {
      gl.uniformMatrix4fv(gl.getUniformLocation(p, 'uMvp'), false, mvp);
      gl.uniformMatrix4fv(gl.getUniformLocation(p, 'uModel'), false, model);
      gl.uniform3fv(gl.getUniformLocation(p, 'uColor'), color);
      gl.uniform1f(gl.getUniformLocation(p, 'uAlpha'), alpha);
    };

    gl.enable(gl.BLEND);
    if (style === 'solid' || style === 'both') {
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(true);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      bind(solid);
      uniforms(solid, 1);
      gl.uniform1f(gl.getUniformLocation(solid, 'uSpec'), 1.2);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
      gl.drawElements(gl.TRIANGLES, mesh.idx.length, gl.UNSIGNED_SHORT, 0);
    }
    if (style === 'holo') {
      gl.disable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      bind(solid);
      uniforms(solid, 0.16);
      gl.uniform1f(gl.getUniformLocation(solid, 'uSpec'), 0.3);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
      gl.drawElements(gl.TRIANGLES, mesh.idx.length, gl.UNSIGNED_SHORT, 0);
    }
    if (style === 'holo' || style === 'both') {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.depthMask(false);
      bind(line);
      uniforms(line, style === 'both' ? 0.5 : 0.95);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lines);
      gl.drawElements(gl.LINES, mesh.lines.length, gl.UNSIGNED_SHORT, 0);
      gl.depthMask(true);
    }
  };
  raf = requestAnimationFrame(draw);

  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(canvas);

  return {
    point(x: number, y: number) {
      pointer = [x, y];
    },
    setSpin(v: number) {
      spin = v;
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      // Não chamamos loseContext(): no StrictMode o mesmo canvas é montado de novo e o contexto precisa continuar vivo.
    },
  };
}
