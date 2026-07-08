'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_REVIEWS = [
  {
    name: 'Sarah Johnson',
    review: 'Absolutely incredible experience! The team went above and beyond to make our trip perfect.',
    rating: 5,
    platform: 'Google'
  },
  {
    name: 'Michael Chen',
    review: 'Best travel agency I\'ve ever used. Every detail was handled with care and professionalism.',
    rating: 5,
    platform: 'WhatsApp'
  },
  {
    name: 'Emma Rodriguez',
    review: 'From the initial planning to the final goodbye, every moment was magical. Highly recommend!',
    rating: 5,
    platform: 'Google'
  }
];

export default function HypeWall() {
  const [reviews, setReviews] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('tenant_id', '011');
      if (data && data.length > 0) {
        setReviews(data);
      } else {
        setReviews(DEFAULT_REVIEWS);
      }
    }
    fetchReviews();

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
    <section ref={sectionRef} className="py-20 pt-24 px-4 max-w-7xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
        Traveler <span className="text-green-400">Hype</span>
      </h2>
      <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
        Real stories from real people who traveled with us
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                  ★
                </span>
              ))}
            </div>
            <p className="text-gray-300 mb-4 italic">"{review.review}"</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{review.name}</span>
              <span className="text-sm text-gray-500">{review.platform}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}