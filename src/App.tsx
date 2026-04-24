import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

type Flavor = {
  id: string
  name: string
  short: string
  description: string
  tint: string
  accent: string
}

const flavors: Flavor[] = [
  {
    id: 'smoke',
    name: '烟熏',
    short: 'Smoke',
    description: '来自轻烘烤麦芽与细微泥煤尾韵，像远处炭火缓慢呼吸。',
    tint: '#5a6672',
    accent: '#cad5e2',
  },
  {
    id: 'honey',
    name: '蜂蜜',
    short: 'Honey',
    description: '花蜜、麦芽糖与橡木甜香。入口柔和，收束干净。',
    tint: '#a06a1c',
    accent: '#f0cf6a',
  },
  {
    id: 'spice',
    name: '香料',
    short: 'Spice',
    description: '白胡椒、肉桂与一丝陈皮，骨架更立体，余韵更长。',
    tint: '#6b3e2c',
    accent: '#edb082',
  },
  {
    id: 'citrus',
    name: '柑橘',
    short: 'Citrus',
    description: '橙皮油脂感和清亮果酸，像清晨光线划开雾气。',
    tint: '#788d46',
    accent: '#f0e08b',
  },
]

export const products = [
  {
    id: 'kaze',
    name: 'No.01 Kaze',
    short: 'Kaze',
    note: '麦芽甜感 / 白花 / 清爽',
    price: '¥680',
    tint: '#a06a1c',
    accent: '#f0cf6a',
    hue: 'from-amber-300/35 via-transparent to-brown-900/0',
  },
  {
    id: 'mizu',
    name: 'No.02 Mizu',
    short: 'Mizu',
    note: '蜂蜜 / 橡木 / 柑橘皮',
    price: '¥920',
    tint: '#788d46',
    accent: '#f0e08b',
    hue: 'from-gold-300/35 via-transparent to-brown-900/0',
  },
  {
    id: 'sumi',
    name: 'No.03 Sumi',
    short: 'Sumi',
    note: '烟熏 / 香料 / 深色果干',
    price: '¥1,280',
    tint: '#6b3e2c',
    accent: '#edb082',
    hue: 'from-stone-300/35 via-transparent to-brown-900/0',
  },
]

const steps = [
  {
    title: '选麦',
    text: '精选日本与北欧两地麦芽，强调干净底味与香气层次。',
    image: 'W',
  },
  {
    title: '发酵',
    text: '低温长发酵，让果香、谷物甜感与乳酸线条逐渐展开。',
    image: 'F',
  },
  {
    title: '蒸馏',
    text: '小型铜壶双次蒸馏，保留更细的油脂感与花果香。',
    image: 'D',
  },
  {
    title: '陈酿',
    text: '熟成于雪松、波本桶与少量日本橡木桶，层次慢慢收拢。',
    image: 'A',
  },
  {
    title: '装瓶',
    text: '低干预装瓶，只保留最能代表年份与产地的风味。',
    image: 'B',
  },
]

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (event: MouseEvent) => setPos({ x: event.clientX, y: event.clientY })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
  return pos
}

export function useGlobalMotion() {
  useEffect(() => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const setVars = (x: number, y: number, progress: number) => {
      root.style.setProperty('--motion-x', x.toFixed(4))
      root.style.setProperty('--motion-y', y.toFixed(4))
      root.style.setProperty('--scroll-progress', progress.toFixed(4))
    }

    if (reduced) {
      setVars(0, 0, 0)
      return
    }

    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let scrollProgress = 0
    let frame = 0

    const updateScroll = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      scrollProgress = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1)
      root.style.setProperty('--scroll-progress', scrollProgress.toFixed(4))
    }

    const onMouseMove = (event: MouseEvent) => {
      targetX = (event.clientX / window.innerWidth) * 2 - 1
      targetY = (event.clientY / window.innerHeight) * 2 - 1
    }

    const tick = () => {
      currentX += (targetX - currentX) * 0.08
      currentY += (targetY - currentY) * 0.08
      setVars(currentX, currentY, scrollProgress)
      frame = window.requestAnimationFrame(tick)
    }

    updateScroll()
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', updateScroll)
    frame = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', updateScroll)
      window.cancelAnimationFrame(frame)
    }
  }, [])
}

export function useRevealOnScroll() {
  useLayoutEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!nodes.length) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      gsap.set(nodes, { opacity: 1, y: 0, filter: 'none' })
      return
    }

    gsap.set(nodes, { opacity: 0, y: 24, filter: 'blur(10px)' })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          observer.unobserve(entry.target)
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.9,
            ease: 'power3.out',
          })
        })
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])
}

function LiquidShader({ color = '#C87533', accent = '#E8B547' }: { color?: string; accent?: string }) {
  const mesh = useRef<THREE.Mesh>(null!)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uAccent: { value: new THREE.Color(accent) },
      uLight: { value: new THREE.Vector2(0.2, 0.8) },
      uIntensity: { value: 1 },
    }),
    [accent, color],
  )

  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime()
    const target = state.pointer
    uniforms.uLight.value.lerp(new THREE.Vector2((target.x + 1) / 2, 1 - (target.y + 1) / 2), 0.04)
    if (mesh.current) {
      mesh.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.25) * 0.03
    }
  })

  return (
    <mesh ref={mesh} position={[0, 0, 0.02]}>
      <planeGeometry args={[4.6, 5.4, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          precision highp float;
          varying vec2 vUv;
          uniform float uTime;
          uniform vec3 uColor;
          uniform vec3 uAccent;
          uniform vec2 uLight;
          uniform float uIntensity;

          float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 78.233);
            return fract(p.x * p.y);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
          }

          float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            for (int i = 0; i < 5; i++) {
              value += amplitude * noise(p);
              p *= 2.02;
              amplitude *= 0.5;
            }
            return value;
          }

          void main() {
            vec2 uv = vUv;
            vec2 center = vec2(0.5, 0.5);
            vec2 p = uv - center;
            float breath = 0.5 + 0.5 * sin(uTime * 0.6283185);
            float warp = fbm(uv * 4.0 + vec2(uTime * 0.05, -uTime * 0.04));
            float waves = sin((uv.x * 10.0 + uTime * 0.7) + warp * 1.8) * 0.015;
            float waves2 = cos((uv.y * 14.0 - uTime * 0.5) + warp * 2.4) * 0.012;
            p.y += waves + waves2;
            p.x += sin(uTime * 0.3 + uv.y * 12.0) * 0.01;

            float dist = length(p * vec2(1.0, 1.05));
            float body = smoothstep(0.72, 0.28, dist);
            float edge = smoothstep(0.72, 0.56, dist);

            vec3 base = mix(vec3(0.08, 0.03, 0.01), uColor, body);
            base = mix(base, uAccent, pow(max(0.0, 1.0 - dist * 1.4), 2.2) * 0.25);

            vec2 lightDir = normalize(vec2(-0.8, 0.9));
            vec2 n = normalize(vec2(
              fbm(uv * 8.0 + uTime * 0.15) - fbm((uv + vec2(0.01, 0.0)) * 8.0 + uTime * 0.15),
              fbm(uv * 8.0 + uTime * 0.15) - fbm((uv + vec2(0.0, 0.01)) * 8.0 + uTime * 0.15)
            ));
            float diffuse = dot(n, lightDir) * 0.5 + 0.5;

            float fresnel = pow(1.0 - max(dot(normalize(vec3(p, 0.9)), vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
            float scatter = smoothstep(0.8, 0.0, dist) * (0.35 + 0.65 * breath);
            float caustic = pow(max(0.0, sin((uv.x + uv.y) * 24.0 + uTime * 1.5) * 0.5 + 0.5), 5.0);
            caustic *= smoothstep(0.8, 0.25, dist);
            float sparkle = pow(max(0.0, dot(normalize(vec2(uv.x - 0.5, uv.y - 0.55)), lightDir)), 14.0);

            vec3 color = base;
            color += diffuse * 0.10;
            color += fresnel * vec3(0.85, 0.72, 0.35) * 0.6;
            color += scatter * vec3(0.26, 0.12, 0.05);
            color += caustic * vec3(0.9, 0.72, 0.2) * 0.5;
            color += sparkle * vec3(1.0, 0.95, 0.7) * 0.8;

            float chroma = (1.0 - body) * 0.015 + fresnel * 0.02;
            color.r += chroma * 0.7;
            color.b -= chroma * 0.8;

            float vignette = smoothstep(0.92, 0.34, length(uv - 0.5));
            color *= vignette;
            color += vec3(0.02, 0.012, 0.006) * uIntensity;

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  )
}

function HeroBackdrop() {
  return (
    <Canvas className="absolute inset-0 h-full w-full" dpr={[1, 1.75]} camera={{ position: [0, 0, 3.8], fov: 38 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[-2, 2.5, 2]} intensity={3.2} color="#ffd38a" />
      <Suspense fallback={null}>
        <LiquidShader />
      </Suspense>
    </Canvas>
  )
}

export function GlobalMotionLayer() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="motion-orb motion-orb-a" />
      <div className="motion-orb motion-orb-b" />
      <div className="motion-orb motion-orb-c" />
      <div className="motion-grid" />
      <div className="motion-scanline" />
      <div className="motion-progress-track">
        <div className="motion-progress-bar" />
      </div>
    </div>
  )
}

export function Bottle({ active = false, scroll = 0, hover = false, label = 'Shizuko' }: { active?: boolean; scroll?: number; hover?: boolean; label?: string }) {
  const group = useRef<THREE.Group>(null!)
  const liquid = useRef<THREE.Mesh>(null!)
  const bottle = useRef<THREE.Mesh>(null!)
  const accent = hover ? '#f3cf7a' : '#e8b547'
  const mixer = useMemo(() => new THREE.Vector2(0, 0), [])
  const wave = useMemo(() => new THREE.Vector2(0, 0), [])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (!group.current) return
    group.current.rotation.y = t * (active ? 0.16 : 0.12)
    group.current.rotation.x = Math.sin(t * 0.3) * 0.03 + THREE.MathUtils.clamp(scroll * 0.0012, -0.32, 0.32)

    if (liquid.current) {
      const targetY = THREE.MathUtils.clamp(scroll * 0.003, -0.22, 0.22)
      mixer.y = THREE.MathUtils.lerp(mixer.y, targetY, 0.04)
      mixer.x = THREE.MathUtils.lerp(mixer.x, -scroll * 0.0006, 0.04)
      liquid.current.rotation.z = mixer.x
      liquid.current.rotation.x = mixer.y
      liquid.current.position.y = THREE.MathUtils.lerp(liquid.current.position.y, mixer.y * 0.2, 0.03)
      liquid.current.scale.y = 1 + Math.abs(scroll) * 0.0003
      const material = liquid.current.material as THREE.ShaderMaterial
      if (material.uniforms.uTime) material.uniforms.uTime.value = t
      if (material.uniforms.uTilt) material.uniforms.uTilt.value.set(mixer.x, mixer.y)
      if (material.uniforms.uHover) material.uniforms.uHover.value = hover ? 1 : 0
      if (material.uniforms.uAccent) {
        material.uniforms.uAccent.value.set(hover ? '#f3cf7a' : '#e8b547')
      }
    }
    if (bottle.current) {
      const material = bottle.current.material as THREE.MeshPhysicalMaterial
      material.roughness = hover ? 0.12 : 0.2
      material.clearcoat = hover ? 1 : 0.8
      material.emissiveIntensity = hover ? 0.25 : 0.12
    }
    wave.x = THREE.MathUtils.lerp(wave.x, hover ? 1 : 0, delta * 4)
  })

  const liquidMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uTilt: { value: new THREE.Vector2(0, 0) },
          uHover: { value: 0 },
          uColor: { value: new THREE.Color('#C87533') },
          uAccent: { value: new THREE.Color(accent) },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision highp float;
          varying vec2 vUv;
          varying vec3 vPosition;
          uniform float uTime;
          uniform vec2 uTilt;
          uniform float uHover;
          uniform vec3 uColor;
          uniform vec3 uAccent;

          float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
          }

          void main() {
            vec2 uv = vUv;
            float fluidLine = 0.5 + uTilt.y * 0.32 + sin(uTime * 0.8 + uv.x * 9.0) * 0.02;
            float liquidMask = smoothstep(fluidLine + 0.02, fluidLine - 0.02, uv.y);
            float foam = smoothstep(fluidLine - 0.02, fluidLine + 0.08, uv.y) * (0.45 + 0.55 * uHover);
            float bubbles = 0.0;
            for (int i = 0; i < 6; i++) {
              float fi = float(i);
              vec2 p = vec2(fract(fi * 0.143 + uTime * 0.03 + fi * 0.11), fract(fi * 0.213 + uTime * 0.07));
              p.y = 1.0 - p.y;
              float d = length(uv - vec2(p.x, mix(0.1, 0.95, p.y)));
              bubbles += smoothstep(0.05, 0.0, d) * smoothstep(0.1, 0.85, uv.y);
            }
            float grain = hash(uv * 120.0 + uTime);
            vec3 col = mix(vec3(0.05, 0.02, 0.01), uColor, liquidMask);
            col += foam * uAccent * 0.22;
            col += bubbles * vec3(1.0, 0.95, 0.75) * 0.22;
            col += grain * 0.018;
            float alpha = liquidMask * 0.84 + foam * 0.65;
            gl_FragColor = vec4(col, alpha);
          }
        `,
      }),
    [accent],
  )

  return (
    <group ref={group} scale={active ? 1.1 : 1}>
      <mesh ref={bottle} castShadow receiveShadow>
        <latheGeometry args={[bottleProfile, 96]} />
        <meshPhysicalMaterial
          color="#191312"
          transparent
          opacity={0.42}
          transmission={0.85}
          thickness={1.25}
          roughness={0.16}
          metalness={0.05}
          clearcoat={0.9}
          clearcoatRoughness={0.08}
          ior={1.5}
          envMapIntensity={1.4}
        />
      </mesh>
      <mesh position={[0, 0.03, 0]} scale={[0.82, 1.36, 0.82]} ref={liquid} material={liquidMaterial}>
        <latheGeometry args={[liquidProfile, 96]} />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.26, 0.34, 0.82, 48]} />
        <meshPhysicalMaterial color="#140b08" roughness={0.3} transmission={0.4} thickness={0.3} />
      </mesh>
      <mesh position={[0, -0.95, 0.22]} rotation={[0, 0, 0.03]}>
        <planeGeometry args={[1.22, 0.72]} />
        <meshStandardMaterial color="#f3e8d8" roughness={0.78} metalness={0.02} />
      </mesh>
      <Html position={[0, -0.93, 0.24]} center transform distanceFactor={10}>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.4em] text-black/80">{label}</div>
        </div>
      </Html>
    </group>
  )
}

const bottleProfile = [
  new THREE.Vector2(0.0, -1.6),
  new THREE.Vector2(0.55, -1.55),
  new THREE.Vector2(0.65, -1.0),
  new THREE.Vector2(0.72, -0.25),
  new THREE.Vector2(0.58, 0.55),
  new THREE.Vector2(0.5, 1.35),
  new THREE.Vector2(0.33, 1.92),
  new THREE.Vector2(0.22, 2.55),
  new THREE.Vector2(0.3, 2.9),
  new THREE.Vector2(0.44, 3.0),
]

const liquidProfile = [
  new THREE.Vector2(0.0, -1.25),
  new THREE.Vector2(0.44, -1.22),
  new THREE.Vector2(0.54, -0.8),
  new THREE.Vector2(0.61, -0.12),
  new THREE.Vector2(0.5, 0.7),
  new THREE.Vector2(0.45, 1.15),
  new THREE.Vector2(0.29, 1.7),
  new THREE.Vector2(0.18, 2.15),
]

function IceCursor({ active }: { active: boolean }) {
  const cursor = useRef<HTMLDivElement>(null!)
  const pos = useMousePosition()

  useEffect(() => {
    if (!cursor.current) return
    gsap.to(cursor.current, {
      x: pos.x - 18,
      y: pos.y - 18,
      duration: 0.14,
      ease: 'power3.out',
    })
  }, [pos.x, pos.y])

  return (
    <div
      ref={cursor}
      className={`pointer-events-none fixed left-0 top-0 z-[60] hidden h-9 w-9 md:block ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Canvas className="h-full w-full" dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 35 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[1, 2, 3]} intensity={2.1} color="#ffffff" />
        <mesh rotation={[0.35, 0.6, 0.15]}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshPhysicalMaterial
            color="#d7f3ff"
            transparent
            opacity={0.42}
            transmission={1}
            roughness={0.03}
            thickness={1.2}
            ior={1.35}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>
      </Canvas>
    </div>
  )
}

function HeroSection({
  onBottleHover,
  bottleHover,
  wheel,
}: {
  onBottleHover: (value: boolean) => void
  bottleHover: boolean
  wheel: number
}) {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <HeroBackdrop />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_24%),linear-gradient(120deg,rgba(0,0,0,0.3),rgba(0,0,0,0.15)_30%,rgba(0,0,0,0.62))]" />
      <div className="section-shell relative z-10 grid min-h-screen items-center py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div data-reveal className="flex items-start gap-6 lg:gap-8">
          <div className="pt-10 text-[11px] uppercase tracking-[0.6em] text-white/50">
            <div className="vertical-rl h-[320px] font-display text-2xl tracking-[0.25em] text-[#f3e8d8]">
              静水
            </div>
          </div>
          <div className="max-w-2xl pt-16">
            <p className="mb-4 text-xs uppercase tracking-[0.55em] text-gold/80">Shizuko Whisky</p>
            <h1 className="title-shadow text-6xl font-semibold leading-[0.9] text-[#f5ead8] md:text-8xl">
              Small-batch
              <span className="mt-2 block font-display text-5xl italic text-[#e8b547] md:text-7xl">
                Japanese Whisky
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-sm leading-7 text-white/72 md:text-base">
              小批量手工蒸馏，保留谷物的温度、铜壶的纹理和东方审美的克制感。每一瓶都像一段慢下来的时间。
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#products"
                className="rounded-full border border-[#f0d49a]/30 bg-[#f0d49a]/10 px-6 py-3 text-sm tracking-[0.25em] text-[#f7e5b8] transition hover:bg-[#f0d49a]/18"
              >
                Explore
              </a>
              <a
                href="#craft"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm tracking-[0.25em] text-white/70 transition hover:bg-white/10"
              >
                Craft
              </a>
            </div>
          </div>
        </div>

        <div
          data-reveal
          className="relative flex min-h-[72vh] items-center justify-center motion-float-strong"
          onMouseEnter={() => onBottleHover(true)}
          onMouseLeave={() => onBottleHover(false)}
        >
          <div className="absolute inset-8 rounded-[3rem] bg-[radial-gradient(circle_at_50%_28%,rgba(232,181,71,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_42%)] blur-2xl motion-float-slow" />
          <Canvas className="relative z-10 h-[680px] w-full" camera={{ position: [0, 0.1, 6], fov: 34 }} dpr={[1, 1.6]}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[-4, 5, 5]} intensity={2.9} color="#ffd69b" />
            <directionalLight position={[2, -2, 1]} intensity={0.5} color="#6d3a14" />
            <Suspense fallback={<Html center className="text-white/50">Loading bottle...</Html>}>
              <Bottle active hover={bottleHover} scroll={wheel} label="Shizuko" />
            </Suspense>
            <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.2} maxPolarAngle={Math.PI / 2.2} />
          </Canvas>
        </div>
      </div>
    </section>
  )
}

function FlavorWheelSection() {
  const [active, setActive] = useState(flavors[0])
  const wheelRef = useRef<HTMLDivElement>(null!)
  const stageRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    gsap.fromTo(
      wheelRef.current,
      { scale: 0.95, rotate: -3, opacity: 0, y: 24 },
      { scale: 1, rotate: 0, opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' },
    )
  }, [])

  useEffect(() => {
    if (!stageRef.current) return
    gsap.fromTo(
      stageRef.current.querySelectorAll('[data-flavor-hero]'),
      { opacity: 0.62, y: 10 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'power3.out' },
    )
  }, [active.id])

  return (
    <section id="flavor" className="relative overflow-hidden py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-1/2 top-0 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,181,71,0.18),transparent_68%)] blur-3xl" />
      <div className="section-shell">
        <div data-reveal className="mb-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.55em] text-gold/75">Flavor Compass</p>
            <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">风味轮盘</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/60 lg:justify-self-end">
            这一段改成更像一张“风味航海图”：
            中央是当前酒体，外圈是四个方向的风味锚点，hover 即可整体换色、换光感和换叙述。
          </p>
        </div>

        <div
          ref={wheelRef}
          data-reveal
          className="glass-panel relative overflow-hidden rounded-[3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(135deg,rgba(17,11,9,0.9),rgba(8,7,10,0.98))] p-5 shadow-soft md:p-6"
          style={
            {
              '--wheel-tint': active.tint,
              '--wheel-accent': active.accent,
            } as React.CSSProperties
          }
        >
          <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <div
              ref={stageRef}
              className="relative min-h-[620px] overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.1),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]"
            >
              <div
                className="absolute inset-0 opacity-95"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${active.tint}34 0%, transparent 36%), radial-gradient(circle at 50% 50%, ${active.accent}26 0%, transparent 18%), linear-gradient(180deg, rgba(255,255,255,0.06), transparent 72%)`,
                }}
              />
              <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)] opacity-60" />

              <div className="absolute left-6 top-6 flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: active.accent, boxShadow: `0 0 18px ${active.accent}cc` }}
                />
                <span className="text-[11px] uppercase tracking-[0.5em] text-white/45">Tasting compass</span>
              </div>
              <div className="absolute right-6 top-6 text-right text-[11px] uppercase tracking-[0.45em] text-white/35">
                <div data-flavor-hero>{`0${flavors.findIndex((item) => item.id === active.id) + 1}`.slice(-2)}</div>
                <div data-flavor-hero className="mt-2 text-white/55">
                  / 04
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-[360px] w-[360px] md:h-[400px] md:w-[400px]">
                  <div
                    className="absolute inset-0 rounded-full border border-white/10"
                    style={{
                      background: `radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 44%, transparent 72%)`,
                      boxShadow: `inset 0 0 80px ${active.tint}22, 0 0 120px rgba(0,0,0,0.22)`,
                    }}
                  />
                  <div className="absolute inset-[7%] animate-[spin_36s_linear_infinite] rounded-full border border-white/5" />
                  <div
                    className="absolute inset-[15%] rounded-full blur-2xl"
                    style={{
                      background: `radial-gradient(circle, ${active.accent}55 0%, ${active.tint}28 35%, transparent 72%)`,
                    }}
                  />
                  <div className="absolute inset-[28%] rounded-full border border-white/10 bg-black/35 shadow-[0_0_100px_rgba(0,0,0,0.35)]">
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.2),transparent_46%)]" />
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.08),transparent_52%)]" />
                    <div className="absolute inset-[18%] rounded-full border border-white/10" />
                    <div className="absolute inset-[28%] rounded-full border border-white/5" />
                  </div>
                  <div className="absolute inset-[40%] rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] shadow-[0_0_40px_rgba(0,0,0,0.3)]" />
                  <div
                    className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
                    style={{
                      background: `radial-gradient(circle, ${active.accent}16 0%, rgba(0,0,0,0.55) 58%)`,
                    }}
                  />

                  {flavors.map((item, index) => {
                    const slotClasses = [
                      'left-1/2 top-0 -translate-x-1/2 -translate-y-2',
                      'right-0 top-1/2 -translate-y-1/2 translate-x-2',
                      'left-1/2 bottom-0 -translate-x-1/2 translate-y-2',
                      'left-0 top-1/2 -translate-y-1/2 -translate-x-2',
                    ]
                    const arcClasses = [
                      'top-10 left-1/2 h-28 w-[2px] -translate-x-1/2',
                      'right-10 top-1/2 h-[2px] w-28 -translate-y-1/2',
                      'bottom-10 left-1/2 h-28 w-[2px] -translate-x-1/2',
                      'left-10 top-1/2 h-[2px] w-28 -translate-y-1/2',
                    ]
                    const isActive = active.id === item.id
                    return (
                      <button
                        key={item.id}
                        className={`group absolute ${slotClasses[index]} w-[168px] rounded-[1.35rem] border px-4 py-3 text-left backdrop-blur-md transition duration-300 ${
                          isActive
                            ? 'border-white/20 bg-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.22)]'
                            : 'border-white/8 bg-black/18 hover:border-white/16 hover:bg-white/[0.08]'
                        }`}
                        onMouseEnter={() => setActive(item)}
                        onFocus={() => setActive(item)}
                      >
                        <span
                          className={`absolute ${arcClasses[index]} rounded-full transition duration-300 ${
                            isActive ? 'opacity-100' : 'opacity-45 group-hover:opacity-80'
                          }`}
                          style={{ background: item.accent, boxShadow: `0 0 20px ${item.accent}88` }}
                        />
                        <span className="relative z-10 block">
                          <span className="block text-[11px] uppercase tracking-[0.35em] text-white/35">{item.short}</span>
                          <span className="mt-2 block text-base font-semibold text-white">{item.name}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="absolute bottom-5 left-5 right-5 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/22 p-4 backdrop-blur-md">
                  <p data-flavor-hero className="text-[11px] uppercase tracking-[0.45em] text-white/35">
                    Active flavor
                  </p>
                  <div className="mt-3 flex items-end gap-3">
                    <h3 data-flavor-hero className="text-3xl font-semibold text-white md:text-4xl">
                      {active.name}
                    </h3>
                    <span className="pb-1 text-xs uppercase tracking-[0.45em] text-white/35">{active.short}</span>
                  </div>
                  <p data-flavor-hero className="mt-4 max-w-xl text-sm leading-7 text-white/70">
                    {active.description}
                  </p>
                </div>

                <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/18 p-4 backdrop-blur-md">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/35">
                    <span>Intensity</span>
                    <span>Layered</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${50 + indexFromFlavor(active.id) * 12}%`, background: `linear-gradient(90deg, ${active.tint}, ${active.accent})` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] uppercase tracking-[0.28em] text-white/35">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-center">Aroma</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-center">Body</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-center">Finish</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-[2.2rem] border border-white/10 bg-black/18 p-4 md:p-5">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.45em] text-white/35">Selected profile</p>
                <div className="mt-4 flex items-end gap-3">
                  <h3 className="text-3xl font-semibold text-white">{active.name}</h3>
                  <span className="pb-1 text-xs uppercase tracking-[0.45em] text-white/35">{active.short}</span>
                </div>
                <p className="mt-5 max-w-md text-sm leading-7 text-white/68">{active.description}</p>
              </div>

              <div className="grid gap-3">
                {flavors.map((item, index) => (
                  <button
                    key={item.id}
                    className={`group rounded-[1.4rem] border px-4 py-4 text-left transition duration-300 ${
                      active.id === item.id
                        ? 'border-white/20 bg-white/[0.09]'
                        : 'border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.06]'
                    }`}
                    onMouseEnter={() => setActive(item)}
                    onFocus={() => setActive(item)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-full border border-white/10"
                        style={{
                          background: `radial-gradient(circle, ${item.accent}cc 0%, ${item.tint}99 48%, rgba(255,255,255,0.08) 100%)`,
                          boxShadow: `0 0 24px ${item.accent}44`,
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-semibold text-white">{item.name}</span>
                          <span className="text-[11px] uppercase tracking-[0.3em] text-white/28">{`0${index + 1}`}</span>
                        </div>
                        <span className="mt-1 block text-[11px] uppercase tracking-[0.35em] text-white/35">
                          {item.short}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/60">{item.description}</p>
                  </button>
                ))}
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4">
                <p className="text-xs uppercase tracking-[0.45em] text-white/35">Hover behaviour</p>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  左侧负责“场景感”，右侧负责“阅读感”。鼠标划过任一方向，整个区块会重新着色，避免现在那种单纯圆盘的平面感。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CraftSection() {
  return (
    <section id="craft" className="py-24">
      <div className="section-shell">
        <div data-reveal className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.55em] text-gold/75">Process</p>
            <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">酿造工艺</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/60">
            横向时间轴，沿着选麦到装瓶的路径缓慢展开，像进入酒厂内部的动线。
          </p>
        </div>

        <div className="overflow-x-auto pb-6">
          <div className="flex min-w-max gap-5">
          {steps.map((step, index) => (
              <article data-reveal key={step.title} className="w-[320px] shrink-0 rounded-[2rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex h-[320px] items-end overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.03)),radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.18),transparent_30%)]">
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02))]">
                    <div className="text-[160px] font-semibold leading-none text-black/70 mix-blend-screen">{step.image}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <span className="text-xs uppercase tracking-[0.4em] text-white/30">0{index + 1}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/65">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product, index }: { product: (typeof products)[number]; index: number }) {
  const [hover, setHover] = useState(false)

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group glass-panel relative overflow-hidden rounded-[2.2rem] border border-white/10 p-5 transition duration-300 hover:-translate-y-1"
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${product.hue} opacity-70 transition duration-300 group-hover:opacity-100`} />
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-white/35">Series 0{index + 1}</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{product.name}</h3>
          </div>
          <span className="text-sm text-[#f3e8d8]">{product.price}</span>
        </div>
        <div className="flex min-h-[340px] items-center justify-center rounded-[1.8rem] border border-white/10 bg-black/20">
          <Canvas className="h-[340px] w-full" camera={{ position: [0, 0.1, 5.4], fov: 35 }} dpr={[1, 1.6]}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[-3, 5, 4]} intensity={2.8} color="#ffdba8" />
            <Suspense fallback={null}>
              <Bottle active hover={hover} scroll={hover ? 50 : 0} label={product.name} />
            </Suspense>
          </Canvas>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/70">{product.note}</p>
      </div>
    </article>
  )
}

function ProductsSection() {
  return (
    <section id="products" className="py-24">
      <div className="section-shell">
        <div data-reveal className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.55em] text-gold/75">Collection</p>
            <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">产品系列</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/60">
            三款风格清晰的瓶身，hover 时高光与姿态略微改变，强化陈列感。
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {products.map((product, index) => (
            <div data-reveal key={product.name}>
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PurchaseSection() {
  return (
    <section id="purchase" className="py-24">
      <div className="section-shell grid gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div data-reveal className="glass-panel rounded-[2.5rem] border border-white/10 p-8">
          <p className="text-xs uppercase tracking-[0.55em] text-gold/75">Buy</p>
          <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">购买页面</h2>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/62">
            购买流程已经单独拆出来，不再塞在首页里。这里保留一个导流入口，点进去会进入完整的选酒、加购和品牌说明页面。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="./purchase.html"
              className="rounded-full bg-[#f0d49a] px-8 py-3 text-sm tracking-[0.3em] text-black transition hover:brightness-110"
            >
              Open Purchase Page
            </a>
            <span className="text-xs uppercase tracking-[0.35em] text-white/35">Dedicated checkout view</span>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/35">Batch</p>
              <p className="mt-3 text-lg text-white">Small</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/35">Lead time</p>
              <p className="mt-3 text-lg text-white">2-4 days</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/35">Gift box</p>
              <p className="mt-3 text-lg text-white">Included</p>
            </div>
          </div>
        </div>

        <div data-reveal className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs uppercase tracking-[0.55em] text-gold/75">Brand Story</p>
          <div className="mt-5 space-y-5 text-sm leading-8 text-white/68">
            <p>
              Shizuko 诞生于一间不追求规模的酒厂。我们相信，威士忌的力量不来自夸张，而来自耐心、准确和长期积累的工艺判断。
            </p>
            <p>
              每一批酒都由少量桶位独立决定走向，保留手工蒸馏里的温度波动，也保留风土和季节对香气的细微影响。
            </p>
            <p>
              我们把东方美学理解为“少即是多”背后的克制，让外观、节奏与口感都尽量简洁，但在细节处保持足够的深度。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function indexFromFlavor(id: string) {
  return Math.max(
    0,
    flavors.findIndex((item) => item.id === id),
  )
}

export default function App() {
  useGlobalMotion()
  useRevealOnScroll()
  const [bottleHover, setBottleHover] = useState(false)
  const [scroll, setScroll] = useState(0)
  const [wheel, setWheel] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setScroll(window.scrollY)
    }
    const onWheel = (event: WheelEvent) => {
      setWheel((prev) => prev + event.deltaY)
    }
    let frame = 0
    const decay = () => {
      setWheel((value) => {
        const next = value * 0.9
        return Math.abs(next) < 0.2 ? 0 : next
      })
      frame = window.requestAnimationFrame(decay)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: true })
    frame = window.requestAnimationFrame(decay)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="relative isolate min-h-screen">
      <GlobalMotionLayer />
      <div className="noise z-10" />
      <IceCursor active={bottleHover} />
      <div className="relative z-20">
        <HeroSection onBottleHover={setBottleHover} bottleHover={bottleHover} wheel={wheel} />
        <div data-reveal className="border-y border-white/5 bg-white/[0.015] py-4">
          <div className="section-shell flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.45em] text-white/40">
            <span>Small batch distillery</span>
            <span>Scroll / Hover / Explore</span>
            <span>Japanese craftsmanship</span>
          </div>
        </div>
        <FlavorWheelSection />
        <CraftSection />
        <ProductsSection />
        <PurchaseSection />
        <footer className="pb-12 pt-6">
          <div data-reveal className="section-shell flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.35em] text-white/28">
            <span>Shizuko Whisky</span>
            <span>Traditional spirit, contemporary restraint</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
