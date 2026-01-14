import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Cloud, useTexture } from '@react-three/drei';
import { Mesh, RepeatWrapping, Color, DoubleSide } from 'three';
import { Wall, Flag } from '@/lib/gameTypes';

interface MapEnvironmentProps {
  mapWidth: number;
  mapHeight: number;
  walls: Wall[];
  flags: Flag[];
  theme?: 'summer' | 'winter' | 'desert';
}

// Convert 2D position to 3D (2D x,y -> 3D x,z)
const to3D = (x: number, y: number, mapWidth: number, mapHeight: number): [number, number] => {
  return [x - mapWidth / 2, y - mapHeight / 2];
};

// Scale factor for converting game units to 3D units
const SCALE = 0.05;

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
      <fog attach="fog" args={[themeConfig.fogColor, 50, 200]} />
      
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
      
      {/* Ground Plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[scaledWidth + 40, scaledHeight + 40]} />
        <meshStandardMaterial 
          color={themeConfig.groundColor} 
          roughness={0.9} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Ground Grid/Texture Pattern */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, 0]}
      >
        <planeGeometry args={[scaledWidth, scaledHeight]} />
        <meshStandardMaterial 
          color={new Color(themeConfig.groundColor).multiplyScalar(0.95)}
          roughness={0.85}
          metalness={0.05}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Map Boundaries */}
      <MapBoundaries width={scaledWidth} height={scaledHeight} />
      
      {/* Walls */}
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
      
      {/* Decorative Elements */}
      {theme === 'summer' && (
        <>
          {/* Trees around the map edges */}
          <Tree position={[-scaledWidth / 2 + 5, 0, -scaledHeight / 2 + 5]} scale={1.2} />
          <Tree position={[-scaledWidth / 2 + 8, 0, -scaledHeight / 2 + 15]} scale={1.0} />
          <Tree position={[scaledWidth / 2 - 5, 0, -scaledHeight / 2 + 5]} scale={1.1} />
          <Tree position={[scaledWidth / 2 - 8, 0, -scaledHeight / 2 + 12]} scale={0.9} />
          <Tree position={[-scaledWidth / 2 + 5, 0, scaledHeight / 2 - 5]} scale={1.0} />
          <Tree position={[scaledWidth / 2 - 5, 0, scaledHeight / 2 - 5]} scale={1.2} />
          
          {/* Bushes */}
          <Bush position={[-scaledWidth / 4, 0, -scaledHeight / 3]} scale={0.8} />
          <Bush position={[scaledWidth / 4, 0, scaledHeight / 3]} scale={0.7} />
          
          {/* Rocks */}
          <Rock position={[0, 0, -scaledHeight / 2 + 3]} scale={0.5} />
          <Rock position={[0, 0, scaledHeight / 2 - 3]} scale={0.6} />
        </>
      )}
      
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
    <mesh position={[0, 1.5, -height / 2 - 0.5]} castShadow receiveShadow>
      <boxGeometry args={[width + 2, 3, 1]} />
      <meshStandardMaterial color="#4a5568" metalness={0.4} roughness={0.6} />
    </mesh>
    {/* Bottom */}
    <mesh position={[0, 1.5, height / 2 + 0.5]} castShadow receiveShadow>
      <boxGeometry args={[width + 2, 3, 1]} />
      <meshStandardMaterial color="#4a5568" metalness={0.4} roughness={0.6} />
    </mesh>
    {/* Left */}
    <mesh position={[-width / 2 - 0.5, 1.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[1, 3, height + 2]} />
      <meshStandardMaterial color="#4a5568" metalness={0.4} roughness={0.6} />
    </mesh>
    {/* Right */}
    <mesh position={[width / 2 + 0.5, 1.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[1, 3, height + 2]} />
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
  
  // Animate flag waving
  useFrame(({ clock }) => {
    if (flagRef.current && !flag.carriedBy) {
      flagRef.current.rotation.y = Math.sin(clock.elapsedTime * 3) * 0.1;
      flagRef.current.position.x = Math.sin(clock.elapsedTime * 2) * 0.02;
    }
  });
  
  if (flag.carriedBy) return null;
  
  return (
    <group position={[x * SCALE, 0, z * SCALE]}>
      {/* Flag Pole */}
      <mesh castShadow position={[0, 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Flag Cloth */}
      <mesh ref={flagRef} castShadow position={[0.5, 3.5, 0]}>
        <boxGeometry args={[1, 0.6, 0.03]} />
        <meshStandardMaterial 
          color={teamColor} 
          emissive={teamColor}
          emissiveIntensity={0.3}
          side={DoubleSide}
        />
      </mesh>
      
      {/* Glow Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshBasicMaterial color={teamColor} transparent opacity={0.4} />
      </mesh>
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
      <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
      <meshStandardMaterial color="#8b4513" roughness={0.9} />
    </mesh>
    {/* Foliage */}
    <mesh castShadow position={[0, 4, 0]}>
      <coneGeometry args={[1.5, 3, 8]} />
      <meshStandardMaterial color="#228b22" roughness={0.8} />
    </mesh>
    <mesh castShadow position={[0, 5.5, 0]}>
      <coneGeometry args={[1.2, 2.5, 8]} />
      <meshStandardMaterial color="#2d8b2d" roughness={0.8} />
    </mesh>
    <mesh castShadow position={[0, 6.8, 0]}>
      <coneGeometry args={[0.8, 2, 8]} />
      <meshStandardMaterial color="#32a032" roughness={0.8} />
    </mesh>
  </group>
);

// Decorative bush
const Bush = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh castShadow position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.8, 8, 6]} />
      <meshStandardMaterial color="#228b22" roughness={0.9} />
    </mesh>
    <mesh castShadow position={[0.4, 0.4, 0.3]}>
      <sphereGeometry args={[0.5, 8, 6]} />
      <meshStandardMaterial color="#2d8b2d" roughness={0.9} />
    </mesh>
    <mesh castShadow position={[-0.3, 0.4, -0.2]}>
      <sphereGeometry args={[0.55, 8, 6]} />
      <meshStandardMaterial color="#1e7b1e" roughness={0.9} />
    </mesh>
  </group>
);

// Decorative rock
const Rock = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <mesh castShadow receiveShadow position={[position[0], position[1] + 0.4 * scale, position[2]]} scale={scale}>
    <dodecahedronGeometry args={[1, 0]} />
    <meshStandardMaterial color="#6b7280" roughness={0.9} metalness={0.1} />
  </mesh>
);
