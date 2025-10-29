'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLatestUnclaimedParcels } from '@/hooks/useLatestParcels';
import ParcelCard from '@/components/parcel/ParcelCard';

export default function Home() {
  const [q, setQ] = useState('');
  
  // Fetch latest unclaimed parcels for the homepage
  const { parcels: latestParcels, isLoading: parcelsLoading } = useLatestUnclaimedParcels(6);

  // Helper function to format area
  const formatAcres = (areaM2: number) => {
    return (areaM2 / 4046.8564224).toFixed(1);
  };

  return (
    <main className="bg-cream">
      {/* 1) Jumbotron */}
      <section className="relative h-[560px] w-full overflow-hidden">
        <Image
          src="https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192871/virgyl-sowah-E9NPWGBXM9o-unsplash_cqeyje.jpg"
          alt="African landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto h-full px-6 flex flex-col items-center justify-center text-center">
          <h1 className="font-bold text-white drop-shadow text-[28px] sm:text-[40px] md:text-[56px] lg:text-[72px]">
            Find Land in Africa
          </h1>
          <p className="mt-4 max-w-2xl text-white/90">
            Discover verified parcels across the continent. Secure, transparent, and mapped.
          </p>
          <div className="mt-8 w-full max-w-2xl flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by state, city or parcel ID"
              className="flex-1 h-12 rounded-full px-5 bg-white text-gray-800 placeholder:text-gray-500 shadow"
            />
            <Link href={`/map${q ? `?q=${encodeURIComponent(q)}` : ''}`} className="inline-flex">
              <button className="h-12 px-6 rounded-full bg-brand-gold text-text-dark font-medium shadow hover:opacity-95">
                Search
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2) Brief + preview grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-semibold text-brand-primary text-[24px] md:text-[32px] lg:text-[40px]">Empowering African Land Ownership</h2>
            <p className="mt-4 text-gray-600">
              This portal helps you explore, verify, lease and manage land across Africa. View boundaries,
              statuses, and parcel details on an interactive map. Every parcel is represented with clear
              metadata and status so you can make confident decisions.
            </p>
            <Link href="/map" className="inline-flex mt-6">
              <button className="h-11 px-6 rounded-full bg-brand-primary text-white hover:bg-brand-primary-dark">
                Explore the Map
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192851/murad-swaleh-7tDidSXbgD8-unsplash_hn17iq.jpg',
              'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192855/sam-szuchan-_wqjX4MauzA-unsplash_u4almv.jpg',
              'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192859/fabricio-sakai-oyQD2wngBDM-unsplash_uamshk.jpg',
              'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192871/virgyl-sowah-E9NPWGBXM9o-unsplash_cqeyje.jpg',
              'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192875/mathias-owa-martins-2mbQ1sxVZ0Q-unsplash_ahahsf.jpg',
              'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192855/sam-szuchan-_wqjX4MauzA-unsplash_u4almv.jpg',
            ].map((src, i) => (
              <div key={i} className={`relative h-28 sm:h-36 md:h-40 rounded-lg overflow-hidden ${i === 1 || i === 4 ? 'col-span-2' : ''}`}>
                <Image src={src} alt="Preview" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3) Latest Unclaimed Land */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-semibold text-brand-primary text-[24px] md:text-[32px] lg:text-[40px]">Latest Unclaimed Land</h2>
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

      {/* 4) Map preview section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="font-semibold text-brand-primary text-[24px] md:text-[32px] lg:text-[40px]">Preview the Parcel Map</h2>
            <p className="mt-2 text-gray-600">Search parcels and open the full interactive map for more details.</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg relative">
            <Image
              src="https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192875/mathias-owa-martins-2mbQ1sxVZ0Q-unsplash_ahahsf.jpg"
              alt="Map preview"
              width={1600}
              height={500}
              className="w-full h-[380px] object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-xl flex gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search parcel ID (e.g., TH-0002)"
                  className="flex-1 h-12 rounded-full px-5 bg-white text-gray-800 placeholder:text-gray-500 shadow"
                />
                <Link href={`/map${q ? `?q=${encodeURIComponent(q)}` : ''}`} className="inline-flex">
                  <button className="h-12 px-6 rounded-full bg-brand-gold text-text-dark font-medium shadow hover:opacity-95">
                    Go to Map
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
