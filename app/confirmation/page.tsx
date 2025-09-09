'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getShopDetailsForCustomer, createBooking } from '@/lib/profile-actions'
import { AuthProvider, useAuth } from '@/components/auth-provider'

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

function ConfirmationPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [shop, setShop] = useState<Shop | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<boolean | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null); // 'pay_now' or 'pay_after_service'
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null); // New state for payment status

  const shopId = searchParams.get('shop')
  const serviceIds = searchParams.get('services')?.split(',').map(Number) || []
  const barberId = Number(searchParams.get('barber'))
  const date = searchParams.get('date')
  const time = searchParams.get('time')
  const statusParam = searchParams.get('status'); // New: to check for payment callback
  const bookingIdParam = searchParams.get('bookingId'); // New: to get booking ID from callback

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

    const handlePaymentCallback = async () => {
      if (statusParam === 'payment_callback' && bookingIdParam) {
        setIsLoading(true);
        setPaymentStatus('pending');
        try {
          // Verify payment status with backend
          const response = await fetch('/api/cashfree/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: bookingIdParam }),
          });
          const data = await response.json();

          if (response.ok && data.success && data.paymentStatus === 'PAID') {
            setPaymentStatus('success');

            // Re-calculate derived values here to ensure they are up-to-date with the current 'shop' state
            const currentSelectedServices = shop?.services.filter(s => serviceIds.includes(s.id)) || [];
            const currentSelectedBarber = shop?.barbers.find(b => b.id === barberId);
            const currentTotalPrice = currentSelectedServices.reduce((sum, service) => sum + service.price, 0);
            const currentTotalDuration = currentSelectedServices.reduce((sum, service) => sum + service.duration, 0);

            if (!currentSelectedBarber) {
              throw new Error("Barber details missing for booking confirmation.");
            }

            // Now that payment is confirmed, create the booking
            const bookingDate = new Date(date).toISOString().split('T')[0];
            const result = await createBooking({
              customer_id: user.id,
              shop_id: shopId,
              barber_id: currentSelectedBarber.id,
              service_ids: serviceIds,
              booking_date: bookingDate,
              booking_time: time,
              total_price: currentTotalPrice,
              total_duration: currentTotalDuration,
              customer_notes: "",
            });

            if (result.error) {
              throw new Error(result.error);
            }
            setBookingSuccess(true);
          } else {
            setPaymentStatus('failed');
            setBookingSuccess(false);
            setError(data.message || 'Payment failed or was not completed.');
          }
        } catch (err: any) {
          setPaymentStatus('failed');
          setBookingSuccess(false);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (statusParam === 'payment_callback') {
      // If it's a payment callback, ensure shop data is loaded before proceeding
      if (shop) {
        handlePaymentCallback();
      } else {
        // If shop data is not yet loaded, fetch it first
        fetchShopData();
      }
    } else {
      fetchShopData();
    }
  }, [shopId, statusParam, bookingIdParam, user, date, time, createBooking, shop, serviceIds, barberId]);

  

  const handleConfirmBooking = async () => {
    if (!user || !shopId || !selectedBarber || selectedServices.length === 0 || !date || !time) {
      setError("Missing booking details. Please go back and select them.");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    setIsBooking(true);
    setBookingSuccess(null);
    setError(null);

    try {
      if (paymentMethod === 'pay_now') {
        // Store booking details temporarily before redirecting to payment gateway
        // In a real app, you might store this in local storage or a session
        // For this example, we'll pass them via URL params for simplicity
        const bookingDetailsForPayment = {
          shopId,
          serviceIds,
          barberId,
          date,
          time,
          totalPrice,
          totalDuration,
          customerId: user.id,
          customerEmail: user.email,
          customerPhone: user.phone, // Assuming user.phone exists
        };
        // Encode booking details to pass in returnUrl
        const encodedBookingDetails = btoa(JSON.stringify(bookingDetailsForPayment));

        // Call backend API to initiate Cashfree payment
        const response = await fetch('/api/cashfree/initiate-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderDetails: {
              orderId: `booking_${Date.now()}`, // Unique order ID
              amount: totalPrice,
              currency: 'INR', // Assuming INR, adjust as needed
              customerDetails: {
                customerId: user.id,
                customerEmail: user.email,
                customerPhone: user.phone, // Assuming user.phone exists
              },
              // Pass booking details back to confirmation page after payment
              returnUrl: `${window.location.origin}/confirmation?status=payment_callback&bookingId=${Date.now()}&bookingDetails=${encodedBookingDetails}`,
            },
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Redirect to Cashfree payment gateway
          window.location.href = data.payment_link;
        } else {
          throw new Error(data.error || 'Failed to initiate Cashfree payment.');
        }
      } else if (paymentMethod === 'pay_after_service') {
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
      }
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
        {paymentStatus === 'pending' && <p className='mt-2 text-muted-foreground'>Verifying payment...</p>}
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

  if (paymentStatus === 'failed') {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card className='max-w-md w-full bg-card'>
          <CardHeader><CardTitle>Payment Failed</CardTitle></CardHeader>
          <CardContent className='p-6 flex flex-col items-center text-center gap-4'>
            <XCircle className='h-10 w-10 text-destructive' />
            <p className='text-destructive-foreground mt-1'>{error || 'Your payment could not be processed. Please try again.'}</p>
            <Button onClick={() => router.back()}>Retry Payment</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedServices = shop?.services.filter(s => serviceIds.includes(s.id)) || []
  const selectedBarber = shop?.barbers.find(b => b.id === barberId)

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0)
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0)

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

        <Card className='shadow-lg bg-card'>
          <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
          <CardContent>
            <RadioGroup onValueChange={setPaymentMethod} value={paymentMethod || ""} className="grid grid-cols-2 gap-4">
              <Label
                htmlFor="pay_now"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem id="pay_now" value="pay_now" className="sr-only" />
                <span className="mb-3 text-lg font-semibold">Pay Now</span>
                <p className="text-sm text-muted-foreground text-center">Complete payment immediately via Cashfree.</p>
              </Label>
              <Label
                htmlFor="pay_after_service"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem id="pay_after_service" value="pay_after_service" className="sr-only" />
                <span className="mb-3 text-lg font-semibold">Pay After Service</span>
                <p className="text-sm text-muted-foreground text-center">Pay at the shop after your service is completed.</p>
              </Label>
            </RadioGroup>
            {!paymentMethod && <p className="text-destructive text-sm mt-2">Please select a payment method.</p>}
          </CardContent>
        </Card>

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

export default function ConfirmationPageWithAuth() {
  return (
    <AuthProvider>
      <ConfirmationPageContent />
    </AuthProvider>
  )
}
