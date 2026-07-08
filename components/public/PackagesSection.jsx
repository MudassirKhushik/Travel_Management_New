'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PackagesSection() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    // Fetch packages from Supabase
    async function fetchPackages() {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('tenant_id', '011');

      if (!error && data) {
        setPackages(data);
      }
      setLoading(false);
    }

    fetchPackages();

    // GSAP scroll animation
    gsap.fromTo(sectionRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  if (loading) {
    return (
      <section id="packages" className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Our Packages</h2>
        <p className="text-center text-gray-400">Loading packages...</p>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="packages" className="py-20 px-4 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12">Our Packages</h2>
      
      {packages.length === 0 ? (
        <p className="text-center text-gray-400">No packages found. Add some in Supabase!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:transform hover:-translate-y-2 transition-all duration-300">
              <img 
                src={pkg.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'} 
                alt={pkg.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{pkg.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{pkg.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">${pkg.price}</span>
                  <span className="text-sm text-gray-400">{pkg.duration_days} days</span>
                </div>
                <button className="mt-4 w-full px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}