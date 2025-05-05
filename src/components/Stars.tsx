import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type TimeOfDay = 'day' | 'night';

interface StarsProps {
  timeOfDay: TimeOfDay;
}

const Stars: React.FC<StarsProps> = ({ timeOfDay }) => {
  // Only render stars at night
  if (timeOfDay !== 'night') return null;
  
  // Create refs for star groups to animate them
  const starsRef = useRef<THREE.Group>(null);
  
  // Generate random star positions
  const starPositions = useMemo(() => {
    const count = 200; // Number of stars
    const positions = [];
    
    for (let i = 0; i < count; i++) {
      // Create a sphere of stars around the scene
      const theta = Math.random() * Math.PI * 2; // Random angle around y-axis
      const phi = Math.acos(2 * Math.random() - 1); // Random angle from y-axis
      
      const radius = 80 + Math.random() * 20; // Random distance from center
      
      // Convert spherical to Cartesian coordinates
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta) + 20; // Shift up a bit
      const z = -radius * Math.cos(phi);
      
      positions.push([x, y, z]);
    }
    
    return positions;
  }, []);
  
  // Generate random star sizes
  const starSizes = useMemo(() => {
    return starPositions.map(() => 0.05 + Math.random() * 0.15);
  }, [starPositions]);
  
  // Generate random star colors (mostly white with some blue and yellow tints)
  const starColors = useMemo(() => {
    return starPositions.map(() => {
      const r = 0.9 + Math.random() * 0.1; // 0.9-1.0
      const g = 0.9 + Math.random() * 0.1; // 0.9-1.0
      const b = 0.9 + Math.random() * 0.1; // 0.9-1.0
      
      // Occasionally add color tint
      const colorVariation = Math.random();
      if (colorVariation > 0.8) {
        // Bluish tint
        return new THREE.Color(r * 0.8, g * 0.9, b * 1.1);
      } else if (colorVariation > 0.6) {
        // Yellowish tint
        return new THREE.Color(r * 1.1, g * 1.1, b * 0.8);
      }
      
      // Default white/silver
      return new THREE.Color(r, g, b);
    });
  }, [starPositions]);
  
  // Twinkle animation
  useFrame(({ clock }) => {
    if (starsRef.current) {
      // Very subtle rotation for stars
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.01;
      
      // Access children to create twinkling effect
      starsRef.current.children.forEach((star, i) => {
        // Different twinkle rate for each star
        const twinkleRate = 0.3 + (i % 5) * 0.1;
        const intensity = (Math.sin(clock.getElapsedTime() * twinkleRate + i) + 1) / 2;
        
        // Apply intensity to star material
        // Use MeshStandardMaterial for emissive properties
        if (star instanceof THREE.Mesh && star.material instanceof THREE.MeshStandardMaterial) {
          // Adjust emissive intensity for twinkling
          star.material.emissiveIntensity = 0.5 + intensity * 0.5;
        }
      });
    }
  });
  
  return (
    <group ref={starsRef}>
      {starPositions.map((position, index) => (
        <mesh key={index} position={position as [number, number, number]}>
          <sphereGeometry args={[starSizes[index], 8, 8]} />
          {/* Use MeshStandardMaterial instead of MeshBasicMaterial for emissive properties */}
          <meshStandardMaterial 
            color={starColors[index]} 
            emissive={starColors[index]}
            emissiveIntensity={0.8}
            toneMapped={false} // Makes stars brighter
            roughness={1.0} // Less reflective
            metalness={0.0} // Non-metallic
          />
        </mesh>
      ))}
    </group>
  );
};

export default Stars;
