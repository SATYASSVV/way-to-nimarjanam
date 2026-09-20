import React, { useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RiversidePeopleProps {
  riverHalfWidth: number;
  distanceTravelled: number;
  celebrationLevel: number;
}

const PEOPLE_LOOP_LENGTH = 420;
const SHIRT_COLORS = ['#dc2626', '#2563eb', '#eab308', '#16a34a', '#db2777', '#ea580c'];
const SKIN_COLORS = ['#9a5b37', '#b9784f', '#7c452c', '#c58a5b'];

interface PersonProps {
  position: [number, number, number];
  shirtColor: string;
  skinColor: string;
  animationOffset: number;
  phrase: string;
  celebrationLevel: number;
  action: 'wave' | 'clap' | 'cheer';
}

const Person: React.FC<PersonProps> = ({
  position,
  shirtColor,
  skinColor,
  animationOffset,
  phrase,
  celebrationLevel,
  action,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() + animationOffset;
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(time * 1.6) * 0.025;
    }
    const wave = Math.sin(time * (2.4 + celebrationLevel * 0.35));
    if (action === 'clap') {
      if (leftArmRef.current) leftArmRef.current.rotation.z = -0.9 + wave * 0.18;
      if (rightArmRef.current) rightArmRef.current.rotation.z = 0.9 - wave * 0.18;
    } else if (action === 'cheer') {
      if (leftArmRef.current) leftArmRef.current.rotation.z = -1.1 + wave * 0.2;
      if (rightArmRef.current) rightArmRef.current.rotation.z = 1.1 - wave * 0.2;
    } else {
      if (leftArmRef.current) leftArmRef.current.rotation.z = -0.35 + wave * 0.55;
      if (rightArmRef.current) rightArmRef.current.rotation.z = 0.35 - wave * 0.55;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.24, 0.75, 7]} />
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.19, 8, 6]} />
        <meshStandardMaterial color={skinColor} roughness={0.9} />
      </mesh>
      <mesh position={[-0.1, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.45, 6]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.45, 6]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>
      <group ref={leftArmRef} position={[-0.22, 0.92, 0]} rotation={[0, 0, -0.35]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.055, 0.42, 6]} />
          <meshStandardMaterial color={skinColor} roughness={0.9} />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.22, 0.92, 0]} rotation={[0, 0, 0.35]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.055, 0.42, 6]} />
          <meshStandardMaterial color={skinColor} roughness={0.9} />
        </mesh>
      </group>
      <Text
        position={[0, 1.7, 0]}
        fontSize={0.16}
        color="#fef3c7"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#451a03"
      >
        {phrase}
      </Text>
    </group>
  );
};

export const RiversidePeople: React.FC<RiversidePeopleProps> = ({
  riverHalfWidth,
  distanceTravelled,
  celebrationLevel,
}) => {
  const people = useMemo(() => Array.from({ length: 18 }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const row = Math.floor(index / 6);
    return {
      side,
      x: side * (riverHalfWidth + 2.5 + (index % 3) * 0.7),
      zOffset: row * 105 + (index % 6) * 13 - 30,
      y: row * 0.05,
      shirtColor: SHIRT_COLORS[index % SHIRT_COLORS.length],
      skinColor: SKIN_COLORS[index % SKIN_COLORS.length],
      animationOffset: index * 0.7,
      phrase: index % 3 === 0 ? 'Ganapathi Bappa Morya!' : index % 3 === 1 ? 'Jai Ganesh!' : 'Morya!',
      action: (index % 3 === 0 ? 'wave' : index % 3 === 1 ? 'clap' : 'cheer') as PersonProps['action'],
    };
  }), [riverHalfWidth]);

  return (
    <group>
      {people.map((person, index) => {
        const relativeZ = ((person.zOffset - distanceTravelled) % PEOPLE_LOOP_LENGTH + PEOPLE_LOOP_LENGTH) % PEOPLE_LOOP_LENGTH - 30;
        return (
          <Person
            key={index}
            position={[person.x, 0.55 + person.y, relativeZ]}
            shirtColor={person.shirtColor}
            skinColor={person.skinColor}
            animationOffset={person.animationOffset}
            phrase={person.phrase}
            action={person.action}
            celebrationLevel={celebrationLevel}
          />
        );
      })}
    </group>
  );
};