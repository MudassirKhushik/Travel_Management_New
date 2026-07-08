'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    q: 'What is the refund policy?',
    a: 'We offer a 100% refund for cancellations made 30 days before departure. Partial refunds available for later cancellations.'
  },
  {
    q: 'Are visas included?',
    a: 'Visa assistance is included, but visa fees are typically not included in package prices unless specified.'
  },
  {
    q: 'Can we customize the itinerary?',
    a: 'Absolutely! Every package is fully customizable. Just let us know your preferences during booking.'
  },
  {
    q: 'What about travel insurance?',
    a: 'We highly recommend travel insurance and can assist you in finding the best coverage for your trip.'
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
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
    <section ref={sectionRef} className="py-20 px-4 max-w-4xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
        Frequently Asked <span className="text-purple-400">Questions</span>
      </h2>
      <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
        Everything you need to know before booking your dream trip
      </p>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition"
            >
              <span className="font-semibold text-left">{faq.q}</span>
              <span className={`text-2xl transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                {openIndex === index ? '−' : '+'}
              </span>
            </button>
            <div className={`px-6 transition-all duration-300 ${openIndex === index ? 'pb-4' : 'max-h-0'}`}>
              <p className="text-gray-400">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}