import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { PerspectiveCamera } from '@react-three/drei';
import GradientBackground from './GradientBackground'; // Import the GradientBackground component

// --- Configuration --- 
const FALLBACK_SKY_COLOR = 0x9ed6fe; // Standard blue
const FALLBACK_CLOUD_COLOR = 0xffffff; // White

// --- Static Cloud Component (for fallback) ---
const StaticClouds: React.FC = () => {
  // Define positions for a few static clouds
  const cloudPositions = [
    [0, 30, -40],   // Main central cloud
    [-25, 25, -50],
    [30, 35, -60],
    [-15, 40, -70],
    [10, 20, -30],
  ];

  return (
    <group>
      {cloudPositions.map((position, index) => (
        <mesh key={index} position={position as [number, number, number]}>
          {/* Simple cloud shape using multiple spheres */}
          <group>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[6 + Math.random() * 2, 16, 16]} />
              <meshStandardMaterial 
                color={FALLBACK_CLOUD_COLOR} 
                roughness={0.9} 
                metalness={0.1}
              />
            </mesh>
            <mesh position={[-5 - Math.random(), -1, 0]}>
              <sphereGeometry args={[4 + Math.random(), 16, 16]} />
              <meshStandardMaterial 
                color={FALLBACK_CLOUD_COLOR} 
                roughness={0.9} 
                metalness={0.1}
              />
            </mesh>
            <mesh position={[5 + Math.random(), -2, 0]}>
              <sphereGeometry args={[5 + Math.random(), 16, 16]} />
              <meshStandardMaterial 
                color={FALLBACK_CLOUD_COLOR} 
                roughness={0.9} 
                metalness={0.1}
              />
            </mesh>
          </group>
        </mesh>
      ))}
    </group>
  );
};

// --- Fallback Weather Component ---
const FallbackWeather: React.FC = () => {
  const skyColor = new THREE.Color(FALLBACK_SKY_COLOR);

  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      {/* Set the background color */}
      <color attach="background" args={[skyColor.getHex()]} />
      
      {/* Setup camera */}
      <PerspectiveCamera makeDefault fov={60} near={0.1} far={1000} position={[0, 5, 1]} />
      
      {/* Add minimal lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight 
          position={[50, 50, 50]}
          intensity={1.0}
          color={0xffffff}
      />
      
      {/* Add the gradient background for seamless scrolling */}
      <GradientBackground topColor={skyColor} />
      
      {/* Add the static clouds */}
      <StaticClouds />
    </Canvas>
  );
};

export default FallbackWeather;
