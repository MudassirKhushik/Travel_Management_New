import Hero from '@/components/public/Hero';
import VideoSection from '@/components/public/VideoSection';
import PackageCard from '@/components/public/PackageCard';
import { supabase } from 'lib/supabaseClient';

// This will fetch from your tenant data
async function getPackages() {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('tenant_id', '011'); // TravelCraft's tenant ID
  
  if (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
  return data;
}

export default async function Home() {
  const packages = await getPackages();

  return (
    <>
      <Hero />
      
      <VideoSection />
      
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Our Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} {...pkg} />
          ))}
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>© 2026 TravelCraft. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}