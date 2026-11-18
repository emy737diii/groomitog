'use client';
import * as THREE from 'three';
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitImpl } from 'three-stdlib';

type Props = { file: string; onTap: () => void; resetSignal: number };

class Boundary extends Component<{ children: ReactNode; file: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="poster3d">3D-модель не загрузилась.<br /><small>Файл: {this.props.file}</small></div>;
    return this.props.children;
  }
}

function Model({ file, onTap, still }: { file: string; onTap: () => void; still: boolean }) {
  const { scene } = useGLTF(file);
  const group = useRef<THREE.Group>(null);
  const hop = useRef(0);
  // Приводим любую модель к размеру ~2 единицы, чтобы камера и тень работали одинаково.
  const scale = useMemo(() => {
    const size = new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
    scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return 2 / Math.max(size.x, size.y, size.z || 1);
  }, [scene]);
  useFrame((state, dt) => {
    if (!group.current) return;
    hop.current = Math.max(0, hop.current - dt * 2.4);
    const idle = still ? 0 : Math.sin(state.clock.elapsedTime * 1.6) * 0.025;
    group.current.position.y = idle + Math.sin(hop.current * Math.PI) * 0.22;
  });
  return (
    <group ref={group} onClick={(e) => { e.stopPropagation(); hop.current = 1; onTap(); }}>
      <Center><primitive object={scene} scale={scale} /></Center>
    </group>
  );
}

export default function Pet3D({ file, onTap, resetSignal }: Props) {
  const controls = useRef<OrbitImpl>(null);
  const [touched, setTouched] = useState(false);
  const [still, setStill] = useState(false);
  const [webgl, setWebgl] = useState(true);
  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const c = document.createElement('canvas');
    setWebgl(!!(c.getContext('webgl2') || c.getContext('webgl')));
  }, []);
  useEffect(() => { if (resetSignal) { controls.current?.reset(); setTouched(false); } }, [resetSignal]);
  if (!webgl) return <div className="poster3d">Ваш браузер не показывает 3D, но расчёт и запись работают.</div>;
  return (
    <Boundary file={file}>
      <Canvas dpr={[1, 2]} camera={{ position: [2.6, 1.3, 3.6], fov: 35 }} gl={{ antialias: true, alpha: true }} shadows>
        <ambientLight intensity={0.35} />
        <directionalLight position={[-3, 5, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <Environment resolution={256}>
          <Lightformer intensity={2.2} position={[0, 4, 3]} scale={[6, 3, 1]} color="#ffffff" />
          <Lightformer intensity={1.2} position={[4, 1, -2]} scale={[3, 3, 1]} color="#FFC4E3" />
          <Lightformer intensity={1.2} position={[-4, 1, -2]} scale={[3, 3, 1]} color="#A6DCFF" />
        </Environment>
        <Suspense fallback={null}><Model file={file} onTap={onTap} still={still} /></Suspense>
        <ContactShadows position={[0, -1.02, 0]} opacity={0.35} blur={2.6} far={2.5} scale={5} />
        <OrbitControls ref={controls} makeDefault enablePan={false} enableDamping minDistance={3} maxDistance={6.5}
          minPolarAngle={0.85} maxPolarAngle={1.75} autoRotate={!still && !touched} autoRotateSpeed={0.8} onStart={() => setTouched(true)} />
      </Canvas>
    </Boundary>
  );
}
