import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type WeatherType = 'clear' | 'few_clouds' | 'clouds' | 'rain' | 'thunderstorm' | 'snow' | 'fog';

interface LightningProps {
  weatherType: WeatherType;
}

const Lightning: React.FC<LightningProps> = ({ weatherType }) => {
  // Only render lightning for thunderstorm and rain (as per user requirement)
  if (weatherType !== 'thunderstorm' && weatherType !== 'rain') {
    return null;
  }

  // Reference to the lightning mesh
  const lightningRef = useRef<THREE.Mesh>(null);
  
  // State to track lightning visibility
  const [isVisible, setIsVisible] = useState(false);
  
  // State to track time until next lightning
  const [nextLightningTime, setNextLightningTime] = useState(
    // More frequent for thunderstorm, less frequent for rain
    weatherType === 'thunderstorm' ? Math.random() * 5 + 2 : Math.random() * 15 + 10
  );
  
  // State to track lightning duration
  const [lightningDuration, setLightningDuration] = useState(0.2);
  
  // Lightning flash effect
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Check if it's time for a lightning flash
    if (time > nextLightningTime) {
      if (!isVisible) {
        // Start lightning flash
        setIsVisible(true);
        
        // Set duration for this flash (slightly random)
        const duration = Math.random() * 0.2 + 0.1;
        setLightningDuration(duration);
        
        // Schedule end of lightning flash
        setTimeout(() => {
          setIsVisible(false);
          
          // Schedule next lightning flash
          const nextTime = time + (
            weatherType === 'thunderstorm' 
              ? Math.random() * 5 + 2    // 2-7 seconds for thunderstorm
              : Math.random() * 15 + 10  // 10-25 seconds for rain
          );
          setNextLightningTime(nextTime);
        }, duration * 1000);
      }
    }
    
    // Rotate lightning slightly for more natural look
    if (lightningRef.current && isVisible) {
      lightningRef.current.rotation.z = Math.sin(time * 10) * 0.05;
    }
  });
  
  // Generate lightning position (random within reasonable area)
  const position = useRef([
    (Math.random() - 0.5) * 60, // x: random position
    30 + Math.random() * 20,    // y: high in the sky
    -30 - Math.random() * 20    // z: in the distance
  ]);
  
  // Lightning intensity based on weather type
  const intensity = weatherType === 'thunderstorm' ? 1.0 : 0.6;
  
  // Only render when visible
  if (!isVisible) return null;
  
  return (
    <>
      {/* Lightning flash light */}
      <pointLight
        position={position.current}
        intensity={intensity * 2}
        distance={200}
        decay={2}
        color="#f0f0ff"
      />
      
      {/* Ambient flash that brightens the whole scene */}
      <ambientLight intensity={intensity * 0.3} color="#ffffff" />
      
      {/* Visual representation of lightning (simple plane with emissive material) */}
      <mesh 
        ref={lightningRef}
        position={position.current}
        rotation={[0, Math.random() * Math.PI, 0]}
      >
        <planeGeometry args={[2 + Math.random() * 3, 20 + Math.random() * 10]} />
        <meshBasicMaterial 
          color="#ffffff" 
          opacity={0.8} 
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
};

export default Lightning;
