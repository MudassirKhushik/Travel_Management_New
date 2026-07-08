'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PackagesGrid() {
  const [packages, setPackages] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    async function fetchPackages() {
      const { data } = await supabase
        .from('packages')
        .select('*')
        .eq('tenant_id', '011');
      if (data) setPackages(data);
    }
    fetchPackages();

    // Scroll animation
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
    <section ref={sectionRef} id="packages" className="py-20 pt-24 px-4 max-w-7xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
        Our <span className="text-blue-400">Packages</span>
      </h2>
      <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
        Curated experiences designed to create lifelong memories
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="relative h-56 overflow-hidden">
              <img 
                src={pkg.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'} 
                alt={pkg.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-sm">
                {pkg.duration_days} days
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{pkg.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{pkg.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-white">${pkg.price}</span>
                <span className="text-sm text-gray-400">per person</span>
              </div>
              
              <button 
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all hover:scale-105"
              >
                Book This Package
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}