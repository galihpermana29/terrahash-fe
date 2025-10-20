import Image from "next/image";
import Link from "next/link";
import { Parcel } from "@/lib/types/parcel";

interface ParcelCardProps {
  parcel: Parcel;
  onViewMap?: () => void;
  onViewDetails?: () => void;
}

const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192851/murad-swaleh-7tDidSXbgD8-unsplash_hn17iq.jpg";

export default function ParcelCard({
  parcel,
  onViewMap,
  onViewDetails,
}: ParcelCardProps) {
  // Get image from asset_url or use default
  const imageUrl = parcel.asset_url?.[0] || DEFAULT_IMAGE;

  // Convert m2 to acres
  const areaInAcres = (parcel.area_m2 / 4046.8564224).toFixed(1);

  // Format updated date
  const updatedDate = new Date(parcel.updated_at || "").toLocaleDateString();

  // Get full address
  const fullAddress = `${parcel.admin_region.city}, ${parcel.admin_region.state}, ${parcel.admin_region.country}`;

  // Get owner name
  const ownerName = parcel.owner
    ? parcel.owner.full_name || "Public"
    : "Unclaimed";

  // Get listing info
  const hasListing = parcel.listing && parcel.listing.active;
  const listingPrice = hasListing ? parcel.listing!.price_kes : null;
  const listingType = hasListing ? parcel.listing!.type : null;
  const leasePeriod = hasListing && listingType === "LEASE" ? parcel.listing!.lease_period : null;

  // Calculate display price for lease
  const getDisplayPrice = () => {
    if (!hasListing || !listingPrice) return null;
    
    if (listingType === "SALE") {
      return `KES ${listingPrice.toLocaleString()}`;
    }
    
    // For LEASE, show per month
    return `KES ${listingPrice.toLocaleString()}/mo`;
  };

  // Get lease period label
  const getLeasePeriodLabel = () => {
    if (!leasePeriod) return "";
    
    const labels = {
      "1_MONTH": "Monthly",
      "6_MONTHS": "Every 6 months",
      "12_MONTHS": "Yearly",
    };
    
    return labels[leasePeriod];
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-cream shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-40">
        <Image
          src={imageUrl}
          alt={parcel.parcel_id}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {/* Status Badge */}
          <span className="text-xs px-2 py-1 rounded-full bg-brand-gold text-text-dark shadow">
            {parcel.status}
          </span>
          {/* Listing Type Badge */}
          {hasListing && (
            <span className="text-xs px-2 py-1 rounded-full bg-white text-gray-700 shadow border border-gray-200">
              {listingType}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-brand-primary">
            {parcel.parcel_id}
          </h3>
          {hasListing && (
            <span className="text-brand-gold font-medium">
              {getDisplayPrice()}
            </span>
          )}
        </div>

        {/* Lease Period (if applicable) */}
        {listingType === "LEASE" && leasePeriod && (
          <p className="text-xs text-blue-600 font-medium">
            Payment: {getLeasePeriodLabel()}
          </p>
        )}

        {/* Location and Area */}
        <p className="mt-1 text-sm text-gray-600">
          {fullAddress} • {areaInAcres} acres
        </p>

        {/* Owner */}
        <p className="text-xs text-gray-600">Owner: {ownerName}</p>

        {/* Contact Phone (if listing has it) */}
        {hasListing && parcel.listing!.contact_phone && (
          <p className="text-xs text-gray-600">
            Contact: {parcel.listing!.contact_phone}
          </p>
        )}

        {/* Updated Date */}
        <p className="text-xs text-gray-500">Updated: {updatedDate}</p>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {onViewMap ? (
            <button
              onClick={onViewMap}
              className="h-10 px-4 rounded-full bg-brand-primary text-white hover:bg-brand-primary-dark transition-colors"
            >
              View on Map
            </button>
          ) : (
            <Link href={`/map?q=${parcel.parcel_id}`}>
              <button className="h-10 px-4 rounded-full bg-brand-primary text-white hover:bg-brand-primary-dark transition-colors">
                View on Map
              </button>
            </Link>
          )}

          {onViewDetails ? (
            <button
              onClick={onViewDetails}
              className="h-10 px-4 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Details
            </button>
          ) : (
            <Link href={`/parcel/${parcel.parcel_id}`}>
              <button className="h-10 px-4 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                Details
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
