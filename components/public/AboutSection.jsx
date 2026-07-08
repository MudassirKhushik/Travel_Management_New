'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const [tenant, setTenant] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    async function fetchTenant() {
      const { data } = await supabase
        .from('tenants')
        .select('*')
        .eq('tenant_id', '011')
        .single();
      if (data) setTenant(data);
    }
    fetchTenant();

    gsap.fromTo(sectionRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        }
      }
    );
  }, []);

  return (
    <section ref={sectionRef} id="about" className="py-20 pt-24 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your Journey, <br />
            <span className="text-blue-400">Our Passion</span>
          </h2>
          <p className="text-gray-300 text-lg mb-6">
            {tenant?.about_story || 'Founded in 2024, TravelCraft was born from a simple belief: travel should be effortless, personal, and unforgettable.'}
          </p>
          <p className="text-gray-400 mb-8">
            {tenant?.about_mission || 'We combine local expertise with global standards to create journeys that feel like home, even when you\'re miles away.'}
          </p>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-3xl font-bold text-blue-400">500+</div>
              <div className="text-sm text-gray-400">Happy Travelers</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-3xl font-bold text-purple-400">50+</div>
              <div className="text-sm text-gray-400">Destinations</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-3xl font-bold text-green-400">4.9★</div>
              <div className="text-sm text-gray-400">Average Rating</div>
            </div>
          </div>
        </div>
        
        <div className="relative h-96 rounded-2xl overflow-hidden">
          <img 
            src={tenant?.about_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'} 
            alt="About us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}