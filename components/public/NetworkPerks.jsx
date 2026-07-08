'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const perks = [
  {
    icon: '🏨',
    title: '5-Star Hotel Network',
    desc: 'Exclusive partnerships with luxury hotels worldwide'
  },
  {
    icon: '🗺️',
    title: 'Expert Local Guides',
    desc: 'Passionate locals who know every hidden gem'
  },
  {
    icon: '🚐',
    title: '24/7 Transport Support',
    desc: 'Reliable ground transport anywhere, anytime'
  },
  {
    icon: '🛡️',
    title: 'Safety Assured',
    desc: 'Travel with peace of mind with our 24/7 support'
  }
];

export default function NetworkPerks() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    cardsRef.current.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: i * 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-gradient-to-b from-black to-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Why <span className="text-purple-400">TravelCraft</span>?
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          We build the infrastructure so you can focus on making memories
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((perk, index) => (
            <div
              key={index}
              ref={el => cardsRef.current[index] = el}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all hover:transform hover:-translate-y-2"
            >
              <div className="text-5xl mb-4">{perk.icon}</div>
              <h3 className="text-xl font-bold mb-2">{perk.title}</h3>
              <p className="text-gray-400 text-sm">{perk.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}