import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CollectibleType } from '../../types/game';

interface Collectible3DProps {
  type: CollectibleType;
  position: [number, number, number];
}

export const Collectible3D: React.FC<Collectible3DProps> = ({ type, position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Bobbing on water
    groupRef.current.position.y = position[1] + Math.sin(t * 2.5 + position[0]) * 0.08;

    // Slow rotation
    if (type === 'om_coin') {
      groupRef.current.rotation.y = t * 2.2;
    } else if (type === 'plastic_bottle' || type === 'plastic_cover') {
      groupRef.current.rotation.y = Math.sin(t * 1.5) * 0.3;
      groupRef.current.rotation.z = Math.cos(t * 1.8) * 0.15;
    } else if (type === 'lotus') {
      groupRef.current.rotation.y = t * 0.5;
    }

    if (flameRef.current) {
      flameRef.current.intensity = 1.2 + Math.sin(t * 8) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 1. Plastic Cover / Bag */}
      {type === 'plastic_cover' && (
        <group>
          <mesh rotation={[0.4, 0.2, 0.3]}>
            <dodecahedronGeometry args={[0.35, 1]} />
            <meshStandardMaterial
              color="#e2e8f0"
              transparent
              opacity={0.65}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <torusGeometry args={[0.18, 0.04, 6, 12]} />
            <meshStandardMaterial color="#cbd5e1" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* 2. Plastic Bottle */}
      {type === 'plastic_bottle' && (
        <group rotation={[1.4, 0.4, 0.2]}>
          {/* Bottle Cylinder */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.55, 12]} />
            <meshStandardMaterial
              color="#38bdf8"
              transparent
              opacity={0.7}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
          {/* Bottle Neck */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.06, 0.12, 0.18, 12]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
          {/* Blue Cap */}
          <mesh position={[0, 0.47, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.08, 12]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* 3. Floating Fishing Net */}
      {type === 'fishing_net' && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.42, 0.08, 8, 16]} />
            <meshStandardMaterial color="#1e293b" wireframe />
          </mesh>
          {/* Floats / corks */}
          {[-0.35, 0, 0.35].map((x, i) => (
            <mesh key={i} position={[x, 0.08, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#ea580c" />
            </mesh>
          ))}
        </group>
      )}

      {/* 4. Sacred Lotus Flower (+20 Eco) */}
      {type === 'lotus' && (
        <group position={[0, 0.05, 0]}>
          {/* Lilypad Base */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <circleGeometry args={[0.5, 16]} />
            <meshStandardMaterial color="#15803d" roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
          {/* Lotus Outer Pink Petals */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh
                key={i}
                position={[Math.cos(rad) * 0.22, 0.1, Math.sin(rad) * 0.22]}
                rotation={[0.3, -rad, 0]}
              >
                <coneGeometry args={[0.12, 0.35, 5]} />
                <meshStandardMaterial color="#f472b6" roughness={0.4} />
              </mesh>
            );
          })}
          {/* Lotus Inner White/Yellow Core */}
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={0.5} />
          </mesh>
          <pointLight color="#f472b6" intensity={0.6} distance={2.5} />
        </group>
      )}

      {/* 5. Holy Diya Lamp (+20 Eco) */}
      {type === 'diya' && (
        <group position={[0, 0.08, 0]}>
          {/* Terracotta Clay Base */}
          <mesh>
            <cylinderGeometry args={[0.26, 0.15, 0.16, 12]} />
            <meshStandardMaterial color="#b45309" roughness={0.8} />
          </mesh>
          {/* Golden Flame */}
          <mesh position={[0, 0.18, 0]}>
            <coneGeometry args={[0.09, 0.24, 8]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={1.2}
              roughness={0.2}
            />
          </mesh>
          <pointLight ref={flameRef} position={[0, 0.22, 0]} color="#f59e0b" intensity={1.4} distance={3.5} />
        </group>
      )}

      {/* 6. Sacred Om Coin (+20 Eco) */}
      {type === 'om_coin' && (
        <group position={[0, 0.35, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.38, 0.38, 0.07, 24]} />
            <meshStandardMaterial
              color="#facc15"
              metalness={0.85}
              roughness={0.25}
              emissive="#ca8a04"
              emissiveIntensity={0.4}
            />
          </mesh>
          {/* Inner Om Emblem Ring */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.26, 0.03, 8, 20]} />
            <meshStandardMaterial color="#fef08a" metalness={0.9} roughness={0.2} />
          </mesh>
          <pointLight color="#fde047" intensity={1.0} distance={3.5} />
        </group>
      )}
    </group>
  );
};
