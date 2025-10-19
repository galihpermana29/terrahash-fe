"use client";

import { useState } from "react";
import { GButton, GInput } from "@gal-ui/components";
import { Form } from "antd";
import { checkWallet } from "@/client-action/auth";

interface OwnerValidatorProps {
  value?: string;
  onChange?: (walletAddress: string, userId?: string) => void;
  disabled?: boolean;
}

export default function OwnerValidator({
  value,
  onChange,
  disabled,
}: OwnerValidatorProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    valid: boolean;
    userName?: string;
    userId?: string;
    message?: string;
  } | null>(null);

  const handleCheckUser = async () => {
    if (!value || value.trim() === "") {
      setValidationStatus({
        valid: false,
        message: "Please enter a wallet address",
      });
      return;
    }

    setIsChecking(true);
    setValidationStatus(null);

    try {
      const result = await checkWallet(value);
      console.log(result, '>')
      if (result.success && result.data.exists) {
        const user = result.data.user;
        setValidationStatus({
          valid: true,
          userName: user.full_name,
          userId: user.id,
        });
        onChange?.(value, user.id);
      } else {
        setValidationStatus({
          valid: false,
          message: "User not found. Please enter a valid wallet address.",
        });
        onChange?.(value, undefined);
      }
    } catch (error) {
      console.error("Error checking wallet:", error);
      setValidationStatus({
        valid: false,
        message: "Error checking wallet. Please try again.",
      });
      onChange?.(value, undefined);
    } finally {
      setIsChecking(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue, undefined);
    setValidationStatus(null); // Reset validation when input changes
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <GInput
            value={value}
            onChange={handleInputChange}
            placeholder="0x..."
            disabled={disabled}
          />
        </div>
        <GButton
          btn_type="secondary-gray"
          onClick={handleCheckUser}
          loading={isChecking}
          disabled={disabled || !value}
        >
          Check User
        </GButton>
      </div>

      {validationStatus && (
        <div className="mt-2">
          {validationStatus.valid ? (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <span>✅</span>
              <span>{validationStatus.userName}</span>
            </div>
          ) : (
            <div className="text-red-500 text-sm">
              {validationStatus.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
