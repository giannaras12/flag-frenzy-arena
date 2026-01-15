// Authentic Tanki Online 2014-2017 Tank Model
// Accurate to original game visuals

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Color, DoubleSide } from 'three';
import { TO_HULLS, TO_TURRETS, TOHullSpec, TOTurretSpec } from '@/lib/tankiAssets';

interface AuthenticTankModelProps {
  position: [number, number, number];
  hullRotation: number;
  turretRotation: number;
  team: 'red' | 'blue';
  hullId: string;
  turretId: string;
  isCurrentPlayer?: boolean;
  hasFlag?: boolean;
  health: number;
  maxHealth: number;
  username?: string;
}

// Team colors matching original TO
const TEAM_COLORS = {
  red: { primary: '#cc2222', secondary: '#881111', accent: '#ff4444' },
  blue: { primary: '#2244cc', secondary: '#112288', accent: '#4488ff' },
};

export const AuthenticTankModel = ({
  position,
  hullRotation,
  turretRotation,
  team,
  hullId,
  turretId,
  isCurrentPlayer = false,
  hasFlag = false,
  health,
  maxHealth,
  username,
}: AuthenticTankModelProps) => {
  const groupRef = useRef<Group>(null);
  const turretGroupRef = useRef<Group>(null);
  const wheelRotation = useRef(0);
  
  // Get specs with fallbacks
  const hullSpec: TOHullSpec = TO_HULLS[hullId] || TO_HULLS.wasp;
  const turretSpec: TOTurretSpec = TO_TURRETS[turretId] || TO_TURRETS.smoky;
  
  // Colors
  const colors = useMemo(() => {
    const tc = TEAM_COLORS[team];
    return {
      primary: new Color(tc.primary),
      secondary: new Color(tc.secondary),
      accent: new Color(tc.accent),
      track: new Color('#1a1a1a'),
      metal: new Color('#404040'),
      chrome: new Color('#808080'),
      playerGlow: new Color('#22ff44'),
    };
  }, [team]);

  // Animate turret and tracks
  useFrame((_, delta) => {
    // Smooth turret rotation
    if (turretGroupRef.current) {
      const targetRot = turretRotation;
      const currentRot = turretGroupRef.current.rotation.y;
      const diff = targetRot - currentRot;
      // Normalize angle difference
      const normalizedDiff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;
      turretGroupRef.current.rotation.y += normalizedDiff * 0.12;
    }
    
    // Animate track wheels when moving
    wheelRotation.current += delta * 5;
  });

  const healthPercent = health / maxHealth;

  return (
    <group ref={groupRef} position={position} rotation={[0, hullRotation, 0]}>
      {/* === HULL === */}
      <group>
        {/* Main hull body - sloped design like TO */}
        <mesh castShadow receiveShadow position={[0, hullSpec.height / 2 + 0.1, 0]}>
          <boxGeometry args={[hullSpec.length * 0.85, hullSpec.height, hullSpec.width * 0.75]} />
          <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Hull front armor (sloped) */}
        <mesh castShadow receiveShadow 
          position={[hullSpec.length * 0.4, hullSpec.height * 0.4 + 0.1, 0]} 
          rotation={[0, 0, -0.4]}
        >
          <boxGeometry args={[hullSpec.length * 0.25, hullSpec.height * 0.6, hullSpec.width * 0.7]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Hull rear */}
        <mesh castShadow receiveShadow 
          position={[-hullSpec.length * 0.38, hullSpec.height * 0.4 + 0.1, 0]}
        >
          <boxGeometry args={[hullSpec.length * 0.2, hullSpec.height * 0.8, hullSpec.width * 0.7]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Side armor plates (left) */}
        <mesh castShadow receiveShadow position={[0, hullSpec.height * 0.35 + 0.1, hullSpec.width * 0.42]}>
          <boxGeometry args={[hullSpec.length * 0.7, hullSpec.height * 0.5, 0.08]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Side armor plates (right) */}
        <mesh castShadow receiveShadow position={[0, hullSpec.height * 0.35 + 0.1, -hullSpec.width * 0.42]}>
          <boxGeometry args={[hullSpec.length * 0.7, hullSpec.height * 0.5, 0.08]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* === TRACKS === */}
        {[-1, 1].map((side) => (
          <group key={`track-${side}`} position={[0, 0.15, side * (hullSpec.width / 2 + hullSpec.trackWidth / 2)]}>
            {/* Track housing */}
            <mesh castShadow receiveShadow position={[0, hullSpec.height * 0.25, 0]}>
              <boxGeometry args={[hullSpec.length, hullSpec.height * 0.5, hullSpec.trackWidth]} />
              <meshStandardMaterial color={colors.track} metalness={0.2} roughness={0.9} />
            </mesh>
            
            {/* Track surface detail */}
            <mesh position={[0, hullSpec.height * 0.52, 0]}>
              <boxGeometry args={[hullSpec.length - 0.1, 0.05, hullSpec.trackWidth + 0.02]} />
              <meshStandardMaterial color="#0a0a0a" metalness={0.1} roughness={0.95} />
            </mesh>
            
            {/* Drive wheels */}
            {[
              [-hullSpec.length * 0.4, 0.18],
              [-hullSpec.length * 0.2, 0.15],
              [0, 0.15],
              [hullSpec.length * 0.2, 0.15],
              [hullSpec.length * 0.4, 0.18],
            ].map(([xPos, radius], i) => (
              <mesh 
                key={`wheel-${side}-${i}`} 
                castShadow 
                position={[xPos, hullSpec.height * 0.25, 0]} 
                rotation={[Math.PI / 2, wheelRotation.current, 0]}
              >
                <cylinderGeometry args={[radius, radius, hullSpec.trackWidth * 0.8, 12]} />
                <meshStandardMaterial color={colors.metal} metalness={0.7} roughness={0.3} />
              </mesh>
            ))}
            
            {/* Sprocket (front drive wheel) */}
            <mesh 
              castShadow 
              position={[hullSpec.length * 0.45, hullSpec.height * 0.25, 0]} 
              rotation={[Math.PI / 2, wheelRotation.current, 0]}
            >
              <cylinderGeometry args={[0.22, 0.22, hullSpec.trackWidth * 0.6, 8]} />
              <meshStandardMaterial color={colors.chrome} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* === TURRET === */}
      <group ref={turretGroupRef} position={[0, hullSpec.turretMountHeight, 0]}>
        {/* Turret base ring */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[turretSpec.turretBaseRadius, turretSpec.turretBaseRadius * 1.1, 0.15, 20]} />
          <meshStandardMaterial 
            color={isCurrentPlayer ? colors.playerGlow : colors.primary} 
            metalness={0.6} 
            roughness={0.4}
            emissive={isCurrentPlayer ? colors.playerGlow : undefined}
            emissiveIntensity={isCurrentPlayer ? 0.3 : 0}
          />
        </mesh>
        
        {/* Turret body */}
        <mesh castShadow receiveShadow position={[0, turretSpec.turretHeight / 2 + 0.08, 0]}>
          <cylinderGeometry 
            args={[turretSpec.turretTopRadius, turretSpec.turretBaseRadius, turretSpec.turretHeight, 16]} 
          />
          <meshStandardMaterial color={colors.primary} metalness={0.55} roughness={0.45} />
        </mesh>
        
        {/* Turret top detail */}
        <mesh castShadow position={[0, turretSpec.turretHeight + 0.1, 0]}>
          <cylinderGeometry args={[turretSpec.turretTopRadius * 0.6, turretSpec.turretTopRadius * 0.8, 0.1, 12]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* === GUN BARREL(S) === */}
        {turretSpec.barrelCount === 1 && (
          <group position={[turretSpec.barrelLength / 2 + turretSpec.turretBaseRadius * 0.6, turretSpec.turretHeight * 0.4, 0]}>
            {/* Main barrel */}
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[turretSpec.barrelRadius, turretSpec.barrelRadius * 0.95, turretSpec.barrelLength, 16]} />
              <meshStandardMaterial color={colors.metal} metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Muzzle brake (if applicable) */}
            {turretSpec.hasMuzzleBrake && (
              <mesh castShadow position={[turretSpec.barrelLength / 2 - 0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[turretSpec.barrelRadius * 1.4, turretSpec.barrelRadius * 1.5, 0.18, 12]} />
                <meshStandardMaterial color={colors.metal} metalness={0.85} roughness={0.15} />
              </mesh>
            )}
            
            {/* Railgun coils */}
            {turretSpec.hasCoil && (
              <>
                {[0.2, 0.5, 0.8].map((pos, i) => (
                  <mesh key={i} castShadow position={[(pos - 0.5) * turretSpec.barrelLength, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <torusGeometry args={[turretSpec.barrelRadius * 1.6, 0.03, 8, 16]} />
                    <meshStandardMaterial color="#4488ff" metalness={0.9} roughness={0.1} emissive="#4488ff" emissiveIntensity={0.5} />
                  </mesh>
                ))}
              </>
            )}
            
            {/* Flamethrower/Freeze nozzle */}
            {turretSpec.hasNozzle && (
              <mesh castShadow position={[turretSpec.barrelLength / 2 + 0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <coneGeometry args={[turretSpec.barrelRadius * 2, 0.3, 12]} />
                <meshStandardMaterial 
                  color={turretSpec.effectColor} 
                  metalness={0.4} 
                  roughness={0.6}
                  emissive={turretSpec.effectColor}
                  emissiveIntensity={0.3}
                />
              </mesh>
            )}
          </group>
        )}
        
        {/* Twins - dual barrels */}
        {turretSpec.barrelCount === 2 && (
          <>
            {[-1, 1].map((offset) => (
              <mesh 
                key={offset}
                castShadow 
                position={[
                  turretSpec.barrelLength / 2 + turretSpec.turretBaseRadius * 0.5, 
                  turretSpec.turretHeight * 0.35, 
                  offset * turretSpec.barrelSpacing / 2
                ]} 
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[turretSpec.barrelRadius, turretSpec.barrelRadius * 0.9, turretSpec.barrelLength, 12]} />
                <meshStandardMaterial color={colors.metal} metalness={0.8} roughness={0.2} />
              </mesh>
            ))}
          </>
        )}
        
        {/* Vulcan - triple rotating barrels */}
        {turretSpec.barrelCount === 3 && (
          <group position={[turretSpec.barrelLength / 2 + turretSpec.turretBaseRadius * 0.5, turretSpec.turretHeight * 0.35, 0]}>
            {[0, 1, 2].map((i) => {
              const angle = (i * Math.PI * 2) / 3;
              return (
                <mesh 
                  key={i}
                  castShadow 
                  position={[0, Math.sin(angle) * turretSpec.barrelSpacing, Math.cos(angle) * turretSpec.barrelSpacing]} 
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[turretSpec.barrelRadius, turretSpec.barrelRadius * 0.9, turretSpec.barrelLength, 10]} />
                  <meshStandardMaterial color={colors.metal} metalness={0.8} roughness={0.2} />
                </mesh>
              );
            })}
            {/* Barrel housing */}
            <mesh castShadow position={[-turretSpec.barrelLength * 0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[turretSpec.barrelSpacing * 1.5, turretSpec.barrelSpacing * 1.3, turretSpec.barrelLength * 0.4, 12]} />
              <meshStandardMaterial color={colors.secondary} metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        )}
      </group>

      {/* === FLAG INDICATOR === */}
      {hasFlag && (
        <group position={[0, hullSpec.turretMountHeight + 1.2, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.025, 0.03, 1, 6]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh castShadow position={[0.2, 0.35, 0]}>
            <boxGeometry args={[0.4, 0.25, 0.02]} />
            <meshStandardMaterial 
              color="#ffd700" 
              emissive="#ffd700" 
              emissiveIntensity={0.5}
              side={DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* === HEALTH BAR === */}
      <group position={[0, hullSpec.turretMountHeight + turretSpec.turretHeight + 0.5, 0]}>
        {/* Background */}
        <mesh>
          <boxGeometry args={[1.4, 0.12, 0.02]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        {/* Health fill */}
        <mesh position={[-(1.4 * (1 - healthPercent)) / 2, 0, 0.01]}>
          <boxGeometry args={[1.4 * healthPercent, 0.08, 0.01]} />
          <meshBasicMaterial 
            color={healthPercent > 0.5 ? '#22cc22' : healthPercent > 0.25 ? '#cccc22' : '#cc2222'} 
          />
        </mesh>
      </group>

      {/* === USERNAME LABEL === */}
      {username && (
        <group position={[0, hullSpec.turretMountHeight + turretSpec.turretHeight + 0.75, 0]}>
          {/* Simple colored plane as name background */}
          <mesh>
            <planeGeometry args={[1.8, 0.25]} />
            <meshBasicMaterial color={team === 'red' ? '#aa2222' : '#2222aa'} transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {/* === CURRENT PLAYER INDICATOR === */}
      {isCurrentPlayer && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[hullSpec.width * 0.7, hullSpec.width * 0.8, 24]} />
          <meshBasicMaterial color={colors.playerGlow} transparent opacity={0.6} side={DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

export default AuthenticTankModel;
