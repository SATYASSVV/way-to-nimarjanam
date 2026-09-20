import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Boat } from './Boat';
import { WaterSurface } from './WaterSurface';
import { RiverEnvironment } from './RiverEnvironment';
import { OceanEnvironment } from './OceanEnvironment';
import { SpawnerManager } from './SpawnerManager';
import { useGameStore } from '../../store/gameStore';

// Camera controller that follows the boat with smooth damping and wave bobs
const FollowCamera: React.FC = () => {
  const { boatX, currentLevel } = useGameStore();
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const waveBob = Math.sin(t * currentLevel.currentStrength * 2.5) * 0.08;

    // Camera target position: behind and slightly above the boat
    const targetCamX = boatX * 0.45;
    const targetCamY = 4.2 + waveBob;
    const targetCamZ = -7.2;

    // Smooth lerp for camera movement
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.1);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.1);

    // Look ahead of the boat
    const lookTargetX = boatX * 0.8;
    const lookTargetY = 1.3 + waveBob * 0.5;
    const lookTargetZ = 8.0;

    camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);
  });

  return null;
};

// Game tick driver inside R3F frame loop
const GameLoopDriver: React.FC = () => {
  const { tickGame } = useGameStore();

  useFrame((_, delta) => {
    // Clamp delta to avoid physics explosion if frame drops
    const clampedDelta = Math.min(delta, 0.06);
    tickGame(clampedDelta);
  });

  return null;
};

interface GameCanvasProps {
  cinematicMode?: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ cinematicMode = false }) => {
  const {
    currentLevel,
    setBoatSteer,
    setBoatTargetX,
    boatX,
    screen,
    isPaused,
    toggleDebugMode,
  } = useGameStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const keysPressed = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const touchStartXRef = useRef<number | null>(null);
  const initialBoatXRef = useRef<number>(0);

  // Keyboard controls listener
  useEffect(() => {
    if (cinematicMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.right = true;
      }
      updateSteerFromKeys();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.right = false;
      }
      updateSteerFromKeys();
    };

    const updateSteerFromKeys = () => {
      if (keysPressed.current.left && !keysPressed.current.right) {
        setBoatSteer(-1);
      } else if (keysPressed.current.right && !keysPressed.current.left) {
        setBoatSteer(1);
      } else {
        setBoatSteer(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      setBoatSteer(0);
    };
  }, [cinematicMode, setBoatSteer]);

  useEffect(() => {
    const handleDebugToggle = (event: KeyboardEvent) => {
      if (event.key === 'F3') {
        event.preventDefault();
        toggleDebugMode();
      }
    };

    window.addEventListener('keydown', handleDebugToggle);
    return () => window.removeEventListener('keydown', handleDebugToggle);
  }, [toggleDebugMode]);

  // Pointer / Touch horizontal drag listener
  const handlePointerDown = (e: React.PointerEvent) => {
    if (cinematicMode || isPaused) return;
    touchStartXRef.current = e.clientX;
    initialBoatXRef.current = boatX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (cinematicMode || isPaused || touchStartXRef.current === null) return;
    const deltaX = e.clientX - touchStartXRef.current;
    // Map screen pixel drag to 3D world coordinates
    const sensitivity = 0.035;
    const targetX = initialBoatXRef.current + deltaX * sensitivity;
    setBoatTargetX(targetX);

    // Provide subtle steering tilt based on drag direction
    if (deltaX < -5) setBoatSteer(-0.7);
    else if (deltaX > 5) setBoatSteer(0.7);
    else setBoatSteer(0);
  };

  const handlePointerUp = () => {
    touchStartXRef.current = null;
    setBoatSteer(0);
  };

  const isOcean = currentLevel.environmentType === 'ocean_nimarjanam';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <Canvas
        shadows
        camera={{ position: [0, 4.2, -7.2], fov: 60, near: 0.1, far: 350 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        {/* Dynamic Fog for Level Immersion */}
        <color attach="background" args={[currentLevel.skyColor]} />
        <fog attach="fog" args={[currentLevel.fogColor, 25, 140]} />

        {/* Dynamic Level Lighting */}
        <ambientLight color={currentLevel.ambientColor} intensity={0.7} />
        <directionalLight
          position={[15, 25, 20]}
          color={currentLevel.sunColor}
          intensity={1.2}
          castShadow
        />
        <directionalLight
          position={[-15, 10, -20]}
          color={currentLevel.waterColor}
          intensity={0.4}
        />

        {/* Camera Driver */}
        <FollowCamera />

        {/* Game Loop Driver */}
        {!cinematicMode && <GameLoopDriver />}

        {/* The Boat carrying Lord Vinayaka */}
        <Boat />

        {/* Animated Water Surface */}
        <WaterSurface />

        {/* Scenery Environment: River vs Ocean */}
        {isOcean ? <OceanEnvironment /> : <RiverEnvironment />}

        {/* Dynamic Collectibles & Obstacles Spawner */}
        {!cinematicMode && <SpawnerManager />}
      </Canvas>
    </div>
  );
};
