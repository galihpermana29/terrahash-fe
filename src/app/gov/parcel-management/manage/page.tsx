"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Form, Radio } from "antd";
import {
  GButton, GInput, GSelect, GTextArea
} from "@gal-ui/components";
import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import OwnerValidator from "@/components/gov/parcel/OwnerValidator";
import DraggerUpload from "@/components/uploader/Multiuploader";

const ParcelMapDrawer = dynamic(
  () => import("@/components/gov/parcel/ParcelMapDrawer"),
  { ssr: false }
);
import { useParcelForm } from "@/hooks/gov/useParcelForm";
import { useParcels, useParcelDetail } from "@/hooks/gov/useParcels";
import AuthGuard from "@/components/auth/AuthGuard";
import { useWatch } from "antd/es/form/Form";
import { uploadMemoDataToIPFS } from "@/lib/utils/ipfs";
import { getHederaClient } from "@/lib/hedera/client";
import { createTopicWithMemo, mintNFT, updateNFTMetadata } from "@/lib/hedera/h";

// Countries in Africa (sample list)
const AFRICAN_COUNTRIES = [
  "Nigeria",
  "South Africa",
  "Kenya",
  "Egypt",
  "Ghana",
  "Ethiopia",
  "Tanzania",
  "Uganda",
  "Morocco",
  "Algeria",
].map((country) => ({ label: country, value: country }));

// Sample states (would be dynamic based on country)
const STATES = {
  Nigeria: ["Lagos", "Abuja", "Kano", "Rivers", "Oyo"],
  "South Africa": ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape"],
  Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
  // Add more...
};

// Sample cities (would be dynamic based on state)
const CITIES = {
  Lagos: ["Ikeja", "Victoria Island", "Lekki", "Surulere"],
  Abuja: ["Central Business District", "Garki", "Wuse", "Maitama"],
  Gauteng: ["Johannesburg", "Pretoria", "Soweto", "Sandton"],
  // Add more...
};

function ManageParcelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parcelId = searchParams.get("parcel_id");
  const isEditMode = !!parcelId;

  const [form] = Form.useForm();
  const {
    geometry,
    area,
    ownerWallet,
    ownerId,
    isReverseGeocoding,
    handleGeometryChange,
    handleOwnerChange,
    buildFormPayload,
  } = useParcelForm();

  const { createParcel, updateParcel, isCreating, isUpdating } = useParcels();
  const { parcel: existingParcel, isLoading: isLoadingParcel } = useParcelDetail(
    isEditMode ? parcelId : null
  );
  const { nftTokenId, treasuryAccountId } = getHederaClient();
  const asset_url = useWatch('asset_url', form);
  const certif_url = useWatch('certif_url', form);

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [status, setStatus] = useState<"UNCLAIMED" | "OWNED">("UNCLAIMED");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadedGeometry, setLoadedGeometry] = useState<GeoJSON.Feature<GeoJSON.Polygon> | null>(null);
  
  // Load existing parcel data in edit mode
  useEffect(() => {
    if (isEditMode && existingParcel && !isDataLoaded) {
      // Parse geometry from string
      const geometry = JSON.parse(existingParcel.geometry_geojson);

      // Set form values
      form.setFieldsValue({
        parcel_id: existingParcel.parcel_id,
        country: existingParcel.admin_region.country,
        state: existingParcel.admin_region.state,
        city: existingParcel.admin_region.city,
        status: existingParcel.status,
        notes: existingParcel.notes || "",
        owner_wallet: existingParcel.owner?.wallet_address || "",
        asset_url: existingParcel.asset_url || [],
        certif_url: existingParcel.certif_url || "",
      });

      // Set local state
      setSelectedCountry(existingParcel.admin_region.country);
      setSelectedState(existingParcel.admin_region.state);
      setStatus(existingParcel.status);

      // Store geometry to pass to map
      setLoadedGeometry(geometry);

      // Set geometry in form state (important for edit mode validation)
      handleGeometryChange(geometry, existingParcel.area_m2);

      // If has owner, set owner data
      if (existingParcel.owner) {
        handleOwnerChange(
          existingParcel.owner.wallet_address,
          existingParcel.owner.id
        );
      }

      setIsDataLoaded(true);
    } else if (!isEditMode && !isDataLoaded) {
      // Create mode: auto-generate parcel ID
      form.setFieldsValue({
        // parcel_id: `PARCEL-${Date.now()}`,
        status: "UNCLAIMED",
      });
      setIsDataLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existingParcel, isDataLoaded]);

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedState("");
    form.setFieldsValue({ state: undefined, city: undefined });
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    form.setFieldsValue({ city: undefined });
  };

  const handleStatusChange = (e: any) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    if (newStatus === "UNCLAIMED") {
      form.setFieldsValue({ owner_wallet: undefined });
    }
  };

  const getStateOptions = () => {
    if (!selectedCountry) return [];
    const states = STATES[selectedCountry as keyof typeof STATES] || [];
    return states.map((state) => ({ label: state, value: state }));
  };

  const getCityOptions = () => {
    if (!selectedState) return [];
    const cities = CITIES[selectedState as keyof typeof CITIES] || [];
    return cities.map((city) => ({ label: city, value: city }));
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = buildFormPayload(values);
      if (!payload) {
        return;
      }
      // Build HIP-412 Metadata
      const memoData = {
        format: "HIP412@2.0.0",
        name: values.parcel_id,
        creator: "Gov.terrahash",
        description: values.notes || "No description provided",
        image: values.certif_url,
        type: values.certif_url?.endsWith(".png") ? "image/png" : "image/jpeg",
        files: (asset_url ?? []).map((url: string, i: number) => ({
          uri: url,
          type: url.endsWith(".png") ? "image/png" : "image/jpeg",
          is_default_file: i === 0 // file pertama dianggap utama
        })),
        attributes: [
          { trait_type: "Country", value: values.country },
          { trait_type: "State", value: values.state },
          { trait_type: "City", value: values.city },
          { trait_type: "Area (m²)", value: area },
          { trait_type: "GeoPoint Type", value: geometry.type },
          { trait_type: "GeoPoint Coordinates", value: geometry.geometry.coordinates[0] }
        ]
      } as const;
      
      const { metadataIpfsUri } = await uploadMemoDataToIPFS(memoData);
      let serialNumber: string | null = null;

      if (!isEditMode) {
        serialNumber = await mintNFT(
          metadataIpfsUri,
          values.owner_wallet || treasuryAccountId
        );

        const cleanedTokenId = nftTokenId.toString().replace("0.0.", "");
        const parcelId = `PARCEL-${cleanedTokenId}-${serialNumber}`;
        payload.parcel_id = parcelId;

        await createParcel(payload);
      } else {
        const existingSerial = values.parcel_id?.split("-")?.pop();
        if (!existingSerial) throw new Error("Invalid parcel_id format");

        await updateNFTMetadata(existingSerial, metadataIpfsUri, values.owner_wallet, values.status);
        await updateParcel({ parcelId: values.parcel_id, data: payload });
      }
      router.push("/gov/parcel-management");
    } catch (err) {
      console.error("[Submit] Error submitting parcel:", err);
    }
  };


  // Show loading state while fetching parcel data in edit mode
  if (isEditMode && isLoadingParcel) {
    return (
      <AuthGuard requiredUserType="GOV" redirectTo="/">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading parcel data...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredUserType="GOV" redirectTo="/">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/gov/parcel-management")}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Back to Parcels
          </button>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Edit Parcel" : "Create New Parcel"}
          </h1>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-6"
        >
          {/* Map Drawing Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Draw Parcel Boundary *
            </h2>
            <ParcelMapDrawer
              value={loadedGeometry || geometry}
              onChange={(geo, area) => {
                handleGeometryChange(geo, area, (location) => {
                  // Auto-fill location fields
                  form.setFieldsValue({
                    country: location.country,
                    state: location.state,
                    city: location.city,
                  });
                  setSelectedCountry(location.country);
                  setSelectedState(location.state);
                });
              }}
              mode={isEditMode ? "edit" : "create"}
            />
            {isReverseGeocoding && (
              <div className="text-sm text-gray-500 mt-2">
                🌍 Detecting location...
              </div>
            )}
          </div>

          {/* Parcel Details Section */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold mb-4">Parcel Details</h2>

            {/* Parcel ID */}
            <Form.Item
              label="Parcel ID"
              name="parcel_id"
            >
              <GInput disabled placeholder="Auto-generated" />
            </Form.Item>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-medium">Location *</h3>

              <Form.Item
                label="Country"
                name="country"
                rules={[{ required: true, message: "Country is required" }]}
              >
                <GSelect
                  options={AFRICAN_COUNTRIES}
                  placeholder="Select country"
                  onChange={handleCountryChange}
                />
              </Form.Item>

              <Form.Item
                label="State/Province"
                name="state"
                rules={[{ required: true, message: "State is required" }]}
              >
                <GSelect
                  options={getStateOptions()}
                  placeholder="Select state"
                  onChange={handleStateChange}
                  disabled={!selectedCountry}
                />
              </Form.Item>

              <Form.Item
                label="City/District"
                name="city"
                rules={[{ required: true, message: "City is required" }]}
              >
                <GSelect
                  options={getCityOptions()}
                  placeholder="Select city"
                  disabled={!selectedState}
                />
              </Form.Item>
            </div>

            {/* Status */}
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Status is required" }]}
            >
              <Radio.Group onChange={handleStatusChange}>
                <Radio value="UNCLAIMED">Unclaimed</Radio>
                <Radio value="OWNED">Owned</Radio>
              </Radio.Group>
            </Form.Item>

            {/* Owner (conditional) */}
            {status === "OWNED" && (
              <Form.Item
                label="Owner Wallet Address"
                name="owner_wallet"
                rules={[
                  {
                    required: true,
                    message: "Owner is required when status is OWNED",
                  },
                  {
                    validator: (_, value) => {
                      console.log(status, ownerId, '?')
                      if (status === "OWNED" && !ownerId) {
                        return Promise.reject(
                          "Please check if the wallet address is valid"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <OwnerValidator
                  value={ownerWallet}
                  onChange={handleOwnerChange}
                  placeholder="0.0.12345..."
                />
              </Form.Item>
            )}

            {/* Notes */}
            <Form.Item label="Notes" name="notes">
              <GTextArea
                customSize="xl"
                placeholder="Additional information, paperwork reference, etc."
                rows={4}
              />
            </Form.Item>
            
            {/* Certificate Upload */}
            <Form.Item
              label="NFT Certificate"
              name="certif_url"
              tooltip="Upload images of the NFT certificate"
              // rules={[{ required: true }]}
            >
              <DraggerUpload
                profileImageURL={certif_url}
                formItemName="certif_url"
                form={form}
                limit={1}
                multiple={false}
              />
            </Form.Item>

            {/* Asset Images */}
            <Form.Item
              label="Parcel Images (Optional)"
              name="asset_url"
              tooltip="Upload images of the parcel (land photos, documents, etc.)"
            >
              <DraggerUpload
                profileImageURL={asset_url}
                formItemName="asset_url"
                form={form}
                limit={5}
                multiple={true}
              />
            </Form.Item>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <GButton
              btn_type="secondary-gray"
              onClick={() => router.push("/gov/parcel-management")}
            >
              Cancel
            </GButton>
            <GButton btn_type="primary" htmlType="submit">
              {isEditMode ? "Update Parcel" : "Create Parcel"}
            </GButton>
          </div>
        </Form>
      </div>
    </AuthGuard>
  );
}

export default function ManageParcelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManageParcelContent />
    </Suspense>
  );
}
