'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function VideoSection() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    gsap.fromTo(videoRef.current,
      { opacity: 0, scale: 0.8, y: 100 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        duration: 1.5,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        }
      }
    );

    // Auto-play video when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          videoRef.current?.play();
        } else {
          videoRef.current?.pause();
        }
      });
    });

    observer.observe(videoRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="py-20 px-4 max-w-6xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          className="w-screen h-screen fixed top-0 left-0 border-none"
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"
        >
          <source src="/Videos/promo-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
          <h2 className="text-3xl font-bold text-white">Discover Your Next Adventure</h2>
        </div>
      </div>
    </section>
  );
}