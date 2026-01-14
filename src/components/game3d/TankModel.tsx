import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MeshStandardMaterial, Color } from 'three';
import { Hull, Gun } from '@/lib/gameTypes';

interface TankModelProps {
  position: [number, number, number];
  hullRotation: number;
  turretRotation: number;
  team: 'red' | 'blue';
  hull: Hull;
  gun: Gun;
  isCurrentPlayer?: boolean;
  hasFlag?: boolean;
  health: number;
  maxHealth: number;
  username?: string;
}

// Hull dimensions based on hull type
const HULL_CONFIGS: Record<string, { length: number; width: number; height: number; trackWidth: number }> = {
  wasp: { length: 2.2, width: 1.4, height: 0.5, trackWidth: 0.25 },
  hornet: { length: 2.4, width: 1.5, height: 0.55, trackWidth: 0.28 },
  hunter: { length: 2.3, width: 1.45, height: 0.52, trackWidth: 0.26 },
  viking: { length: 2.8, width: 1.8, height: 0.7, trackWidth: 0.35 },
  dictator: { length: 2.6, width: 1.7, height: 0.65, trackWidth: 0.32 },
  titan: { length: 3.2, width: 2.0, height: 0.8, trackWidth: 0.4 },
  mammoth: { length: 3.0, width: 1.9, height: 0.75, trackWidth: 0.38 },
  crusader: { length: 2.5, width: 1.6, height: 0.6, trackWidth: 0.3 },
};

// Turret configs based on gun type
const TURRET_CONFIGS: Record<string, { barrelLength: number; barrelRadius: number; turretSize: number; barrels: number }> = {
  smoky: { barrelLength: 1.8, barrelRadius: 0.12, turretSize: 0.5, barrels: 1 },
  twins: { barrelLength: 1.6, barrelRadius: 0.08, turretSize: 0.45, barrels: 2 },
  thunder: { barrelLength: 2.0, barrelRadius: 0.18, turretSize: 0.6, barrels: 1 },
  railgun: { barrelLength: 2.5, barrelRadius: 0.1, turretSize: 0.55, barrels: 1 },
  plasma: { barrelLength: 1.5, barrelRadius: 0.14, turretSize: 0.5, barrels: 1 },
  laser: { barrelLength: 1.4, barrelRadius: 0.06, turretSize: 0.4, barrels: 1 },
  firebird: { barrelLength: 1.6, barrelRadius: 0.15, turretSize: 0.55, barrels: 1 },
  freeze: { barrelLength: 1.5, barrelRadius: 0.16, turretSize: 0.55, barrels: 1 },
  isida: { barrelLength: 1.2, barrelRadius: 0.12, turretSize: 0.5, barrels: 1 },
  ricochet: { barrelLength: 1.7, barrelRadius: 0.13, turretSize: 0.52, barrels: 1 },
  shaft: { barrelLength: 2.8, barrelRadius: 0.08, turretSize: 0.45, barrels: 1 },
  terminator: { barrelLength: 1.4, barrelRadius: 0.1, turretSize: 0.48, barrels: 3 },
};

export const TankModel = ({
  position,
  hullRotation,
  turretRotation,
  team,
  hull,
  gun,
  isCurrentPlayer = false,
  hasFlag = false,
  health,
  maxHealth,
}: TankModelProps) => {
  const groupRef = useRef<Group>(null);
  const turretRef = useRef<Group>(null);
  
  // Get hull and turret configs
  const hullConfig = HULL_CONFIGS[hull.id] || HULL_CONFIGS.wasp;
  const turretConfig = TURRET_CONFIGS[gun.id] || TURRET_CONFIGS.smoky;
  
  // Team colors
  const teamColor = useMemo(() => new Color(team === 'red' ? '#ef4444' : '#3b82f6'), [team]);
  const teamColorDark = useMemo(() => new Color(team === 'red' ? '#991b1b' : '#1e3a8a'), [team]);
  const trackColor = useMemo(() => new Color('#1f2937'), []);
  const metalColor = useMemo(() => new Color('#374151'), []);
  const playerGlow = useMemo(() => new Color('#22c55e'), []);

  // Animate turret rotation smoothly
  useFrame(() => {
    if (turretRef.current) {
      const targetRotation = turretRotation;
      const currentRotation = turretRef.current.rotation.y;
      const diff = targetRotation - currentRotation;
      turretRef.current.rotation.y += diff * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, hullRotation, 0]}>
      {/* Tank Hull Body */}
      <mesh castShadow receiveShadow position={[0, hullConfig.height / 2, 0]}>
        <boxGeometry args={[hullConfig.length, hullConfig.height, hullConfig.width]} />
        <meshStandardMaterial color={teamColor} metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Hull Front Slope */}
      <mesh castShadow receiveShadow position={[hullConfig.length / 2 - 0.2, hullConfig.height / 2, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.4, hullConfig.height * 0.8, hullConfig.width * 0.9]} />
        <meshStandardMaterial color={teamColorDark} metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Left Track */}
      <mesh castShadow receiveShadow position={[0, hullConfig.height * 0.3, hullConfig.width / 2 + hullConfig.trackWidth / 2]}>
        <boxGeometry args={[hullConfig.length + 0.2, hullConfig.height * 0.6, hullConfig.trackWidth]} />
        <meshStandardMaterial color={trackColor} metalness={0.3} roughness={0.8} />
      </mesh>
      
      {/* Right Track */}
      <mesh castShadow receiveShadow position={[0, hullConfig.height * 0.3, -hullConfig.width / 2 - hullConfig.trackWidth / 2]}>
        <boxGeometry args={[hullConfig.length + 0.2, hullConfig.height * 0.6, hullConfig.trackWidth]} />
        <meshStandardMaterial color={trackColor} metalness={0.3} roughness={0.8} />
      </mesh>
      
      {/* Track Wheels (left side) */}
      {[-0.8, 0, 0.8].map((xOffset, i) => (
        <mesh key={`lwheel-${i}`} castShadow position={[xOffset, hullConfig.height * 0.3, hullConfig.width / 2 + hullConfig.trackWidth / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[hullConfig.height * 0.25, hullConfig.height * 0.25, hullConfig.trackWidth * 0.9, 12]} />
          <meshStandardMaterial color={metalColor} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      
      {/* Track Wheels (right side) */}
      {[-0.8, 0, 0.8].map((xOffset, i) => (
        <mesh key={`rwheel-${i}`} castShadow position={[xOffset, hullConfig.height * 0.3, -hullConfig.width / 2 - hullConfig.trackWidth / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[hullConfig.height * 0.25, hullConfig.height * 0.25, hullConfig.trackWidth * 0.9, 12]} />
          <meshStandardMaterial color={metalColor} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      
      {/* Turret Group */}
      <group ref={turretRef} position={[0, hullConfig.height + 0.15, 0]}>
        {/* Turret Base */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[turretConfig.turretSize, turretConfig.turretSize * 1.1, 0.3, 16]} />
          <meshStandardMaterial color={isCurrentPlayer ? playerGlow : teamColor} metalness={0.7} roughness={0.3} emissive={isCurrentPlayer ? playerGlow : undefined} emissiveIntensity={isCurrentPlayer ? 0.2 : 0} />
        </mesh>
        
        {/* Turret Top */}
        <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[turretConfig.turretSize * 0.7, turretConfig.turretSize, 0.2, 16]} />
          <meshStandardMaterial color={teamColorDark} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Gun Barrel(s) */}
        {turretConfig.barrels === 1 && (
          <mesh castShadow position={[turretConfig.barrelLength / 2 + turretConfig.turretSize * 0.5, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[turretConfig.barrelRadius, turretConfig.barrelRadius * 0.9, turretConfig.barrelLength, 12]} />
            <meshStandardMaterial color={metalColor} metalness={0.9} roughness={0.1} />
          </mesh>
        )}
        
        {turretConfig.barrels === 2 && (
          <>
            <mesh castShadow position={[turretConfig.barrelLength / 2 + turretConfig.turretSize * 0.4, 0.1, 0.12]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[turretConfig.barrelRadius, turretConfig.barrelRadius * 0.9, turretConfig.barrelLength, 10]} />
              <meshStandardMaterial color={metalColor} metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh castShadow position={[turretConfig.barrelLength / 2 + turretConfig.turretSize * 0.4, 0.1, -0.12]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[turretConfig.barrelRadius, turretConfig.barrelRadius * 0.9, turretConfig.barrelLength, 10]} />
              <meshStandardMaterial color={metalColor} metalness={0.9} roughness={0.1} />
            </mesh>
          </>
        )}
        
        {turretConfig.barrels === 3 && (
          <>
            <mesh castShadow position={[turretConfig.barrelLength / 2 + turretConfig.turretSize * 0.4, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[turretConfig.barrelRadius, turretConfig.barrelRadius * 0.9, turretConfig.barrelLength, 10]} />
              <meshStandardMaterial color={metalColor} metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh castShadow position={[turretConfig.barrelLength / 2 + turretConfig.turretSize * 0.35, 0.05, 0.15]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[turretConfig.barrelRadius * 0.7, turretConfig.barrelRadius * 0.6, turretConfig.barrelLength * 0.8, 8]} />
              <meshStandardMaterial color={metalColor} metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh castShadow position={[turretConfig.barrelLength / 2 + turretConfig.turretSize * 0.35, 0.05, -0.15]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[turretConfig.barrelRadius * 0.7, turretConfig.barrelRadius * 0.6, turretConfig.barrelLength * 0.8, 8]} />
              <meshStandardMaterial color={metalColor} metalness={0.9} roughness={0.1} />
            </mesh>
          </>
        )}
        
        {/* Muzzle Brake */}
        <mesh position={[turretConfig.barrelLength + turretConfig.turretSize * 0.5, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[turretConfig.barrelRadius * 1.3, turretConfig.barrelRadius * 1.5, 0.15, 12]} />
          <meshStandardMaterial color={metalColor} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      
      {/* Flag Indicator */}
      {hasFlag && (
        <group position={[0, hullConfig.height + 1.5, 0]}>
          {/* Flag Pole */}
          <mesh castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
            <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Flag Cloth */}
          <mesh position={[0.25, 0.4, 0]} castShadow>
            <boxGeometry args={[0.5, 0.3, 0.02]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}
      
      {/* Health Bar (3D billboard) */}
      <group position={[0, hullConfig.height + 0.8, 0]}>
        {/* Background */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.5, 0.12, 0.02]} />
          <meshBasicMaterial color="#1f2937" />
        </mesh>
        {/* Health Fill */}
        <mesh position={[-(1.5 / 2) * (1 - health / maxHealth) / 2, 0, 0.01]}>
          <boxGeometry args={[1.5 * (health / maxHealth), 0.08, 0.01]} />
          <meshBasicMaterial color={health / maxHealth > 0.5 ? '#22c55e' : health / maxHealth > 0.25 ? '#f59e0b' : '#ef4444'} />
        </mesh>
      </group>
      
      {/* Current player indicator ring */}
      {isCurrentPlayer && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[hullConfig.width * 0.8, hullConfig.width * 0.9, 32]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};
