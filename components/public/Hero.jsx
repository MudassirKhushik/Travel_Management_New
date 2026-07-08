'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { supabase } from '@/lib/supabaseClient';

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200',
];

export default function Hero() {
  const [tenantData, setTenantData] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const intervalRef = useRef(null); // 👈 Store interval reference

  useEffect(() => {
    // Fetch tenant data only once
    async function fetchTenant() {
      const { data } = await supabase
        .from('tenants')
        .select('*')
        .eq('tenant_id', '011')
        .single();
      if (data) {
        setTenantData(data);
        // Set initial image if tenant has custom images
        if (data.hero_images?.length > 0) {
          setCurrentImage(0);
        }
      }
    }
    fetchTenant();

    // GSAP Animations (run once)
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2 }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.6'
    )
    .fromTo(ctaRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    );

    // Image Carousel - Store interval reference
    intervalRef.current = setInterval(() => {
      setCurrentImage((prev) => {
        const images = tenantData?.hero_images || DEFAULT_IMAGES;
        return (prev + 1) % images.length;
      });
    }, 5000);

    // Cleanup function
    return () => {
      tl.kill();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // 👈 Empty dependency array - runs ONCE

  const images = tenantData?.hero_images?.length > 0 ? tenantData.hero_images : DEFAULT_IMAGES;

  return (
    <section className="relative h-screen w-full overflow-hidden pt-20">
      {/* Background Carousel */}
      <div className="absolute inset-0">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center px-4 md:px-20">
        <div className="max-w-3xl">
          <h1 
            ref={titleRef} 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              We Craft the Journeys,
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              You Make the Memories
            </span>
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl"
          >
            Discover handcrafted travel experiences with personalized itineraries, 
            expert guides, and unforgettable moments.
          </p>
          
          <button 
            ref={ctaRef}
            onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-white text-black rounded-full font-medium text-lg hover:bg-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            Explore Destinations →
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
}