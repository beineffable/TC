import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type TimeOfDay = 'day' | 'night';
type WeatherType = 'clear' | 'few_clouds' | 'clouds' | 'rain' | 'thunderstorm' | 'snow' | 'fog';

interface SunMoonProps {
  timeOfDay: TimeOfDay;
  weatherType: WeatherType;
}

const SunMoon: React.FC<SunMoonProps> = ({ timeOfDay, weatherType }) => {
  const sunRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  
  // Position based on time of day
  const position = timeOfDay === 'day' 
    ? [50, 40, -60] // Sun position during day
    : [-40, 30, -60]; // Moon position during night
  
  // Determine visibility based on weather and time
  const isVisible = weatherType !== 'clouds' && 
                   weatherType !== 'rain' && 
                   weatherType !== 'thunderstorm' && 
                   weatherType !== 'fog';
  
  // Simple animation
  useFrame(() => {
    if (sunRef.current && timeOfDay === 'day') {
      sunRef.current.rotation.y += 0.001;
    }
    if (moonRef.current && timeOfDay === 'night') {
      moonRef.current.rotation.y += 0.0005;
    }
  });

  // Only render if visible based on weather conditions
  if (!isVisible) return null;
  
  return (
    <>
      {timeOfDay === 'day' && (
        <mesh ref={sunRef} position={position}>
          <sphereGeometry args={[15, 32, 32]} />
          <meshBasicMaterial color="#FDB813" />
          <pointLight 
            position={[0, 0, 0]} 
            intensity={1.5} 
            distance={200} 
            decay={2} 
            color="#FFF5E0" 
          />
        </mesh>
      )}
      
      {timeOfDay === 'night' && (
        <mesh ref={moonRef} position={position}>
          <sphereGeometry args={[10, 32, 32]} />
          <meshStandardMaterial 
            color="#E6E6E6" 
            emissive="#AAAACC"
            emissiveIntensity={0.2}
            roughness={0.8}
            metalness={0.1}
          />
          <pointLight 
            position={[0, 0, 0]} 
            intensity={0.8} 
            distance={150} 
            decay={2} 
            color="#E6EEFF" 
          />
        </mesh>
      )}
    </>
  );
};

export default SunMoon;
