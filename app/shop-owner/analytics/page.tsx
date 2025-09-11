
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthProvider } from '@/components/auth-provider';

interface Review {
  id: number;
  rating: number;
  feedback: string;
  created_at: string;
}

interface Booking {
  id: number;
  total_price: number;
  created_at: string;
}

function AnalyticsPageContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/shop-owner/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setReviews(data.reviews || []);
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="my-4 px-4 sm:px-6 md:px-8 lg:px-12 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  const totalRevenue = bookings.reduce((acc, booking) => acc + booking.total_price, 0);

  const getRevenueLastNMonths = (months) => {
    const lastNMonths = new Date();
    lastNMonths.setMonth(lastNMonths.getMonth() - months);
    return bookings
      .filter(b => new Date(b.created_at) > lastNMonths)
      .reduce((acc, booking) => acc + booking.total_price, 0);
  };

  const averageRevenuePerBooking = bookings.length > 0
    ? (totalRevenue / bookings.length).toFixed(2)
    : 'N/A';

  return (
    <div className="my-4 px-4 sm:px-6 md:px-8 lg:px-12 space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹{totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue (Last Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹{getRevenueLastNMonths(1).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Revenue/Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹{averageRevenuePerBooking}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{averageRating}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle>Rating: {review.rating}/5</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
                <p>{review.feedback}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AuthProvider>
      <AnalyticsPageContent />
    </AuthProvider>
  )
}
