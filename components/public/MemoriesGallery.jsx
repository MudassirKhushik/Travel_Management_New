'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600',
  'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600',
  'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600',
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600',
];

export default function MemoriesGallery() {
  const [images, setImages] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    async function fetchGallery() {
      const { data } = await supabase
        .from('gallery')
        .select('*')
        .eq('tenant_id', '011');
      if (data && data.length > 0) {
        setImages(data.map(item => item.image_url));
      } else {
        setImages(DEFAULT_IMAGES);
      }
    }
    fetchGallery();

    gsap.fromTo(sectionRef.current,
      { opacity: 0 },
      {
        opacity: 1,
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
    <section ref={sectionRef} className="py-20 pt-24 px-4 bg-gradient-to-b from-gray-900/50 to-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Memories <span className="text-yellow-400">Gallery</span>
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Real moments from our travelers around the world
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.slice(0, 8).map((img, index) => (
            <div key={index} className={`relative overflow-hidden rounded-xl group ${
              index % 3 === 0 ? 'row-span-2' : ''
            }`}>
              <img 
                src={img} 
                alt={`Memory ${index + 1}`}
                className="w-full h-full object-cover aspect-square group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}