import React, { useMemo } from 'react';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// Define the shader material
const GradientMaterial = shaderMaterial(
  // Uniforms
  {
    uTopColor: new THREE.Color(0x9ed6fe), // Default top color (sky blue)
    uBottomColor: new THREE.Color(0xffffff), // Bottom color (white)
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uTopColor;
    uniform vec3 uBottomColor;
    varying vec2 vUv;
    void main() {
      // Linear interpolation between top and bottom colors based on UV y-coordinate
      gl_FragColor = vec4(mix(uBottomColor, uTopColor, vUv.y), 1.0);
    }
  `
);

// Extend R3F to recognize the shader material
extend({ GradientMaterial });

interface GradientBackgroundProps {
  topColor: THREE.Color;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ topColor }) => {
  const materialProps = useMemo(() => ({
    uTopColor: topColor,
    uBottomColor: new THREE.Color(0xffffff),
  }), [topColor]);

  return (
    <mesh position={[0, 0, -100]} rotation={[0, 0, 0]}> {/* Position behind everything */}
      {/* Use a large plane to cover the background */}
      <planeGeometry args={[200, 100]} /> {/* Adjust size as needed */}
      {/* @ts-ignore - extend doesn't perfectly type hint shader materials */}
      <gradientMaterial attach="material" {...materialProps} side={THREE.DoubleSide} />
    </mesh>
  );
};

export default GradientBackground;

