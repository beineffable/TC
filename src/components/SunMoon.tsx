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

  // Determine visibility and position based on time of day
  const isDay = timeOfDay === 'day';
  const isVisible = true; // Always visible, just changes appearance/position

  // Determine color based on weather and time
  const sunColor = (weatherType === 'fog' || weatherType === 'rain' || weatherType === 'thunderstorm' || weatherType === 'snow') ? '#cccccc' : '#ffffaa';
  const moonColor = '#e0e0ff';

  // Animation: Rotate sun/moon slowly
  useFrame(({ clock }) => {
    const angle = clock.getElapsedTime() * 0.1; // Slow rotation
    const radius = 50;
    const x = Math.sin(angle) * radius;
    const z = -Math.cos(angle) * radius - 30; // Keep it in the distance
    const y = Math.cos(angle) * 15 + 30; // Rise and set effect

    if (isDay && sunRef.current) {
      sunRef.current.position.set(x, y, z);
      sunRef.current.visible = true;
      if (moonRef.current) moonRef.current.visible = false;
    } else if (!isDay && moonRef.current) {
      // Moon follows a similar path but might be slightly different
      const moonAngle = angle + Math.PI; // Opposite side of the sky
      const moonX = Math.sin(moonAngle) * radius;
      const moonZ = -Math.cos(moonAngle) * radius - 30;
      const moonY = Math.cos(moonAngle) * 15 + 30;
      moonRef.current.position.set(moonX, moonY, moonZ);
      moonRef.current.visible = true;
      if (sunRef.current) sunRef.current.visible = false;
    }
  });

  if (!isVisible) return null;

  return (
    <group>
      {/* Sun */}
      <mesh ref={sunRef} position={[0, 50, -80]}> {/* Initial position, will be updated by useFrame */}
        <sphereGeometry args={[5, 32, 32]} />
        <meshStandardMaterial 
          color={sunColor} 
          emissive={sunColor} 
          emissiveIntensity={1.5} 
          toneMapped={false}
        />
      </mesh>
      
      {/* Moon */}
      <mesh ref={moonRef} position={[0, 50, -80]}> {/* Initial position, will be updated by useFrame */}
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial 
          color={moonColor} 
          emissive={moonColor} 
          emissiveIntensity={0.3} 
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

export default SunMoon;

