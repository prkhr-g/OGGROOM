"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface VendorIdFormProps {
  isOpen: boolean;
  onClose: () => void;
  ownerName: string;
  ownerEmail: string;
  onSuccess: (vendorId: string) => void;
}

export function VendorIdForm({
  isOpen,
  onClose,
  ownerName,
  ownerEmail,
  onSuccess,
}: VendorIdFormProps) {
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [accountHolder, setAccountHolder] = useState(""); // New state
  const [pan, setPan] = useState(""); // New state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");

    // Basic validation for phone number
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/shop-owner/vendor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: ownerName,
          email: ownerEmail,
          phone: phone,
          upi_id: upiId,
          account_holder: accountHolder,
          pan: pan,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate vendor ID.");
      }

      const result = await response.json();
      onSuccess(result.vendor_id);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Vendor ID</DialogTitle>
          <DialogDescription>
            Please provide your details to generate a vendor ID for receiving
            payments.
          </DialogDescription>
          <p className="text-xs text-amber-600 dark:text-amber-400 pt-2">
            Note: It is mandatory to collect the payment online at the time of
            booking.
          </p>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={ownerName}
              disabled
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={ownerEmail}
              disabled
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="upi_id" className="text-right">
              UPI ID
            </Label>
            <Input
              id="upi_id"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account_holder" className="text-right">
              UPI Account Holder Name
            </Label>
            <Input
              id="account_holder"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pan" className="text-right">
              PAN
            </Label>
            <Input
              id="pan"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              className="col-span-3"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive col-span-4 text-center">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate ID"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
