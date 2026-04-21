/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  Float, 
  MeshDistortMaterial, 
  MeshWobbleMaterial, 
  PerspectiveCamera, 
  Environment, 
  Text
} from "@react-three/drei";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, Clock, Lock, Cpu, Globe, Wrench } from "lucide-react";
import * as THREE from "three";

// --- 3D Components ---

function FloatingShape({ position, color, speed, speedRot, type = 'box' }: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * speedRot.x;
    meshRef.current.rotation.y = t * speedRot.y;
    meshRef.current.rotation.z = t * speedRot.z;
    meshRef.current.position.y = position[1] + Math.sin(t * speed) * 0.5;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh position={position} ref={meshRef}>
        {type === 'box' && <boxGeometry args={[1, 1, 1]} />}
        {type === 'sphere' && <sphereGeometry args={[0.7, 32, 32]} />}
        {type === 'torus' && <torusGeometry args={[0.6, 0.2, 16, 100]} />}
        {type === 'dodecahedron' && <dodecahedronGeometry args={[0.7]} />}
        <MeshDistortMaterial
          color={color}
          speed={speed * 2}
          distort={0.3}
          radius={1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  const shapes = useMemo(() => [
    { pos: [-4, 2, -2], color: "#4ade80", speed: 1.2, rot: { x: 0.1, y: 0.2, z: 0.1 }, type: 'dodecahedron' },
    { pos: [4, -2, -3], color: "#60a5fa", speed: 0.8, rot: { x: 0.2, y: 0.1, z: 0.3 }, type: 'torus' },
    { pos: [-3, -3, -1], color: "#f472b6", speed: 1.5, rot: { x: 0.3, y: 0.3, z: 0.1 }, type: 'sphere' },
    { pos: [3, 3, -4], color: "#fbbf24", speed: 1.0, rot: { x: 0.1, y: 0.4, z: 0.2 }, type: 'box' },
    { pos: [0, 0, -8], color: "#8b5cf6", speed: 0.5, rot: { x: 0.05, y: 0.05, z: 0.05 }, type: 'sphere' },
  ], []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

      {shapes.map((s, i) => (
        <FloatingShape 
          key={i} 
          position={s.pos} 
          color={s.color} 
          speed={s.speed} 
          speedRot={s.rot} 
          type={s.type} 
        />
      ))}

      <mesh scale={100}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial side={THREE.BackSide} color="#050505" />
      </mesh>
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.5} 
      />
    </>
  );
}

// --- UI Components ---

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(6 * 60 * 60); // 6 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0'),
    };
  };

  const { h, m, s } = formatTime(timeLeft);

  return (
    <div className="flex gap-4 items-center justify-start">
      <TimerUnit value={h} label="HOURS" />
      <div className="text-4xl self-center font-mono text-slate-700 mb-6">:</div>
      <TimerUnit value={m} label="MINUTES" />
      <div className="text-4xl self-center font-mono text-slate-700 mb-6">:</div>
      <TimerUnit value={s} label="SECONDS" isHighlight />
    </div>
  );
}

function TimerUnit({ value, label, isHighlight }: { value: string; label: string; isHighlight?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-20 md:w-24 h-24 md:h-28 slab-unit flex items-center justify-center">
        <div className="slab-split" />
        <span className={`text-4xl md:text-5xl font-mono font-black relative z-10 ${isHighlight ? 'text-cyan-400' : 'text-white'}`}>
          {value}
        </span>
      </div>
      <span className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
    </div>
  );
}

export default function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-slate-200 selection:bg-cyan-500 selection:text-black">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 bg-grid z-0" />
      
      {/* Decorative Lines */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-slate-700 to-transparent" />
      </div>

      {/* 3D Scene in background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <Canvas shadows gl={{ antialias: true }}>
          <Scene />
        </Canvas>
      </div>

      {/* Main Content Hub */}
      <main className="relative z-20 flex flex-col items-center justify-center h-full px-6">
        <motion.div
           className="isometric-card w-full max-w-3xl"
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="isometric-content bg-slate-900 border border-slate-700/50 p-8 md:p-14 rounded-2xl">
            {/* Header Status */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]" />
              <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-slate-400">
                System Maintenance Mode : Active
              </span>
            </div>

            {/* Main Message */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight md:leading-[1.1]">
               Upgrading <span className="text-cyan-400">Core</span> <br className="hidden md:block"/> Infrastructure
            </h1>
            
            <p className="text-slate-400 text-sm md:text-lg mb-10 max-w-md leading-relaxed font-light">
              We're currently performing scheduled server migrations to enhance your experience. Systems will resume shortly.
            </p>

            {/* Countdown Blocks */}
            <CountdownTimer />

            {/* Progress Bar Section */}
            <div className="mt-12">
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="bg-cyan-500 h-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                />
              </div>
              <div className="mt-3 flex justify-between text-[10px] font-mono font-bold tracking-widest text-slate-500">
                <span>DEPLOYMENT PROGRESS</span>
                <span>68% COMPLETE</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Navigation */}
        <div className="mt-16 w-full max-w-3xl flex flex-col md:flex-row items-center justify-between border-t border-slate-800 pt-8 gap-6">
          <div className="flex gap-8 text-[11px] font-bold tracking-[0.2em] text-slate-500">
            <FooterIcon label="TWITTER/X" />
            <FooterIcon label="DISCORD" />
            <FooterIcon label="STATUS PAGE" />
          </div>
          <div className="text-[11px] font-mono text-slate-600 tracking-wider">
            VER. 2.4.0-MAINT
          </div>
        </div>
      </main>
    </div>
  );
}

function FooterIcon({ label }: { label: string }) {
  return (
    <button className="hover:text-cyan-400 transition-colors uppercase cursor-pointer">
      {label}
    </button>
  );
}
