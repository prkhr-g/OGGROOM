"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { Loader as GoogleMapsApiLoader } from "@googlemaps/js-api-loader";
import { Loader2 } from "lucide-react";

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(
  undefined,
);

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setLoadError(
        new Error(
          "Google Maps API key is not set. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.",
        ),
      );
      return;
    }

    const loader = new GoogleMapsApiLoader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((error) => {
        setLoadError(error);
      });
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }
  return context;
};

export const GoogleMapsLoader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoaded, loadError } = useGoogleMaps();

  if (loadError) {
    return (
      <div className="text-red-500 text-sm p-4 border border-red-300 rounded-md">
        {loadError.message}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          Loading Google Maps...
        </span>
      </div>
    );
  }

  return <>{children}</>;
};
