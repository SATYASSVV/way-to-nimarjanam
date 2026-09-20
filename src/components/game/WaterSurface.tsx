import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

export const WaterSurface: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { currentLevel } = useGameStore();

  // Create a segmented plane geometry for vertex wave animation
  const geom = useMemo(() => {
    return new THREE.PlaneGeometry(60, 200, 48, 64);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const pos = geom.attributes.position;
    const count = pos.count;
    const speed = currentLevel.currentStrength * 1.8;

    // Animated sine waves along the river length
    for (let i = 0; i < count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i); // In planeGeometry, Y is the Z axis once rotated
      // Longitudinal wave + lateral ripples
      const wave = Math.sin(v * 0.12 + t * speed) * 0.22 +
                   Math.cos(u * 0.25 + t * speed * 1.3) * 0.12;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
  });

  return (
    <group position={[0, -0.2, 50]}>
      {/* Primary Animated River Surface */}
      <mesh ref={meshRef} geometry={geom} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial
          color={currentLevel.waterColor}
          roughness={0.25}
          metalness={0.65}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Deep Riverbed Water Base (prevents see-through bottom) */}
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 200]} />
        <meshStandardMaterial
          color={currentLevel.waterDeepColor}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
};
