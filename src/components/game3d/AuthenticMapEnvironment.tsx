// Authentic Tanki Online 2014-2017 Map Environment
// Recreates original map aesthetics and layouts

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Cloud } from '@react-three/drei';
import { Mesh, Color, DoubleSide } from 'three';
import { TOMapDefinition, TOMapElement, TO_MAPS } from '@/lib/tankiAssets';
import { Flag } from '@/lib/gameTypes';

interface AuthenticMapEnvironmentProps {
  mapId: string;
  flags: Flag[];
}

// Scale factor (game units to 3D world units)
const SCALE = 0.3;

// Material colors matching original TO
const MATERIALS = {
  concrete: { color: '#707070', metalness: 0.3, roughness: 0.8 },
  metal: { color: '#505560', metalness: 0.7, roughness: 0.3 },
  wood: { color: '#8B4513', metalness: 0.1, roughness: 0.9 },
  brick: { color: '#8B5A3C', metalness: 0.2, roughness: 0.85 },
};

// Ground colors for different themes
const GROUND_THEMES = {
  grass: { primary: '#4a7c3a', secondary: '#3d6b2e', patches: ['#557a45', '#4d7040', '#3a5a2a'] },
  sand: { primary: '#c2a66a', secondary: '#b09860', patches: ['#d4b87a', '#c8ac6e', '#a89050'] },
  snow: { primary: '#e8e8e8', secondary: '#d0d0d0', patches: ['#ffffff', '#f0f0f0', '#dcdcdc'] },
  metal: { primary: '#505050', secondary: '#404040', patches: ['#606060', '#555555', '#4a4a4a'] },
};

// Building component - authentic TO style
const TOBuilding = ({ 
  element, 
  mapCenter 
}: { 
  element: TOMapElement; 
  mapCenter: { x: number; z: number };
}) => {
  const mat = MATERIALS[element.material || 'concrete'];
  const pos: [number, number, number] = [
    (element.position.x - mapCenter.x) * SCALE,
    element.size.height / 2 * SCALE,
    (element.position.z - mapCenter.z) * SCALE,
  ];
  
  return (
    <group position={pos} rotation={[0, element.rotation || 0, 0]}>
      {/* Main building body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[
          element.size.width * SCALE,
          element.size.height * SCALE,
          element.size.depth * SCALE,
        ]} />
        <meshStandardMaterial 
          color={mat.color} 
          metalness={mat.metalness} 
          roughness={mat.roughness} 
        />
      </mesh>
      
      {/* Roof edge */}
      <mesh castShadow position={[0, element.size.height / 2 * SCALE + 0.1, 0]}>
        <boxGeometry args={[
          element.size.width * SCALE + 0.2,
          0.2,
          element.size.depth * SCALE + 0.2,
        ]} />
        <meshStandardMaterial color="#505050" metalness={0.4} roughness={0.6} />
      </mesh>
      
      {/* Windows (on larger buildings) */}
      {element.size.width > 8 && element.size.depth > 8 && (
        <>
          {[-1, 1].map((side, i) => (
            <mesh 
              key={i} 
              position={[
                side * (element.size.width / 4) * SCALE,
                0,
                element.size.depth / 2 * SCALE + 0.02,
              ]}
            >
              <boxGeometry args={[
                element.size.width * 0.15 * SCALE,
                element.size.height * 0.35 * SCALE,
                0.05,
              ]} />
              <meshStandardMaterial color="#1a2030" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
};

// Wall component
const TOWall = ({ 
  element, 
  mapCenter 
}: { 
  element: TOMapElement; 
  mapCenter: { x: number; z: number };
}) => {
  const mat = MATERIALS[element.material || 'concrete'];
  const pos: [number, number, number] = [
    (element.position.x - mapCenter.x) * SCALE,
    element.size.height / 2 * SCALE,
    (element.position.z - mapCenter.z) * SCALE,
  ];
  
  return (
    <mesh 
      position={pos} 
      rotation={[0, element.rotation || 0, 0]}
      castShadow 
      receiveShadow
    >
      <boxGeometry args={[
        element.size.width * SCALE,
        element.size.height * SCALE,
        element.size.depth * SCALE,
      ]} />
      <meshStandardMaterial 
        color={mat.color} 
        metalness={mat.metalness} 
        roughness={mat.roughness}
      />
    </mesh>
  );
};

// Platform component (elevated areas)
const TOPlatform = ({ 
  element, 
  mapCenter 
}: { 
  element: TOMapElement; 
  mapCenter: { x: number; z: number };
}) => {
  const pos: [number, number, number] = [
    (element.position.x - mapCenter.x) * SCALE,
    element.position.y * SCALE,
    (element.position.z - mapCenter.z) * SCALE,
  ];
  
  return (
    <group position={pos}>
      {/* Platform surface */}
      <mesh castShadow receiveShadow position={[0, element.size.height / 2 * SCALE, 0]}>
        <boxGeometry args={[
          element.size.width * SCALE,
          element.size.height * SCALE,
          element.size.depth * SCALE,
        ]} />
        <meshStandardMaterial color="#606060" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Support pillars */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([xOff, zOff], i) => (
        <mesh 
          key={i} 
          castShadow 
          position={[
            xOff * (element.size.width / 2 - 1) * SCALE,
            element.position.y / 2 * SCALE,
            zOff * (element.size.depth / 2 - 1) * SCALE,
          ]}
        >
          <cylinderGeometry args={[0.3, 0.35, element.position.y * SCALE, 8]} />
          <meshStandardMaterial color="#404040" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      
      {/* Edge railings */}
      <mesh position={[0, (element.size.height + 0.5) * SCALE, element.size.depth / 2 * SCALE]}>
        <boxGeometry args={[element.size.width * SCALE, 0.3, 0.1]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, (element.size.height + 0.5) * SCALE, -element.size.depth / 2 * SCALE]}>
        <boxGeometry args={[element.size.width * SCALE, 0.3, 0.1]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
};

// Ramp component
const TORamp = ({ 
  element, 
  mapCenter 
}: { 
  element: TOMapElement; 
  mapCenter: { x: number; z: number };
}) => {
  const pos: [number, number, number] = [
    (element.position.x - mapCenter.x) * SCALE,
    element.position.y * SCALE,
    (element.position.z - mapCenter.z) * SCALE,
  ];
  
  return (
    <mesh 
      position={pos}
      rotation={[0.3, element.rotation || 0, 0]}
      castShadow 
      receiveShadow
    >
      <boxGeometry args={[
        element.size.width * SCALE,
        0.2,
        element.size.depth * SCALE,
      ]} />
      <meshStandardMaterial color="#707070" metalness={0.4} roughness={0.7} />
    </mesh>
  );
};

// Crate component - authentic TO wooden crate
const TOCrate = ({ 
  element, 
  mapCenter 
}: { 
  element: TOMapElement; 
  mapCenter: { x: number; z: number };
}) => {
  const pos: [number, number, number] = [
    (element.position.x - mapCenter.x) * SCALE,
    element.size.height / 2 * SCALE,
    (element.position.z - mapCenter.z) * SCALE,
  ];
  const size = element.size.width * SCALE;
  
  return (
    <group position={pos}>
      {/* Main crate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      
      {/* Wood bands */}
      <mesh position={[0, size * 0.35, 0]}>
        <boxGeometry args={[size + 0.02, size * 0.08, size + 0.02]} />
        <meshStandardMaterial color="#5D3A1A" roughness={0.85} />
      </mesh>
      <mesh position={[0, -size * 0.35, 0]}>
        <boxGeometry args={[size + 0.02, size * 0.08, size + 0.02]} />
        <meshStandardMaterial color="#5D3A1A" roughness={0.85} />
      </mesh>
    </group>
  );
};

// Barrier component
const TOBarrier = ({ 
  element, 
  mapCenter 
}: { 
  element: TOMapElement; 
  mapCenter: { x: number; z: number };
}) => {
  const pos: [number, number, number] = [
    (element.position.x - mapCenter.x) * SCALE,
    element.size.height / 2 * SCALE,
    (element.position.z - mapCenter.z) * SCALE,
  ];
  
  return (
    <group position={pos} rotation={[0, element.rotation || 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[
          element.size.width * SCALE,
          element.size.height * SCALE,
          element.size.depth * SCALE,
        ]} />
        <meshStandardMaterial color="#808080" roughness={0.9} />
      </mesh>
      
      {/* Warning stripe */}
      <mesh position={[0, 0, element.size.depth / 2 * SCALE + 0.01]}>
        <boxGeometry args={[element.size.width * SCALE, element.size.height * 0.3 * SCALE, 0.02]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>
    </group>
  );
};

// Flag component - authentic TO style
const TOFlag = ({ 
  flag, 
  mapCenter 
}: { 
  flag: Flag; 
  mapCenter: { x: number; z: number };
}) => {
  const flagRef = useRef<Mesh>(null);
  const teamColor = flag.team === 'red' ? '#cc2222' : '#2244cc';
  const glowColor = flag.team === 'red' ? '#ff4444' : '#4488ff';
  
  const pos: [number, number, number] = [
    (flag.position.x - mapCenter.x * SCALE * 2) * SCALE * 0.5,
    0,
    (flag.position.y - mapCenter.z * SCALE * 2) * SCALE * 0.5,
  ];
  
  useFrame(({ clock }) => {
    if (flagRef.current && !flag.carriedBy) {
      flagRef.current.rotation.y = Math.sin(clock.elapsedTime * 2.5) * 0.12;
    }
  });
  
  if (flag.carriedBy) return null;
  
  return (
    <group position={pos}>
      {/* Base platform */}
      <mesh receiveShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.0, 1.2, 0.15, 8]} />
        <meshStandardMaterial color={teamColor} metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Glowing ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.1, 1.4, 24]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.6} side={DoubleSide} />
      </mesh>
      
      {/* Pole */}
      <mesh castShadow position={[0, 2, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 4, 8]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Flag cloth */}
      <mesh ref={flagRef} castShadow position={[0.5, 3.6, 0]}>
        <boxGeometry args={[1.0, 0.65, 0.03]} />
        <meshStandardMaterial 
          color={teamColor}
          emissive={teamColor}
          emissiveIntensity={0.2}
          side={DoubleSide}
        />
      </mesh>
      
      {/* Point light */}
      <pointLight position={[0, 1, 0]} color={glowColor} intensity={1.2} distance={5} />
    </group>
  );
};

// Main map environment component
export const AuthenticMapEnvironment = ({
  mapId,
  flags,
}: AuthenticMapEnvironmentProps) => {
  const map: TOMapDefinition = TO_MAPS[mapId] || TO_MAPS.silence;
  const mapCenter = { x: map.width / 2, z: map.height / 2 };
  const scaledWidth = map.width * SCALE;
  const scaledHeight = map.height * SCALE;
  
  const groundTheme = GROUND_THEMES[map.groundType];
  
  // Generate ground patches for variation
  const groundPatches = useMemo(() => {
    const patches: Array<{ pos: [number, number, number]; color: string; size: number }> = [];
    for (let i = 0; i < 60; i++) {
      patches.push({
        pos: [
          (Math.random() - 0.5) * scaledWidth * 0.95,
          0.01,
          (Math.random() - 0.5) * scaledHeight * 0.95,
        ],
        color: groundTheme.patches[Math.floor(Math.random() * groundTheme.patches.length)],
        size: 1 + Math.random() * 2.5,
      });
    }
    return patches;
  }, [scaledWidth, scaledHeight, groundTheme.patches]);

  return (
    <>
      {/* Sky */}
      <Sky 
        distance={450000}
        sunPosition={[100, 60, 80]}
        inclination={0.55}
        azimuth={0.25}
      />
      
      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#c8e0f0', 80, 300]} />
      
      {/* Ambient light */}
      <ambientLight intensity={0.5} />
      
      {/* Sun */}
      <directionalLight
        position={[80, 80, 60]}
        intensity={1.2}
        color="#fff8e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={250}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      
      {/* Fill light */}
      <directionalLight position={[-40, 30, -40]} intensity={0.25} color="#b0c4de" />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[scaledWidth + 40, scaledHeight + 40]} />
        <meshStandardMaterial color={groundTheme.primary} roughness={0.9} metalness={0.05} />
      </mesh>
      
      {/* Ground patches */}
      {groundPatches.map((patch, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={patch.pos} receiveShadow>
          <circleGeometry args={[patch.size, 8]} />
          <meshStandardMaterial color={patch.color} roughness={0.95} />
        </mesh>
      ))}
      
      {/* Map boundary walls */}
      {/* Top */}
      <mesh position={[0, 1.5, -scaledHeight / 2 - 0.4]} castShadow receiveShadow>
        <boxGeometry args={[scaledWidth + 1, 3, 0.8]} />
        <meshStandardMaterial color="#505050" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, 1.5, scaledHeight / 2 + 0.4]} castShadow receiveShadow>
        <boxGeometry args={[scaledWidth + 1, 3, 0.8]} />
        <meshStandardMaterial color="#505050" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Left */}
      <mesh position={[-scaledWidth / 2 - 0.4, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 3, scaledHeight + 1]} />
        <meshStandardMaterial color="#505050" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Right */}
      <mesh position={[scaledWidth / 2 + 0.4, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 3, scaledHeight + 1]} />
        <meshStandardMaterial color="#505050" metalness={0.4} roughness={0.6} />
      </mesh>
      
      {/* Render map elements */}
      {map.elements.map((element, i) => {
        const key = `${element.type}-${i}`;
        switch (element.type) {
          case 'building':
            return <TOBuilding key={key} element={element} mapCenter={mapCenter} />;
          case 'wall':
            return <TOWall key={key} element={element} mapCenter={mapCenter} />;
          case 'platform':
            return <TOPlatform key={key} element={element} mapCenter={mapCenter} />;
          case 'ramp':
            return <TORamp key={key} element={element} mapCenter={mapCenter} />;
          case 'crate':
            return <TOCrate key={key} element={element} mapCenter={mapCenter} />;
          case 'barrier':
            return <TOBarrier key={key} element={element} mapCenter={mapCenter} />;
          default:
            return null;
        }
      })}
      
      {/* Flags */}
      {flags.map((flag) => (
        <TOFlag key={flag.id} flag={flag} mapCenter={mapCenter} />
      ))}
      
      {/* Decorative clouds */}
      <Cloud position={[-25, 35, 0]} speed={0.15} opacity={0.4} />
      <Cloud position={[25, 42, -20]} speed={0.12} opacity={0.35} />
      <Cloud position={[0, 38, 25]} speed={0.18} opacity={0.45} />
    </>
  );
};

export default AuthenticMapEnvironment;
