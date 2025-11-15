// @ts-nocheck
"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Emotion, useAppStore } from '@/lib/store';

function Character({ amplitude, emotion }: { amplitude: number; emotion: Emotion }) {
  const groupObj = useMemo(() => new THREE.Group(), []);
  const jaw = useRef<THREE.Mesh>(null);
  const leftEye = useRef<THREE.Mesh>(null);
  const rightEye = useRef<THREE.Mesh>(null);
  const leftHand = useRef<THREE.Mesh>(null);
  const rightHand = useRef<THREE.Mesh>(null);

  const materials = useMemo(() => ({
    skin: new THREE.MeshStandardMaterial({ color: '#f2c9a0', roughness: 0.9, metalness: 0.0 }),
    mouth: new THREE.MeshStandardMaterial({ color: '#6b1b1b', roughness: 0.8 }),
    eye: new THREE.MeshStandardMaterial({ color: '#111' }),
    shirt: new THREE.MeshStandardMaterial({ color: '#4b5563', roughness: 1 }),
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    groupObj.rotation.y = Math.sin(t * 0.6) * 0.1;
    groupObj.rotation.x = Math.sin(t * 0.4) * 0.05;
    if (jaw.current) {
      const open = THREE.MathUtils.lerp(0.03, 0.45, amplitude);
      jaw.current.rotation.x = -open;
    }
    if (leftEye.current && rightEye.current) {
      const blink = Math.max(0, Math.sin(t * 3.1 + 1.7));
      const scaleY = THREE.MathUtils.clamp(1 - Math.pow(blink, 10) * 0.8, 0.2, 1);
      leftEye.current.scale.y = scaleY;
      rightEye.current.scale.y = scaleY;
    }
    if (leftHand.current && rightHand.current) {
      const s = Math.sin(t * 2.0) * amplitude * 0.6;
      leftHand.current.position.y = 0.4 + s;
      rightHand.current.position.y = 0.4 - s;
    }
  });

  const emotionOffset = ((): [number, number] => {
    switch (emotion) {
      case 'happy': return [0.12, 0.04];
      case 'sad': return [-0.1, -0.03];
      case 'angry': return [-0.06, 0.05];
      case 'surprised': return [0.2, 0.08];
      default: return [0, 0];
    }
  })();

  return (
    // Using a primitive Group to avoid JSX IntrinsicElements typing issues
    // @ts-expect-error - R3F intrinsic element provided at runtime
    <primitive object={groupObj}>
      <mesh position={[0, 0.9, 0]} material={materials.skin}>
        <sphereGeometry args={[0.55, 48, 48]} />
      </mesh>
      {/* Jaw */}
      <mesh ref={jaw} position={[0, 0.66, 0.28]} rotation={[0,0,0]} material={materials.skin}>
        <boxGeometry args={[0.8, 0.35, 0.6]} />
      </mesh>
      {/* Mouth cavity */}
      <mesh position={[0, 0.6, 0.55]} rotation={[Math.PI/2, 0, 0]} material={materials.mouth}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
      </mesh>
      {/* Eyes */}
      <mesh ref={leftEye} position={[-0.2, 1.02 + emotionOffset[1], 0.45 + emotionOffset[0]]} material={materials.eye}>
        <sphereGeometry args={[0.06, 16, 16]} />
      </mesh>
      <mesh ref={rightEye} position={[0.2, 1.02 + emotionOffset[1], 0.45 + emotionOffset[0]]} material={materials.eye}>
        <sphereGeometry args={[0.06, 16, 16]} />
      </mesh>
      {/* Body */}
      <mesh position={[0, -0.2, 0]} material={materials.shirt}>
        <cylinderGeometry args={[0.6, 0.7, 1.2, 24]} />
      </mesh>
      {/* Hands */}
      <mesh ref={leftHand} position={[-0.8, 0.4, 0]} material={materials.skin}>
        <sphereGeometry args={[0.14, 16, 16]} />
      </mesh>
      <mesh ref={rightHand} position={[0.8, 0.4, 0]} material={materials.skin}>
        <sphereGeometry args={[0.14, 16, 16]} />
      </mesh>
    </primitive>
  );
}

export function AvatarCanvas({ amplitude }: { amplitude: number }) {
  const { emotion } = useAppStore();
  return (
    <Canvas camera={{ position: [0, 1.1, 3.2], fov: 40 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.7} />
      <directionalLight intensity={1.2} position={[3, 5, 3]} />
      <directionalLight intensity={0.6} position={[-2, 3, -2]} />
      <Character amplitude={amplitude} emotion={emotion} />
      <OrbitControls enablePan={false} minDistance={2.4} maxDistance={4.2} enableDamping dampingFactor={0.08} />
    </Canvas>
  );
}
