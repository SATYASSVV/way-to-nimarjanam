import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ObstacleType } from '../../types/game';

interface Obstacle3DProps {
  type: ObstacleType;
  position: [number, number, number];
}

export const Obstacle3D: React.FC<Obstacle3DProps> = ({ type, position }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    if (type === 'whirlpool') {
      groupRef.current.rotation.y = t * 3.5;
    } else if (type === 'log') {
      groupRef.current.rotation.z = Math.sin(t * 2.0 + position[0]) * 0.08;
      groupRef.current.position.y = position[1] + Math.sin(t * 1.8) * 0.05;
    } else {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 1. Floating Log / Driftwood */}
      {type === 'log' && (
        <group rotation={[0, 0.4, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.32, 0.35, 3.2, 10]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
          {/* Branch stub */}
          <mesh position={[0.4, 0.3, 0.2]} rotation={[0.4, 0, 0.5]}>
            <cylinderGeometry args={[0.1, 0.14, 0.8, 6]} />
            <meshStandardMaterial color="#3f2305" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* 2. Sharp River Rock / Boulder */}
      {type === 'rock' && (
        <group>
          <mesh position={[0, 0.2, 0]} rotation={[0.3, 0.6, 0.2]}>
            <dodecahedronGeometry args={[1.1, 0]} />
            <meshStandardMaterial color="#44403c" roughness={0.95} />
          </mesh>
          {/* Water Foam Rim around Rock */}
          <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.1, 1.45, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
          </mesh>
        </group>
      )}

      {/* 3. Hazardous Debris Cluster */}
      {type === 'debris' && (
        <group>
          {/* Tangled industrial metal and barrel debris */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[1.6, 0.45, 1.4]} />
            <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.4} />
          </mesh>
          <mesh position={[0.4, 0.3, 0.2]} rotation={[0.5, 0.3, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.9, 10]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.6} />
          </mesh>
          {/* Warning red hazard indicator */}
          <pointLight position={[0, 0.6, 0]} color="#ef4444" intensity={0.8} distance={3} />
        </group>
      )}

      {/* 4. River Whirlpool Vortex */}
      {type === 'whirlpool' && (
        <group position={[0, -0.15, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 2.2, 24]} />
            <meshBasicMaterial color="#0284c7" transparent opacity={0.65} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.8, 1.8, 16]} />
            <meshBasicMaterial color="#e0f2fe" transparent opacity={0.4} />
          </mesh>
        </group>
      )}
    </group>
  );
};
