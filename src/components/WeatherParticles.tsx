import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type WeatherType = 'clear' | 'few_clouds' | 'clouds' | 'rain' | 'thunderstorm' | 'snow' | 'fog';

interface WeatherParticlesProps {
  weatherType: WeatherType;
}

const WeatherParticles: React.FC<WeatherParticlesProps> = ({ weatherType }) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Only render particles for rain or snow
  if (weatherType !== 'rain' && weatherType !== 'snow') {
    return null;
  }

  const particleCount = weatherType === 'rain' ? 5000 : 2000; // More rain drops, fewer snowflakes
  const particleSize = weatherType === 'rain' ? 0.1 : 0.2; // Snowflakes slightly larger
  const particleColor = weatherType === 'rain' ? '#a0c0f0' : '#ffffff'; // Bluish for rain, white for snow
  const fallSpeed = weatherType === 'rain' ? 0.5 : 0.1; // Rain falls faster
  const windEffect = weatherType === 'rain' ? 0.05 : 0.02; // Slight wind effect

  // Generate initial particle positions
  const positions = useMemo(() => {
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3 + 0] = (Math.random() - 0.5) * 100; // x spread
      posArray[i * 3 + 1] = Math.random() * 50;         // y start position (above camera)
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 100; // z spread
    }
    return posArray;
  }, [particleCount]);

  // Animate particles
  useFrame(() => {
    if (pointsRef.current) {
      const posAttribute = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        // Update y position (fall down)
        posAttribute.array[i * 3 + 1] -= fallSpeed;
        
        // Add slight wind effect
        posAttribute.array[i * 3 + 0] += windEffect * (Math.random() - 0.5);
        
        // If particle falls below the ground, reset its position to the top
        if (posAttribute.array[i * 3 + 1] < -10) {
          posAttribute.array[i * 3 + 1] = 50 + Math.random() * 10; // Reset y
          posAttribute.array[i * 3 + 0] = (Math.random() - 0.5) * 100; // Reset x slightly
        }
      }
      posAttribute.needsUpdate = true;
      
      // Rotate slightly for snow effect
      if (weatherType === 'snow') {
          pointsRef.current.rotation.y += 0.0005;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry attach="geometry">
        {/* Correctly attach the buffer attribute using args */}
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]} // Pass Float32Array and itemSize via args
          count={positions.length / 3} // Calculate count based on array length
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        size={particleSize}
        color={particleColor}
        sizeAttenuation={true}
        transparent={true}
        opacity={weatherType === 'rain' ? 0.5 : 0.8}
        depthWrite={false} // Prevent particles from obscuring each other too much
      />
    </points>
  );
};

export default WeatherParticles;
