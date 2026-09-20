import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { RiversidePeople } from './RiversidePeople';

export const OceanEnvironment: React.FC = () => {
  const { distanceTravelled, currentLevel } = useGameStore();
  const sanctumRef = useRef<THREE.Group>(null);

  // The sanctum destination is at targetDistance (1000m)
  const remainingToSanctum = currentLevel.targetDistance - distanceTravelled;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (sanctumRef.current) {
      // Gentle floating motion of sacred ocean mandap
      sanctumRef.current.position.y = Math.sin(t * 1.2) * 0.12;
      sanctumRef.current.rotation.y = Math.sin(t * 0.4) * 0.03;
    }
  });

  return (
    <group>
      <RiversidePeople
        riverHalfWidth={currentLevel.riverWidth / 2}
        distanceTravelled={distanceTravelled}
        celebrationLevel={currentLevel.id + 2}
      />
      {/* Broad Open Ocean Floor and Distant Horizon */}
      <mesh position={[0, -0.8, 80]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 300]} />
        <meshStandardMaterial color="#0c4a6e" roughness={0.7} />
      </mesh>

      {/* Floating Devotional Lamps on Ocean Surface */}
      {[-8, -4, 4, 8].map((x, idx) => {
        const lampZ = (idx * 25 - (distanceTravelled % 100)) % 100;
        return (
          <group key={idx} position={[x, -0.05, lampZ]}>
            <mesh>
              <cylinderGeometry args={[0.2, 0.12, 0.1, 8]} />
              <meshStandardMaterial color="#92400e" />
            </mesh>
            <pointLight color="#f59e0b" intensity={0.6} distance={4} />
          </group>
        );
      })}

      {/* Final Sacred Ocean Sanctum Platform (Appears ahead as distance approaches 1000m) */}
      <group
        ref={sanctumRef}
        position={[0, 0, remainingToSanctum]}
        visible={remainingToSanctum < 120}
      >
        {/* Consecrated Floating Floral Immersion Platform */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[7.0, 7.5, 0.6, 24]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>

        {/* Sacred Mandap Columns */}
        {[-3.5, 3.5].map((px) =>
          [-3.5, 3.5].map((pz) => (
            <group key={`${px}_${pz}`} position={[px, 1.8, pz]}>
              <mesh>
                <cylinderGeometry args={[0.25, 0.3, 3.2, 12]} />
                <meshStandardMaterial color="#d97706" metalness={0.6} roughness={0.3} />
              </mesh>
              {/* Pillar Lamp */}
              <pointLight position={[0, 1.7, 0]} color="#fbbf24" intensity={1.2} distance={8} />
            </group>
          ))
        )}

        {/* Mandap Canopy Roof */}
        <mesh position={[0, 3.6, 0]}>
          <coneGeometry args={[5.5, 2.0, 4]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>

        {/* Sacred Golden Kalasam on Top */}
        <mesh position={[0, 4.8, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#facc15" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Saffron & Red Devotional Flags */}
        {[-3.5, 3.5].map((fx, i) => (
          <group key={i} position={[fx, 3.8, 0]}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
              <meshStandardMaterial color="#facc15" />
            </mesh>
            <mesh position={[0.2, 0.8, 0]}>
              <coneGeometry args={[0.25, 0.5, 3]} />
              <meshStandardMaterial color="#f97316" />
            </mesh>
          </group>
        ))}

        {/* Consecrated Immersion Light Glow */}
        <pointLight position={[0, 1.5, 0]} color="#fde047" intensity={3.0} distance={20} />
      </group>
    </group>
  );
};
