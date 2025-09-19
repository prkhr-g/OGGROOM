'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { getShopDetailsForCustomer, createBooking, getCustomerProfile } from '@/lib/profile-actions'
import { AuthProvider, useAuth } from '@/components/auth-provider'

// This component handles the verification status display
function ConfirmationStatus() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      // This is not a return from payment, so do nothing.
      return;
    }

    const verify = async () => {
      setPaymentStatus('pending');
      try {
        const response = await fetch('/api/cashfree/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setPaymentStatus('success');
        } else {
          setPaymentStatus('failed');
          setError(data.error || 'Payment verification failed.');
        }
      } catch (err: any) {
        setPaymentStatus('failed');
        setError(err.message);
      }
    };

    verify();
  }, [orderId]);

  if (!orderId) return null; // Don't render anything if it's not a payment return

  if (paymentStatus === 'pending') {
    return (
        <div className='flex flex-col items-center justify-center gap-4'>
            <Loader2 className='h-10 w-10 animate-spin text-primary' />
            <p className='text-muted-foreground'>Verifying your payment, please wait...</p>
        </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
        <div className='flex flex-col items-center text-center gap-4'>
            <XCircle className='h-10 w-10 text-destructive' />
            <div>
                <h3 className='text-xl font-semibold text-destructive'>Payment Failed</h3>
                <p className='text-destructive-foreground mt-1'>{error}</p>
            </div>
            <Link href="/customer/home"><Button variant="outline">Go to My Bookings</Button></Link>
        </div>
    );
  }

  return (
    <div className='flex flex-col items-center text-center gap-4'>
        <CheckCircle className='h-10 w-10 text-green-500' />
        <div>
            <h3 className='text-xl font-semibold text-green-500'>Booking Confirmed!</h3>
            <p className='text-green-500/80 mt-1'>Your appointment has been successfully scheduled.</p>
        </div>
        <Link href="/customer/home"><Button>Go to My Bookings</Button></Link>
    </div>
  );
}

// This component handles the initial confirmation and payment choice
function ConfirmationFlow() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [shop, setShop] = useState<any | null>(null);
    const [customerProfile, setCustomerProfile] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

    const shopId = searchParams.get('shop');
    const serviceIds = searchParams.get('services')?.split(',').map(Number) || [];
    const barberId = Number(searchParams.get('barber'));
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!shopId || !user) return;
            try {
                const [shopResult, profileResult] = await Promise.all([
                    getShopDetailsForCustomer(shopId),
                    getCustomerProfile(user.id)
                ]);
                if (shopResult.error || !shopResult.shop) throw new Error(shopResult.error || 'Shop not found.');
                setShop(shopResult.shop);
                if (profileResult.error || !profileResult.profile) throw new Error(profileResult.error || 'Profile not found.');
                setCustomerProfile(profileResult.profile);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetchInitialData();
    }, [shopId, user]);

    const handleConfirmBooking = async () => {
        if (!paymentMethod) {
            setError("Please select a payment method.");
            return;
        }
        setIsBooking(true);
        setError(null);

        const selectedServices = shop?.services.filter((s: any) => serviceIds.includes(s.id)) || [];
        const totalPrice = selectedServices.reduce((sum: number, service: any) => sum + service.price, 0);
        const totalDuration = selectedServices.reduce((sum: number, service: any) => sum + service.duration, 0);

        try {
            if (paymentMethod === 'pay_now') {
                const bookingDetails = {
                    shop_id: shopId,
                    customer_id: user.id,
                    barber_id: barberId,
                    service_ids: serviceIds,
                    booking_date: new Date(date!).toISOString().split('T')[0],
                    booking_time: time,
                    total_price: totalPrice,
                    total_duration: totalDuration,
                    customer_notes: "",
                    customer_email: user.email,
                    customer_phone: customerProfile.phone,
                };

                const response = await fetch('/api/cashfree/initiate-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingDetails }),
                });

                const data = await response.json();
                if (data.success && data.payment_session_id) {
                    const cashfree = Cashfree({ mode: "sandbox" }); // Or "production"
                    cashfree.checkout({ paymentSessionId: data.payment_session_id });
                } else {
                    throw new Error(data.error?.message || "Failed to initiate payment.");
                }
            } else if (paymentMethod === 'pay_after_service') {
                const result = await createBooking({
                    customer_id: user.id,
                    shop_id: shopId!,
                    barber_id: barberId,
                    service_ids: serviceIds,
                    booking_date: new Date(date!).toISOString().split('T')[0],
                    booking_time: time!,
                    total_price: totalPrice,
                    total_duration: totalDuration,
                    customer_notes: "",
                    status: 'confirmed' // Or 'pending_payment_at_shop'
                });
                if (result.error) throw new Error(result.error);
                router.push('/confirmation?order_id=local_booking'); // Redirect to a generic success page for non-payment bookings
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsBooking(false);
        }
    };

    if (isLoading || authLoading) {
        return <div className="flex justify-center p-8"><Loader2 className='h-8 w-8 animate-spin'/></div>;
    }

    if (error) {
        return <p className="text-destructive text-center">Error: {error}</p>;
    }
    
    const selectedServices = shop?.services.filter((s: any) => serviceIds.includes(s.id)) || [];
    const selectedBarber = shop?.barbers.find((b: any) => b.id === barberId);
    const totalPrice = selectedServices.reduce((sum: number, service: any) => sum + service.price, 0);

    return (
        <div>
            <Card className='mb-6'>
                <CardHeader><CardTitle>Booking Summary</CardTitle></CardHeader>
                <CardContent className='space-y-2'>
                    <p><strong>Shop:</strong> {shop?.name}</p>
                    <p><strong>Staff:</strong> {selectedBarber?.name}</p>
                    <p><strong>Date:</strong> {new Date(date!).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {time}</p>
                    <p className='font-bold text-lg'>Total Price: ₹{totalPrice.toFixed(2)}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
                <CardContent>
                    <RadioGroup onValueChange={setPaymentMethod} value={paymentMethod || ""} className="grid grid-cols-2 gap-4">
                        <Label htmlFor="pay_now" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent [&:has([data-state=checked])]:border-primary">
                            <RadioGroupItem id="pay_now" value="pay_now" className="sr-only" />
                            <span className="font-semibold">Pay Now</span>
                        </Label>
                        <Label htmlFor="pay_after_service" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent [&:has([data-state=checked])]:border-primary">
                            <RadioGroupItem id="pay_after_service" value="pay_after_service" className="sr-only" />
                            <span className="font-semibold">Pay After Service</span>
                        </Label>
                    </RadioGroup>
                </CardContent>
            </Card>

            <Button onClick={handleConfirmBooking} className='w-full mt-6' disabled={isBooking || !paymentMethod}>
                {isBooking ? <Loader2 className='h-5 w-5 animate-spin' /> : 'Confirm Booking'}
            </Button>
        </div>
    );
}

function ConfirmationPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className='min-h-screen bg-background flex items-center justify-center'>
      <Card className='max-w-lg w-full bg-card'>
        <CardHeader>
          <CardTitle className='text-center text-2xl'>
            {orderId ? 'Booking Status' : 'Confirm Your Booking'}
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <Suspense fallback={<div className='flex justify-center'><Loader2 className='h-8 w-8 animate-spin'/></div>}>
            {orderId ? <ConfirmationStatus /> : <ConfirmationFlow />}
          </Suspense>
        </CardContent>
      </Card>
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
