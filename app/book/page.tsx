"use client";

import type React from "react";

import { Suspense, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getShopDetailsForCustomer,
  getAvailableTimeSlots,
  createBooking,
} from "@/lib/profile-actions";
import { AuthProvider, useAuth } from "@/components/auth-provider";

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

interface Barber {
  id: number;
  name: string;
}

interface ShopDetails {
  id: string;
  name: string;
  services: Service[];
  barbers: Barber[];
}

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopId = searchParams.get("shopId");
  const { user } = useAuth();

  const [shop, setShop] = useState<ShopDetails | null>(null);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.user_metadata?.full_name || "",
    phone: user?.user_metadata?.phone_number || "",
    email: user?.email || "",
    notes: "",
  });
  const [isBooked, setIsBooked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopId) {
      setError("Shop ID is missing.");
      setLoading(false);
      return;
    }

    const fetchShopDetails = async () => {
      setLoading(true);
      const { shop, error } = await getShopDetailsForCustomer(shopId);
      if (error) {
        setError(error);
      } else if (shop) {
        setShop(shop);
        console.log("Fetched shop data:", shop); // Add this line
      }
      setLoading(false);
    };
    console.log("Shop ID from URL:", shopId); // Add this line
    fetchShopDetails();
  }, [shopId]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (selectedDate && selectedBarber && shopId) {
        const { timeSlots, error } = await getAvailableTimeSlots(
          shopId,
          parseInt(selectedBarber),
          selectedDate,
        );
        if (error) {
          setError(error);
          setAvailableTimeSlots([]);
        } else if (timeSlots) {
          setAvailableTimeSlots(timeSlots);
        }
      } else {
        setAvailableTimeSlots([]); // Clear slots if no date or barber is selected
      }
      setSelectedTime(""); // Reset selected time when date or barber changes
    };

    fetchAvailableSlots();
  }, [selectedDate, selectedBarber, shopId]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !user ||
      !shopId ||
      !selectedService ||
      !selectedBarber ||
      !selectedDate ||
      !selectedTime ||
      !customerInfo.name ||
      !customerInfo.phone ||
      !customerInfo.email
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const service = shop?.services.find(
      (s) => s.id.toString() === selectedService,
    );
    if (!service) {
      setError("Selected service not found.");
      return;
    }

    const bookingData = {
      customer_id: user.id,
      shop_id: shopId,
      barber_id: parseInt(selectedBarber),
      service_ids: [service.id], // Assuming one service per booking for now
      booking_date: selectedDate,
      booking_time: selectedTime,
      total_price: service.price,
      customer_notes: customerInfo.notes,
    };

    const { success, error: bookingError } = await createBooking(bookingData);

    if (success) {
      setIsBooked(true);
    } else {
      setError(bookingError || "Failed to create booking.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading shop details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Shop not found.</p>
      </div>
    );
  }

  if (isBooked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Booking Confirmed!
            </CardTitle>
            <CardDescription>
              Your appointment has been successfully booked
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p>
                <strong>Service:</strong>{" "}
                {
                  shop.services.find((s) => s.id.toString() === selectedService)
                    ?.name
                }
              </p>
              <p>
                <strong>Date:</strong> {selectedDate}
              </p>
              <p>
                <strong>Time:</strong> {selectedTime}
              </p>
              <p>
                <strong>Customer:</strong> {customerInfo.name}
              </p>
            </div>
            <p className="text-sm text-gray-600 text-center">
              A confirmation email has been sent to {customerInfo.email}
            </p>
            <Link href="/">
              <Button className="w-full">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleBooking} className="space-y-8">
          {/* Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {shop?.services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - {service.duration} min - ₹{service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Barber Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedBarber}
                onValueChange={setSelectedBarber}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a Staff" />
                </SelectTrigger>
                <SelectContent>
                  {shop?.barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id.toString()}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div>
                <Label>Time Slot</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                  {availableTimeSlots.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="text-xs"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Special Requests (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or notes for your Staff..."
                  value={customerInfo.notes}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, notes: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary & Submit */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedService && selectedDate && selectedTime ? (
                <div className="bg-blue-50 p-4 rounded-lg space-y-2 mb-4">
                  <p>
                    <strong>Service:</strong>{" "}
                    {
                      shop?.services.find(
                        (s) => s.id.toString() === selectedService,
                      )?.name
                    }
                  </p>
                  <p>
                    <strong>Staff:</strong>{" "}
                    {
                      shop?.barbers.find(
                        (b) => b.id.toString() === selectedBarber,
                      )?.name
                    }
                  </p>
                  <p>
                    <strong>Date:</strong> {selectedDate}
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedTime}
                  </p>
                  <p>
                    <strong>Duration:</strong>{" "}
                    {
                      shop?.services.find(
                        (s) => s.id.toString() === selectedService,
                      )?.duration
                    }{" "}
                    min
                  </p>
                  <p>
                    <strong>Price:</strong> ₹
                    {
                      shop?.services.find(
                        (s) => s.id.toString() === selectedService,
                      )?.price
                    }
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 mb-4">
                  Please select service, date, and time to see booking summary
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={
                  !selectedService ||
                  !selectedDate ||
                  !selectedTime ||
                  !customerInfo.name ||
                  !customerInfo.phone ||
                  !customerInfo.email
                }
              >
                Confirm Booking
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}
