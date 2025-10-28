"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Carousel, Tag, Spin, Typography, Modal, message, Form } from "antd";
import { GButton, GTextArea } from "@gal-ui/components";
import { useParcelDetail } from "@/hooks/gov/useParcels";
import { useAuth } from "@/contexts/AuthContext";
import ParcelMap from "@/components/map/ParcelMap";
import MapLegend from "@/components/map/MapLegend";
import type { ParcelFC, ParcelGeometry } from "@/lib/types/parcel";
import { createPurchaseTransaction } from "@/client-action/transaction";
import { getEvmAddressFromHederaAccountId, submitMessageToTopic, TransferToken, TransferTokentoBuyer } from "@/lib/hedera/h";
import { getHederaClient } from "@/lib/hedera/client";
import { createObjection } from "@/client-action/objection";
import { parseEther } from "viem";
import { useAccount, useSendTransaction } from "wagmi";


const { Title, Text, Paragraph } = Typography;
const { nftTokenId } = getHederaClient();
export default function ParcelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const parcelId = params.parcel_id as string;
  const { sendTransactionAsync } = useSendTransaction();
  const { address: userAddress } = useAccount();

  const { parcel, isLoading } = useParcelDetail(parcelId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isSubmittingObjection, setIsSubmittingObjection] = useState(false);
  const [objectionForm] = Form.useForm();

  // Placeholder images for carousel
  const images = parcel?.asset_url && parcel.asset_url.length > 0 ? parcel.asset_url : ["/placeholder-land.jpg"];

  // Create map data for single parcel
  const mapData: ParcelFC | null = parcel
    ? {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: JSON.parse(parcel.geometry_geojson).geometry as ParcelGeometry,
          properties: {
            parcel_id: parcel.parcel_id,
            status: parcel.status,
            area_m2: parcel.area_m2,
            updated_at: parcel.updated_at || new Date().toISOString(),
            owner_id: parcel.owner_id,
          },
        },
      ],
    }
    : null;

  const handleBuyOrLease = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!parcel?.listing) {
      message.error("No listing found for this parcel");
      return;
    }
    setShowPurchaseModal(true);

  };

  const handlePurchaseConfirm = async () => {
    if (!parcel?.listing || !user) return;

    setIsProcessing(true);
    try {

      const sellerWallet = getEvmAddressFromHederaAccountId(parcel.owner?.wallet_address || "");
      console.log("Seller Wallet:", parcel.owner?.wallet_address, "=> EVM Address:", sellerWallet);
      const amountInNative = parseEther(
        (parcel.listing.price_kes).toString()
      );

      const txHash = await sendTransactionAsync({
          from: userAddress,
          to: sellerWallet,
          value: amountInNative,
          gasLimit: 210000,
      });

      console.log("Transaction Hash:", txHash);

      const response = await createPurchaseTransaction({
        listing_id: parcel.listing.id,
        payment_hash: txHash,
      });

      console.log("Purchase Response:", response);

      if (response.success && response.data) {
        message.success("Purchase completed successfully!");
        setShowPurchaseModal(false);

        router.push("/user/my-transactions");
      } else {
        message.error(response.error?.message || "Purchase failed");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      message.error("An error occurred during purchase");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleObjectionSubmit = async (values: { objection: string }) => {
    if (!parcel || !user) return;
    setIsSubmittingObjection(true);
    try {
      const { status } = await submitMessageToTopic(
        parcel.ob_topic_id || "",
        `Objection from ${user.full_name}: ${values.objection}`,
        parcel.parcel_id
      );
      console.log("Submitted objection message to topic with status:", status);
      const response = await createObjection({
        parcel_id: parcel.parcel_id,
        message: values.objection,
        ob_topic_id: parcel.ob_topic_id,
        hash_topic: status === "SUCCESS" ? true : false,
      });

      if (response.success) {
        message.success("Objection submitted successfully!");
        objectionForm.resetFields();
      } else {
        message.error(response.error?.message || "Failed to submit objection");
      }
    } catch (error) {
      console.error("Objection submission error:", error);
      message.error("An error occurred while submitting objection");
    } finally {
      setIsSubmittingObjection(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-6xl mb-4">🔍</div>
        <Title level={3}>Parcel not found</Title>
        <Text type="secondary" className="mb-6">
          The parcel you're looking for doesn't exist or has been removed.
        </Text>
        <GButton onClick={() => router.push("/map")}>Back to Map</GButton>
      </div>
    );
  }

  const region = parcel.admin_region;
  const acres = (parcel.area_m2 * 0.000247105).toFixed(2);
  const hasListing = parcel.listing && parcel.listing.active;
  const isPublicUser = user?.type === "PUBLIC";
  const isOwner = user?.id === parcel.owner_id;

  return (
    <div className="min-h-screen">
      {/* Header with Back Button */}
      <div className=" border-b-[.5px] border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/map")}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
            <Title level={3} className="!mb-0">
              Detail Land
            </Title>
          </div>
          {/* Action Buttons */}
          {parcel && (
            <div className="">
              {hasListing && isPublicUser && !isOwner && (
                <button
                  onClick={handleBuyOrLease}
                  disabled={isProcessing} // only disable if processing
                  className={`h-10 px-6 rounded-full font-medium transition-colors ${
                    isProcessing
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-brand-primary text-white hover:bg-brand-primary-dark"
                  }`}
                >
                  {isProcessing
                    ? "Processing..."
                    : parcel.listing?.type === "SALE"
                    ? "Buy Now"
                    : "Lease Soon"}
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Hero Section - Image Carousel & Info */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Image Carousel */}
            <div className="w-full">
              <Carousel autoplay className="rounded-lg overflow-hidden shadow-lg">
                {images.map((img, idx) => (
                  <div key={idx}>
                    <div
                      className="h-[400px] bg-cover bg-center"
                      style={{ backgroundImage: `url(${img})` }}
                    />
                  </div>
                ))}
              </Carousel>
            </div>

            {/* Right: Parcel Info */}
            <div className="flex flex-col">
              {/* Parcel Title */}
              <div className="mb-3">
                <div className="flex flex-col-reverse items-start gap-2">
                  <Title level={2} className="!mb-2 !mt-0 text-3xl">
                    {parcel.parcel_id}
                  </Title>

                  {/* Status Badges */}
                  <div className="flex items-center">
                    <Tag
                      color={parcel.status === "OWNED" ? "blue" : "green"}
                      className="text-xs px-2 py-0.5"
                    >
                      {parcel.status}
                    </Tag>
                    {hasListing && (
                      <Tag
                        color={parcel.listing.type === "SALE" ? "green" : "orange"}
                        className="text-xs px-2 py-0.5"
                      >
                        FOR {parcel.listing.type}
                      </Tag>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-600">
                  <Text type="secondary" className="text-sm">
                    {region.city}, {region.state}, {region.country}
                  </Text>
                </div>
              </div>

              {/* Price Section */}
              {hasListing && (
                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <Title level={3}>
                      HBAR {parcel.listing?.price_kes.toLocaleString()}
                    </Title>
                    {parcel.listing?.type === "LEASE" && (
                      <Text type="secondary" className="text-lg">/month</Text>
                    )}
                  </div>
                  {parcel.listing?.type === "LEASE" &&
                    parcel.listing?.lease_period && (
                      <Text type="secondary" className="text-sm mt-1">
                        Payment: {parcel.listing.lease_period.replace("_", " ")}
                      </Text>
                    )}
                </div>
              )}

              {/* Property Details */}
              <div className="mb-6">
                <Title level={5} className="!mb-4 text-base font-semibold">
                  Property Details
                </Title>

                <div className="space-y-3">
                  {/* Area */}
                  <div className="flex justify-between items-center">
                    <Text type="secondary" className="text-sm">
                      Area
                    </Text>
                    <Text className="text-sm font-medium">
                      {parcel.area_m2.toLocaleString()} m² ({acres} acres)
                    </Text>
                  </div>

                  {/* Owner */}
                  {parcel.owner && (
                    <div className="flex justify-between items-center">
                      <Text type="secondary" className="text-sm">
                        Owner
                      </Text>
                      <div className="flex items-center gap-2">
                        <Text className="text-sm font-medium">
                          {parcel.owner.full_name}
                        </Text>
                        {isOwner && (
                          <Tag color="blue" className="text-xs">
                            You
                          </Tag>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  {hasListing && (
                    <div className="flex justify-between items-center">
                      <Text type="secondary" className="text-sm">
                        Contact
                      </Text>
                      <Text className="text-sm font-medium">
                        {parcel.listing?.contact_phone || "-"}
                      </Text>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {hasListing && parcel.listing?.description && (
                <div className="mb-6">
                  <Title level={5} className="!mb-3 text-base font-semibold">
                    Description
                  </Title>
                  <Paragraph className="text-sm text-gray-600 leading-relaxed">
                    {parcel.listing.description}
                  </Paragraph>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Additional Details */}
      {hasListing && parcel.listing?.terms && (
        <div className="">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Title level={3} className="mb-4">
              Terms & Conditions
            </Title>
            <Paragraph className="whitespace-pre-wrap">
              {parcel.listing?.terms}
            </Paragraph>
          </div>
        </div>
      )}

      {/* Map Section */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Title level={3} className="mb-4">
            Location
          </Title>
          <div className="relative h-[500px] rounded-lg overflow-hidden shadow-lg">
            {mapData && (
              <>
                <ParcelMap
                  data={mapData}
                  filterStatuses={[parcel.status]}
                  query={parcel.parcel_id}
                />
                <MapLegend />
              </>
            )}
          </div>
        </div>
      </div>
      {/* Objection Form */}
      {isPublicUser && !isOwner && parcel.status === "UNCLAIMED" && (
        <div className="">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Title level={3} className="mb-4">
              Submit Land Objection
            </Title>
            <Text type="secondary" className="block mb-6">
              If you have concerns or objections about this land parcel, please submit your message below.
              Government officials will review your submission and may contact you for further information.
            </Text>

            <Form
              form={objectionForm}
              layout="vertical"
              onFinish={handleObjectionSubmit}
              className="max-w-2xl"
            >

              <Form.Item
                name="objection"
                label="Your Objection Message"
                rules={[
                  { required: true, message: "Please enter your objection" },
                  { min: 10, message: "Message must be at least 10 characters" },
                  { max: 1000, message: "Message must not exceed 1000 characters" }
                ]}
              >
                <GTextArea
                  customSize="xl"
                  placeholder="Please describe your objection or concern about this land parcel..."
                  showCount
                  maxLength={1000}
                />
              </Form.Item>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg mb-[20px]">
                <Text className="text-sm text-blue-800">
                  <strong>Note:</strong> Your objection will be reviewed by government officials.
                  They may contact you via email or phone for additional information.
                  Please ensure your contact information is up to date in your profile.
                </Text>
              </div>
              <Form.Item>
                <button
                  className={`h-10 px-6 rounded-full font-medium transition-colors ${isSubmittingObjection
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-brand-primary text-white hover:bg-brand-primary-dark"
                    }`}
                  type="submit"
                  disabled={isSubmittingObjection}
                >
                  {isSubmittingObjection ? "Submitting..." : "Submit Objection"}
                </button>
              </Form.Item>
            </Form>


          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      <Modal
        title="Confirm Purchase"
        open={showPurchaseModal}
        onCancel={() => setShowPurchaseModal(false)}
        footer={[
          <button
            key="cancel"
            onClick={() => setShowPurchaseModal(false)}
            className="px-4 py-2 mr-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>,
          <button
            key="confirm"
            onClick={handlePurchaseConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${isProcessing
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-brand-primary text-white hover:bg-brand-primary-dark"
              }`}
          >
            {isProcessing ? "Processing..." : "Confirm Purchase"}
          </button>,
        ]}
      >
        {parcel?.listing && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Purchase Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Parcel ID:</span>
                  <span className="font-medium">{parcel.parcel_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Area:</span>
                  <span className="font-medium">
                    {parcel.area_m2.toLocaleString()} m² ({(parcel.area_m2 * 0.000247105).toFixed(2)} acres)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">
                    {parcel.admin_region.city}, {parcel.admin_region.state}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total Price:</span>
                  <span className="text-brand-primary">
                    HBAR {parcel.listing.price_kes.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2">🔗 Web3 Integration</h5>
              <p className="text-sm text-blue-700">
                This purchase will be recorded on the Hedera blockchain for transparency and security.
                You'll need to confirm the transaction in your wallet.
              </p>
            </div>

            <p className="text-sm text-gray-600">
              By confirming this purchase, you agree to the terms and conditions of the land sale.
              This transaction cannot be reversed once completed.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
