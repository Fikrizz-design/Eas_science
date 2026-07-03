import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Info } from 'lucide-react';

function Planet({ position, size, color, name, speed }: any) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      ref.current.position.x = Math.cos(time * speed) * position[0];
      ref.current.position.z = Math.sin(time * speed) * position[0];
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      <mesh
        ref={ref}
        position={[position[0], 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} />
        {hovered && (
          <Html distanceFactor={10} position={[0, size + 0.5, 0]}>
            <div className="bg-black/80 text-white px-3 py-1 rounded backdrop-blur-md border border-white/20 whitespace-nowrap text-sm">
              {name}
            </div>
          </Html>
        )}
      </mesh>
      {/* Orbit path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[position[0] - 0.05, position[0] + 0.05, 64]} />
        <meshBasicMaterial color="#ffffff" opacity={0.1} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function SolarSystem() {
  return (
    <div className="h-full flex flex-col relative">
      <header className="absolute top-4 left-4 z-10 bg-black/50 p-4 rounded-xl border border-white/10 backdrop-blur-md max-w-sm pointer-events-none">
        <h1 className="text-2xl font-display font-bold flex items-center space-x-2">
          <Info className="w-5 h-5 text-brand-400" />
          <span>Interactive Simulator</span>
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Explore the solar system, wormholes, and black holes. Drag to rotate, scroll to zoom.
        </p>
      </header>

      <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-black">
        <Canvas camera={{ position: [0, 20, 30], fov: 45 }}>
          <ambientLight intensity={0.1} />
          <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          {/* Sun */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[3, 64, 64]} />
            <meshBasicMaterial color="#FDB813" />
            <Html distanceFactor={15} position={[0, 4, 0]}>
              <div className="bg-orange-500/80 text-white px-3 py-1 rounded backdrop-blur-md border border-white/20">Sun</div>
            </Html>
          </mesh>

          {/* Planets */}
          <Planet name="Mercury" position={[6, 0, 0]} size={0.4} color="#888888" speed={0.8} />
          <Planet name="Venus" position={[9, 0, 0]} size={0.9} color="#e3bb76" speed={0.6} />
          <Planet name="Earth" position={[13, 0, 0]} size={1} color="#2b82c9" speed={0.5} />
          <Planet name="Mars" position={[17, 0, 0]} size={0.5} color="#c1440e" speed={0.4} />
          <Planet name="Jupiter" position={[24, 0, 0]} size={2.5} color="#d39c7e" speed={0.2} />

          {/* Simulated Black Hole */}
          <group position={[40, 0, -20]}>
            <mesh>
              <sphereGeometry args={[2, 32, 32]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.5, 5, 64]} />
              <meshBasicMaterial color="#8E2DE2" opacity={0.5} transparent side={THREE.DoubleSide} />
            </mesh>
            <Html distanceFactor={20} position={[0, 4, 0]}>
              <div className="bg-purple-900/80 text-white px-3 py-1 rounded backdrop-blur-md border border-white/20">Simulated Black Hole</div>
            </Html>
          </group>

          <OrbitControls enablePan={false} maxDistance={100} minDistance={10} />
        </Canvas>
      </div>
    </div>
  );
}
