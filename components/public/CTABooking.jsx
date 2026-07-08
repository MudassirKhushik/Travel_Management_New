'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CTABooking() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    destination: '',
    travelDate: '',
    packageId: '',
  });
  const [packages, setPackages] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    async function fetchPackages() {
      const { data } = await supabase
        .from('packages')
        .select('id, title')
        .eq('tenant_id', '011');
      if (data) setPackages(data);
    }
    fetchPackages();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('notifications')
      .insert([{
        tenant_id: '011',
        phone: formData.contact,
        total_people: 1,
        interested_package: formData.destination,
        name: formData.name,
        travel_date: formData.travelDate,
      }]);

    if (!error) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setFormData({ name: '', contact: '', destination: '', travelDate: '', packageId: '' });
    }
  };

  return (
    <section ref={sectionRef} id="booking" className="py-20 pt-24 px-4 bg-gradient-to-b from-black to-blue-950/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Let's Plan Your <span className="text-blue-400">Dream Getaway</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Fill in your details and we'll craft the perfect itinerary for you
          </p>
        </div>

        {submitted ? (
          <div className="p-8 bg-green-500/20 border border-green-500 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-green-400">Thank You! 🎉</h3>
            <p className="text-gray-300 mt-2">We'll reach out within 24 hours to plan your dream trip.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contact Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  placeholder="+1 234 567 890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Destination Interest</label>
                <select
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="">Select a destination</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.title}>{pkg.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Travel Date</label>
                <input
                  type="date"
                  value={formData.travelDate}
                  onChange={(e) => setFormData({...formData, travelDate: e.target.value})}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-8 w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              Submit Inquiry →
            </button>
          </form>
        )}
      </div>
    </section>
  );
}