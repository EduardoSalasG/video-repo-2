import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { brand } from '../../theme';

const BG = brand.bg;
const ACCENT = brand.accent;
const BEAM_COLOR = '#f2f0ff';
const BEAT = 60 / 96; // compás de salsa, ~96 BPM

// Paso básico visto desde arriba (adelante = -z): izquierdo adelante (1),
// derecho en base (2), izquierdo vuelve (3), pausa (4), derecho atrás (5),
// izquierdo en base (6), derecho vuelve (7), pausa (8).
const STEP_MARKERS = [
  { x: -0.34, z: -0.64, side: 'left' as const, rot: 0.16, counts: [0] },
  { x: 0.34, z: 0, side: 'right' as const, rot: -0.1, counts: [1, 6] },
  { x: -0.34, z: 0, side: 'left' as const, rot: 0.1, counts: [2, 5] },
  { x: 0.34, z: 0.64, side: 'right' as const, rot: -0.16, counts: [4] },
];

function makeGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.55)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Huella estilizada tipo diagrama de pasos: empeine ancho, arco marcado en el
// lado interno, talón estrecho. `left` espeja el arco hacia la línea media.
function makeFootTexture(side: 'left' | 'right'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (side === 'left') {
      ctx.translate(128, 0);
      ctx.scale(-1, 1);
    }
    ctx.filter = 'blur(2px)';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(64, 20);
    ctx.bezierCurveTo(98, 20, 104, 52, 101, 84); // bola, borde externo
    ctx.bezierCurveTo(98, 114, 82, 124, 80, 154); // mediopié externo
    ctx.bezierCurveTo(78, 186, 92, 202, 87, 226); // talón externo
    ctx.bezierCurveTo(83, 248, 45, 248, 41, 226); // base del talón
    ctx.bezierCurveTo(37, 202, 48, 186, 44, 152); // talón interno
    ctx.bezierCurveTo(41, 124, 28, 114, 27, 82); // arco interno
    ctx.bezierCurveTo(26, 52, 30, 20, 64, 20); // bola, borde interno
    ctx.closePath();
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const BEAM_SHADER = {
  vertex: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vUv = uv;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewDir = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragment: `
    uniform vec3 uColor;
    uniform float uIntensity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      float facing = abs(dot(normalize(vNormal), normalize(vViewDir)));
      float body = pow(facing, 1.7);
      float vertical = mix(0.1, 1.0, vUv.y) * smoothstep(0.0, 0.18, vUv.y);
      gl_FragColor = vec4(uColor, uIntensity * body * vertical);
    }
  `,
};

interface BeamRig {
  cone: THREE.Mesh;
  spot: THREE.SpotLight;
  target: THREE.Object3D;
  targetX: number;
  tilt: number;
  phase: number;
  sway: number;
}

export const StageCanvas = () => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const compact = window.matchMedia('(max-width: 640px)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      return; // WebGL no disponible: el fondo CSS queda como fallback.
    }

    renderer.setClearColor(new THREE.Color(BG));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.5 : 1.75));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(BG, 0.045);

    const camera = new THREE.PerspectiveCamera(compact ? 52 : 42, 1, 0.1, 60);
    camera.position.set(0, 3.15, 10);
    camera.lookAt(0, 0.8, -2);

    scene.add(new THREE.HemisphereLight(0x2b2745, 0x08070d, 0.5));

    // Piso
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 70),
      new THREE.MeshStandardMaterial({ color: '#0f0d17', roughness: 0.9, metalness: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const glowTexture = makeGlowTexture();
    const disposables: Array<{ dispose: () => void }> = [floor.geometry, floor.material as THREE.Material, glowTexture];

    // Haces de luz + focos reales sobre el piso
    const beams: BeamRig[] = [];
    const beamSpecs = [
      { x: -3.4, z: -1.5, top: 8.2, radius: 2.7, tilt: 0.16, sway: 0.05, phase: 0.4, intensity: 0.5 },
      { x: 0.9, z: -2.6, top: 9.0, radius: 3.1, tilt: -0.06, sway: 0.07, phase: 2.1, intensity: 0.42 },
      { x: 3.8, z: 0.2, top: 7.6, radius: 2.4, tilt: -0.2, sway: 0.04, phase: 4.3, intensity: 0.55 },
    ];
    for (const spec of beamSpecs) {
      const height = spec.top;
      const coneGeo = new THREE.CylinderGeometry(0.12, spec.radius, height, 28, 1, true);
      const coneMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uColor: { value: new THREE.Color(BEAM_COLOR) },
          uIntensity: { value: spec.intensity },
        },
        vertexShader: BEAM_SHADER.vertex,
        fragmentShader: BEAM_SHADER.fragment,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(spec.x, height / 2, spec.z);
      cone.rotation.z = spec.tilt;
      scene.add(cone);
      disposables.push(coneGeo, coneMat);

      const target = new THREE.Object3D();
      target.position.set(spec.x - Math.sin(spec.tilt) * height, 0, spec.z);
      scene.add(target);

      const spot = new THREE.SpotLight(BEAM_COLOR, 140, 30, Math.atan(spec.radius / height) * 1.9, 0.9, 1.4);
      spot.position.set(spec.x, height, spec.z);
      spot.target = target;
      scene.add(spot);

      beams.push({ cone, spot, target, targetX: target.position.x, tilt: spec.tilt, phase: spec.phase, sway: spec.sway });
    }

    // Polvo en suspensión dentro de los haces y ambiente
    const dustCount = compact ? 450 : 1100;
    const positions = new Float32Array(dustCount * 3);
    const speeds = new Float32Array(dustCount);
    const phases = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      const beam = beamSpecs[i % beamSpecs.length];
      if (i % 10 < 7) {
        const t = Math.random();
        const r = (0.15 + (beam.radius - 0.15) * t) * Math.sqrt(Math.random()) * 0.85;
        const a = Math.random() * Math.PI * 2;
        positions[i * 3] = beam.x + Math.cos(a) * r - Math.sin(beam.tilt) * beam.top * t;
        positions[i * 3 + 1] = beam.top * t + 0.05;
        positions[i * 3 + 2] = beam.z + Math.sin(a) * r;
      } else {
        positions[i * 3] = (Math.random() - 0.5) * 18;
        positions[i * 3 + 1] = Math.random() * 8 + 0.05;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      }
      speeds[i] = 0.06 + Math.random() * 0.14;
      phases[i] = Math.random() * Math.PI * 2;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.045,
      map: glowTexture,
      transparent: true,
      opacity: 0.5,
      color: '#d8d5f5',
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);
    disposables.push(dustGeo, dustMat);

    // Diagrama de paso básico sobre el piso: huellas que se encienden por tiempo
    const diagram = new THREE.Group();
    if (compact) {
      // Mobile: centrado y más cerca de cámara para que no se corte
      diagram.position.set(0.5, 0.02, 0.7);
      diagram.rotation.y = -0.05;
      diagram.scale.setScalar(0.8);
    } else {
      diagram.position.set(2.1, 0.02, -0.4);
      diagram.rotation.y = -0.12;
    }
    const stepGeo = new THREE.PlaneGeometry(0.3, 0.72);
    stepGeo.rotateX(-Math.PI / 2); // queda plano; la punta del pie mira a -z
    const footTextures = {
      left: makeFootTexture('left'),
      right: makeFootTexture('right'),
    };
    disposables.push(footTextures.left, footTextures.right);
    const markers = STEP_MARKERS.map((step) => {
      const mat = new THREE.MeshBasicMaterial({
        map: footTextures[step.side],
        color: ACCENT,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(stepGeo, mat);
      mesh.rotation.y = step.rot;
      mesh.position.set(step.x, 0, step.z);
      diagram.add(mesh);
      disposables.push(mat);
      return { mesh, mat, counts: step.counts, pulseAt: -10 };
    });
    scene.add(diagram);
    disposables.push(stepGeo);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const resize = () => {
      const { clientWidth, clientHeight } = host;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    resize();

    let raf = 0;
    let running = true;
    let last = performance.now();
    const start = last;
    let lastCount = -1;

    const renderFrame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const t = (now - start) / 1000;

      // Pulso del diagrama en tiempos de 8
      const count = Math.floor(t / BEAT) % 8;
      if (count !== lastCount) {
        lastCount = count;
        for (const marker of markers) {
          if (marker.counts.includes(count)) marker.pulseAt = t;
        }
      }
      for (const marker of markers) {
        const pulse = Math.exp(-(t - marker.pulseAt) * 3.2);
        marker.mat.opacity = 0.14 + pulse * 0.86;
        const s = 1 + pulse * 0.18;
        marker.mesh.scale.set(s, 1, s);
      }

      // Haces que barren suave, como follow-spots
      for (const beam of beams) {
        const offset = Math.sin(t * 0.16 + beam.phase);
        beam.cone.rotation.z = beam.tilt + offset * beam.sway;
        beam.target.position.x = beam.targetX + offset * 0.8;
      }

      // Polvo que asciende y deriva
      const pos = dustGeo.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        arr[i * 3 + 1] += speeds[i] * dt;
        arr[i * 3] += Math.sin(t * 0.4 + phases[i]) * 0.0012;
        if (arr[i * 3 + 1] > 8.4) arr[i * 3 + 1] = 0.05;
      }
      pos.needsUpdate = true;

      // Parallax de cámara suave e interrumpible
      const targetX = pointer.x * 0.7;
      const targetY = 3.15 + pointer.y * -0.35;
      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (targetY - camera.position.y) * 0.03;
      camera.position.z = 10 + Math.sin(t * 0.1) * 0.15;
      camera.lookAt(0, 0.8, -2);

      renderer.render(scene, camera);
    };

    const loop = (now: number) => {
      if (running) renderFrame(now);
      raf = requestAnimationFrame(loop);
    };

    const visibility = () => {
      running = !document.hidden && visible;
    };
    let visible = true;
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      visibility();
    });
    observer.observe(host);

    const onResize = () => {
      resize();
      if (reduced) renderer.render(scene, camera);
    };
    window.addEventListener('resize', onResize);

    if (reduced) {
      // Una sola pasada: la escena queda quieta, el contenido manda.
      renderFrame(performance.now());
    } else {
      raf = requestAnimationFrame(loop);
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('visibilitychange', visibility);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', visibility);
      for (const item of disposables) item.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    />
  );
};
