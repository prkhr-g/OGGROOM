'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, Users, DollarSign, Clock, Star, Settings, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Phone, TrendingUp, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { getShopOwnerProfile, getShopOwnerDashboard, addService as addServiceAction, addBarber as addBarberAction, deleteService as deleteServiceAction, deleteBarber as deleteBarberAction, updateService as updateServiceAction, updateBarber as updateBarberAction } from '@/lib/profile-actions'

// Interfaces
interface Booking { id: number; customer: { name: string; phone: string; email: string }; service_name: string; barber_name: string; booking_time: string; status: string; price: number; notes: string; }
interface Service { id: number; name: string; duration: number; price: number; description: string; }
interface Barber { id: number; name: string; specialties: string[]; rating: number; experience: string; phone: string; email: string; }
interface ShopOwnerProfile { id: string; name: string; shop: { id: string; }; }

export default function ShopOwnerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<ShopOwnerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [isSavingService, setIsSavingService] = useState(false)
  const [serviceError, setServiceError] = useState<string | null>(null)

  const [isAddBarberOpen, setIsAddBarberOpen] = useState(false)
  const [isSavingBarber, setIsSavingBarber] = useState(false)
  const [barberError, setBarberError] = useState<string | null>(null)

  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isUpdatingService, setIsUpdatingService] = useState(false)
  const [updateServiceError, setUpdateServiceError] = useState<string | null>(null)

  const [isEditBarberOpen, setIsEditBarberOpen] = useState(false)
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null)
  const [isUpdatingBarber, setIsUpdatingBarber] = useState(false)
  const [updateBarberError, setUpdateBarberError] = useState<string | null>(null)

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Data states
  const [todayBookings, setTodayBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        setIsLoading(true)
        const profileResult = await getShopOwnerProfile(user.id)
        if (profileResult.error) throw new Error(profileResult.error)
        if (!profileResult.profile) {
          router.push('/shop-owner/profile')
          return
        }
        setProfile(profileResult.profile)

        const dashboardResult = await getShopOwnerDashboard(profileResult.profile.shop.id)
        if (dashboardResult.error || !dashboardResult.data) throw new Error(dashboardResult.error || 'Failed to fetch dashboard data')

        setTodayBookings(dashboardResult.data.bookings || [])
        setServices(dashboardResult.data.services || [])
        setBarbers(dashboardResult.data.barbers || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [user, router])

  const handleAddService = async (serviceData: Omit<Service, 'id'>) => {
    if (!profile) return
    setIsSavingService(true)
    setServiceError(null)
    const result = await addServiceAction(profile.shop.id, serviceData)
    if (result.error) setServiceError(result.error)
    else {
      const dash = await getShopOwnerDashboard(profile.shop.id)
      if (dash.data) setServices(dash.data.services || [])
      setIsAddServiceOpen(false)
    }
    setIsSavingService(false)
  }

  const handleAddBarber = async (barberData: Omit<Barber, 'id' | 'rating'>) => {
    if (!profile) return
    setIsSavingBarber(true)
    setBarberError(null)
    const result = await addBarberAction(profile.shop.id, barberData)
    if (result.error) setBarberError(result.error)
    else {
      const dash = await getShopOwnerDashboard(profile.shop.id)
      if (dash.data) setBarbers(dash.data.barbers || [])
      setIsAddBarberOpen(false)
    }
    setIsSavingBarber(false)
  }

  const handleDeleteService = async (serviceId: number) => {
    if (!profile) return;
    if (confirm('Are you sure you want to delete this service?')) {
      const result = await deleteServiceAction(serviceId)
      if (result.error) setError(result.error)
      else {
        const dash = await getShopOwnerDashboard(profile.shop.id)
        if (dash.data) setServices(dash.data.services || [])
      }
    }
  }

  const handleDeleteBarber = async (barberId: number) => {
    if (!profile) return;
    if (confirm('Are you sure you want to delete this barber?')) {
      const result = await deleteBarberAction(barberId)
      if (result.error) setError(result.error)
      else {
        const dash = await getShopOwnerDashboard(profile.shop.id)
        if (dash.data) setBarbers(dash.data.barbers || [])
      }
    }
  }

  const handleUpdateService = async (serviceData: Service) => {
    if (!profile) return;
    setIsUpdatingService(true);
    setUpdateServiceError(null);
    const result = await updateServiceAction(serviceData.id, serviceData);
    if (result.error) setUpdateServiceError(result.error);
    else {
      const dash = await getShopOwnerDashboard(profile.shop.id);
      if (dash.data) setServices(dash.data.services || []);
      setIsEditServiceOpen(false);
    }
    setIsUpdatingService(false);
  };

  const handleUpdateBarber = async (barberData: Barber) => {
    if (!profile) return;
    setIsUpdatingBarber(true);
    setUpdateBarberError(null);
    const result = await updateBarberAction(barberData.id, barberData);
    if (result.error) setUpdateBarberError(result.error);
    else {
      const dash = await getShopOwnerDashboard(profile.shop.id);
      if (dash.data) setBarbers(dash.data.barbers || []);
      setIsEditBarberOpen(false);
    }
    setIsUpdatingBarber(false);
  };

  // Mock functions
  const updateBookingStatus = (bookingId: number, newStatus: string) => setTodayBookings(p => p.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))

  const stats = [
    { title: "Today's Revenue", value: `$${todayBookings.reduce((acc, b) => acc + b.price, 0)}`, icon: DollarSign, color: 'text-green-600' },
    { title: "Today's Bookings", value: todayBookings.length.toString(), icon: Calendar, color: 'text-blue-600' },
    { title: 'Active Customers', value: '156', icon: Users, color: 'text-purple-600' },
    { title: 'Average Rating', value: '4.9', icon: Star, color: 'text-yellow-600' },
  ]

  if (isLoading) return <div className='min-h-screen bg-slate-50 flex items-center justify-center'><Loader2 className='h-8 w-8 animate-spin' /></div>
  if (error) return <div className='min-h-screen bg-slate-50 flex items-center justify-center'><Card className='max-w-md w-full'><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p className='text-red-600 mb-4'>{error}</p><Button onClick={() => window.location.reload()}>Try Again</Button></CardContent></Card></div>

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-6xl mx-auto px-4 py-4 flex items-center justify-between'>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>Elite Barbershop Dashboard</h1>
            <p className='text-sm text-gray-600'>Welcome back, {profile?.name}!</p>
          </div>
          <div className='flex items-center gap-3'>
            <Link href='/shop-owner/profile'><Button variant='outline' size='sm'><Settings className='h-4 w-4 mr-2' />Profile & Settings</Button></Link>
            <Link href='/shop-owner/profile'><Avatar className='cursor-pointer'><AvatarImage src='/placeholder.svg?height=40&width=40' /><AvatarFallback>{profile?.name.charAt(0)}</AvatarFallback></Avatar></Link>
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 py-6 space-y-6'>
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center`}><stat.icon className={`h-6 w-6 ${stat.color}`} /></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                 <DialogTrigger asChild>
                   <Button className="h-20 flex-col gap-2"><Plus className="h-6 w-6" />Add Service</Button>
                 </DialogTrigger>
                 <DialogContent>
                   <DialogHeader>
                     <DialogTitle>Add New Service</DialogTitle>
                     <DialogDescription>Create a new service for your shop.</DialogDescription>
                   </DialogHeader>
                   <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); handleAddService({ name: fd.get('name') as string, duration: Number(fd.get('duration')), price: Number(fd.get('price')), description: fd.get('description') as string }); }} className='space-y-4'>
                     <div><Label htmlFor='name'>Service Name</Label><Input id='name' name='name' required disabled={isSavingService} /></div>
                     <div className='grid grid-cols-2 gap-4'>
                       <div><Label htmlFor='duration'>Duration (minutes)</Label><Input id='duration' name='duration' type='number' required disabled={isSavingService} /></div>
                       <div><Label htmlFor='price'>Price ($)</Label><Input id='price' name='price' type='number' step='0.01' required disabled={isSavingService} /></div>
                     </div>
                     <div><Label htmlFor='description'>Description</Label><Textarea id='description' name='description' disabled={isSavingService} /></div>
                     {serviceError && <p className='text-sm text-red-600'>{serviceError}</p>}
                     <Button type='submit' className='w-full' disabled={isSavingService}>{isSavingService ? <><Loader2 className='h-4 w-4 mr-2 animate-spin' />Saving...</> : 'Add Service'}</Button>
                   </form>
                 </DialogContent>
              </Dialog>
              <Dialog open={isAddBarberOpen} onOpenChange={setIsAddBarberOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent"><Users className="h-6 w-6" />Manage Barbers</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Barber</DialogTitle>
                    <DialogDescription>Add a new team member.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); handleAddBarber({ name: fd.get('name') as string, experience: fd.get('experience') as string, phone: fd.get('phone') as string, email: fd.get('email') as string, specialties: (fd.get('specialties') as string).split(',').map(s => s.trim()) }); }} className='space-y-4'>
                    <div><Label htmlFor='barber-name'>Full Name</Label><Input id='barber-name' name='name' required disabled={isSavingBarber} /></div>
                    <div><Label htmlFor='experience'>Experience</Label><Input id='experience' name='experience' placeholder='e.g., 5 years' required disabled={isSavingBarber} /></div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div><Label htmlFor='barber-phone'>Phone</Label><Input id='barber-phone' name='phone' type='tel' required disabled={isSavingBarber} /></div>
                      <div><Label htmlFor='barber-email'>Email</Label><Input id='barber-email' name='email' type='email' required disabled={isSavingBarber} /></div>
                    </div>
                    <div><Label htmlFor='specialties'>Specialties (comma-separated)</Label><Input id='specialties' name='specialties' placeholder='e.g., Classic Cuts, Fades' disabled={isSavingBarber} /></div>
                    {barberError && <p className='text-sm text-red-600'>{barberError}</p>}
                    <Button type='submit' className='w-full' disabled={isSavingBarber}>{isSavingBarber ? <><Loader2 className='h-4 w-4 mr-2 animate-spin' />Saving...</> : 'Add Barber'}</Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent"><Calendar className="h-6 w-6" />View Schedule</Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent"><TrendingUp className="h-6 w-6" />Analytics</Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle>Today's Appointments</CardTitle><CardDescription>Manage your daily bookings</CardDescription></div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayBookings.length === 0 ? <p>No appointments today.</p> : todayBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  {/* Booking details... */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Services Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle>Services Management</CardTitle><CardDescription>Manage your shop's services</CardDescription></div>
              <Button onClick={() => setIsAddServiceOpen(true)} size="sm"><Plus className="h-4 w-4 mr-2" />Add Service</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map(service => (
                <div key={service.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{service.duration} min</span>
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${service.price}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => { setEditingService(service); setIsEditServiceOpen(true); }}><Edit className="h-3 w-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteService(service.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Service Dialog */}
        {editingService && (
          <Dialog open={isEditServiceOpen} onOpenChange={setIsEditServiceOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Service</DialogTitle>
                <DialogDescription>Update the details of this service.</DialogDescription>
              </DialogHeader>
              <form onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                handleUpdateService({
                  ...editingService,
                  name: fd.get('name') as string,
                  duration: Number(fd.get('duration')),
                  price: Number(fd.get('price')),
                  description: fd.get('description') as string,
                });
              }} className='space-y-4'>
                <div><Label htmlFor='edit-service-name'>Service Name</Label><Input id='edit-service-name' name='name' required value={editingService.name} onChange={e => setEditingService({ ...editingService!, name: e.target.value })} disabled={isUpdatingService} /></div>
                <div className='grid grid-cols-2 gap-4'>
                  <div><Label htmlFor='edit-service-duration'>Duration (minutes)</Label><Input id='edit-service-duration' name='duration' type='number' required value={editingService.duration} onChange={e => setEditingService({ ...editingService!, duration: Number(e.target.value) })} disabled={isUpdatingService} /></div>
                  <div><Label htmlFor='edit-service-price'>Price ($)</Label><Input id='edit-service-price' name='price' type='number' step='0.01' required value={editingService.price} onChange={e => setEditingService({ ...editingService!, price: Number(e.target.value) })} disabled={isUpdatingService} /></div>
                </div>
                <div><Label htmlFor='edit-service-description'>Description</Label><Textarea id='edit-service-description' name='description' value={editingService.description} onChange={e => setEditingService({ ...editingService!, description: e.target.value })} disabled={isUpdatingService} /></div>
                {updateServiceError && <p className='text-sm text-red-600'>{updateServiceError}</p>}
                <Button type='submit' className='w-full' disabled={isUpdatingService}>{isUpdatingService ? <><Loader2 className='h-4 w-4 mr-2 animate-spin' />Updating...</> : 'Update Service'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Team Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle>Team Management</CardTitle><CardDescription>Manage your barbers and staff</CardDescription></div>
              <Button onClick={() => setIsAddBarberOpen(true)} size="sm"><Plus className="h-4 w-4 mr-2" />Add Barber</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {barbers.map(barber => (
                <div key={barber.id} className="p-4 border rounded-lg">
                   <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=50&width=50" />
                      <AvatarFallback>{barber.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{barber.name}</h3>
                      <p className="text-sm text-gray-600">{barber.experience} experience</p>
                      <div className="flex items-center gap-1 mt-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><span className="text-sm">{barber.rating}</span></div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500"><Phone className="h-3 w-3" /><span>{barber.phone}</span></div>
                      <div className="flex flex-wrap gap-1 mt-2">{barber.specialties.map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => { setEditingBarber(barber); setIsEditBarberOpen(true); }}><Edit className="h-3 w-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteBarber(barber.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Barber Dialog */}
        {editingBarber && (
          <Dialog open={isEditBarberOpen} onOpenChange={setIsEditBarberOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Barber</DialogTitle>
                <DialogDescription>Update the details of this barber.</DialogDescription>
              </DialogHeader>
              <form onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                handleUpdateBarber({
                  ...editingBarber,
                  name: fd.get('name') as string,
                  experience: fd.get('experience') as string,
                  phone: fd.get('phone') as string,
                  email: fd.get('email') as string,
                  specialties: (fd.get('specialties') as string).split(',').map(s => s.trim()),
                });
              }} className='space-y-4'>
                <div><Label htmlFor='edit-barber-name'>Full Name</Label><Input id='edit-barber-name' name='name' required value={editingBarber.name} onChange={e => setEditingBarber({ ...editingBarber!, name: e.target.value })} disabled={isUpdatingBarber} /></div>
                <div><Label htmlFor='edit-experience'>Experience</Label><Input id='edit-experience' name='experience' placeholder='e.g., 5 years' required value={editingBarber.experience} onChange={e => setEditingBarber({ ...editingBarber!, experience: e.target.value })} disabled={isUpdatingBarber} /></div>
                <div className='grid grid-cols-2 gap-4'>
                  <div><Label htmlFor='edit-barber-phone'>Phone</Label><Input id='edit-barber-phone' name='phone' type='tel' required value={editingBarber.phone} onChange={e => setEditingBarber({ ...editingBarber!, phone: e.target.value })} disabled={isUpdatingBarber} /></div>
                  <div><Label htmlFor='edit-barber-email'>Email</Label><Input id='edit-barber-email' name='email' type='email' required value={editingBarber.email} onChange={e => setEditingBarber({ ...editingBarber!, email: e.target.value })} disabled={isUpdatingBarber} /></div>
                </div>
                <div><Label htmlFor='edit-specialties'>Specialties (comma-separated)</Label><Input id='edit-specialties' name='specialties' placeholder='e.g., Classic Cuts, Fades' value={editingBarber.specialties.join(', ')} onChange={e => setEditingBarber({ ...editingBarber!, specialties: e.target.value.split(',').map(s => s.trim()) })} disabled={isUpdatingBarber} /></div>
                {updateBarberError && <p className='text-sm text-red-600'>{updateBarberError}</p>}
                <Button type='submit' className='w-full' disabled={isUpdatingBarber}>{isUpdatingBarber ? <><Loader2 className='h-4 w-4 mr-2 animate-spin' />Updating...</> : 'Update Barber'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

      </main>
    </div>
  )
}
