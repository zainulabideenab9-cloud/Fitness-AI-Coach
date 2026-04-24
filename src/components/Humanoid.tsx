import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface HumanoidProps {
  instruction: string;
}

export function Humanoid({ instruction }: HumanoidProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Animation state
  const state = useMemo(() => ({
    time: 0,
    joints: {
      leftUpperArm: new THREE.Euler(),
      rightUpperArm: new THREE.Euler(),
      leftThigh: new THREE.Euler(),
      rightThigh: new THREE.Euler(),
      leftCalf: new THREE.Euler(),
      rightCalf: new THREE.Euler(),
      torso: new THREE.Euler(),
      pelvis: new THREE.Vector3(0, 0, 0)
    }
  }), []);

  useFrame((_, delta) => {
    state.time += delta;
    const t = state.time;
    const { joints } = state;

    // Reset basics
    joints.leftUpperArm.set(0, 0, -Math.PI / 3);
    joints.rightUpperArm.set(0, 0, Math.PI / 3);
    joints.leftThigh.set(0, 0, 0);
    joints.rightThigh.set(0, 0, 0);
    joints.leftCalf.set(0, 0, 0);
    joints.rightCalf.set(0, 0, 0);
    joints.torso.set(0, 0, 0);
    joints.pelvis.set(0, 0, 0);

    // Procedural animations based on instruction
    if (instruction === 'jumping_jacks') {
      const freq = 3;
      const wave = Math.sin(t * freq);
      const angle = (wave + 1) / 2; // 0 to 1
      joints.leftUpperArm.z = -Math.PI / 4 - angle * Math.PI * 0.7;
      joints.rightUpperArm.z = Math.PI / 4 + angle * Math.PI * 0.7;
      joints.leftThigh.z = -angle * 0.5;
      joints.rightThigh.z = angle * 0.5;
      joints.pelvis.y = angle * 0.2;
    } else if (instruction === 'squats' || instruction === 'archer_squats' || instruction === 'pistols') {
      const freq = 2;
      const wave = (Math.sin(t * freq) + 1) / 2;
      joints.leftThigh.x = wave * Math.PI * 0.4;
      joints.rightThigh.x = instruction === 'pistols' ? 0 : wave * Math.PI * 0.4;
      joints.leftCalf.x = -wave * Math.PI * 0.5;
      joints.rightCalf.x = instruction === 'pistols' ? 0 : -wave * Math.PI * 0.5;
      joints.torso.x = -wave * 0.2;
      joints.pelvis.y = -wave * 0.5;
      if (instruction === 'pistols') {
         joints.rightThigh.x = -Math.PI / 3; // Extend one leg
      }
    } else if (instruction.includes('pushups') || instruction.includes('planche')) {
      const freq = 2;
      const wave = (Math.sin(t * freq) + 1) / 2;
      joints.torso.x = -Math.PI / 2; 
      joints.pelvis.y = -0.5 + wave * 0.3;
      joints.leftUpperArm.x = -Math.PI / 2 + wave * 0.8;
      joints.rightUpperArm.x = -Math.PI / 2 + wave * 0.8;
      if (groupRef.current) {
        groupRef.current.position.y = -0.5 + wave * 0.4;
        groupRef.current.rotation.x = Math.PI / 2;
      }
    } else if (instruction === 'plank' || instruction === 'hollow_body') {
      joints.torso.x = Math.PI / 2;
      if (instruction === 'hollow_body') {
         joints.leftThigh.x = -0.3;
         joints.rightThigh.x = -0.3;
         joints.leftUpperArm.x = Math.PI;
         joints.rightUpperArm.x = Math.PI;
      }
      if (groupRef.current) {
         groupRef.current.rotation.x = Math.PI / 2;
         groupRef.current.position.y = -0.4;
      }
    } else if (instruction === 'high_knees' || instruction === 'mountain_climbers' || instruction === 'march') {
      const freq = instruction === 'march' ? 4 : 8;
      const waveL = Math.sin(t * freq);
      const waveR = Math.sin(t * freq + Math.PI);
      
      if (instruction === 'mountain_climbers') {
          joints.torso.x = -Math.PI / 2;
          joints.leftThigh.x = Math.max(0, waveL) * Math.PI * 0.4;
          joints.rightThigh.x = Math.max(0, waveR) * Math.PI * 0.4;
          if (groupRef.current) {
             groupRef.current.rotation.x = Math.PI / 2;
             groupRef.current.position.y = -0.4;
          }
      } else {
          joints.leftThigh.x = Math.max(0, waveL) * Math.PI * 0.5;
          joints.rightThigh.x = Math.max(0, waveR) * Math.PI * 0.5;
          joints.leftCalf.x = -Math.max(0, waveL) * Math.PI * 0.3;
          joints.rightCalf.x = -Math.max(0, waveR) * Math.PI * 0.3;
          joints.pelvis.y = Math.abs(Math.sin(t * freq)) * 0.1;
      }
    } else if (instruction.includes('pullups') || instruction.includes('muscle_ups') || instruction.includes('hanging')) {
       const freq = 1.5;
       const wave = (Math.sin(t * freq) + 1) / 2;
       joints.leftUpperArm.x = Math.PI - wave * 1.5;
       joints.rightUpperArm.x = Math.PI - wave * 1.5;
       if (instruction === 'hanging_leg_raises') {
          joints.leftThigh.x = wave * Math.PI * 0.5;
          joints.rightThigh.x = wave * Math.PI * 0.5;
       }
       if (groupRef.current) {
          groupRef.current.position.y = wave * 0.5;
       }
    } else if (instruction.includes('lunges')) {
       const freq = 2;
       const wave = (Math.sin(t * freq) + 1) / 2;
       joints.leftThigh.x = wave * Math.PI * 0.4;
       joints.rightThigh.x = -wave * Math.PI * 0.2;
       joints.leftCalf.x = -wave * Math.PI * 0.4;
       joints.pelvis.y = -wave * 0.4;
    } else if (instruction === 'dips' || instruction === 'bench_dips') {
       const freq = 2;
       const wave = (Math.sin(t * freq) + 1) / 2;
       joints.leftUpperArm.x = 0.5 - wave * 1.2;
       joints.rightUpperArm.x = 0.5 - wave * 1.2;
       joints.leftThigh.x = 0.5; // Sitting position
       joints.rightThigh.x = 0.5;
       joints.pelvis.y = -wave * 0.5;
    }
    
    // Safety reset if rotation was changed
    if (!instruction.includes('pushups') && !instruction.includes('plank')) {
        if (groupRef.current) {
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
        }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Pelvis */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Torso */}
      <group position={[0, 0.1, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.3, 0.5, 0.2]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>

        {/* Arms */}
        {/* Left Arm */}
        <group position={[-0.15, 0.45, 0]} rotation={[state.joints.leftUpperArm.x, 0, state.joints.leftUpperArm.z]}>
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.04, 0.2, 8, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <group position={[0, -0.3, 0]}>
             <mesh position={[0, -0.15, 0]}>
                <capsuleGeometry args={[0.035, 0.2, 8, 8]} />
                <meshStandardMaterial color="#64748b" />
             </mesh>
          </group>
        </group>

        {/* Right Arm */}
        <group position={[0.15, 0.45, 0]} rotation={[state.joints.rightUpperArm.x, 0, state.joints.rightUpperArm.z]}>
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.04, 0.2, 8, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <group position={[0, -0.3, 0]}>
             <mesh position={[0, -0.15, 0]}>
                <capsuleGeometry args={[0.035, 0.2, 8, 8]} />
                <meshStandardMaterial color="#64748b" />
             </mesh>
          </group>
        </group>
      </group>

      {/* Legs */}
      {/* Left Leg */}
      <group position={[-0.1, -0.05, 0]} rotation={[state.joints.leftThigh.x, 0, state.joints.leftThigh.z]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.05, 0.3, 8, 8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <group position={[0, -0.35, 0]} rotation={[state.joints.leftCalf.x, 0, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.045, 0.3, 8, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      </group>

      {/* Right Leg */}
      <group position={[0.1, -0.05, 0]} rotation={[state.joints.rightThigh.x, 0, state.joints.rightThigh.z]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.05, 0.3, 8, 8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <group position={[0, -0.35, 0]} rotation={[state.joints.rightCalf.x, 0, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.045, 0.3, 8, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
