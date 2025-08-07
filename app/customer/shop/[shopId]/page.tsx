'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Clock, Loader2, Star, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getShopDetailsForCustomer } from '@/lib/profile-actions'

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
  services: Service[]
  barbers: Barber[]
}

interface Service {
  id: number
  name: string
  duration: number
  price: number
  description: string
}

interface Barber {
  id: number
  name: string
  specialties: string[]
  rating: number
  experience: string
  phone: string
  email: string
}

export default function ShopDetailsPage() {
  const params = useParams()
  const shopId = params.shopId as string
  const [shop, setShop] = useState<Shop | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShopDetails = async () => {
      if (!shopId) return
      try {
        setIsLoading(true)
        const result = await getShopDetailsForCustomer(shopId)
        if (result.error) {
          throw new Error(result.error)
        }
        setShop(result.shop)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchShopDetails()
  }, [shopId])

  if (isLoading) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <Card className='max-w-md w-full'>
          <CardHeader><CardTitle>Error</CardTitle></CardHeader>
          <CardContent className='p-6 text-center'>
            <p className='text-red-600 mb-4'>{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <Card className='max-w-md w-full'>
          <CardContent className='p-6 text-center'>
            <p className='text-red-600 mb-4'>Shop not found.</p>
            <Link href='/customer/shop'><Button>Back to Shops</Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-6xl mx-auto px-4 py-4 flex items-center justify-between'>
          <h1 className='text-xl font-semibold text-gray-900'>{shop.name}</h1>
          <Link href='/customer/shop'><Button variant='outline'>Back to Shops</Button></Link>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 py-6 space-y-6'>
        {/* Shop Details */}
        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle>{shop.name}</CardTitle>
            <CardDescription>{shop.type}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <p className='flex items-center text-sm text-gray-600'><MapPin className='h-4 w-4 mr-2' />{shop.address}</p>
            <p className='flex items-center text-sm text-gray-600'><Phone className='h-4 w-4 mr-2' />{shop.phone}</p>
            <p className='flex items-center text-sm text-gray-600'><Mail className='h-4 w-4 mr-2' />{shop.email}</p>
            <p className='flex items-center text-sm text-gray-600'><Clock className='h-4 w-4 mr-2' />{shop.opening_time} - {shop.closing_time}</p>
          </CardContent>
        </Card>

        {/* Services Offered */}
        <Card className='shadow-lg'>
          <CardHeader><CardTitle>Services Offered</CardTitle></CardHeader>
          <CardContent>
            {shop.services.length === 0 ? (
              <p>No services available for this shop.</p>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {shop.services.map(service => (
                  <div key={service.id} className='p-4 border rounded-lg'>
                    <h3 className='font-semibold'>{service.name}</h3>
                    <p className='text-sm text-gray-600 mt-1'>{service.description}</p>
                    <div className='flex items-center gap-4 mt-2 text-sm text-gray-500'>
                      <span><Clock className='h-3 w-3 inline mr-1' />{service.duration} min</span>
                      <span><DollarSign className='h-3 w-3 inline mr-1' />${service.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="w-full text-center mt-6">
          <Link href={`/customer/shop/${shop.id}/book`}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg py-3">
              Book Now
            </Button>
          </Link>
        </div>

        {/* Barbers at this Shop */}
        <Card className='shadow-lg'>
          <CardHeader><CardTitle>Barbers</CardTitle></CardHeader>
          <CardContent>
            {shop.barbers.length === 0 ? (
              <p>No barbers available at this shop.</p>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {shop.barbers.map(barber => (
                  <div key={barber.id} className='p-4 border rounded-lg'>
                    <h3 className='font-semibold'>{barber.name}</h3>
                    <p className='text-sm text-gray-600'>{barber.experience} experience</p>
                    <div className='flex items-center gap-1 mt-1'><Star className='h-3 w-3 fill-yellow-400 text-yellow-400' /><span className='text-sm'>{barber.rating}</span></div>
                    <div className='flex flex-wrap gap-1 mt-2'>{barber.specialties.map((s, i) => <Badge key={i} variant='secondary' className='text-xs'>{s}</Badge>)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
