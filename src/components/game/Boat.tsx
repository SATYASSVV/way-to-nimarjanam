import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VinayakaIdol } from './VinayakaIdol';
import { useGameStore } from '../../store/gameStore';

interface BoatProps {
  dissolving?: boolean;
  dissolveProgress?: number;
}

export const Boat: React.FC<BoatProps> = ({ dissolving = false, dissolveProgress = 0 }) => {
  const boatRef = useRef<THREE.Group>(null);
  const wakeRef = useRef<THREE.Group>(null);
  const { boatX, boatSteer, isInvulnerable, currentLevel } = useGameStore();

  const boatWoodColor = '#7c2d12';     // Traditional dark teak wood
  const boatRimColor = '#9a3412';      // Warm cedar rim
  const brassColor = '#eab308';        // Brass accents & lanterns

  const hullGeometry = useMemo(() => {
    const stations = [
      { z: -2.05, width: 0.18, top: 0.38, bottom: 0.08 },
      { z: -1.55, width: 0.68, top: 0.42, bottom: -0.08 },
      { z: -0.55, width: 0.9, top: 0.44, bottom: -0.22 },
      { z: 0.65, width: 0.88, top: 0.46, bottom: -0.2 },
      { z: 1.55, width: 0.62, top: 0.52, bottom: -0.02 },
      { z: 2.12, width: 0.08, top: 0.92, bottom: 0.26 },
    ];
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    stations.forEach((station, stationIndex) => {
      vertices.push(
        -station.width, station.top, station.z,
        station.width, station.top, station.z,
        -station.width * 0.72, station.bottom, station.z,
        station.width * 0.72, station.bottom, station.z,
      );
      const v = stationIndex / (stations.length - 1);
      uvs.push(0, v, 1, v, 0.1, v + 0.12, 0.9, v + 0.12);
    });

    for (let stationIndex = 0; stationIndex < stations.length - 1; stationIndex += 1) {
      const current = stationIndex * 4;
      const next = current + 4;
      [[0, 2], [1, 3], [2, 3]].forEach(([lower, upper]) => {
        indices.push(current + lower, next + lower, current + upper);
        indices.push(current + upper, next + lower, next + upper);
      });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const woodTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.fillStyle = '#7c2d12';
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += 4) {
      const shade = 24 + Math.sin(y * 0.17) * 14;
      context.strokeStyle = `rgb(${92 + shade}, ${38 + shade * 0.35}, ${16 + shade * 0.12})`;
      context.lineWidth = 1 + (y % 13 === 0 ? 1 : 0);
      context.beginPath();
      context.moveTo(0, y);
      context.bezierCurveTo(64, y + Math.sin(y) * 3, 170, y - Math.cos(y) * 3, 256, y + Math.sin(y * 0.5) * 2);
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  useFrame((state) => {
    if (!boatRef.current) return;
    const t = state.clock.getElapsedTime();

    // 1. Position tracking
    boatRef.current.position.x = boatX;

    // 2. Gentle dynamic water bobbing
    const waveFreq = currentLevel.currentStrength * 3.0;
    const bobY = Math.sin(t * waveFreq) * 0.08 - 0.04;
    boatRef.current.position.y = bobY;

    // 3. Natural pitch (rocking front/back with waves)
    const pitch = Math.sin(t * waveFreq * 0.8) * 0.05;
    // 4. Steering roll (tilting left/right when turning)
    const roll = -boatSteer * 0.18 + Math.cos(t * waveFreq * 0.5) * 0.03;
    // 5. Gentle yaw drift
    const yaw = boatSteer * 0.08;

    boatRef.current.rotation.x = pitch;
    boatRef.current.rotation.z = roll;
    boatRef.current.rotation.y = yaw;

    // Wake particle animation
    if (wakeRef.current) {
      wakeRef.current.scale.z = 1.0 + Math.sin(t * 10) * 0.15;
      wakeRef.current.position.y = -0.15 + Math.sin(t * 5) * 0.02;
    }
  });

  // Visual flicker when invulnerable after obstacle collision
  const isBlinking = isInvulnerable && Math.floor(Date.now() / 100) % 2 === 0;

  return (
    <group ref={boatRef} position={[0, 0, 0]}>
      {/* Wooden Boat Hull */}
      <group visible={!isBlinking}>
        {/* Main Hull Body */}
        <mesh geometry={hullGeometry} castShadow receiveShadow>
          <meshStandardMaterial map={woodTexture ?? undefined} color={boatWoodColor} roughness={0.72} />
        </mesh>

        {/* Individual plank bands follow the curved hull profile. */}
        {[-1.55, -1.05, -0.55, -0.05, 0.45, 0.95, 1.45].map((z, index) => (
          <mesh key={index} position={[0, 0.39 + Math.abs(z) * 0.015, z]} castShadow>
            <boxGeometry args={[1.62 - Math.abs(z) * 0.22, 0.045, 0.045]} />
            <meshStandardMaterial color={index % 2 ? '#a0522d' : '#c27845'} roughness={0.8} />
          </mesh>
        ))}

        {/* Interior floor and transverse support ribs give the hull useful depth. */}
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <boxGeometry args={[1.25, 0.08, 3.15]} />
          <meshStandardMaterial color="#5b2110" roughness={0.9} />
        </mesh>
        {[-1.35, -0.45, 0.45, 1.35].map((z) => (
          <mesh key={`rib-${z}`} position={[0, 0.16, z]} castShadow>
            <boxGeometry args={[1.42, 0.12, 0.12]} />
            <meshStandardMaterial color="#b56535" roughness={0.8} />
          </mesh>
        ))}

        {/* Dark metal fasteners along the gunwales. */}
        {[-1.45, -0.7, 0.05, 0.8, 1.55].flatMap((z) => [-0.82, 0.82].map((x) => (
          <mesh key={`fastener-${x}-${z}`} position={[x, 0.52, z]} castShadow>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#292524" metalness={0.75} roughness={0.3} />
          </mesh>
        )))}

        {/* Curved Prow / Bow (Front of boat pointing +Z) */}
        <mesh position={[0, 0.25, 2.1]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.75, 1.2, 4]} />
          <meshStandardMaterial color={boatWoodColor} roughness={0.7} />
        </mesh>

        {/* Stern (Back of boat at -Z) */}
        <mesh position={[0, 0.25, -2.0]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[1.4, 0.55, 0.6]} />
          <meshStandardMaterial color={boatWoodColor} roughness={0.7} />
        </mesh>

        {/* Side Railings / Gunwales */}
        <mesh position={[-0.8, 0.45, 0]} castShadow>
          <boxGeometry args={[0.12, 0.25, 3.9]} />
          <meshStandardMaterial color={boatRimColor} roughness={0.5} />
        </mesh>
        <mesh position={[0.8, 0.45, 0]} castShadow>
          <boxGeometry args={[0.12, 0.25, 3.9]} />
          <meshStandardMaterial color={boatRimColor} roughness={0.5} />
        </mesh>

        {/* Front Brass Tip & Flagpole */}
        <mesh position={[0, 0.8, 2.5]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color={brassColor} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Devotional Saffron Flag */}
        <mesh position={[0.12, 1.05, 2.5]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.18, 0.35, 3]} />
          <meshStandardMaterial color="#f97316" roughness={0.6} />
        </mesh>

        {/* Front Decorative Lantern / Diya on Boat */}
        <group position={[0, 0.55, 2.0]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.08, 0.15, 8]} />
            <meshStandardMaterial color={brassColor} metalness={0.8} roughness={0.2} />
          </mesh>
          <pointLight color="#f59e0b" intensity={0.9} distance={3} />
        </group>

        {/* Wooden Seating Benches */}
        <mesh position={[0, 0.25, 1.1]}>
          <boxGeometry args={[1.4, 0.08, 0.4]} />
          <meshStandardMaterial color={boatRimColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.25, -1.1]}>
          <boxGeometry args={[1.4, 0.08, 0.4]} />
          <meshStandardMaterial color={boatRimColor} roughness={0.6} />
        </mesh>

        {/* Revered Clay Vinayaka Idol seated respectfully on consecrated throne */}
        <VinayakaIdol dissolving={dissolving} dissolveProgress={dissolveProgress} />
      </group>

      {/* Dynamic Water Wake & Foam behind Boat */}
      <group ref={wakeRef} position={[0, -0.15, -2.5]}>
        {/* Central trailing foam strip */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 3.5]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>
        {/* Left wake ripple */}
        <mesh position={[-0.8, 0, 0.5]} rotation={[-Math.PI / 2, 0, -0.2]}>
          <planeGeometry args={[0.8, 2.8]} />
          <meshBasicMaterial
            color="#bae6fd"
            transparent
            opacity={0.25}
            depthWrite={false}
          />
        </mesh>
        {/* Right wake ripple */}
        <mesh position={[0.8, 0, 0.5]} rotation={[-Math.PI / 2, 0, 0.2]}>
          <planeGeometry args={[0.8, 2.8]} />
          <meshBasicMaterial
            color="#bae6fd"
            transparent
            opacity={0.25}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};
