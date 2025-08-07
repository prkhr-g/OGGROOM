'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getAvailableShops } from '@/lib/profile-actions'

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

export default function ShopBrowserPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true)
        const result = await getAvailableShops()
        if (result.error) {
          throw new Error(result.error)
        }
        setShops(result.shops || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchShops()
  }, [])

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

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-6xl mx-auto px-4 py-4 flex items-center justify-between'>
          <h1 className='text-xl font-semibold text-gray-900'>Browse Shops</h1>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 py-6 space-y-6'>
        {shops.length === 0 ? (
          <p className='text-center text-gray-600'>No shops available at the moment.</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {shops.map(shop => (
              <Card key={shop.id} className='shadow-lg'>
                <CardHeader>
                  <CardTitle>{shop.name}</CardTitle>
                  <CardDescription>{shop.type}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <p className='flex items-center text-sm text-gray-600'><MapPin className='h-4 w-4 mr-2' />{shop.address}</p>
                  <p className='flex items-center text-sm text-gray-600'><Phone className='h-4 w-4 mr-2' />{shop.phone}</p>
                  <p className='flex items-center text-sm text-gray-600'><Mail className='h-4 w-4 mr-2' />{shop.email}</p>
                  <p className='flex items-center text-sm text-gray-600'><Clock className='h-4 w-4 mr-2' />{shop.opening_time} - {shop.closing_time}</p>
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
