'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Bell,
  Search,
  MessageSquare,
  Repeat,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useMemo } from "react"
import { getAllData, getCustomerProfile, getNearbyShops, getAvailableShops } from "@/lib/profile-actions"
import { getUpcomingBookings, getPreviousBookings } from "@/lib/booking-actions"
import { useAuth } from "@/components/auth-provider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Shop {
  id: string
  name: string
  type: string
  email: string
  phone: string
  address: string
  is_open: boolean
  opening_time: string
  closing_time: string
  shop_latitude?: number;
  shop_longitude?: number;
  distance_meters?: number;
  average_rating?: number;
}

interface Service {
  id: number
  shop_id: string
  name: string
  duration: number
  price: number
  description: string
}

interface Booking {
  id: number
  shops: { id: string; name: string } | null
  barber: { name: string } | null
  services: Service[]
  booking_date: string
  booking_time: string
  status: string
}

function ReviewDialog({ booking, isOpen, onOpenChange, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(booking.id, rating, feedback);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>Rate your experience at {booking?.shops?.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 cursor-pointer ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomerHomeScreen() {
  const { user } = useAuth()
  const [nearbyShops, setNearbyShops] = useState<Shop[]>([])
  const [allShops, setAllShops] = useState<Shop[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [previousBookings, setPreviousBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customerLocationError, setCustomerLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchDataLoaded, setIsSearchDataLoaded] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setCustomerLocationError(null);

        const [customerProfileResult, upcomingResult, previousResult] = await Promise.all([
          getCustomerProfile(user.id),
          getUpcomingBookings(),
          getPreviousBookings(),
        ]);

        if (customerProfileResult.error) {
          setCustomerLocationError("Failed to load customer profile for location: " + customerProfileResult.error);
          const shopsResult = await getAvailableShops();
          if (shopsResult.error) throw new Error(shopsResult.error);
          setNearbyShops(shopsResult.shops || []);
        } else if (customerProfileResult.profile && customerProfileResult.profile.latitude && customerProfileResult.profile.longitude) {
          const nearbyShopsResult = await getNearbyShops(customerProfileResult.profile.latitude, customerProfileResult.profile.longitude);
          if (nearbyShopsResult.error) {
            setCustomerLocationError("Failed to fetch nearby shops: " + nearbyShopsResult.error);
            const shopsResult = await getAvailableShops();
            if (shopsResult.error) throw new Error(shopsResult.error);
            setNearbyShops(shopsResult.shops || []);
          } else {
            setNearbyShops(nearbyShopsResult.shops || []);
          }
        } else {
          setCustomerLocationError("Your location is not set. Please update your profile to see nearby shops.");
          const shopsResult = await getAvailableShops();
          if (shopsResult.error) throw new Error(shopsResult.error);
          setNearbyShops(shopsResult.shops || []);
        }

        if (upcomingResult.error) throw new Error(upcomingResult.error);
        setUpcomingBookings(upcomingResult.bookings || []);

        if (previousResult.error) throw new Error(previousResult.error);
        setPreviousBookings(previousResult.bookings || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [user]);

  const loadSearchData = async () => {
    if (isSearchDataLoaded) return;
    setIsSearchLoading(true);
    try {
      const allDataResult = await getAllData();
      if (allDataResult.error) throw new Error(allDataResult.error);
      setAllShops(allDataResult.shops || []);
      setAllServices(allDataResult.services || []);
      setIsSearchDataLoaded(true);
    } catch (err: any) {
      setError("Failed to load search data: " + err.message);
    } finally {
      setIsSearchLoading(false);
    }
  };

  const searchResults = useMemo(() => {
    if (!searchQuery) {
      return [];
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return allShops.filter(shop => {
      if (shop.name.toLowerCase().includes(lowercasedQuery)) return true;
      if (shop.address.toLowerCase().includes(lowercasedQuery)) return true;
      const shopServices = allServices.filter(service => service.shop_id === shop.id);
      if (shopServices.some(service => service.name.toLowerCase().includes(lowercasedQuery))) return true;
      return false;
    });
  }, [searchQuery, allShops, allServices]);

  useEffect(() => {
    if (searchQuery && searchResults.length > 0) {
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  }, [searchQuery, searchResults]);

  const handleReviewSubmit = async (booking_id: number, rating: number, feedback: string) => {
    const response = await fetch('/api/customer/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id, rating, feedback }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      setError(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader><CardTitle>Error</CardTitle></CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-destructive-foreground mb-4">Failed to load data: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header - Styled like Hero Page Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="OGGroom Logo" width={40} height={40} />
            <span className="text-2xl font-bold text-foreground">OGGroom</span>
          </Link>
          <div className="flex items-center gap-3">
            
            <Link href="/customer/profile">
              <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User Avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 space-y-8">
        {/* Search Section - Kept for functionality */}
        <section>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search salons, services, or locations..." 
                      className="pl-10 bg-card" 
                      value={searchQuery}
                      onFocus={loadSearchData}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-60 overflow-y-auto">
                  {isSearchLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map(shop => (
                        <Link key={shop.id} href={`/customer/shop/${shop.id}`} className="block">
                          <div className="p-2 hover:bg-accent rounded-md">
                            <p className="font-semibold">{shop.name}</p>
                            <p className="text-sm text-muted-foreground">{shop.address}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No results found.</p>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </section>

        {/* Appointments Section */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">My Appointments</h2>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="previous" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Previous
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="mt-6">
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id} className="bg-card shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>{booking.shops?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{booking.shops?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.services.map(s => s.name).join(', ')} with {booking.barber?.name || 'N/A'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-primary" />
                                {new Date(booking.booking_date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-primary" />
                                {booking.booking_time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                          <Badge>
                            {booking.status}
                          </Badge>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-none"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-none"
                            >
                              Reschedule
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-10 bg-card">
                  <CardContent>
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No upcoming appointments</p>
                    <Link href="/customer/shop" className="mt-4 inline-block">
                      <Button>Browse Salons</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="previous" className="mt-6">
              {selectedBookingForReview && <ReviewDialog
                booking={selectedBookingForReview}
                isOpen={isReviewDialogOpen}
                onOpenChange={setIsReviewDialogOpen}
                onSubmit={handleReviewSubmit}
              />}
              {previousBookings.length > 0 ? (
                <div className="space-y-4">
                  {previousBookings.map((booking) => (
                    <Card key={booking.id} className="bg-card shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>{booking.shops?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{booking.shops?.name}</p>
                            <p className="text-sm text-muted-foreground">{booking.services.map(s => s.name).join(', ')}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(booking.booking_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                          {booking.shops && <Link href={`/customer/shop/${booking.shops.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-none"
                            >
                              <Repeat className="h-4 w-4 mr-2" />
                              Book Again
                            </Button>
                          </Link>}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none"
                            onClick={() => {
                              setSelectedBookingForReview(booking);
                              setIsReviewDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Leave Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-10 bg-card">
                  <CardContent>
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No previous appointments found.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* Nearby Shops Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-foreground">Nearby Salons & Barbershops</h2>
            <Link href="/customer/shop">
              <Button variant="link">
                View All
              </Button>
            </Link>
          </div>
          {customerLocationError && (
            <div className="p-3 mb-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
              {customerLocationError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyShops.length === 0 ? (
              <Card className="text-center py-10 bg-card w-full">
                <CardContent>
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No nearby shops found. Try adjusting your location or search filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              nearbyShops.map((shop) => (
                <Card key={shop.id} className="bg-card shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-start gap-4">
                    <Avatar className="w-20 h-20 rounded-lg">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{shop.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{shop.name}</h3>
                          <p className="text-sm text-muted-foreground">{shop.type}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
                              {shop.average_rating?.toFixed(1) ?? 'N/A'}
                            </span>
                            {shop.distance_meters !== undefined && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-primary" />
                                {`${(shop.distance_meters / 1000).toFixed(1)} km`}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link href={`/customer/shop/${shop.id}`}>
                          <Button size="sm" className="mt-1">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
      {/* Footer - Consistent with Hero Page */}
      <footer className="py-8 bg-muted text-muted-foreground border-t border-border">
        <div className="container text-center">
          <p>&copy; {new Date().getFullYear()} OGGroom. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}