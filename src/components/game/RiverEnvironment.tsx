import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { RiversidePeople } from './RiversidePeople';

export const RiverEnvironment: React.FC = () => {
  const { currentLevel, distanceTravelled } = useGameStore();
  const width = currentLevel.riverWidth;
  const halfWidth = width / 2;

  // Generate scenic elements along both banks
  const sceneryProps = useMemo(() => {
    const items: Array<{
      side: 'left' | 'right';
      x: number;
      zOffset: number;
      type: 'tree' | 'temple' | 'ghat' | 'rock' | 'bridge';
      scale: number;
    }> = [];

    // Place trees, rocks, ghats every 15 meters along the route
    for (let i = 0; i < 30; i++) {
      const zOffset = i * 14 - 40;
      const side = i % 2 === 0 ? 'left' : 'right';
      const x = side === 'left' ? -(halfWidth + 3.5 + (i % 3) * 1.5) : (halfWidth + 3.5 + (i % 3) * 1.5);

      let type: 'tree' | 'temple' | 'ghat' | 'rock' | 'bridge' = 'tree';
      if (currentLevel.environmentType === 'village_ghat') {
        type = i % 4 === 0 ? 'ghat' : i % 7 === 0 ? 'bridge' : 'tree';
      } else if (currentLevel.environmentType === 'cleanup_challenge') {
        type = i % 3 === 0 ? 'rock' : 'tree';
      } else if (currentLevel.environmentType === 'krishna_dawn') {
        type = i % 6 === 0 ? 'temple' : i % 2 === 0 ? 'tree' : 'rock';
      } else if (currentLevel.environmentType === 'estuary_sea') {
        type = i % 3 === 0 ? 'rock' : 'tree';
      }

      items.push({
        side,
        x,
        zOffset,
        type,
        scale: 0.8 + (i % 4) * 0.25,
      });
    }

    return items;
  }, [currentLevel.environmentType, halfWidth]);

  // Wrap z coordinates relative to travel distance for continuous scrolling
  const loopLength = 420;

  return (
    <group>
      <RiversidePeople
        riverHalfWidth={halfWidth}
        distanceTravelled={distanceTravelled}
        celebrationLevel={currentLevel.id}
      />

      {/* Repeating devotional flags and lamps make the banks feel inhabited without adding heavy assets. */}
      {[-1, 1].flatMap((side) => [0, 1, 2, 3].map((index) => {
        const z = ((index * 105 - distanceTravelled) % 420 + 420) % 420 - 30;
        const x = side * (halfWidth + 1.6);
        return (
          <group key={`bank-decoration-${side}-${index}`} position={[x, 0, z]}>
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.035, 3, 6]} />
              <meshStandardMaterial color="#713f12" roughness={0.9} />
            </mesh>
            <mesh position={[side * 0.22, 2.35, 0]} rotation={[0, 0, side * -0.15]}>
              <coneGeometry args={[0.28, 0.55, 3]} />
              <meshStandardMaterial color={index % 2 ? '#dc2626' : '#f97316'} roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.13, 0.09, 0.1, 8]} />
              <meshStandardMaterial color="#92400e" roughness={0.8} />
            </mesh>
            <pointLight position={[0, 0.4, 0]} color="#fbbf24" intensity={0.18} distance={2.5} />
          </group>
        );
      }))}
      {/* Left Riverbank Terrain */}
      <mesh position={[-(halfWidth + 12), 0.2, 50]}>
        <boxGeometry args={[24, 1.2, 220]} />
        <meshStandardMaterial color={currentLevel.bankColor} roughness={0.9} />
      </mesh>

      {/* Right Riverbank Terrain */}
      <mesh position={[(halfWidth + 12), 0.2, 50]}>
        <boxGeometry args={[24, 1.2, 220]} />
        <meshStandardMaterial color={currentLevel.bankColor} roughness={0.9} />
      </mesh>

      {/* Riverbank Decorative Green Edges / Sandy Slopes */}
      <mesh position={[-(halfWidth + 0.6), -0.05, 50]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[1.5, 0.5, 220]} />
        <meshStandardMaterial color="#3f6212" roughness={0.95} />
      </mesh>
      <mesh position={[(halfWidth + 0.6), -0.05, 50]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[1.5, 0.5, 220]} />
        <meshStandardMaterial color="#3f6212" roughness={0.95} />
      </mesh>

      {/* Scenery Objects along banks */}
      {sceneryProps.map((item, idx) => {
        // Calculate dynamic z based on distance
        const relativeZ = ((item.zOffset - distanceTravelled) % loopLength + loopLength) % loopLength - 30;

        return (
          <group key={idx} position={[item.x, 0.6, relativeZ]} scale={item.scale}>
            {item.type === 'tree' && (
              <group>
                {/* Palm / Banyan Tree Trunk */}
                <mesh position={[0, 1.5, 0]}>
                  <cylinderGeometry args={[0.2, 0.35, 3.2, 8]} />
                  <meshStandardMaterial color="#713f12" roughness={0.9} />
                </mesh>
                {/* Lush Foliage Canopies */}
                <mesh position={[0, 3.4, 0]}>
                  <sphereGeometry args={[1.4, 8, 8]} />
                  <meshStandardMaterial color="#166534" roughness={0.8} />
                </mesh>
                <mesh position={[0.4, 3.9, 0.2]}>
                  <sphereGeometry args={[1.0, 8, 8]} />
                  <meshStandardMaterial color="#15803d" roughness={0.8} />
                </mesh>
              </group>
            )}

            {item.type === 'temple' && (
              <group>
                {/* Temple Gopuram Tower Silhouette */}
                <mesh position={[0, 2.0, 0]}>
                  <boxGeometry args={[2.4, 4.0, 2.4]} />
                  <meshStandardMaterial color="#b45309" roughness={0.7} />
                </mesh>
                {/* Spire */}
                <mesh position={[0, 4.6, 0]}>
                  <coneGeometry args={[1.2, 1.6, 4]} />
                  <meshStandardMaterial color="#eab308" metalness={0.5} roughness={0.4} />
                </mesh>
                {/* Temple Kalasam */}
                <mesh position={[0, 5.6, 0]}>
                  <sphereGeometry args={[0.25, 8, 8]} />
                  <meshStandardMaterial color="#facc15" metalness={0.8} />
                </mesh>
              </group>
            )}

            {item.type === 'ghat' && (
              <group>
                {/* Stone Ghat Steps leading into water */}
                <mesh position={[item.side === 'left' ? 1.5 : -1.5, -0.1, 0]}>
                  <boxGeometry args={[3.2, 0.6, 6.0]} />
                  <meshStandardMaterial color="#78716c" roughness={0.8} />
                </mesh>
                <mesh position={[item.side === 'left' ? 2.5 : -2.5, 0.3, 0]}>
                  <boxGeometry args={[2.0, 0.6, 6.0]} />
                  <meshStandardMaterial color="#a8a29e" roughness={0.8} />
                </mesh>
                {/* Holy Lamp Post */}
                <mesh position={[0, 1.2, 0]}>
                  <cylinderGeometry args={[0.08, 0.1, 2.4, 8]} />
                  <meshStandardMaterial color="#44403c" metalness={0.6} />
                </mesh>
                <pointLight position={[0, 2.4, 0]} color="#f59e0b" intensity={0.8} distance={6} />
              </group>
            )}

            {item.type === 'rock' && (
              <group>
                <mesh position={[0, 0.4, 0]} rotation={[0.4, 0.8, 0.2]}>
                  <dodecahedronGeometry args={[1.3, 0]} />
                  <meshStandardMaterial color="#57534e" roughness={0.9} />
                </mesh>
              </group>
            )}

            {item.type === 'bridge' && (
              <group position={[item.side === 'left' ? (halfWidth + 3.5) / 2 : -(halfWidth + 3.5) / 2, 4.2, 0]}>
                {/* High village footbridge plank */}
                <mesh>
                  <boxGeometry args={[halfWidth * 1.5, 0.4, 2.0]} />
                  <meshStandardMaterial color="#78350f" roughness={0.8} />
                </mesh>
                {/* Bridge Pillars */}
                <mesh position={[-halfWidth / 2, -2.2, 0]}>
                  <cylinderGeometry args={[0.3, 0.3, 4.4, 8]} />
                  <meshStandardMaterial color="#78716c" roughness={0.8} />
                </mesh>
                <mesh position={[halfWidth / 2, -2.2, 0]}>
                  <cylinderGeometry args={[0.3, 0.3, 4.4, 8]} />
                  <meshStandardMaterial color="#78716c" roughness={0.8} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
