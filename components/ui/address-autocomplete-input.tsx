"use client";

import React, { useRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, LocateFixed } from "lucide-react";
import { useGoogleMaps } from "@/components/google-maps-loader";
import { ErrorModal } from "@/components/ui/error-modal";

interface AddressAutocompleteInputProps {
  value: string;
  onChange: (address: string, lat: number | null, lng: number | null) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
}

export const AddressAutocompleteInput: React.FC<
  AddressAutocompleteInputProps
> = ({
  value,
  onChange,
  disabled,
  id = "address-autocomplete",
  label = "Address",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded, loadError } = useGoogleMaps();
  const [isLocating, setIsLocating] = useState(false);
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: "",
    description: "",
  });

  useEffect(() => {
    if (isLoaded && inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: "in" },
        },
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.geometry) {
          const lat = place.geometry.location?.lat() || null;
          const lng = place.geometry.location?.lng() || null;
          onChange(place.formatted_address || "", lat, lng);
        } else {
          onChange(inputRef.current?.value || "", null, null);
        }
      });
    }
  }, [isLoaded, onChange]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            setIsLocating(false);
            if (status === "OK" && results && results[0]) {
              onChange(results[0].formatted_address, lat, lng);
            } else {
              setErrorModal({
                isOpen: true,
                title: "Could not determine address",
                description:
                  "Reverse geocoding failed. Please try again or enter your address manually.",
              });
            }
          });
        },
        (error) => {
          setIsLocating(false);
          let title = "Error Getting Location";
          let description =
            "An unknown error occurred. Please try again or enter your address manually.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              title = "Location Permission Denied";
              description =
                "To use this feature, please allow location access in your browser settings. You may need to reload the page after granting permission.";
              break;
            case error.POSITION_UNAVAILABLE:
              title = "Location Unavailable";
              description =
                "Your location could not be determined. Please ensure your device\'s location services are enabled in your operating system settings and that you have a stable internet connection. Trying again outdoors may also help. If the issue persists, please enter your address manually.";
              break;
            case error.TIMEOUT:
              title = "Location Request Timed Out";
              description =
                "The request to get your location timed out. Please try again.";
              break;
          }

          setErrorModal({ isOpen: true, title, description });
        },
      );
    } else {
      setErrorModal({
        isOpen: true,
        title: "Geolocation Not Supported",
        description:
          "Your browser does not support geolocation. Please enter your address manually.",
      });
    }
  };

  if (loadError) {
    return <div className="text-red-500 text-sm">{loadError.message}</div>;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading Maps...
      </div>
    );
  }

  return (
    <>
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        description={errorModal.description}
      />
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex items-center gap-2">
          <Input
            id={id}
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value, null, null)}
            disabled={disabled || isLocating}
            placeholder="Enter shop address"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleGetCurrentLocation}
            disabled={disabled || isLocating}
            aria-label="Use my current location"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
