import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type WeatherType = 'clear' | 'few_clouds' | 'clouds' | 'rain' | 'thunderstorm' | 'snow' | 'fog';
type TimeOfDay = 'day' | 'night';

interface CloudsProps {
  weatherType: WeatherType;
  timeOfDay: TimeOfDay;
}

const Clouds: React.FC<CloudsProps> = ({ weatherType, timeOfDay }) => {
  // Create refs for cloud groups to animate them
  const cloudsRef = useRef<THREE.Group>(null);
  
  // Determine cloud color based on weather and time of day
  const getCloudColor = (): string => {
    // White clouds in good weather (clear, few_clouds)
    if (weatherType === 'clear' || weatherType === 'few_clouds') {
      return '#ffffff'; // Pure white for company logo in good weather
    }
    
    // Darker clouds for night
    if (timeOfDay === 'night') {
      return '#9aa0a8'; // Dark grayish for night
    }
    
    // Darker clouds for rain/snow/thunderstorm
    if (weatherType === 'rain' || weatherType === 'thunderstorm' || weatherType === 'snow') {
      return '#a8a8a8'; // Darker gray for bad weather
    }
    
    // Default cloud color for other conditions
    return '#f0f0f0'; // Slightly off-white for cloudy day
  };
  
  // Determine number of clouds based on weather type
  const getCloudCount = (): number => {
    if (weatherType === 'clear') return 1; // Just the logo cloud
    if (weatherType === 'few_clouds') return 3;
    if (weatherType === 'clouds') return 6;
    if (weatherType === 'rain' || weatherType === 'thunderstorm' || weatherType === 'snow' || weatherType === 'fog') return 8;
    return 3; // Default
  };
  
  // Simple animation for gentle cloud movement
  useFrame(({ clock }) => {
    if (cloudsRef.current) {
      // Very subtle movement for clouds
      cloudsRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.05) * 2;
    }
  });
  
  // Generate cloud positions
  const cloudPositions = React.useMemo(() => {
    const count = getCloudCount();
    const positions = [];
    
    // Always include the main logo cloud in a prominent position
    positions.push([0, 30, -40]); // Main logo cloud
    
    // Add additional clouds based on weather
    for (let i = 1; i < count; i++) {
      const x = (Math.random() - 0.5) * 80;
      const y = 20 + Math.random() * 20;
      const z = -30 - Math.random() * 40;
      positions.push([x, y, z]);
    }
    
    return positions;
  }, [weatherType]);
  
  const cloudColor = getCloudColor();
  
  return (
    <group ref={cloudsRef}>
      {cloudPositions.map((position, index) => (
        <mesh key={index} position={position as [number, number, number]}>
          {/* Use different size for the main logo cloud */}
          {index === 0 ? (
            // Main logo cloud - larger and more defined
            <group>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[6, 16, 16]} />
                <meshStandardMaterial 
                  color={cloudColor} 
                  roughness={0.9} 
                  metalness={0.1}
                  emissive={timeOfDay === 'night' ? '#333333' : '#ffffff'}
                  emissiveIntensity={timeOfDay === 'night' ? 0.05 : 0}
                />
              </mesh>
              <mesh position={[-5, -1, 0]}>
                <sphereGeometry args={[4, 16, 16]} />
                <meshStandardMaterial 
                  color={cloudColor} 
                  roughness={0.9} 
                  metalness={0.1}
                  emissive={timeOfDay === 'night' ? '#333333' : '#ffffff'}
                  emissiveIntensity={timeOfDay === 'night' ? 0.05 : 0}
                />
              </mesh>
              <mesh position={[5, -2, 0]}>
                <sphereGeometry args={[5, 16, 16]} />
                <meshStandardMaterial 
                  color={cloudColor} 
                  roughness={0.9} 
                  metalness={0.1}
                  emissive={timeOfDay === 'night' ? '#333333' : '#ffffff'}
                  emissiveIntensity={timeOfDay === 'night' ? 0.05 : 0}
                />
              </mesh>
            </group>
          ) : (
            // Additional clouds - varied sizes
            <group>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[3 + Math.random() * 3, 16, 16]} />
                <meshStandardMaterial 
                  color={cloudColor} 
                  roughness={0.9} 
                  metalness={0.1}
                  emissive={timeOfDay === 'night' ? '#333333' : '#ffffff'}
                  emissiveIntensity={timeOfDay === 'night' ? 0.05 : 0}
                />
              </mesh>
              <mesh position={[-3 - Math.random() * 2, -1, 0]}>
                <sphereGeometry args={[2 + Math.random() * 2, 16, 16]} />
                <meshStandardMaterial 
                  color={cloudColor} 
                  roughness={0.9} 
                  metalness={0.1}
                  emissive={timeOfDay === 'night' ? '#333333' : '#ffffff'}
                  emissiveIntensity={timeOfDay === 'night' ? 0.05 : 0}
                />
              </mesh>
              <mesh position={[3 + Math.random() * 2, -1, 0]}>
                <sphereGeometry args={[2 + Math.random() * 2, 16, 16]} />
                <meshStandardMaterial 
                  color={cloudColor} 
                  roughness={0.9} 
                  metalness={0.1}
                  emissive={timeOfDay === 'night' ? '#333333' : '#ffffff'}
                  emissiveIntensity={timeOfDay === 'night' ? 0.05 : 0}
                />
              </mesh>
            </group>
          )}
        </mesh>
      ))}
    </group>
  );
};

export default Clouds;
