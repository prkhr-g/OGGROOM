'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Banknote, Phone, Mail, Info, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { getShopOwnerProfile, getShopBookings, getShopOwnerDashboard } from '@/lib/profile-actions'
import { format, isFuture, parseISO } from 'date-fns'

interface Booking {
  id: number;
  customer_id: string;
  shop_id: string;
  barber_id: number;
  service_ids: number[];
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
  customer_notes: string | null;
  customer: { name: string; phone: string; email: string };
  barber: { name: string };
  services: string;
}

export default function ShopSchedulePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [shopId, setShopId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        setIsLoading(true);
        const profileResult = await getShopOwnerProfile(user.id);
        if (profileResult.error) throw new Error(profileResult.error);
        if (!profileResult.profile || !profileResult.profile.shop) {
          setError('Shop profile not found.');
          return;
        }
        setShopId(profileResult.profile.shop.id);

        const bookingsResult = await getShopBookings(profileResult.profile.shop.id);
        if (bookingsResult.error) throw new Error(bookingsResult.error);
        console.log("Raw bookings data:", bookingsResult.bookings);

        const dashboardResult = await getShopOwnerDashboard(profileResult.profile.shop.id);
        if (dashboardResult.error || !dashboardResult.data) throw new Error(dashboardResult.error || 'Failed to fetch dashboard data');
        const allServices = dashboardResult.data.services || [];

        // Filter for upcoming bookings and map service names
        const upcomingBookings = (bookingsResult.bookings || []).map((booking: any) => {
          const bookingDateTime = parseISO(`${booking.booking_date}T${booking.booking_time}`);
          console.log("Booking date-time:", booking.booking_date, booking.booking_time, bookingDateTime);
          const serviceNames = (booking.service_ids || [])
            .map((serviceId: number) => {
              const service = allServices.find((s: Service) => s.id === serviceId);
              return service ? service.name : 'Unknown Service';
            })
            .join(', ');
          return {
            ...booking,
            services: serviceNames, // Overwrite services with mapped names
          };
        });

        setBookings(upcomingBookings);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduleData();
  }, [user, router]);

  if (isLoading) return <div className='min-h-screen bg-background flex items-center justify-center'><p>Loading schedule...</p></div>;
  if (error) return <div className='min-h-screen bg-background flex items-center justify-center'><Card className='max-w-md w-full bg-card'><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p className='text-destructive mb-4'>{error}</p><Button onClick={() => window.location.reload()}>Try Again</Button></CardContent></Card></div>;

  return (
    <div className='min-h-screen bg-background p-6'>
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Shop Schedule</h1>
        </div>
      </header>
      <Card className='max-w-4xl mx-auto mt-6 bg-card'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Upcoming Shop Schedule</CardTitle>
          <CardDescription>View and manage all your upcoming appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className='text-center text-muted-foreground'>No upcoming appointments found.</p>
          ) : (
            <div className='space-y-4'>
              {bookings.map(booking => (
                <div key={booking.id} className='border border-border rounded-lg p-4 bg-background shadow-sm'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-semibold text-lg text-foreground'>Booking ID: {booking.id}</h3>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>{booking.status}</Badge>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-foreground'>
                    <div className='flex items-center gap-2'><User className='h-4 w-4 text-muted-foreground' />Customer: {booking.customer?.name || 'N/A'}</div>
                    <div className='flex items-center gap-2'><Calendar className='h-4 w-4 text-muted-foreground' />Date: {format(parseISO(booking.booking_date), 'PPP')}</div>
                    <div className='flex items-center gap-2'><Clock className='h-4 w-4 text-muted-foreground' />Time: {booking.booking_time}</div>
                    <div className='flex items-center gap-2'><Info className='h-4 w-4 text-muted-foreground' />Barber: {booking.barber?.name || 'N/A'}</div>
                    <div className='flex items-center gap-2'><Info className='h-4 w-4 text-muted-foreground' />Service(s): {booking.services || 'N/A'}</div>
                    <div className='flex items-center gap-2'><Banknote className='h-4 w-4 text-muted-foreground' />Price: ₹{booking.total_price}</div>
                    {booking.customer?.phone && <div className='flex items-center gap-2'><Phone className='h-4 w-4 text-muted-foreground' />Phone: {booking.customer.phone}</div>}
                    {booking.customer?.email && <div className='flex items-center gap-2'><Mail className='h-4 w-4 text-muted-foreground' />Email: {booking.customer.email}</div>}
                    {booking.customer_notes && <div className='md:col-span-2 flex items-start gap-2'><Info className='h-4 w-4 text-muted-foreground' />Notes: {booking.customer_notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}