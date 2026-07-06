import Hero from '@/components/public/Hero';
import VideoSection from '@/components/public/VideoSection';
import PackageCard from '@/components/public/PackageCard';
import { supabase } from 'lib/supabaseClient';

// This will fetch from your tenant data
async function getPackages() {
  console.log('🔍 Fetching packages...');
  
  try {
    // First, check if we can even connect
    const { data: testData, error: testError } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ Connection test failed:', testError);
      return [];
    }

    // Now fetch actual data
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('tenant_id', '011');

    if (error) {
      console.error('❌ Fetch error:', error);
      return [];
    }

    console.log('✅ Found packages:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('🔥 Unexpected error:', err);
    return [];
  }
}
export default async function Home() {
  const packages = await getPackages();

  return (
    <>
      <Hero />
      <VideoSection />
      
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Our Packages</h2>
        {packages.length === 0 ? (
          <p className="text-center text-gray-400">No packages found. Please add some in the database.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} {...pkg} />
            ))}
          </div>
        )}
      </section>

      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>© 2026 TravelCraft. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}