"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Clock, DollarSign, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { getShopDetailsForCustomer, getAllTimeSlots } from "@/lib/profile-actions";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { v4 as uuidv4 } from "uuid";

interface Shop {
  id: string;
  name: string;
  type: string;
  address: string;
  is_open: boolean;
  opening_time: string;
  closing_time: string;
  services: Service[];
  barbers: Barber[];
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
}

interface TimeSlot {
  time_slot: string;
  status: "available" | "booked";
}

function BookAppointmentScreenContent() {
  const params = useParams();
  const shopId = params.shopId as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [allTimeSlots, setAllTimeSlots] = useState<TimeSlot[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  const formatDateToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const barberRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchShopDetails = async () => {
      if (!shopId) return;
      try {
        setIsLoading(true);
        const result = await getShopDetailsForCustomer(shopId);
        if (result.error) {
          throw new Error(result.error);
        }
        setShop(result.shop);

        const serviceIdsFromQuery = searchParams.get("services");
        if (serviceIdsFromQuery) {
          setSelectedServiceIds(serviceIdsFromQuery.split(",").map(Number));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShopDetails();
  }, [shopId, searchParams]);

  const handleServiceToggle = (serviceId: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const selectedServicesDetails = useMemo(() => {
    return (
      shop?.services.filter((s) => selectedServiceIds.includes(s.id)) || []
    );
  }, [selectedServiceIds, shop?.services]);

  const totalPrice = useMemo(() => {
    return selectedServicesDetails.reduce(
      (sum, service) => sum + service.price,
      0,
    );
  }, [selectedServicesDetails]);

  const totalDuration = useMemo(() => {
    return selectedServicesDetails.reduce(
      (sum, service) => sum + service.duration,
      0,
    );
  }, [selectedServicesDetails]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (selectedBarberId && selectedDate && shopId) {
        setIsFetchingSlots(true);
        setError(null);
        try {
          const formattedDate = formatDateToYYYYMMDD(selectedDate);
          const result = await getAllTimeSlots(
            shopId,
            selectedBarberId,
            formattedDate,
          );
          if (result.error) {
            throw new Error(result.error);
          }
          setAllTimeSlots(result.slots || []);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsFetchingSlots(false);
        }
      } else {
        setAllTimeSlots([]);
      }
    };
    fetchTimeSlots();
  }, [selectedBarberId, selectedDate, shopId]);

  const canSlotAccommodate = (startTime: string): boolean => {
    if (totalDuration === 0) return false;

    const startIndex = allTimeSlots.findIndex(
      (slot) => slot.time_slot === startTime,
    );
    if (startIndex === -1) return false;

    const requiredSlots = Math.ceil(totalDuration / 15);

    for (let i = 0; i < requiredSlots; i++) {
      const slotIndex = startIndex + i;
      if (
        slotIndex >= allTimeSlots.length ||
        allTimeSlots[slotIndex].status === "booked"
      ) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (selectedServiceIds.length > 0 && barberRef.current) {
      barberRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedServiceIds]);

  useEffect(() => {
    if (selectedBarberId && calendarRef.current) {
      calendarRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedBarberId]);

  useEffect(() => {
    if (selectedDate && timeRef.current) {
      timeRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedDate]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m > 0 ? ` ${m}min` : ""}`;
  };

  const handlePayment = async () => {
    if (!user || !shop) {
      setError("You must be logged in to make a payment.");
      return;
    }
    setIsProcessingPayment(true);
    setError(null);
    try {
      const orderId = uuidv4();
      const orderDetails = {
        orderId,
        amount: totalPrice,
        currency: "INR",
        customerDetails: {
          customer_id: user.id,
          customer_email: user.email,
          customer_phone: user.phone || "9999999999",
        },
        shopId: shop.id,
      };

      const response = await fetch("/api/cashfree/initiate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderDetails }),
      });

      const data = await response.json();

      if (data.success && data.payment_session_id) {
        const cashfreeSDK = new (window as any).Cashfree(
          data.payment_session_id,
        );
        cashfreeSDK.redirect();
      } else {
        throw new Error(data.error?.message || "Failed to initiate payment.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const selectedBarberData = shop?.barbers.find(
    (b) => b.id === selectedBarberId,
  );
  const canProceed =
    selectedServiceIds.length > 0 &&
    selectedBarberId &&
    selectedDate &&
    selectedTime;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full bg-card">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full bg-card">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Shop not found.</p>
            <Link href="/customer/shop">
              <Button>Back to Shops</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-4">
            <Link href={`/customer/shop/${shop.id}`} className="flex items-center gap-2 px-4 sm:pl-6 md:px-8 lg:px-12">
              <Image src="/logo.png" alt="OGGROOM Logo" width={40} height={40} />
            </Link>
            <h1 className="text-xl font-semibold text-foreground">
              Book at {shop.name}
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              <span className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-base font-bold">
                1
              </span>
              Select Services
            </CardTitle>
            <CardDescription>
              Choose one or more services for your appointment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {shop.services.length === 0 ? (
              <p>No services available for this shop.</p>
            ) : (
              shop.services.map((service) => (
                <div
                  key={service.id}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm
                    ${
                      selectedServiceIds.includes(service.id)
                        ? "bg-primary/10 border-primary ring-1 ring-primary"
                        : "bg-background hover:bg-muted/50 border-border"
                    }`}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={selectedServiceIds.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`service-${service.id}`}
                        className="font-semibold text-foreground cursor-pointer text-base"
                      >
                        {service.name}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-foreground text-lg">
                      ₹{service.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center justify-end mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(service.duration)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {selectedServiceIds.length > 0 && (
          <Card className="shadow-lg bg-card" ref={barberRef}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <span className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-base font-bold">
                  2
                </span>
                Select Staff
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {shop.barbers.length === 0 ? (
                <p>No staffs available for this shop.</p>
              ) : (
                shop.barbers.map((barber) => (
                  <Card
                    key={barber.id}
                    className={`cursor-pointer transition-all p-4 rounded-lg border
                                    ${
                                      selectedBarberId === barber.id
                                        ? "bg-primary/10 border-primary ring-2 ring-primary"
                                        : "bg-background hover:bg-muted/50 border-border"
                                    }`}
                    onClick={() => setSelectedBarberId(barber.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="/placeholder.svg?height=60&width=60" />
                        <AvatarFallback>
                          {barber.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {barber.name}
                        </h3>

                        <div className="flex flex-wrap gap-1 mt-1">
                          {barber.specialties.map((specialty, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {selectedBarberId && (
          <div className="grid md:grid-cols-2 gap-6" ref={calendarRef}>
            <Card className="shadow-lg bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <span className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-base font-bold">
                    3
                  </span>
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-2 text-center">
                  You can only book slots up to three days in advance.
                </p>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) =>
                    date < new Date(new Date().setDate(new Date().getDate() - 1)) ||
                    date > new Date(new Date().setDate(new Date().getDate() + 3))
                  }
                  className="rounded-md border-border p-0"
                />
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-card" ref={timeRef}>
              <CardHeader>
                <CardTitle className="text-xl text-foreground">
                  Select Time
                </CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `Showing all slots for ${selectedDate.toLocaleDateString()}`
                    : "Please select a date first"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isFetchingSlots ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : allTimeSlots.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No slots available for this date. The shop might be closed.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {allTimeSlots.map((slot) => {
                      const isPastSlot =
                        selectedDate &&
                        selectedDate.toDateString() === new Date().toDateString() &&
                        new Date(
                          selectedDate.getFullYear(),
                          selectedDate.getMonth(),
                          selectedDate.getDate(),
                          parseInt(slot.time_slot.split(":")[0]),
                          parseInt(slot.time_slot.split(":")[1]),
                        ) < new Date();

                      const isAvailable = slot.status === "available";
                      const canFit = isAvailable && canSlotAccommodate(slot.time_slot);
                      const isSelected = selectedTime === slot.time_slot;

                      return (
                        <Button
                          key={slot.time_slot}
                          variant={isSelected ? "default" : isAvailable ? "outline" : "destructive"}
                          size="sm"
                          onClick={() => setSelectedTime(slot.time_slot)}
                          disabled={!canFit || slot.status === "booked" || isPastSlot}
                          className={`text-xs ${
                            (!canFit || slot.status === "booked" || isPastSlot)
                              ? "bg-red-500/20 text-red-500 cursor-not-allowed" : ""
                          }`}
                        >
                          {slot.time_slot.substring(0, 5)}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {canProceed && (
          <Card className="shadow-xl mt-8 sticky bottom-4 z-10 bg-card">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-foreground mb-1">
                  Selected Services:
                </h4>
                <ul className="list-disc list-inside pl-1 space-y-1 text-sm text-muted-foreground">
                  {selectedServicesDetails.map((s) => (
                    <li key={s.id}>
                      {s.name} (₹{s.price.toFixed(2)}) -{" "}
                      {formatDuration(s.duration)}
                    </li>
                  ))}
                </ul>
              </div>
              {selectedBarberData && (
                <p className="text-sm">
                  <strong>Staff:</strong> {selectedBarberData.name}
                </p>
              )}
              {selectedDate && (
                <p className="text-sm">
                  <strong>Date:</strong> {selectedDate.toLocaleDateString()}
                </p>
              )}
              {selectedTime && (
                <p className="text-sm">
                  <strong>Time:</strong> {selectedTime}
                </p>
              )}
              <div className="border-t border-border pt-3 mt-3 space-y-1">
                <p className="flex justify-between text-sm">
                  <span>Total Estimated Duration:</span>
                  <span className="font-medium">
                    {formatDuration(totalDuration)}
                  </span>
                </p>
                <p className="flex justify-between text-lg font-semibold">
                  <span>Total Price:</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </p>
              </div>
              <Link
                href={`/confirmation?shop=${shop.id}&services=${selectedServiceIds.join(",")}&barber=${selectedBarberId}&date=${selectedDate ? formatDateToYYYYMMDD(selectedDate) : ""}&time=${selectedTime}`}
              >
                <Button className="w-full text-lg py-3 mt-2">
                  Continue to Confirmation
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function BookAppointmentScreen() {
  return (
    <AuthProvider>
      <BookAppointmentScreenContent />
    </AuthProvider>
  );
}
