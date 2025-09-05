'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin, Clock, Loader2, ArrowLeft, Filter } from 'lucide-react'
import Link from 'next/link'
import { getAvailableShops, getCustomerProfile, getNearbyShops } from '@/lib/profile-actions'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
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
  distance_meters?: number
}

export default function ShopBrowserPage() {
  const { user } = useAuth()
  const [shops, setShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [hasLocation, setHasLocation] = useState(false);

  const [filters, setFilters] = useState({
    shopTypes: [] as string[],
    openNow: false,
    distance: 20, // default 20km
  });

  useEffect(() => {
    const fetchShops = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true)
        const customerProfileResult = await getCustomerProfile(user.id);
        let fetchedShops: Shop[] = [];

        if (customerProfileResult.profile && customerProfileResult.profile.latitude && customerProfileResult.profile.longitude) {
          setHasLocation(true);
          const nearbyShopsResult = await getNearbyShops(customerProfileResult.profile.latitude, customerProfileResult.profile.longitude, 50000000); // 50,000 km radius to get all shops with distance
          if (nearbyShopsResult.error) {
            throw new Error(nearbyShopsResult.error);
          }
          fetchedShops = nearbyShopsResult.shops || [];
        } else {
          setHasLocation(false);
          const result = await getAvailableShops()
          if (result.error) {
            throw new Error(result.error)
          }
          fetchedShops = result.shops || [];
        }
        setShops(fetchedShops)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchShops()
  }, [user])

  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      const shopTypesMatch = filters.shopTypes.length === 0 || filters.shopTypes.includes(shop.type);

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const openingTimeParts = shop.opening_time.split(':');
      const openingMinutes = parseInt(openingTimeParts[0]) * 60 + parseInt(openingTimeParts[1]);

      const closingTimeParts = shop.closing_time.split(':');
      const closingMinutes = parseInt(closingTimeParts[0]) * 60 + parseInt(closingTimeParts[1]);

      const openNowMatch = !filters.openNow || (shop.is_open && openingMinutes <= currentMinutes && closingMinutes >= currentMinutes);

      const distanceMatch = !hasLocation || !shop.distance_meters || (shop.distance_meters / 1000) <= filters.distance;

      return shopTypesMatch && openNowMatch && distanceMatch;
    });
  }, [shops, filters, hasLocation]);

  const handleShopTypeChange = (type: string) => {
    setFilters(prevFilters => {
      const newShopTypes = prevFilters.shopTypes.includes(type)
        ? prevFilters.shopTypes.filter(t => t !== type)
        : [...prevFilters.shopTypes, type];
      return { ...prevFilters, shopTypes: newShopTypes };
    });
  };

  const handleOpenNowChange = (checked: boolean) => {
    setFilters(prevFilters => ({ ...prevFilters, openNow: checked }));
  };

  const handleDistanceChange = (value: number[]) => {
    setFilters(prevFilters => ({ ...prevFilters, distance: value[0] }));
  };


  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card className='max-w-md w-full bg-card'>
          <CardHeader><CardTitle>Error</CardTitle></CardHeader>
          <CardContent className='p-6 text-center'>
            <p className='text-destructive mb-4'>{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <header className='bg-card shadow-sm border-b border-border'>
        <div className='max-w-6xl mx-auto px-4 py-4 flex items-center justify-between'>
            <div className="flex items-center gap-4">
                <Link href="/customer/home" passHref>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>
                <h1 className='text-xl font-semibold text-foreground'>Browse Shops</h1>
            </div>
            <Drawer>
                <DrawerTrigger asChild>
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Filter Shops</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Shop Type</h3>
                            <div className="space-y-2">
                                {['barbershop', 'salon', 'spa', 'unisex'].map(type => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={type} 
                                            checked={filters.shopTypes.includes(type)} 
                                            onCheckedChange={() => handleShopTypeChange(type)} 
                                        />
                                        <Label htmlFor={type} className="capitalize">{type}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Availability</h3>
                            <div className="flex items-center space-x-2">
                                <Switch id="open-now" checked={filters.openNow} onCheckedChange={handleOpenNowChange} />
                                <Label htmlFor="open-now">Open Now</Label>
                            </div>
                        </div>
                        {hasLocation && (
                            <div>
                                <h3 className="font-semibold mb-2">Distance</h3>
                                <div className="flex items-center justify-between">
                                    <Label>Max: {filters.distance} km</Label>
                                </div>
                                <Slider 
                                    defaultValue={[20]} 
                                    max={20} 
                                    step={2} 
                                    onValueChange={handleDistanceChange} 
                                />
                            </div>
                        )}
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 py-6 space-y-6'>
        {filteredShops.length === 0 ? (
          <p className='text-center text-muted-foreground'>No shops match your filters.</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredShops.map(shop => (
              <Card key={shop.id} className='shadow-lg bg-card'>
                <CardHeader>
                  <CardTitle>{shop.name}</CardTitle>
                  <CardDescription>{shop.type}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <div className="flex justify-between">
                    <p className='flex items-center text-sm text-muted-foreground'><MapPin className='h-4 w-4 mr-2' />{shop.address}</p>
                    {shop.distance_meters && <p>{(shop.distance_meters / 1000).toFixed(1)} km</p>}
                  </div>
                  <p className='flex items-center text-sm text-muted-foreground'><Phone className='h-4 w-4 mr-2' />{shop.phone}</p>
                  <p className='flex items-center text-sm text-muted-foreground'><Mail className='h-4 w-4 mr-2' />{shop.email}</p>
                  <p className='flex items-center text-sm text-muted-foreground'><Clock className='h-4 w-4 mr-2' />{shop.opening_time} - {shop.closing_time}</p>
                  <Button asChild className='w-full mt-4'>
                    <Link href={`/customer/shop/${shop.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}