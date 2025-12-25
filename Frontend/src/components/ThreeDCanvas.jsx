import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';

const AnimatedSphere = () => {
    const meshRef = useRef();
    const materialRef = useRef();

    useFrame((state) => {
        const { clock, mouse } = state;
        const time = clock.getElapsedTime();

        if (meshRef.current) {
            // Smooth rotation based on time and mouse
            meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.2 + mouse.y * 0.2;
            meshRef.current.rotation.y = time * 0.3 + mouse.x * 0.2;

            // Subtle floating motion
            meshRef.current.position.y = Math.sin(time * 0.5) * 0.1;
        }

        if (materialRef.current) {
            // Dynamic distortion based on mouse position
            const mouseSpeed = Math.sqrt(mouse.x ** 2 + mouse.y ** 2);
            materialRef.current.distort = 0.4 + mouseSpeed * 0.2;
            materialRef.current.speed = 3 + mouseSpeed * 2;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere ref={meshRef} args={[1, 128, 128]} scale={2.5}>
                <MeshDistortMaterial
                    ref={materialRef}
                    color="#3b82f6"
                    speed={3}
                    distort={0.4}
                    radius={1}
                />
            </Sphere>
        </Float>
    );
};

const ThreeDCanvas = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                </div>
            }>
                <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
                    <AnimatedSphere />
                </Canvas>
            </Suspense>
        </div>
    );
};

export default ThreeDCanvas;
