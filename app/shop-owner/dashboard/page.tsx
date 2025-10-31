"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Users,
  Banknote,
  Clock,
  Star,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  TrendingUp,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import {
  getShopOwnerProfile,
  getShopOwnerDashboard,
  addService as addServiceAction,
  addBarber as addBarberAction,
  deleteService as deleteServiceAction,
  deleteBarber as deleteBarberAction,
  updateService as updateServiceAction,
  updateBarber as updateBarberAction,
  getShopUpcomingBookings,
} from "@/lib/profile-actions";
import { updateBookingStatusInDb } from "@/lib/booking-actions";
import { Skeleton } from "@/components/ui/skeleton";

function ShopOwnerDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <div>
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-card">
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Interfaces
interface Booking {
  id: number;
  customer: { name: string; phone: string; email: string };
  service_name: string;
  barber_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
  notes: string;
}
interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string;
}
interface Barber {
  id: number;
  name: string;
  specialties: string[];
  experience: string;
  phone: string;
  email: string;
}
interface ShopOwnerProfile {
  id: string;
  name: string;
  shop: { id: string; name: string };
}
interface Review {
  id: number;
  rating: number;
  feedback: string;
  created_at: string;
}

function ShopOwnerDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ShopOwnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const [isAddBarberOpen, setIsAddBarberOpen] = useState(false);
  const [isSavingBarber, setIsSavingBarber] = useState(false);
  const [barberError, setBarberError] = useState<string | null>(null);

  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isUpdatingService, setIsUpdatingService] = useState(false);
  const [updateServiceError, setUpdateServiceError] = useState<string | null>(
    null,
  );

  const [isEditBarberOpen, setIsEditBarberOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [isUpdatingBarber, setIsUpdatingBarber] = useState(false);
  const [updateBarberError, setUpdateBarberError] = useState<string | null>(
    null,
  );

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isViewBookingDialogOpen, setIsViewBookingDialogOpen] = useState(false);
  const [allUpcomingBookings, setAllUpcomingBookings] = useState<Booking[]>([]);
  const [isViewAllBookingsDialogOpen, setIsViewAllBookingsDialogOpen] = useState(false);

  // Data states
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalCompletedBookings, setTotalCompletedBookings] = useState(0);
  const [showTodaysAppointments, setShowTodaysAppointments] = useState(false);
  const [showServicesManagement, setShowServicesManagement] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);

  const todaysAppointmentsRef = useRef<HTMLDivElement>(null);
  const servicesManagementRef = useRef<HTMLDivElement>(null);
  const teamManagementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTodaysAppointments && todaysAppointmentsRef.current) {
      todaysAppointmentsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showTodaysAppointments]);

  useEffect(() => {
    if (showServicesManagement && servicesManagementRef.current) {
      servicesManagementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showServicesManagement]);

  useEffect(() => {
    if (showTeamManagement && teamManagementRef.current) {
      teamManagementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showTeamManagement]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const profileResult = await getShopOwnerProfile(user.id);
      if (profileResult.error) throw new Error(profileResult.error);
      if (!profileResult.profile) {
        router.push("/shop-owner/profile");
        return;
      }
      setProfile(profileResult.profile);

      const dashboardResult = await getShopOwnerDashboard(
        profileResult.profile.shop.id,
      );
      if (dashboardResult.error || !dashboardResult.data)
        throw new Error(
          dashboardResult.error || "Failed to fetch dashboard data",
        );

      setTotalCompletedBookings(
        (dashboardResult.data.bookings || []).filter(
          (b: any) => b.status === "completed",
        ).length,
      );

      const upcomingBookingsResult = await getShopUpcomingBookings(
        profileResult.profile.shop.id,
      );
      if (upcomingBookingsResult.error)
        throw new Error(upcomingBookingsResult.error);
              setAllUpcomingBookings(upcomingBookingsResult.bookings || []);
      
      const today = new Date().toISOString().split("T")[0];
      const todayFilteredBookings = (dashboardResult.data.bookings || []).filter(
        (booking: any) =>
          booking.booking_date === today && booking.status !== "cancelled",
      );
              const mappedBookings = (todayFilteredBookings || []).map(
                (booking: any) => {
                  const serviceNames = (booking.service_ids || [])
                    .map((serviceId: number) => {
                      const service = (dashboardResult.data.services || []).find(
                        (s: Service) => s.id === serviceId,
                      );
                      return service ? service.name : "Unknown Service";
                    })
                    .join(", ");
      
                  const barber = (dashboardResult.data.barbers || []).find(
                    (b: Barber) => b.id === booking.barber_id,
                  );
                  const barberName = barber ? barber.name : "Unknown Barber";
      
                  return {
                    ...booking,
                    service_name: serviceNames,
                    barber_name: barberName,
                  };
                },
              );
              setTodayBookings(mappedBookings);      setServices(dashboardResult.data.services || []);
      setBarbers(dashboardResult.data.barbers || []);

      const reviewsResponse = await fetch("/api/shop-owner/analytics");
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, router, getShopOwnerProfile, getShopOwnerDashboard, getShopUpcomingBookings]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, review) => acc + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const stats = [
    {
      title: "Today's Revenue",
      value: `₹${todayBookings.reduce((acc, b) => acc + b.total_price, 0)}`,
      icon: Banknote,
      color: "text-green-500",
    },
    {
      title: "Today's Bookings",
      value: todayBookings.length.toString(),
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      title: "Happy Customers",
      value: totalCompletedBookings.toString(),
      icon: Users,
      color: "text-purple-500",
    },
  ];

  const handleAddService = async (serviceData: Omit<Service, "id">) => {
    if (!profile) return;
    setIsSavingService(true);
    setServiceError(null);
    const result = await addServiceAction(profile.shop.id, serviceData);
    if (result.error) setServiceError(result.error);
    else {
      const dash = await getShopOwnerDashboard(profile.shop.id);
      if (dash.data) setServices(dash.data.services || []);
      setIsAddServiceOpen(false);
    }
    setIsSavingService(false);
  };

  const handleAddBarber = async (barberData: Omit<Barber, "id" | "rating">) => {
    if (!profile) return;
    setIsSavingBarber(true);
    setBarberError(null);
    const result = await addBarberAction(profile.shop.id, barberData);
    if (result.error) setBarberError(result.error);
    else {
      const dash = await getShopOwnerDashboard(profile.shop.id);
      if (dash.data) setBarbers(dash.data.barbers || []);
      setIsAddBarberOpen(false);
    }
    setIsSavingBarber(false);
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!profile) return;
    if (confirm("Are you sure you want to delete this service?")) {
      const result = await deleteServiceAction(serviceId);
      if (result.error) setError(result.error);
      else {
        const dash = await getShopOwnerDashboard(profile.shop.id);
        if (dash.data) setServices(dash.data.services || []);
      }
    }
  };

  const handleDeleteBarber = async (barberId: number) => {
    if (!profile) return;
    if (confirm("Are you sure you want to delete this barber?")) {
      const result = await deleteBarberAction(barberId);
      if (result.error) setError(result.error);
      else {
        const dash = await getShopOwnerDashboard(profile.shop.id);
        if (dash.data) setBarbers(dash.data.barbers || []);
      }
    }
  };

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

  const handleShowTodaysAppointments = () => {
    setShowTodaysAppointments((prev) => !prev);
    setShowServicesManagement(false);
    setShowTeamManagement(false);
  };

  const handleShowServicesManagement = () => {
    setShowServicesManagement((prev) => !prev);
    setShowTodaysAppointments(false);
    setShowTeamManagement(false);
  };

  const handleShowTeamManagement = () => {
    setShowTeamManagement((prev) => !prev);
    setShowTodaysAppointments(false);
    setShowServicesManagement(false);
  };

  const handleCancelBooking = async (bookingId: number) => {
    const result = await updateBookingStatusInDb(bookingId, "cancelled");
    if (result.error) {
      setError(result.error);
      return;
    }
    setTodayBookings((p) =>
      p.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
    );
    setSelectedBooking(null);
  };

  const handleVerifyOtp = async () => {
    if (!selectedBooking) return;

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const response = await fetch(
        `/api/shop-owner/bookings/${selectedBooking.id}/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otp: otpValue }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to verify OTP.");
      }

      // Update booking status in the UI
      setTodayBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id ? { ...b, status: "completed" } : b
        )
      );

      // Close all dialogs
      setSelectedBooking(null);
      setIsCompleteDialogOpen(false);
      setOtpValue("");
    } catch (error: any) {
      setOtpError(error.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };



  if (isLoading) return <ShopOwnerDashboardSkeleton />;
  if (error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full bg-card">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="OGGROOM Logo" width={30} height={30} />
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {profile?.shop?.name || "Shop Dashboard"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/shop-owner/profile">
              <Avatar className="cursor-pointer">
                <AvatarImage src="/placeholder.svg?height=36&width=36" />
                <AvatarFallback>{profile?.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {stats.map((stat, index) => (
            <Card
              key={index}
              className={`bg-card ${stat.title === "Today's Bookings" ? "cursor-pointer hover:bg-muted" : ""}`}
              onClick={() =>
                stat.title === "Today's Bookings" &&
                handleShowTodaysAppointments()
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={handleShowServicesManagement}
              >
                <Plus className="h-6 w-6" />
                Service<br></br>Management
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={handleShowTeamManagement}
              >
                <Users className="h-6 w-6" />
                Team Management
              </Button>
              <Link
                href="/shop-owner/schedule"
                className="h-20 flex-col gap-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <Calendar className="h-6 w-6" />
                View Schedule
              </Link>
              <Link
                href="/shop-owner/analytics"
                className="h-20 flex-col gap-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <TrendingUp className="h-6 w-6" />
                Analytics
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        {showTodaysAppointments && (
          <motion.div
            ref={todaysAppointmentsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Appointments</CardTitle>
                    <CardDescription>
                      Manage your daily bookings
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsViewAllBookingsDialogOpen(true)}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayBookings.length === 0 ? (
                    <p>No appointments today.</p>
                  ) : (
                    todayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 bg-background rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {booking.customer?.name || "N/A"}
                          </h3>
                          <div className="text-sm text-muted-foreground">
                            {booking.service_name} with {booking.barber_name}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.booking_time}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsViewBookingDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Services Management */}
        {showServicesManagement && (
          <motion.div
            ref={servicesManagementRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Services Management</CardTitle>
                    <CardDescription>
                      Manage your shop's services
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsAddServiceOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {service.duration} min
                            </span>
                            <span className="flex items-center gap-1">
                              ₹{service.price}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingService(service);
                              setIsEditServiceOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Add New Service</DialogTitle>
                  <DialogDescription>
                    Create a new service for your shop.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    handleAddService({
                      name: fd.get("name") as string,
                      duration: Number(fd.get("duration")),
                      price: Number(fd.get("price")),
                      description: fd.get("description") as string,
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      disabled={isSavingService}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        required
                        disabled={isSavingService}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        required
                        disabled={isSavingService}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      disabled={isSavingService}
                    />
                  </div>
                  {serviceError && (
                    <p className="text-sm text-destructive">{serviceError}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSavingService}
                  >
                    {isSavingService ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Add Service"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}

        {/* Team Management */}
        {showTeamManagement && (
          <motion.div
            ref={teamManagementRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>
                      Manage your barbers and staff
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsAddBarberOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staffs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {barbers.map((barber) => (
                    <div
                      key={barber.id}
                      className="p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg?height=40&width=40" />
                          <AvatarFallback>
                            {barber.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{barber.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {barber.experience} experience
                          </p>

                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{barber.phone}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {barber.specialties.map((s, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingBarber(barber);
                              setIsEditBarberOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteBarber(barber.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Dialog open={isAddBarberOpen} onOpenChange={setIsAddBarberOpen}>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Add New Staff</DialogTitle>
                  <DialogDescription>Add a new team member.</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    handleAddBarber({
                      name: fd.get("name") as string,
                      experience: fd.get("experience") as string,
                      phone: fd.get("phone") as string,
                      email: fd.get("email") as string,
                      specialties: (fd.get("specialties") as string)
                        .split(",")
                        .map((s) => s.trim()),
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="barber-name">Full Name</Label>
                    <Input
                      id="barber-name"
                      name="name"
                      required
                      disabled={isSavingBarber}
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience</Label>
                    <Input
                      id="experience"
                      name="experience"
                      placeholder="e.g., 5 years"
                      required
                      disabled={isSavingBarber}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="barber-phone">Phone</Label>
                      <Input
                        id="barber-phone"
                        name="phone"
                        type="tel"
                        required
                        disabled={isSavingBarber}
                      />
                    </div>
                    <div>
                      <Label htmlFor="barber-email">Email</Label>
                      <Input
                        id="barber-email"
                        name="email"
                        type="email"
                        required
                        disabled={isSavingBarber}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="specialties">
                      Specialties (comma-separated)
                    </Label>
                    <Input
                      id="specialties"
                      name="specialties"
                      placeholder="e.g., Classic Cuts, Fades"
                      disabled={isSavingBarber}
                    />
                  </div>
                  {barberError && (
                    <p className="text-sm text-destructive">{barberError}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSavingBarber}
                  >
                    {isSavingBarber ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Add Barber"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}

        {/* Edit Barber Dialog */}
        {editingBarber && (
          <Dialog open={isEditBarberOpen} onOpenChange={setIsEditBarberOpen}>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>Edit Staff</DialogTitle>
                <DialogDescription>
                  Update the details of this staff.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  handleUpdateBarber({
                    ...editingBarber,
                    name: fd.get("name") as string,
                    experience: fd.get("experience") as string,
                    phone: fd.get("phone") as string,
                    email: fd.get("email") as string,
                    specialties: (fd.get("specialties") as string)
                      .split(",")
                      .map((s) => s.trim()),
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="edit-barber-name">Full Name</Label>
                  <Input
                    id="edit-barber-name"
                    name="name"
                    required
                    value={editingBarber.name}
                    onChange={(e) =>
                      setEditingBarber({
                        ...editingBarber!,
                        name: e.target.value,
                      })
                    }
                    disabled={isUpdatingBarber}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-experience">Experience</Label>
                  <Input
                    id="edit-experience"
                    name="experience"
                    placeholder="e.g., 5 years"
                    required
                    value={editingBarber.experience}
                    onChange={(e) =>
                      setEditingBarber({
                        ...editingBarber!,
                        experience: e.target.value,
                      })
                    }
                    disabled={isUpdatingBarber}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-barber-phone">Phone</Label>
                    <Input
                      id="edit-barber-phone"
                      name="phone"
                      type="tel"
                      required
                      value={editingBarber.phone}
                      onChange={(e) =>
                        setEditingBarber({
                          ...editingBarber!,
                          phone: e.target.value,
                        })
                      }
                      disabled={isUpdatingBarber}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-barber-email">Email</Label>
                    <Input
                      id="edit-barber-email"
                      name="email"
                      type="email"
                      required
                      value={editingBarber.email}
                      onChange={(e) =>
                        setEditingBarber({
                          ...editingBarber!,
                          email: e.target.value,
                        })
                      }
                      disabled={isUpdatingBarber}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-specialties">
                    Specialties (comma-separated)
                  </Label>
                  <Input
                    id="edit-specialties"
                    name="specialties"
                    placeholder="e.g., Classic Cuts, Fades"
                    value={editingBarber.specialties.join(", ")}
                    onChange={(e) =>
                      setEditingBarber({
                        ...editingBarber!,
                        specialties: e.target.value
                          .split(",")
                          .map((s) => s.trim()),
                      })
                    }
                    disabled={isUpdatingBarber}
                  />
                </div>
                {updateBarberError && (
                  <p className="text-sm text-destructive">
                    {updateBarberError}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isUpdatingBarber}
                >
                  {isUpdatingBarber ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Barber"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </main>



      {/* Cancel Dialog */}
      {selectedBooking && (
        <Dialog
          open={isCancelDialogOpen}
          onOpenChange={() => setIsCancelDialogOpen(false)}
        >
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently cancel the
                booking.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCancelDialogOpen(false)}
              >
                Go Back
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleCancelBooking(selectedBooking.id)}
              >
                Confirm Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Complete Dialog */}
      {selectedBooking && (
        <Dialog
          open={isCompleteDialogOpen}
          onOpenChange={() => {
            setIsCompleteDialogOpen(false);
            setOtpValue("");
            setOtpError(null);
          }}
        >
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Enter OTP to Complete Booking</DialogTitle>
              <DialogDescription>
                Please enter the 4-digit OTP from the customer to complete the booking.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                type="text"
                maxLength={4}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                className="text-center text-2xl tracking-widest"
              />
              {otpError && <p className="text-destructive text-sm">{otpError}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCompleteDialogOpen(false);
                  setOtpValue("");
                  setOtpError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp || otpValue.length !== 4}
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Complete"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* View Booking Dialog */}
      {selectedBooking && (
        <Dialog
          open={isViewBookingDialogOpen}
          onOpenChange={() => {
            setIsViewBookingDialogOpen(false);
            setSelectedBooking(null);
          }}
        >
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected booking.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-semibold">Customer Information</h4>
                <div>Name: {selectedBooking.customer?.name || "N/A"}</div>
                <div>Phone: {selectedBooking.customer?.phone || "N/A"}</div>
                <div>Email: {selectedBooking.customer?.email || "N/A"}</div>
              </div>
              <div>
                <h4 className="font-semibold">Service Details</h4>
                <div>Service: {selectedBooking.service_name}</div>
                <div>Barber: {selectedBooking.barber_name}</div>
                <div>Date: {new Date(selectedBooking.booking_date).toLocaleDateString()}</div>
                <div>Time: {selectedBooking.booking_time}</div>
                <div>Price: ₹{selectedBooking.total_price}</div>
                <div>
                  Status:{" "}
                  <Badge
                    variant={
                      selectedBooking.status === "confirmed"
                        ? "default"
                        : selectedBooking.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
              {selectedBooking.notes && (
                <div>
                  <h4 className="font-semibold">Notes</h4>
                  <div>{selectedBooking.notes}</div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              {selectedBooking.status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => setIsCancelDialogOpen(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
              {selectedBooking.status === "confirmed" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => setIsCancelDialogOpen(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCompleteDialogOpen(true);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* View All Bookings Dialog */}
      <Dialog
        open={isViewAllBookingsDialogOpen}
        onOpenChange={() => setIsViewAllBookingsDialogOpen(false)}
      >
        <DialogContent className="bg-card max-w-2xl">
          <DialogHeader>
            <DialogTitle>All Upcoming Appointments</DialogTitle>
            <DialogDescription>
              A list of all upcoming bookings for your shop.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            {allUpcomingBookings.length === 0 ? (
              <p>No upcoming appointments.</p>
            ) : (
              allUpcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {booking.customer?.name || "N/A"}
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      {booking.service_name} with {booking.barber_name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {booking.booking_time}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        booking.status === "confirmed"
                          ? "default"
                          : booking.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {booking.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsViewBookingDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ShopOwnerDashboard() {
  return (
    <AuthProvider>
      <ShopOwnerDashboardContent />
    </AuthProvider>
  );
}
