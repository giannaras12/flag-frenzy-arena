import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Color } from 'three';
import { Projectile } from '@/lib/gameTypes';

interface ProjectileEffectProps {
  projectile: Projectile;
  mapWidth: number;
  mapHeight: number;
}

const SCALE = 0.05;

// Convert 2D position to 3D
const to3D = (x: number, y: number, mapWidth: number, mapHeight: number): [number, number] => {
  return [x - mapWidth / 2, y - mapHeight / 2];
};

export const ProjectileEffect = ({ projectile, mapWidth, mapHeight }: ProjectileEffectProps) => {
  const meshRef = useRef<Mesh>(null);
  const trailRef = useRef<Mesh>(null);
  
  const [x, z] = to3D(projectile.position.x, projectile.position.y, mapWidth, mapHeight);
  const color = useMemo(() => new Color(projectile.color), [projectile.color]);
  
  // Get projectile visual config based on effect type
  const config = useMemo(() => {
    switch (projectile.effect) {
      case 'explosive':
        return { size: 0.4, trailLength: 1.5, intensity: 1.5 };
      case 'railgun':
        return { size: 0.2, trailLength: 3, intensity: 2 };
      case 'plasma':
        return { size: 0.35, trailLength: 1.2, intensity: 1.8 };
      case 'laser':
        return { size: 0.15, trailLength: 2.5, intensity: 2.5 };
      default:
        return { size: 0.25, trailLength: 1, intensity: 1 };
    }
  }, [projectile.effect]);
  
  // Animate glow pulse
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 15) * 0.2;
      meshRef.current.scale.setScalar(pulse);
    }
  });
  
  // Calculate velocity direction for trail
  const velocity = projectile.velocity;
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  const angle = Math.atan2(velocity.y, velocity.x);
  
  return (
    <group position={[x * SCALE, 1.2, z * SCALE]}>
      {/* Main projectile */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[config.size, 12, 8]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[config.size * 1.5, 12, 8]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Trail */}
      <mesh 
        ref={trailRef}
        position={[-config.trailLength * 0.5 * Math.cos(angle), 0, -config.trailLength * 0.5 * Math.sin(angle)]}
        rotation={[0, -angle + Math.PI / 2, Math.PI / 2]}
      >
        <cylinderGeometry args={[config.size * 0.3, config.size * 0.8, config.trailLength, 8]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Point light for glow effect */}
      <pointLight 
        color={color} 
        intensity={config.intensity} 
        distance={5}
        decay={2}
      />
    </group>
  );
};

// Explosion effect component
interface ExplosionProps {
  position: [number, number, number];
  color: string;
  size?: 'small' | 'medium' | 'large';
  onComplete?: () => void;
}

export const Explosion = ({ position, color, size = 'medium', onComplete }: ExplosionProps) => {
  const meshRef = useRef<Mesh>(null);
  const startTime = useRef(Date.now());
  
  const baseSize = size === 'small' ? 0.5 : size === 'medium' ? 1 : 1.5;
  const duration = size === 'small' ? 300 : size === 'medium' ? 500 : 700;
  
  useFrame(() => {
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    
    if (meshRef.current) {
      // Expand and fade
      const scale = baseSize * (1 + progress * 2);
      meshRef.current.scale.setScalar(scale);
      
      const material = meshRef.current.material as any;
      material.opacity = 1 - progress;
    }
    
    if (progress >= 1 && onComplete) {
      onComplete();
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshBasicMaterial 
        color={color}
        transparent
        opacity={1}
      />
    </mesh>
  );
};

// Muzzle flash effect
interface MuzzleFlashProps {
  position: [number, number, number];
  rotation: number;
  color: string;
}

export const MuzzleFlash = ({ position, rotation, color }: MuzzleFlashProps) => {
  const meshRef = useRef<Mesh>(null);
  const startTime = useRef(Date.now());
  
  useFrame(() => {
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / 100, 1);
    
    if (meshRef.current) {
      const material = meshRef.current.material as any;
      material.opacity = 1 - progress;
    }
  });
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh ref={meshRef}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={1}
        />
      </mesh>
      <pointLight color={color} intensity={3} distance={3} decay={2} />
    </group>
  );
};
