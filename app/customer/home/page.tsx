"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Bell,
  Search,
  Filter,
  Heart,
  MessageSquare,
  Repeat,
  Scissors,
  User,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getAvailableShops, getUpcomingBookings, getPreviousBookings, getShopDetailsForCustomer } from "@/lib/profile-actions"
import { useAuth } from "@/components/auth-provider"

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
}

interface Service {
  id: number
  name: string
  duration: number
  price: number
  description: string
}

interface Booking {
  id: number
  shop: { name: string }
  barber: { name: string }
  service_ids: number[] // Now an array of IDs
  booking_date: string
  booking_time: string
  status: string
}

export default function CustomerHomeScreen() {
  const { user } = useAuth()
  const [shops, setShops] = useState<Shop[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [previousBookings, setPreviousBookings] = useState<Booking[]>([])
  const [allServices, setAllServices] = useState<Service[]>([]) // To store all services for lookup
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true)
        // Fetch shops
        const shopsResult = await getAvailableShops()
        if (shopsResult.error) {
          throw new Error(shopsResult.error)
        }
        setShops(shopsResult.shops || [])

        // Fetch all services (assuming a way to get all services, or fetch per shop as needed)
        // For simplicity, let's assume we can get all services from one of the shops for now
        // In a real app, you might have a dedicated function to get all services or fetch them per shop
        if (shopsResult.shops && shopsResult.shops.length > 0) {
          const shopDetailsResult = await getShopDetailsForCustomer(shopsResult.shops[0].id);
          if (shopDetailsResult.shop) {
            setAllServices(shopDetailsResult.shop.services || []);
          }
        }

        // Fetch upcoming bookings
        const upcomingResult = await getUpcomingBookings(user.id)
        if (upcomingResult.error) {
          throw new Error(upcomingResult.error)
        }
        setUpcomingBookings(upcomingResult.bookings || [])

        // Fetch previous bookings
        const previousResult = await getPreviousBookings(user.id)
        if (previousResult.error) {
          throw new Error(previousResult.error)
        }
        setPreviousBookings(previousResult.bookings || [])

      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [user])

  // Helper to get service names from IDs
  const getServiceNames = (serviceIds: number[]) => {
    return serviceIds.map(id => allServices.find(s => s.id === id)?.name || 'Unknown Service').join(", ");
  };

  // favoriteShops will now be dynamic or show a message if no favorites are implemented
  const favoriteShops: Shop[] = [] // Placeholder for now, as favoriting is not implemented

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-600">Loading data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader><CardTitle>Error</CardTitle></CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Failed to load data: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header - Styled like Hero Page Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Scissors className="h-7 w-7 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">OGGroom</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Link href="/customer/profile">
              <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search salons, services, or locations..." className="pl-10 bg-white" />
            </div>
            <Button variant="outline" className="bg-white">
              <Filter className="h-4 w-4 mr-2 text-blue-600" />
              Filters
            </Button>
          </div>
        </section>

        {/* Appointments Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Appointments</h2>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-200/70">
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="previous" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Previous
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="mt-6">
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>{booking.shop.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-800">{booking.shop.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {getServiceNames(booking.service_ids)} with {booking.barber.name}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-blue-600" />
                                {new Date(booking.booking_date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-blue-600" />
                                {booking.booking_time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                          <Badge className="bg-blue-100 text-blue-700 self-start sm:self-center">
                            {booking.status}
                          </Badge>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-none border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-none border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
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
                <Card className="text-center py-10 bg-white">
                  <CardContent>
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-muted-foreground">No upcoming appointments</p>
                    <Link href="/customer/shop" className="mt-4 inline-block">
                      <Button className="bg-blue-600 hover:bg-blue-700">Browse Salons</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="previous" className="mt-6">
              {previousBookings.length > 0 ? (
                <div className="space-y-4">
                  {previousBookings.map((booking) => (
                    <Card key={booking.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>{booking.shop.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-800">{booking.shop.name}</p>
                            <p className="text-sm text-muted-foreground">{getServiceNames(booking.service_ids)}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(booking.booking_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                          >
                            <Repeat className="h-4 w-4 mr-2" />
                            Book Again
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
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
                <Card className="text-center py-10 bg-white">
                  <CardContent>
                    <Clock className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-muted-foreground">No previous appointments found.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* Favourite Shops Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Favourite Shops</h2>
          {favoriteShops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteShops.map((shop) => (
                <Card key={shop.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="w-16 h-16 rounded-lg">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{shop.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{shop.name}</h3>
                      <p className="text-sm text-muted-foreground">{shop.type}</p>
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                        <span className="text-gray-700">{shop.rating}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                      <Heart className="h-5 w-5 fill-current" />
                      <span className="sr-only">Remove from favourites</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-10 bg-white">
              <CardContent>
                <Heart className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-muted-foreground">You haven't added any favourite shops yet.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Nearby Shops Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Nearby Salons & Barbershops</h2>
            <Link href="/customer/shop">
              <Button variant="link" className="text-blue-600 hover:text-blue-700">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shops.length === 0 ? (
              <Card className="text-center py-10 bg-white w-full">
                <CardContent>
                  <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No nearby shops found. Try adjusting your location or search filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              shops.map((shop) => (
                <Card key={shop.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-start gap-4">
                    <Avatar className="w-20 h-20 rounded-lg">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{shop.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{shop.name}</h3>
                          <p className="text-sm text-muted-foreground">{shop.type}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
                              {/* Placeholder for rating and reviews */}
                              4.5 (100 reviews)
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-blue-600" />
                              {/* Placeholder for distance */}
                              0.5 km
                            </span>
                          </div>
                        </div>
                        <Link href={`/customer/shop/${shop.id}`}>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 mt-1">
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
      <footer className="py-8 bg-slate-800 text-slate-400 border-t border-slate-700">
        <div className="container text-center">
          <p>&copy; {new Date().getFullYear()} OGGroom. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}