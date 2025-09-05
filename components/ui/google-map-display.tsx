"use client"

import React, { useRef, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useGoogleMaps } from "@/components/google-maps-loader"

interface GoogleMapDisplayProps {
  latitude: number
  longitude: number
  shopName?: string
  zoom?: number
}

export const GoogleMapDisplay: React.FC<GoogleMapDisplayProps> = ({
  latitude,
  longitude,
  shopName = "Shop Location",
  zoom = 15,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const { isLoaded, loadError } = useGoogleMaps()

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      const mapOptions = {
        center: { lat: latitude, lng: longitude },
        zoom: zoom,
      }
      const map = new window.google.maps.Map(mapRef.current, mapOptions)

      new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: shopName,
      })
    }
  }, [isLoaded, latitude, longitude, zoom, shopName])

  if (loadError) {
    return <div className="text-red-500 text-sm p-4 border border-red-300 rounded-md">{loadError}</div>
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading Map...</span>
      </div>
    )
  }

  return <div ref={mapRef} style={{ height: "400px", width: "100%" }} className="rounded-md" />
}