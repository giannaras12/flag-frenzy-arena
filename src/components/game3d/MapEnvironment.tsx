import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Cloud } from '@react-three/drei';
import { Mesh, Color, DoubleSide } from 'three';
import { Wall, Flag } from '@/lib/gameTypes';

interface MapEnvironmentProps {
  mapWidth: number;
  mapHeight: number;
  walls: Wall[];
  flags: Flag[];
  theme?: 'summer' | 'winter' | 'desert' | 'boombox';
}

// Convert 2D position to 3D (2D x,y -> 3D x,z)
const to3D = (x: number, y: number, mapWidth: number, mapHeight: number): [number, number] => {
  return [x - mapWidth / 2, y - mapHeight / 2];
};

// Scale factor for converting game units to 3D units
const SCALE = 0.05;

// Industrial building component - like the ones in Boombox map
const Building = ({ 
  position, 
  size, 
  color = '#8B7355',
  roofColor = '#654321',
  hasWindows = true
}: { 
  position: [number, number, number]; 
  size: [number, number, number];
  color?: string;
  roofColor?: string;
  hasWindows?: boolean;
}) => {
  return (
    <group position={position}>
      {/* Main building body */}
      <mesh position={[0, size[1] / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, size[1] + 0.15, 0]} castShadow>
        <boxGeometry args={[size[0] + 0.2, 0.3, size[2] + 0.2]} />
        <meshStandardMaterial color={roofColor} roughness={0.8} />
      </mesh>
      
      {/* Windows */}
      {hasWindows && [-1, 1].map((xOff, i) => (
        <mesh key={i} position={[xOff * (size[0] * 0.25), size[1] * 0.6, size[2] / 2 + 0.03]} castShadow>
          <boxGeometry args={[size[0] * 0.18, size[1] * 0.25, 0.05]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      
      {/* Door */}
      <mesh position={[0, size[1] * 0.2, size[2] / 2 + 0.03]} castShadow>
        <boxGeometry args={[size[0] * 0.2, size[1] * 0.4, 0.05]} />
        <meshStandardMaterial color="#3d2914" roughness={0.9} />
      </mesh>
    </group>
  );
};

// Industrial crate/container
const Crate = ({ position, size = 1, color = '#8B4513' }: { position: [number, number, number]; size?: number; color?: string }) => {
  return (
    <group position={[position[0], position[1] + size / 2, position[2]]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Crate bands */}
      <mesh position={[0, size * 0.3, 0]}>
        <boxGeometry args={[size + 0.02, size * 0.08, size + 0.02]} />
        <meshStandardMaterial color="#5a3510" roughness={0.9} />
      </mesh>
      <mesh position={[0, -size * 0.3, 0]}>
        <boxGeometry args={[size + 0.02, size * 0.08, size + 0.02]} />
        <meshStandardMaterial color="#5a3510" roughness={0.9} />
      </mesh>
    </group>
  );
};

// Metal barrel
const Barrel = ({ position, color = '#2f4f4f' }: { position: [number, number, number]; color?: string }) => {
  return (
    <group position={[position[0], position[1] + 0.5, position[2]]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.4, 1, 16]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Barrel rings */}
      <mesh position={[0, 0.35, 0]}>
        <torusGeometry args={[0.36, 0.03, 8, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <torusGeometry args={[0.41, 0.03, 8, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>
    </group>
  );
};

// Concrete barrier
const ConcreteBarrier = ({ 
  position, 
  rotation = 0,
  length = 3 
}: { 
  position: [number, number, number]; 
  rotation?: number;
  length?: number;
}) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.8, 0.5]} />
        <meshStandardMaterial color="#808080" roughness={0.95} />
      </mesh>
      {/* Yellow/black warning stripes */}
      <mesh position={[0, 0.4, 0.26]} castShadow>
        <boxGeometry args={[length, 0.15, 0.02]} />
        <meshStandardMaterial color="#ffd700" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Shipping container
const ShippingContainer = ({ 
  position, 
  rotation = 0,
  color = '#cc4444'
}: { 
  position: [number, number, number]; 
  rotation?: number;
  color?: string;
}) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 2.4, 2.2]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Container ridges */}
      {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 1.12]} castShadow>
          <boxGeometry args={[0.08, 2.3, 0.08]} />
          <meshStandardMaterial color={new Color(color).multiplyScalar(0.8)} metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// Metal pipe structure
const PipeStructure = ({ 
  position,
  length = 4
}: { 
  position: [number, number, number]; 
  length?: number;
}) => {
  return (
    <group position={position}>
      {/* Horizontal pipe */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, length, 12]} />
        <meshStandardMaterial color="#6b5b4f" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Support legs */}
      <mesh position={[-length / 2 + 0.3, 1, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 2, 8]} />
        <meshStandardMaterial color="#5a4a3f" metalness={0.4} roughness={0.7} />
      </mesh>
      <mesh position={[length / 2 - 0.3, 1, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 2, 8]} />
        <meshStandardMaterial color="#5a4a3f" metalness={0.4} roughness={0.7} />
      </mesh>
    </group>
  );
};

// Light pole
const LightPole = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 5, 8]} />
        <meshStandardMaterial color="#404040" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 5.2, 0]}>
        <boxGeometry args={[0.6, 0.35, 0.3]} />
        <meshStandardMaterial color="#505050" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Light glow */}
      <mesh position={[0, 5, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#fffacd" />
      </mesh>
      <pointLight position={[0, 4.8, 0]} intensity={0.4} distance={12} color="#fff5e0" />
    </group>
  );
};

export const MapEnvironment = ({
  mapWidth,
  mapHeight,
  walls,
  flags,
  theme = 'summer',
}: MapEnvironmentProps) => {
  const sunRef = useRef<Mesh>(null);
  
  // Theme configurations
  const themeConfig = useMemo(() => {
    switch (theme) {
      case 'winter':
        return {
          skyColor: '#b0c4de',
          groundColor: '#e8e8e8',
          sunColor: '#f0f8ff',
          ambientIntensity: 0.4,
          sunIntensity: 0.8,
          fogColor: '#e0e0e0',
        };
      case 'desert':
        return {
          skyColor: '#f4a460',
          groundColor: '#edc9af',
          sunColor: '#ffd700',
          ambientIntensity: 0.5,
          sunIntensity: 1.4,
          fogColor: '#deb887',
        };
      case 'boombox':
        return {
          skyColor: '#87ceeb',
          groundColor: '#5a8f4a',
          sunColor: '#ffd700',
          ambientIntensity: 0.45,
          sunIntensity: 1.3,
          fogColor: '#c8e8c8',
        };
      default: // summer
        return {
          skyColor: '#87ceeb',
          groundColor: '#228b22',
          sunColor: '#ffd700',
          ambientIntensity: 0.5,
          sunIntensity: 1.2,
          fogColor: '#e0f0ff',
        };
    }
  }, [theme]);

  const scaledWidth = mapWidth * SCALE;
  const scaledHeight = mapHeight * SCALE;

  // Animate sun
  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.position.y = 80 + Math.sin(clock.elapsedTime * 0.1) * 5;
    }
  });

  // Generate ground patches for texture variation
  const groundPatches = useMemo(() => {
    const patches: Array<{ pos: [number, number, number]; color: string; size: number }> = [];
    for (let i = 0; i < 40; i++) {
      patches.push({
        pos: [
          (Math.random() - 0.5) * scaledWidth * 0.9,
          0.01,
          (Math.random() - 0.5) * scaledHeight * 0.9
        ],
        color: Math.random() > 0.5 ? '#4a7c3f' : '#3d6b34',
        size: 1.5 + Math.random() * 2
      });
    }
    return patches;
  }, [scaledWidth, scaledHeight]);

  const isBoombox = theme === 'boombox' || theme === 'summer';

  return (
    <>
      {/* Sky */}
      <Sky 
        distance={450000}
        sunPosition={[100, 80, 50]}
        inclination={0.6}
        azimuth={0.25}
      />
      
      {/* Fog */}
      <fog attach="fog" args={[themeConfig.fogColor, 60, 250]} />
      
      {/* Ambient Light */}
      <ambientLight intensity={themeConfig.ambientIntensity} />
      
      {/* Sun Directional Light */}
      <directionalLight
        position={[80, 100, 50]}
        intensity={themeConfig.sunIntensity}
        color={themeConfig.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={300}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      {/* Fill Light */}
      <directionalLight
        position={[-50, 30, -50]}
        intensity={0.3}
        color="#b0c4de"
      />
      
      {/* Ground Plane - Main grass */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[scaledWidth + 50, scaledHeight + 50]} />
        <meshStandardMaterial 
          color={themeConfig.groundColor} 
          roughness={0.9} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Ground variation patches */}
      {groundPatches.map((patch, i) => (
        <mesh 
          key={i}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={patch.pos}
          receiveShadow
        >
          <circleGeometry args={[patch.size, 8]} />
          <meshStandardMaterial 
            color={patch.color}
            roughness={0.95}
          />
        </mesh>
      ))}
      
      {/* Dirt path through center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[scaledWidth * 0.25, scaledHeight]} />
        <meshStandardMaterial color="#8B7355" roughness={0.95} />
      </mesh>
      
      {/* Map Boundaries */}
      <MapBoundaries width={scaledWidth} height={scaledHeight} />
      
      {/* Original walls */}
      {walls.map((wall) => (
        <WallMesh key={wall.id} wall={wall} mapWidth={mapWidth} mapHeight={mapHeight} />
      ))}
      
      {/* Flags */}
      {flags.map((flag) => (
        <FlagMesh key={flag.id} flag={flag} mapWidth={mapWidth} mapHeight={mapHeight} />
      ))}
      
      {/* Flag Bases */}
      <FlagBase position={[80 * SCALE - scaledWidth / 2, 0, 400 * SCALE - scaledHeight / 2]} team="red" />
      <FlagBase position={[1120 * SCALE - scaledWidth / 2, 0, 400 * SCALE - scaledHeight / 2]} team="blue" />
      
      {/* === BOOMBOX-STYLE MAP ELEMENTS === */}
      {isBoombox && (
        <>
          {/* Central building cluster */}
          <Building 
            position={[0, 0, 0]} 
            size={[6, 4, 5]} 
            color="#7a6955"
            roofColor="#5a4a3a"
          />
          
          {/* Corner buildings */}
          <Building 
            position={[-scaledWidth * 0.35, 0, -scaledHeight * 0.3]} 
            size={[7, 5, 6]} 
            color="#8a7965"
            roofColor="#6a5a4a"
          />
          <Building 
            position={[scaledWidth * 0.35, 0, -scaledHeight * 0.3]} 
            size={[7, 5, 6]} 
            color="#8a7965"
            roofColor="#6a5a4a"
          />
          <Building 
            position={[-scaledWidth * 0.35, 0, scaledHeight * 0.3]} 
            size={[7, 4.5, 6]} 
            color="#9a8975"
            roofColor="#7a6a5a"
          />
          <Building 
            position={[scaledWidth * 0.35, 0, scaledHeight * 0.3]} 
            size={[7, 4.5, 6]} 
            color="#9a8975"
            roofColor="#7a6a5a"
          />
          
          {/* Small structures near center */}
          <Building 
            position={[-scaledWidth * 0.15, 0, 0]} 
            size={[3.5, 3, 3]} 
            color="#6a5945"
            hasWindows={false}
          />
          <Building 
            position={[scaledWidth * 0.15, 0, 0]} 
            size={[3.5, 3, 3]} 
            color="#6a5945"
            hasWindows={false}
          />
          
          {/* Shipping containers */}
          <ShippingContainer 
            position={[-scaledWidth * 0.25, 0, -scaledHeight * 0.15]} 
            rotation={Math.PI / 6}
            color="#cc4444"
          />
          <ShippingContainer 
            position={[scaledWidth * 0.25, 0, scaledHeight * 0.15]} 
            rotation={-Math.PI / 6}
            color="#4444cc"
          />
          
          {/* Concrete barriers */}
          <ConcreteBarrier position={[-scaledWidth * 0.1, 0, -scaledHeight * 0.2]} rotation={Math.PI / 4} length={3} />
          <ConcreteBarrier position={[scaledWidth * 0.1, 0, -scaledHeight * 0.2]} rotation={-Math.PI / 4} length={3} />
          <ConcreteBarrier position={[-scaledWidth * 0.1, 0, scaledHeight * 0.2]} rotation={-Math.PI / 4} length={3} />
          <ConcreteBarrier position={[scaledWidth * 0.1, 0, scaledHeight * 0.2]} rotation={Math.PI / 4} length={3} />
          
          {/* Crates for cover */}
          <Crate position={[-5, 0, -6]} size={1.2} />
          <Crate position={[-4, 0, -5]} size={0.9} />
          <Crate position={[-4.5, 0.9, -5.5]} size={0.7} />
          <Crate position={[5, 0, -6]} size={1.2} />
          <Crate position={[4, 0, -5]} size={0.9} />
          
          <Crate position={[-5, 0, 6]} size={1.2} color="#6B4423" />
          <Crate position={[5, 0, 6]} size={1.2} color="#6B4423" />
          <Crate position={[4.5, 0, 5]} size={0.8} color="#7B5433" />
          
          {/* Barrels */}
          <Barrel position={[-scaledWidth * 0.2, 0, -5]} color="#2f4f4f" />
          <Barrel position={[-scaledWidth * 0.2 + 0.8, 0, -5]} color="#4f2f2f" />
          <Barrel position={[scaledWidth * 0.2, 0, -5]} color="#2f4f4f" />
          <Barrel position={[scaledWidth * 0.2, 0, 5]} color="#4f4f2f" />
          <Barrel position={[scaledWidth * 0.2 - 0.8, 0, 5]} color="#2f4f4f" />
          
          {/* Pipe structures */}
          <PipeStructure position={[-scaledWidth * 0.18, 0, scaledHeight * 0.1]} length={5} />
          <PipeStructure position={[scaledWidth * 0.18, 0, -scaledHeight * 0.1]} length={5} />
          
          {/* Light poles */}
          <LightPole position={[-scaledWidth * 0.3, 0, -scaledHeight * 0.15]} />
          <LightPole position={[scaledWidth * 0.3, 0, -scaledHeight * 0.15]} />
          <LightPole position={[-scaledWidth * 0.3, 0, scaledHeight * 0.15]} />
          <LightPole position={[scaledWidth * 0.3, 0, scaledHeight * 0.15]} />
        </>
      )}
      
      {/* Trees on edges */}
      <Tree position={[-scaledWidth / 2 + 3, 0, -scaledHeight / 2 + 3]} scale={1.2} />
      <Tree position={[-scaledWidth / 2 + 5, 0, -scaledHeight / 2 + 8]} scale={1.0} />
      <Tree position={[scaledWidth / 2 - 3, 0, -scaledHeight / 2 + 3]} scale={1.1} />
      <Tree position={[scaledWidth / 2 - 5, 0, -scaledHeight / 2 + 6]} scale={0.9} />
      <Tree position={[-scaledWidth / 2 + 3, 0, scaledHeight / 2 - 3]} scale={1.0} />
      <Tree position={[scaledWidth / 2 - 3, 0, scaledHeight / 2 - 3]} scale={1.2} />
      <Tree position={[-scaledWidth / 2 + 6, 0, 0]} scale={0.8} />
      <Tree position={[scaledWidth / 2 - 6, 0, 0]} scale={0.8} />
      
      {/* Clouds */}
      <Cloud position={[-20, 40, 0]} speed={0.2} opacity={0.5} />
      <Cloud position={[20, 50, -20]} speed={0.15} opacity={0.4} />
      <Cloud position={[0, 45, 30]} speed={0.25} opacity={0.6} />
    </>
  );
};

// Map boundary walls
const MapBoundaries = ({ width, height }: { width: number; height: number }) => (
  <>
    {/* Top */}
    <mesh position={[0, 2, -height / 2 - 0.5]} castShadow receiveShadow>
      <boxGeometry args={[width + 2, 4, 1]} />
      <meshStandardMaterial color="#4a5568" metalness={0.4} roughness={0.6} />
    </mesh>
    {/* Bottom */}
    <mesh position={[0, 2, height / 2 + 0.5]} castShadow receiveShadow>
      <boxGeometry args={[width + 2, 4, 1]} />
      <meshStandardMaterial color="#4a5568" metalness={0.4} roughness={0.6} />
    </mesh>
    {/* Left */}
    <mesh position={[-width / 2 - 0.5, 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[1, 4, height + 2]} />
      <meshStandardMaterial color="#4a5568" metalness={0.4} roughness={0.6} />
    </mesh>
    {/* Right */}
    <mesh position={[width / 2 + 0.5, 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[1, 4, height + 2]} />
      <meshStandardMaterial color="#4a5568" metalness={0.4} roughness={0.6} />
    </mesh>
  </>
);

// Wall mesh component
const WallMesh = ({ wall, mapWidth, mapHeight }: { wall: Wall; mapWidth: number; mapHeight: number }) => {
  const [x, z] = to3D(
    wall.position.x + wall.width / 2, 
    wall.position.y + wall.height / 2, 
    mapWidth, 
    mapHeight
  );
  
  const height3D = wall.type === 'solid' ? 3 : 2;
  const color = wall.type === 'solid' ? '#6b7280' : '#854d0e';
  
  return (
    <mesh 
      position={[x * SCALE, height3D / 2, z * SCALE]} 
      castShadow 
      receiveShadow
    >
      <boxGeometry args={[wall.width * SCALE, height3D, wall.height * SCALE]} />
      <meshStandardMaterial 
        color={color} 
        metalness={wall.type === 'solid' ? 0.5 : 0.2}
        roughness={wall.type === 'solid' ? 0.4 : 0.8}
      />
    </mesh>
  );
};

// Flag mesh component
const FlagMesh = ({ flag, mapWidth, mapHeight }: { flag: Flag; mapWidth: number; mapHeight: number }) => {
  const flagRef = useRef<Mesh>(null);
  const [x, z] = to3D(flag.position.x, flag.position.y, mapWidth, mapHeight);
  
  const teamColor = flag.team === 'red' ? '#ef4444' : '#3b82f6';
  const glowColor = flag.team === 'red' ? '#ff6666' : '#6699ff';
  
  // Animate flag waving
  useFrame(({ clock }) => {
    if (flagRef.current && !flag.carriedBy) {
      flagRef.current.rotation.y = Math.sin(clock.elapsedTime * 3) * 0.15;
      flagRef.current.position.x = Math.sin(clock.elapsedTime * 2) * 0.03;
    }
  });
  
  if (flag.carriedBy) return null;
  
  return (
    <group position={[x * SCALE, 0, z * SCALE]}>
      {/* Base platform */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.2, 1.4, 0.2, 8]} />
        <meshStandardMaterial color={teamColor} roughness={0.6} metalness={0.3} />
      </mesh>
      
      {/* Glowing ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.3, 1.6, 32]} />
        <meshStandardMaterial 
          color={glowColor} 
          emissive={glowColor} 
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Flag Pole */}
      <mesh castShadow position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 5, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Flag Cloth */}
      <mesh ref={flagRef} castShadow position={[0.6, 4.5, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.04]} />
        <meshStandardMaterial 
          color={teamColor} 
          emissive={teamColor}
          emissiveIntensity={0.3}
          side={DoubleSide}
        />
      </mesh>
      
      {/* Team emblem */}
      <mesh position={[0.6, 4.5, 0.025]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Point light glow */}
      <pointLight position={[0, 1.5, 0]} color={glowColor} intensity={1.5} distance={6} />
    </group>
  );
};

// Flag base indicator
const FlagBase = ({ position, team }: { position: [number, number, number]; team: 'red' | 'blue' }) => {
  const meshRef = useRef<Mesh>(null);
  const teamColor = team === 'red' ? '#ef4444' : '#3b82f6';
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.elapsedTime * 0.5;
    }
  });
  
  return (
    <group position={position}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.5, 2, 6]} />
        <meshBasicMaterial color={teamColor} transparent opacity={0.6} side={DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshBasicMaterial color={teamColor} transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

// Decorative tree
const Tree = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    {/* Trunk */}
    <mesh castShadow position={[0, 1.5, 0]}>
      <cylinderGeometry args={[0.25, 0.35, 3, 8]} />
      <meshStandardMaterial color="#5d4037" roughness={0.9} />
    </mesh>
    {/* Foliage layers */}
    <mesh castShadow position={[0, 4, 0]}>
      <coneGeometry args={[1.4, 2.8, 8]} />
      <meshStandardMaterial color="#2e7d32" roughness={0.8} />
    </mesh>
    <mesh castShadow position={[0, 5.3, 0]}>
      <coneGeometry args={[1.1, 2.3, 8]} />
      <meshStandardMaterial color="#388e3c" roughness={0.8} />
    </mesh>
    <mesh castShadow position={[0, 6.4, 0]}>
      <coneGeometry args={[0.7, 1.8, 8]} />
      <meshStandardMaterial color="#43a047" roughness={0.8} />
    </mesh>
  </group>
);

export default MapEnvironment;
