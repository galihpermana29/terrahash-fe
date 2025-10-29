'use client';

import { useState } from 'react';
import { Search, MapPin, Shield, FileCheck, ChevronRight, Sparkles, Eye, TrendingUp } from 'lucide-react';
import { useLatestUnclaimedParcels } from '@/hooks/useLatestParcels';
import ParcelCard from '@/components/parcel/ParcelCard';
import Link from 'next/dist/client/link';

export default function Home() {
  const [q, setQ] = useState('');
  
  // Mock data - replace with actual hook
const { parcels: latestParcels, isLoading: parcelsLoading } = useLatestUnclaimedParcels(6);
  const formatAcres = (areaM2) => {
    return (areaM2 / 4046.8564224).toFixed(1);
  };

  const images = [
    'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192851/murad-swaleh-7tDidSXbgD8-unsplash_hn17iq.jpg',
    'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192855/sam-szuchan-_wqjX4MauzA-unsplash_u4almv.jpg',
    'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192859/fabricio-sakai-oyQD2wngBDM-unsplash_uamshk.jpg',
    'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192871/virgyl-sowah-E9NPWGBXM9o-unsplash_cqeyje.jpg',
    'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192875/mathias-owa-martins-2mbQ1sxVZ0Q-unsplash_ahahsf.jpg',
    'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192855/sam-szuchan-_wqjX4MauzA-unsplash_u4almv.jpg',
  ];

  return (
    <main className="bg-white">
      {/* Hero Section with Parallax Effect */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192871/virgyl-sowah-E9NPWGBXM9o-unsplash_cqeyje.jpg"
            alt="African landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-4xl mx-auto text-center">

            {/* Headline */}
            <h1 className="font-bold text-white mb-10 tracking-tight leading-none">
              {/* Main title – even larger */}
              <span className="block text-[3.5rem] sm:text-[5rem] lg:text-[7rem] xl:text-[8rem] 2xl:text-[9rem] mb-3 leading-none">
              Find Land
              </span>
              {/* Gradient subtitle – even larger */}
              <span className="block text-[3.5rem] sm:text-[5rem] lg:text-[7rem] xl:text-[8rem] 2xl:text-[9rem] bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent leading-none">
              in Africa
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Discover verified parcels across the continent. Secure, transparent, and mapped.
            </p>

            {/* Premium Search Bar */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <Search className="absolute left-6 w-5 h-5 text-gray-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by state, city or parcel ID"
                    className="flex-1 h-16 pl-14 pr-4 bg-transparent text-gray-900 placeholder:text-gray-400 text-lg focus:outline-none"
                  />
                  <button 
                    onClick={() => window.location.href = `/map${q ? `?q=${encodeURIComponent(q)}` : ''}`}
                    className="m-2 h-12 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Verified Parcels</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/40"></div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                <span>Clear Documentation</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/40"></div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Precise Mapping</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with Image Grid */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="order-2 lg:order-1">
              <h2 className="text-[2em] sm:text-[3.5rem] lg:text-[3rem] font-bold text-gray-900 mb-6 leading-tight">
                Empowering African Land Ownership
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                This portal helps you explore, verify, lease and manage land across Africa. View boundaries,
                statuses, and parcel details on an interactive map. Every parcel is represented with clear
                metadata and status so you can make confident decisions.
              </p>

              {/* Feature List */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: Shield, text: 'Verified parcels with blockchain security' },
                  { icon: MapPin, text: 'Precise GPS coordinates and boundaries' },
                  { icon: FileCheck, text: 'Transparent documentation and records' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => window.location.href = '/map'}
                className="inline-flex items-center gap-2 h-14 px-8 rounded-xl bg-brand-primary from-emerald-600 to-teal-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Explore the Map
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Image Grid */}
            <div className="order-1 lg:order-2">
              <div className="grid grid-cols-3 gap-4">
                {images.map((src, i) => (
                  <div 
                    key={i} 
                    className={`relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group ${
                      i === 1 || i === 4 ? 'col-span-2 h-48 sm:h-56 md:h-64' : 'h-32 sm:h-40 md:h-48'
                    }`}
                  >
                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

          {/* 3) Latest Unclaimed Land */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-[1rem] sm:text-[1.8rem] lg:text-[2.5rem] font-bold text-gray-900 mb-4">Latest Unclaimed Land</h2>
                </div>
                <Link href="/map" className="text-brand-gold hover:opacity-80">View all on map →</Link>
              </div>
              {/* You might have an unused or incorrectly placed section for leased parcels here; remove or adapt as needed */}
              {Array.isArray(latestParcels) && latestParcels.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {latestParcels.map((parcel) => (
                    <ParcelCard
                      key={parcel.parcel_id}
                      parcel={parcel}
                      onViewMap={() => {
                        window.location.href = `/map?q=${parcel.parcel_id}`;
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No unclaimed land available at the moment.</p>
                  <p className="text-sm mt-2">Check back later for new listings.</p>
                </div>
              )}
            </div>
          </section>


      {/* Map Preview Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[1rem] sm:text-[2rem] lg:text-[3rem] font-bold text-gray-900 mb-4">Preview the Parcel Map</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search parcels and open the full interactive map for more details.
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
            <img
              src="https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192875/mathias-owa-martins-2mbQ1sxVZ0Q-unsplash_ahahsf.jpg"
              alt="Map preview"
              className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            
            {/* Search Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="w-full max-w-2xl">
                <div className="relative group/search">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-3xl blur opacity-30 group-hover/search:opacity-50 transition"></div>
                  <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <Search className="absolute left-6 w-5 h-5 text-gray-400" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search parcel ID (e.g., PARCEL-12345-1)"
                      className="flex-1 h-16 pl-14 pr-4 bg-transparent text-gray-900 placeholder:text-gray-400 text-lg focus:outline-none"
                    />
                    <button 
                      onClick={() => window.location.href = `/map${q ? `?q=${encodeURIComponent(q)}` : ''}`}
                      className="m-2 h-12 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 font-semibold hover:shadow-lg hover:scale-105 transition-all"
                    >
                      Go to Map
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Find Your Perfect Parcel?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Start exploring verified land parcels across Africa today. Join thousands of satisfied landowners.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/map'}
              className="h-14 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Explore Map Now
            </button>
            <button className="h-14 px-8 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20 transition-all border border-white/20">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}