import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'

function Orb() {
  const mesh = useRef()

  useFrame((state, delta) => {
    if (!mesh.current) return
    mesh.current.rotation.y += delta * 0.9
    mesh.current.rotation.x += delta * 0.45
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.06
    mesh.current.scale.setScalar(pulse)
  })

  return (
    <group ref={mesh}>
      <mesh>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#a855f7" metalness={0.9} roughness={0.18} />
      </mesh>
      <mesh scale={1.32}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#ec4899" wireframe transparent opacity={0.45} />
      </mesh>
    </group>
  )
}

export default function LoadingOrb({ className = '' }) {
  return (
    <div className={`h-40 w-40 ${className}`}>
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.2], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 3, 3]} intensity={30} color="#38bdf8" />
        <pointLight position={[-3, -2, 2]} intensity={25} color="#ec4899" />
        <Suspense fallback={null}>
          <Orb />
        </Suspense>
      </Canvas>
    </div>
  )
}
