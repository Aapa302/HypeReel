import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, Lightformer, MeshTransmissionMaterial } from '@react-three/drei'
import { Suspense, useEffect, useRef } from 'react'

/**
 * The canvas sits behind the UI with pointer-events disabled, so the pointer is
 * tracked on the window instead of relying on canvas events.
 */
function MouseParallax({ children, strength = 0.35 }) {
  const group = useRef()
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (event) => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, delta) => {
    if (!group.current) return
    const { x, y } = pointer.current
    const ease = Math.min(delta * 2, 1)
    group.current.rotation.y += (x * strength - group.current.rotation.y) * ease
    group.current.rotation.x += (-y * strength * 0.6 - group.current.rotation.x) * ease
  })

  return <group ref={group}>{children}</group>
}

function Spinning({ speed = 0.2, axis = 'y', children }) {
  const mesh = useRef()

  useFrame((_, delta) => {
    if (!mesh.current) return
    mesh.current.rotation[axis] += delta * speed
    mesh.current.rotation.z += delta * speed * 0.35
  })

  return <group ref={mesh}>{children}</group>
}

function GlassShape({ position, scale = 1, geometry, color, speed = 0.2, rotationIntensity = 1 }) {
  return (
    <Float speed={1.1} rotationIntensity={rotationIntensity} floatIntensity={1.6} position={position}>
      <Spinning speed={speed}>
        <mesh scale={scale} castShadow>
          {geometry}
          <MeshTransmissionMaterial
            thickness={0.9}
            roughness={0.12}
            chromaticAberration={0.35}
            anisotropy={0.4}
            ior={1.4}
            distortion={0.3}
            distortionScale={0.4}
            temporalDistortion={0.15}
            color={color}
            backside
          />
        </mesh>
      </Spinning>
    </Float>
  )
}

function MetallicShape({ position, scale = 1, geometry, color, speed = 0.3 }) {
  return (
    <Float speed={1.4} rotationIntensity={1.2} floatIntensity={1.2} position={position}>
      <Spinning speed={speed} axis="x">
        <mesh scale={scale}>
          {geometry}
          <meshStandardMaterial color={color} metalness={1} roughness={0.22} envMapIntensity={1.4} />
        </mesh>
      </Spinning>
    </Float>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 8], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 8, 5]} intensity={1.6} color="#c4b5fd" />
      <pointLight position={[-6, -3, 2]} intensity={40} color="#ec4899" />
      <pointLight position={[6, 3, -2]} intensity={30} color="#38bdf8" />

      <Suspense fallback={null}>
        <MouseParallax>
          <GlassShape
            position={[-3.1, 0.8, 0]}
            scale={1.35}
            color="#a855f7"
            geometry={<icosahedronGeometry args={[1, 0]} />}
          />
          <GlassShape
            position={[3.2, -0.9, -1.2]}
            scale={1.05}
            color="#38bdf8"
            speed={0.28}
            geometry={<sphereGeometry args={[1, 48, 48]} />}
          />
          <MetallicShape
            position={[2.4, 1.9, -2.4]}
            scale={0.85}
            color="#f472b6"
            geometry={<torusGeometry args={[1, 0.32, 32, 96]} />}
          />
          <MetallicShape
            position={[-2.6, -2.1, -2]}
            scale={0.7}
            color="#818cf8"
            speed={0.42}
            geometry={<torusKnotGeometry args={[0.75, 0.24, 128, 24]} />}
          />
        </MouseParallax>
        <Environment resolution={64}>
          <Lightformer form="rect" intensity={2.4} color="#a855f7" position={[-4, 3, 4]} scale={[8, 8, 1]} />
          <Lightformer form="rect" intensity={2} color="#38bdf8" position={[4, -2, 4]} scale={[8, 8, 1]} />
          <Lightformer form="ring" intensity={3} color="#ec4899" position={[0, 2, -6]} scale={[6, 6, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  )
}
