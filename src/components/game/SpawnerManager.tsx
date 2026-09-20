import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { ActiveItem, CollectibleType, ObstacleType } from '../../types/game';
import { SCORING_RULES } from '../../data/levelsConfig';
import { Collectible3D } from './Collectible3D';
import { Obstacle3D } from './Obstacle3D';

export const SpawnerManager: React.FC = () => {
  const {
    currentLevel,
    distanceTravelled,
    boatX,
    isInvulnerable,
    collectItem,
    triggerDamage,
    screen,
    isPaused,
    debugMode,
    setDebugTelemetry,
  } = useGameStore();

  const itemsRef = useRef<ActiveItem[]>([]);
  const boatXRef = useRef(boatX);
  const lastSpawnDistanceRef = useRef<number>(0);
  const [, setRenderTrigger] = React.useState(0);
  boatXRef.current = boatX;

  // Clear spawned items on level switch
  useEffect(() => {
    itemsRef.current = [];
    lastSpawnDistanceRef.current = distanceTravelled;
  }, [currentLevel.id]);

  useEffect(() => {
    const handleDebugKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'b') return;
      itemsRef.current.push({
        id: `debug_bottle_${Date.now()}`,
        type: 'plastic_bottle',
        x: boatXRef.current,
        z: 6,
        isObstacle: false,
        points: SCORING_RULES.plastic_bottle.points,
        isTrash: true,
        isEco: false,
      });
    };

    window.addEventListener('keydown', handleDebugKey);
    return () => window.removeEventListener('keydown', handleDebugKey);
  }, []);

  useFrame((_, delta) => {
    if (screen !== 'playing' || isPaused) return;

    const speed = currentLevel.baseSpeed;
    const riverHalfWidth = currentLevel.riverWidth / 2 - 1.5;

    // 1. Move all existing items towards and past the boat (along Z axis)
    const activeList = itemsRef.current;
    for (let i = 0; i < activeList.length; i++) {
      const item = activeList[i];
      item.previousZ = item.z;
      item.z -= speed * delta;
    }

    // 2. Collision Detection
    for (let i = 0; i < activeList.length; i++) {
      const item = activeList[i];
      if (item.collected) continue;

      // Sweep the item through its previous and current positions so fast items cannot tunnel through the boat.
      const itemHalfDepth = item.isObstacle ? 0.75 : 0.45;
      const boatHalfDepth = 2.1;
      const crossedBoat = Math.max(item.previousZ ?? item.z, item.z) >= -(boatHalfDepth + itemHalfDepth)
        && Math.min(item.previousZ ?? item.z, item.z) <= boatHalfDepth + itemHalfDepth;

      if (crossedBoat) {
        const dx = Math.abs(item.x - boatX);
        const itemHalfWidth = item.isObstacle ? 0.8 : 0.45;
        const boatHalfWidth = 0.82;
        const horizontalReach = boatHalfWidth + itemHalfWidth;

        if (!item.isObstacle) {
          if (dx <= horizontalReach) {
            collectItem(item);
          }
        } else {
          // Obstacle collision radius
          if (dx <= horizontalReach) {
            if (!isInvulnerable) {
              triggerDamage();
            }
          }
        }
      }
    }

    // 3. Remove passed items (behind camera z < -20)
    itemsRef.current = activeList.filter((it) => it.z > -25 && (!it.collected || it.z > 0));

    // 4. Procedural Dynamic Spawner Ahead of Boat
    // Spawn every ~10 to 14 meters of travel if distance is under targetDistance - 40m
    const spawnInterval = 11;
    if (distanceTravelled - lastSpawnDistanceRef.current >= spawnInterval && distanceTravelled < currentLevel.targetDistance - 45) {
      lastSpawnDistanceRef.current = distanceTravelled;
      spawnCluster(riverHalfWidth);
    }

    if (debugMode) {
      const nearest = activeList
        .filter((item) => !item.collected && !item.isObstacle)
        .sort((a, b) => Math.abs(a.z) - Math.abs(b.z))[0];
      const nearestDistance = nearest
        ? Math.sqrt((nearest.x - boatX) ** 2 + nearest.z ** 2)
        : null;

      setDebugTelemetry({
        distanceTravelled,
        forwardSpeed: speed,
        deltaTime: delta,
        boatX,
        boatWorldPosition: [boatX, 0, 0],
        nearestCollectibleWorldPosition: nearest ? [nearest.x, 0, nearest.z] : null,
        nearestCollectibleDistance: nearestDistance,
        collisionDetected: activeList.some((item) => item.collected),
      });
    }

    setRenderTrigger((prev) => prev + 1);
  });

  const spawnCluster = (halfWidth: number) => {
    const newItems: ActiveItem[] = [];
    const spawnZ = 95 + Math.random() * 15;
    const rand = Math.random();

    // Lanes: Divide river width into 5 navigable lanes
    const lanes = [-0.75, -0.4, 0, 0.4, 0.75].map((factor) => factor * halfWidth);
    const chosenLanes = [...lanes].sort(() => Math.random() - 0.5);

    // 1. Obstacle Spawn (Fairness check: never block more than 2 lanes simultaneously)
    if (rand < currentLevel.obstacleFrequency) {
      const obsType = getRandomObstacle();
      const obsLane = chosenLanes[0];

      newItems.push({
        id: `obs_${Date.now()}_${Math.random()}`,
        type: obsType,
        x: obsLane,
        z: spawnZ,
        isObstacle: true,
        points: 0,
        isTrash: false,
        isEco: false,
      });
    }

    // 2. Trash Collectible Spawn (+10 Punya)
    if (Math.random() < currentLevel.trashFrequency) {
      const trashType = getRandomTrash();
      const rule = SCORING_RULES[trashType];
      const trashLane = chosenLanes[1];

      newItems.push({
        id: `trash_${Date.now()}_${Math.random()}`,
        type: trashType,
        x: trashLane,
        z: spawnZ + (Math.random() * 6 - 3),
        isObstacle: false,
        points: rule.points,
        isTrash: true,
        isEco: false,
      });
    }

    // 3. Sacred Eco Item Spawn (+20 Punya)
    if (Math.random() < currentLevel.ecoFrequency) {
      const ecoType = getRandomEco();
      const rule = SCORING_RULES[ecoType];
      const ecoLane = chosenLanes[2];

      newItems.push({
        id: `eco_${Date.now()}_${Math.random()}`,
        type: ecoType,
        x: ecoLane,
        z: spawnZ + (Math.random() * 8 - 4),
        isObstacle: false,
        points: rule.points,
        isTrash: false,
        isEco: true,
      });
    }

    itemsRef.current.push(...newItems);
  };

  const getRandomObstacle = (): ObstacleType => {
    const types: ObstacleType[] = ['log', 'rock', 'debris'];
    if (currentLevel.id >= 3) {
      types.push('whirlpool');
    }
    return types[Math.floor(Math.random() * types.length)];
  };

  const getRandomTrash = (): CollectibleType => {
    const types: CollectibleType[] = ['plastic_cover', 'plastic_bottle'];
    if (currentLevel.id >= 2) {
      types.push('fishing_net');
    }
    return types[Math.floor(Math.random() * types.length)];
  };

  const getRandomEco = (): CollectibleType => {
    const types: CollectibleType[] = ['lotus', 'diya'];
    if (currentLevel.id >= 2) {
      types.push('om_coin');
    }
    return types[Math.floor(Math.random() * types.length)];
  };

  return (
    <group>
      {itemsRef.current.map((item) => {
        if (item.collected) return null;

        if (item.isObstacle) {
          return (
            <Obstacle3D
              key={item.id}
              type={item.type as ObstacleType}
              position={[item.x, 0, item.z]}
            />
          );
        }

        return (
          <Collectible3D
            key={item.id}
            type={item.type as CollectibleType}
            position={[item.x, 0, item.z]}
          />
        );
      })}
    </group>
  );
};
