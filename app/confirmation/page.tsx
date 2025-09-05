'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getShopDetailsForCustomer, createBooking } from '@/lib/profile-actions'
import { useAuth } from '@/components/auth-provider'

interface Shop {
  id: string
  name: string
  services: Service[]
  barbers: Barber[]
}

interface Service {
  id: number
  name: string
  duration: number
  price: number
}

interface Barber {
  id: number
  name: string
}

export default function ConfirmationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [shop, setShop] = useState<Shop | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<boolean | null>(null)

  const shopId = searchParams.get('shop')
  const serviceIds = searchParams.get('services')?.split(',').map(Number) || []
  const barberId = Number(searchParams.get('barber'))
  const date = searchParams.get('date')
  const time = searchParams.get('time')

  useEffect(() => {
    const fetchShopData = async () => {
      if (!shopId) {
        setError('Shop ID is missing.')
        setIsLoading(false)
        return
      }
      try {
        const result = await getShopDetailsForCustomer(shopId)
        if (result.error || !result.shop) {
          throw new Error(result.error || 'Shop details not found.')
        }
        setShop(result.shop)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchShopData()
  }, [shopId])

  const selectedServices = shop?.services.filter(s => serviceIds.includes(s.id)) || []
  const selectedBarber = shop?.barbers.find(b => b.id === barberId)

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0)
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0)

  const handleConfirmBooking = async () => {
    if (!user || !shopId || !selectedBarber || selectedServices.length === 0 || !date || !time) {
      setError("Missing booking details. Please go back and select them.");
      return;
    }

    setIsBooking(true);
    setBookingSuccess(null);
    setError(null);

    try {
      const bookingDate = new Date(date).toISOString().split('T')[0]; // Format date to YYYY-MM-DD

      const result = await createBooking({
        customer_id: user.id,
        shop_id: shopId,
        barber_id: selectedBarber.id,
        service_ids: serviceIds,
        booking_date: bookingDate,
        booking_time: time,
        total_price: totalPrice,
        total_duration: totalDuration,
        customer_notes: "", // Optional: Add a field for notes if needed
      });

      if (result.error) {
        throw new Error(result.error);
      }
      setBookingSuccess(true);
    } catch (err: any) {
      setBookingSuccess(false);
      setError(err.message);
    } finally {
      setIsBooking(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h${m > 0 ? ` ${m}min` : ""}`
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (error && bookingSuccess === null) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card className='max-w-md w-full bg-card'>
          <CardHeader><CardTitle>Error</CardTitle></CardHeader>
          <CardContent className='p-6 text-center'>
            <p className='text-destructive mb-4'>{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!shop || !selectedBarber || selectedServices.length === 0 || !date || !time) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card className='max-w-md w-full bg-card'>
          <CardHeader><CardTitle>Missing Booking Details</CardTitle></CardHeader>
          <CardContent className='p-6 text-center'>
            <p className='text-destructive mb-4'>Some booking details are missing. Please go back and select them.</p>
            <Link href={`/customer/shop/${shopId}`}><Button>Back to Shop</Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <header className='bg-card shadow-sm border-b border-border'>
        <div className='max-w-6xl mx-auto px-4 py-4 flex items-center justify-between'>
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="OGGroom Logo" width={30} height={30} />
            <h1 className='text-xl font-semibold text-foreground'>Confirm Your Booking</h1>
          </div>
          <Link href={`/customer/shop/${shopId}`}><Button variant='outline'>Change Booking</Button></Link>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 py-6 space-y-6'>
        <Card className='shadow-lg bg-card'>
          <CardHeader><CardTitle>Booking Details</CardTitle></CardHeader>
          <CardContent className='space-y-4'>
            <p><strong>Shop:</strong> {shop.name}</p>
            <div>
              <h4 className='font-medium text-foreground mb-1'>Selected Services:</h4>
              <ul className='list-disc list-inside pl-1 space-y-1 text-sm text-muted-foreground'>
                {selectedServices.map(s => (
                  <li key={s.id}>{s.name} (₹{s.price.toFixed(2)}) - {formatDuration(s.duration)}</li>
                ))}
              </ul>
            </div>
            <p><strong>Barber:</strong> {selectedBarber.name}</p>
            <p><strong>Date:</strong> {new Date(date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {time}</p>
            <div className='border-t border-border pt-3 mt-3 space-y-1'>
              <p className='flex justify-between text-sm'><span>Total Estimated Duration:</span><span className='font-medium'>{formatDuration(totalDuration)}</span></p>
              <p className='flex justify-between text-lg font-semibold'><span>Total Price:</span><span>₹{totalPrice.toFixed(2)}</span></p>
            </div>
          </CardContent>
        </Card>

        {bookingSuccess === true && (
          <Card className='shadow-lg border-green-500 bg-green-50/10'>
            <CardContent className='p-6 flex flex-col items-center text-center gap-4'>
              <CheckCircle className='h-10 w-10 text-green-500' />
              <div>
                <h3 className='text-xl font-semibold text-green-500'>Booking Confirmed!</h3>
                <p className='text-green-500/80 mt-1'>Your appointment has been successfully scheduled.</p>
              </div>
              <Link href="/customer/home">
                <Button className='mt-2'>Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {bookingSuccess === false && (
          <Card className='shadow-lg border-destructive bg-destructive/10'>
            <CardContent className='p-4 flex items-center gap-3'>
              <XCircle className='h-6 w-6 text-destructive' />
              <p className='text-destructive-foreground font-medium'>{error || 'Booking failed. Please try again.'}</p>
            </CardContent>
          </Card>
        )}

        <Button onClick={handleConfirmBooking} className='w-full py-3 text-lg' disabled={isBooking || bookingSuccess !== null}>
          {isBooking ? (
            <><Loader2 className='h-5 w-5 mr-2 animate-spin' />Confirming...</>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </main>
    </div>
  )
}
