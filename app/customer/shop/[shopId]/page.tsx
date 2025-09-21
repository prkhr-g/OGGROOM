"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Loader2,
  Star,
  DollarSign,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedTabsContent } from "@/components/ui/animated-tabs-content";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { GoogleMapsProvider } from "@/components/google-maps-loader";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getShopDetailsForCustomer } from "@/lib/profile-actions";

const GoogleMapDisplay = dynamic(
  () =>
    import("@/components/ui/google-map-display").then(
      (mod) => mod.GoogleMapDisplay,
    ),
  {
    ssr: false,
    loading: () => <Loader2 className="h-8 w-8 animate-spin text-primary" />,
  },
);

interface Shop {
  id: string;
  name: string;
  type: string;
  address: string;
  is_open: boolean;
  opening_time: string;
  closing_time: string;
  shop_latitude: number | null;
  shop_longitude: number | null;
  services: Service[];
  barbers: Barber[];
}

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string;
}

interface Barber {
  id: number;
  name: string;
  specialties: string[];
  experience: string;
}

interface Review {
  id: number;
  rating: number;
  feedback: string;
  created_at: string;
}

export default function ShopDetailsPage() {
  const params = useParams();
  const shopId = params.shopId as string;
  const [shop, setShop] = useState<Shop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchShopDetails = async () => {
      if (!shopId) return;
      try {
        setIsLoading(true);
        const result = await getShopDetailsForCustomer(shopId);
        if (result.error) {
          throw new Error(result.error);
        }
        setShop(result.shop);

        const reviewsResponse = await fetch(
          `/api/customer/shops/${shopId}/reviews`,
        );
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShopDetails();
  }, [shopId]);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, review) => acc + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "N/A";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full bg-card">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full bg-card">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Shop not found.</p>
            <Link href="/customer/shop">
              <Button>Back to Shops</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">{shop.name}</h1>
          <Link href="/customer/shop">
            <Button variant="outline">Back to Shops</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Shop Details */}
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{shop.name}</CardTitle>
                <CardDescription>{shop.type}</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-bold">{averageRating}</span>
                <span className="text-sm text-muted-foreground">
                  ({reviews.length} reviews)
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsMapVisible(!isMapVisible)}
                className="flex items-center text-sm text-muted-foreground text-left hover:text-primary transition-colors"
              >
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{shop.address}</span>
              </button>
              {shop.shop_latitude && shop.shop_longitude && !isMapVisible && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMapVisible(true)}
                  className="ml-4 flex-shrink-0"
                >
                  View on Map
                </Button>
              )}
            </div>

            <p className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              {shop.opening_time} - {shop.closing_time}
            </p>
          </CardContent>
        </Card>

        {/* Shop Location Map */}
        <AnimatePresence>
          {isMapVisible && shop.shop_latitude && shop.shop_longitude && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="shadow-lg bg-card">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Location</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMapVisible(false)}
                    >
                      Hide Map
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <GoogleMapsProvider>
                    <GoogleMapDisplay
                      latitude={shop.shop_latitude}
                      longitude={shop.shop_longitude}
                      shopName={shop.name}
                    />
                  </GoogleMapsProvider>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs
          defaultValue="services"
          className="w-full"
          ref={tabsRef}
          onValueChange={() => {
            tabsRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>
          <AnimatedTabsContent value="services">
            <Card className="shadow-lg bg-card">
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                {shop.services.length === 0 ? (
                  <p>No services available for this shop.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shop.services.map((service) => (
                      <div
                        key={service.id}
                        className="p-4 border border-border rounded-lg"
                      >
                        <h3 className="font-semibold text-foreground">
                          {service.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {service.duration} min
                          </span>
                          <span>₹{service.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-lg bg-card mt-6">
              <CardHeader>
                <CardTitle>Staffs</CardTitle>
              </CardHeader>
              <CardContent>
                {shop.barbers.length === 0 ? (
                  <p>No staffs available at this shop.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shop.barbers.map((barber) => (
                      <div
                        key={barber.id}
                        className="p-4 border border-border rounded-lg"
                      >
                        <h3 className="font-semibold text-foreground">
                          {barber.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {barber.experience} experience
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {barber.specialties.map((s, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedTabsContent>
          <AnimatedTabsContent value="reviews">
            <Card className="shadow-lg bg-card">
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p>No reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${review.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                        <p className="mt-1">{review.feedback}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedTabsContent>
          <AnimatedTabsContent value="policies">
            <Card className="shadow-lg bg-card">
              <CardHeader>
                <CardTitle>Shop Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold">Cancellation Policy</h3>
                  <p className="text-muted-foreground">policy1</p>
                </div>
                <div>
                  <h3 className="font-bold">Late Arrival Policy</h3>
                  <p className="text-muted-foreground">policy2</p>
                </div>
                <div>
                  <h3 className="font-bold">No-Show Policy</h3>
                  <p className="text-muted-foreground">policy3</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedTabsContent>
        </Tabs>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Link href={`/customer/shop/${shop.id}/book`} className="w-full">
            <Button size="lg" className="w-full text-lg py-3">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
