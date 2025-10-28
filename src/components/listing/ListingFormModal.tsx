"use client";

import { useState } from "react";
import { Modal, Form, Radio, Checkbox } from "antd";
import { GButton, GInput, GTextArea, GSelect } from "@gal-ui/components";
import { useListingMutations } from "@/hooks/useListings";
import type { Parcel, Listing } from "@/lib/types/parcel";
import { approveNftAllowance, connectHederaSnap } from "@/lib/hedera/allowance";
import { getHederaClient } from "@/lib/hedera/client";
import { createTopicWithMemo } from "@/lib/hedera/h";

interface ListingFormModalProps {
  open: boolean;
  onClose: () => void;
  parcel: Parcel;
  existingListing?: Listing | null;
  mode: "create" | "edit";
}

const { nftTokenId, treasuryAccountId } = getHederaClient() ;
export default function ListingFormModal({
  open,
  onClose,
  parcel,
  existingListing,
  mode,
}: ListingFormModalProps) {
  const [form] = Form.useForm();
  const { createListing, updateListing } = useListingMutations();
  const [listingType, setListingType] = useState<"SALE" | "LEASE">(
    existingListing?.type || "SALE"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const leasePeriodOptions = [
    { value: "1_MONTH", label: "Monthly (Pay every month)" },
    { value: "6_MONTHS", label: "Every 6 Months" },
    { value: "12_MONTHS", label: "Yearly (Pay every 12 months)" },
  ];

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await connectHederaSnap()
        await approveNftAllowance({
          spenderAccountId: treasuryAccountId,
          nftTokenId: nftTokenId || "",
          approveAll: true,
        });
        
        const topicMemo = `Lease Record for : ${parcel.parcel_id}`;
        const topicId = await createTopicWithMemo(topicMemo);

        console.log(topicId);
        await createListing({
          parcel_id: parcel.parcel_id,
          type: listingType,
          price_kes: parseFloat(values.price_kes),
          lease_period: listingType === "LEASE" ? values.lease_period : undefined,
          description: values.description,
          terms: values.terms,
          contact_phone: values.contact_phone,
          topic_id: topicId,
        });
      } else if (existingListing) {
        await updateListing(existingListing.id, {
          price_kes: parseFloat(values.price_kes),
          lease_period: listingType === "LEASE" ? values.lease_period : undefined,
          description: values.description,
          terms: values.terms,
          contact_phone: values.contact_phone,
        });
      }
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error submitting listing:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Calculate total price for lease
  const calculateLeaseTotal = () => {
    const pricePerMonth = form.getFieldValue("price_kes");
    const period = form.getFieldValue("lease_period");

    if (!pricePerMonth || !period) return null;

    const months = {
      "1_MONTH": 1,
      "6_MONTHS": 6,
      "12_MONTHS": 12,
    }[period];

    return pricePerMonth * months;
  };

  return (
    <Modal
      title={mode === "create" ? "Create Listing" : "Edit Listing"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={
          existingListing
            ? {
              type: existingListing.type,
              price_kes: existingListing.price_kes,
              lease_period: existingListing.lease_period,
              description: existingListing.description,
              terms: existingListing.terms,
              contact_phone: existingListing.contact_phone,
              agree: false,
            }
            : {
              type: "SALE",
              agree: false,
            }
        }
      >
        {/* Parcel Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="font-semibold">{parcel.parcel_id}</div>
          <div className="text-sm text-gray-600">
            {parcel.admin_region.city}, {parcel.admin_region.state},{" "}
            {parcel.admin_region.country}
          </div>
          <div className="text-sm text-gray-600">
            Area: {(parcel.area_m2 * 0.000247105).toFixed(2)} acres
          </div>
        </div>

        {/* Listing Type */}
        {mode === "create" && (
          <Form.Item
            label="Listing Type"
            name="type"
            rules={[{ required: true, message: "Please select listing type" }]}
          >
            <Radio.Group
              onChange={(e) => setListingType(e.target.value)}
              value={listingType}
            >
              <Radio value="SALE">For Sale</Radio>
              <Radio value="LEASE">For Lease</Radio>
            </Radio.Group>
          </Form.Item>
        )}

        {/* Price */}
        <Form.Item
          label={
            listingType === "LEASE"
              ? "Price per Month (HBAR)"
              : "Price (HBAR)"
          }
          name="price_kes"
          rules={[
            { required: true, message: "Please enter price" },
            {
              validator: (_, value) => {
                if (value && value <= 0) {
                  return Promise.reject("Price must be greater than 0");
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <GInput
            type="number"
            placeholder="Enter price in HBAR"
          />
        </Form.Item>

        {/* Lease Period */}
        {listingType === "LEASE" && (
          <>
            <Form.Item
              label="Payment Period"
              name="lease_period"
              rules={[
                {
                  required: true,
                  message: "Please select payment period",
                },
              ]}
            >
              <GSelect
                options={leasePeriodOptions}
                placeholder="Select payment period"
                customSize="xl"
              />
            </Form.Item>

            {/* Show total calculation */}
            {form.getFieldValue("price_kes") &&
              form.getFieldValue("lease_period") && (
                <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
                  <div className="font-semibold text-blue-900">
                    Total Payment per Period
                  </div>
                  <div className="text-blue-700">
                    HBAR {calculateLeaseTotal()?.toLocaleString()}
                  </div>
                </div>
              )}
          </>
        )}

        {/* Description */}
        <Form.Item label="Description (Optional)" name="description">
          <GTextArea
            placeholder="Describe your land, features, location benefits, etc."
            rows={4}
            maxLength={1000}
            showCount
            customSize="xl"
          />
        </Form.Item>

        {/* Terms */}
        <Form.Item label="Terms & Conditions (Optional)" name="terms">
          <GTextArea
            placeholder="Any specific terms, conditions, or requirements"
            rows={3}
            maxLength={500}
            showCount
            customSize="xl"
          />
        </Form.Item>

        {/* Contact Phone */}
        <Form.Item
          label="Contact Phone (Optional)"
          name="contact_phone"
          rules={[
            {
              pattern: /^[0-9+\-\s()]+$/,
              message: "Please enter a valid phone number",
            },
          ]}
        >
          <GInput
            placeholder="e.g., +254 712 345 678"
          />
        </Form.Item>

        {/* Agreement Checkbox */}
        <Form.Item
          name="agree"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(
                    "You must agree to the terms and conditions"
                  ),
            },
          ]}
        >
          <Checkbox>
            I agree that all information provided is accurate and I have the
            right to list this property
          </Checkbox>
        </Form.Item>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <GButton btn_type="secondary-gray" onClick={handleCancel}>
            Cancel
          </GButton>
          <GButton
            btn_type="primary"
            htmlType="submit"
            loading={isSubmitting}
          >
            {mode === "create" ? "Create Listing" : "Update Listing"}
          </GButton>
        </div>
      </Form>
    </Modal>
  );
}
