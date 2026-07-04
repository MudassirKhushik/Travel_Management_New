'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    // 1. THREE.JS SETUP (3D Particles)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      alpha: true,
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
      colors[i] = Math.random() * 0.5 + 0.5; // Warm colors
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 3;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      particlesMesh.rotation.x += 0.0001;
      particlesMesh.rotation.y += 0.0002;
      
      // Follow mouse
      particlesMesh.rotation.x += (mouseY - particlesMesh.rotation.x) * 0.02;
      particlesMesh.rotation.y += (mouseX - particlesMesh.rotation.y) * 0.02;
      
      renderer.render(scene, camera);
    }
    animate();

    // 2. GSAP ANIMATIONS
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 1.5, delay: 0.3 }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.2 },
      '-=0.5'
    );

    // Scroll-triggered animation
    gsap.to(containerRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
      opacity: 0,
      scale: 0.9,
    });

    // Cleanup
    return () => {
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative h-screen w-full flex items-center justify-center"
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      <div className="relative z-10 text-center px-4">
        <h1 
          ref={titleRef} 
          className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
        >
          TravelCraft
        </h1>
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl mt-6 text-gray-300 max-w-2xl mx-auto"
        >
          Crafting extraordinary journeys since 2024
        </p>
        <button 
          className="mt-8 px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
          Explore Packages →
        </button>
      </div>
    </section>
  );
}