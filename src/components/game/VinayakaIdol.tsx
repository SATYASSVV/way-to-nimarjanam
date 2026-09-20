import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VinayakaIdolProps {
  dissolving?: boolean;
  dissolveProgress?: number;
}

export const VinayakaIdol: React.FC<VinayakaIdolProps> = ({ dissolving = false, dissolveProgress = 0 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Gentle devotional breathing motion
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.03;

    if (auraRef.current) {
      auraRef.current.intensity = 1.2 + Math.sin(t * 3) * 0.3;
    }
  });

  // Traditional natural clay material colors
  const clayColor = '#b45309';       // Warm terracotta clay
  const clayDark = '#78350f';        // Deep earthen accent
  const goldColor = '#fbbf24';       // Sacred gold crown and ornaments
  const garlandColor = '#f97316';    // Marigold orange garland
  const garlandRed = '#dc2626';      // Sacred vermilion / kumkum

  const opacity = dissolving ? Math.max(0, 1 - dissolveProgress) : 1;

  return (
    <group ref={groupRef} position={[0, 0.45, 0]}>
      {/* Devotional Aura Glow */}
      <pointLight
        ref={auraRef}
        position={[0, 1.2, 0.2]}
        color="#fbbf24"
        distance={4}
        decay={2}
        intensity={1.2}
      />

      {/* Sacred Peetam / Lotus Throne Base */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 0.2, 16]} />
        <meshStandardMaterial color="#854d0e" roughness={0.7} />
      </mesh>
      {/* Lotus Petal Ring Base */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.75, 0.65, 0.08, 12]} />
        <meshStandardMaterial color="#fb7185" roughness={0.6} />
      </mesh>

      {/* Main Body / Belly (Lambodara) */}
      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshStandardMaterial color={clayColor} roughness={0.8} />
      </mesh>

      {/* Chest & Torso */}
      <mesh position={[0, 0.68, 0.02]}>
        <cylinderGeometry args={[0.3, 0.38, 0.38, 16]} />
        <meshStandardMaterial color={clayColor} roughness={0.8} />
      </mesh>

      {/* Sacred Thread (Yajnopavita) across chest */}
      <mesh position={[0.02, 0.68, 0.18]} rotation={[0, 0, -0.6]}>
        <torusGeometry args={[0.32, 0.02, 8, 24]} />
        <meshStandardMaterial color="#fef08a" roughness={0.5} />
      </mesh>

      {/* Elephant Head */}
      <mesh position={[0, 1.05, 0.08]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color={clayColor} roughness={0.8} />
      </mesh>

      {/* Forehead Kumkum / Chandan Tilak */}
      <mesh position={[0, 1.15, 0.38]}>
        <boxGeometry args={[0.08, 0.12, 0.02]} />
        <meshStandardMaterial color={garlandRed} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.22, 0.38]}>
        <boxGeometry args={[0.16, 0.03, 0.02]} />
        <meshStandardMaterial color="#fef08a" roughness={0.4} />
      </mesh>

      {/* Trunk (Curving gracefully to the left/right) */}
      <group position={[0, 0.95, 0.25]}>
        {/* Upper trunk */}
        <mesh position={[0, 0, 0]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.08, 0.24, 12]} />
          <meshStandardMaterial color={clayColor} roughness={0.8} />
        </mesh>
        {/* Mid trunk */}
        <mesh position={[0.03, -0.16, 0.08]} rotation={[0.6, 0.3, 0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.2, 12]} />
          <meshStandardMaterial color={clayColor} roughness={0.8} />
        </mesh>
        {/* Lower curve holding sacred sweet modak */}
        <mesh position={[0.08, -0.28, 0.12]} rotation={[0.8, 0.6, 0]}>
          <cylinderGeometry args={[0.06, 0.04, 0.16, 12]} />
          <meshStandardMaterial color={clayColor} roughness={0.8} />
        </mesh>
      </group>

      {/* Modak (Sacred Sweet) */}
      <mesh position={[0.16, 0.68, 0.32]}>
        <coneGeometry args={[0.06, 0.1, 10]} />
        <meshStandardMaterial color="#fef08a" roughness={0.5} />
      </mesh>

      {/* Big Elephant Ears */}
      {/* Left Ear */}
      <mesh position={[-0.38, 1.05, 0.02]} rotation={[0, -0.3, -0.1]}>
        <boxGeometry args={[0.3, 0.32, 0.04]} />
        <meshStandardMaterial color={clayColor} roughness={0.8} />
      </mesh>
      {/* Right Ear */}
      <mesh position={[0.38, 1.05, 0.02]} rotation={[0, 0.3, 0.1]}>
        <boxGeometry args={[0.3, 0.32, 0.04]} />
        <meshStandardMaterial color={clayColor} roughness={0.8} />
      </mesh>

      {/* Tusks (Danta) - One complete, one half */}
      <mesh position={[-0.1, 0.95, 0.32]} rotation={[-0.4, 0, 0.2]}>
        <coneGeometry args={[0.025, 0.12, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[0.1, 0.96, 0.32]} rotation={[-0.4, 0, -0.2]}>
        <coneGeometry args={[0.025, 0.06, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      {/* Sacred Crown (Kireetam / Mukut) */}
      <group position={[0, 1.35, 0.05]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.26, 0.22, 16]} />
          <meshStandardMaterial color={goldColor} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <coneGeometry args={[0.18, 0.28, 16]} />
          <meshStandardMaterial color={goldColor} metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Crown Jewel */}
        <mesh position={[0, 0.1, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={garlandRed} roughness={0.2} />
        </mesh>
      </group>

      {/* Hands / Arms */}
      {/* Front Right Hand - Abhaya Mudra (Blessing) */}
      <group position={[0.42, 0.65, 0.22]} rotation={[0.4, 0.2, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.07, 0.26, 8]} />
          <meshStandardMaterial color={clayColor} roughness={0.8} />
        </mesh>
        {/* Palm facing forward */}
        <mesh position={[0, 0.16, 0.03]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.1, 0.12, 0.03]} />
          <meshStandardMaterial color={clayColor} roughness={0.8} />
        </mesh>
      </group>

      {/* Front Left Hand - Holding Modak */}
      <group position={[-0.38, 0.62, 0.22]} rotation={[0.3, -0.2, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.07, 0.24, 8]} />
          <meshStandardMaterial color={clayColor} roughness={0.8} />
        </mesh>
      </group>

      {/* Rear Sacred Arms */}
      <mesh position={[-0.42, 0.82, -0.05]} rotation={[-0.5, -0.4, 0.4]}>
        <cylinderGeometry args={[0.05, 0.06, 0.28, 8]} />
        <meshStandardMaterial color={clayColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.42, 0.82, -0.05]} rotation={[-0.5, 0.4, -0.4]}>
        <cylinderGeometry args={[0.05, 0.06, 0.28, 8]} />
        <meshStandardMaterial color={clayColor} roughness={0.8} />
      </mesh>

      {/* Devotional Flower Garland (Haralu) Draped Gracefully */}
      <mesh position={[0, 0.72, 0.22]} rotation={[0.5, 0, 0]}>
        <torusGeometry args={[0.34, 0.05, 8, 20]} />
        <meshStandardMaterial color={garlandColor} roughness={0.7} />
      </mesh>

      {/* Folded Legs (Padmasana) */}
      <mesh position={[0, 0.15, 0.15]} rotation={[1.4, 0, 0]}>
        <torusGeometry args={[0.36, 0.12, 10, 20, Math.PI]} />
        <meshStandardMaterial color={clayDark} roughness={0.8} />
      </mesh>
    </group>
  );
};
