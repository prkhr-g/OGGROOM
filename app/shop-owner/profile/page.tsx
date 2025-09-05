"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Store, Mail, Phone, MapPin, Calendar, Edit, Save, X, Loader2, Clock, Settings } from "lucide-react"
import { AddressAutocompleteInput } from "@/components/ui/address-autocomplete-input"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { updateShopOwnerProfile, getShopOwnerProfile, updateShopStatus, createShopOwnerProfile } from "@/lib/profile-actions"


interface ShopOwnerProfile {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
  shop: {
    id: string
    name: string
    type: string
    email: string
    phone: string
    address: string
    is_open: boolean
    opening_time: string
    closing_time: string
    shop_latitude: number | null;
    shop_longitude: number | null;
  }
}

export default function ShopOwnerProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<ShopOwnerProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [editData, setEditData] = useState({
    ownerName: "",
    ownerEmail: user?.email || "",
    ownerPhone: "",
    shopName: "",
    shopType: "barbershop",
    shopEmail: "",
    shopPhone: "",
    shopAddress: "",
    shopLatitude: null as number | null,
    shopLongitude: null as number | null,
    openingTime: "09:00",
    closingTime: "18:00",
  })

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const result = await getShopOwnerProfile(user!.id)

      if (result.error) {
        setError(result.error)
      } else if (result.profile) {
        setProfile(result.profile)
        setEditData({
          ownerName: result.profile.name,
          ownerEmail: result.profile.email,
          ownerPhone: result.profile.phone,
          shopName: result.profile.shop.name,
          shopType: result.profile.shop.type,
          shopEmail: result.profile.shop.email,
          shopPhone: result.profile.shop.phone,
          shopAddress: result.profile.shop.address,
          shopLatitude: result.profile.shop.shop_latitude || null,
          shopLongitude: result.profile.shop.shop_longitude || null,
          openingTime: (result.profile.shop.opening_time || "09:00").substring(0, 5),
          closingTime: (result.profile.shop.closing_time || "18:00").substring(0, 5),
        })
      }
    } catch (error) {
      setError("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError("")
      setSuccess("")

      let result
      const dataToSave = {
        ...editData,
        shopLatitude: editData.shopLatitude,
        shopLongitude: editData.shopLongitude,
      }

      if (profile) {
        // Update existing profile
        result = await updateShopOwnerProfile(user!.id, profile.shop.id, dataToSave)
      } else {
        // Create new profile
        result = await createShopOwnerProfile(user!.id, dataToSave)
      }

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess("Profile saved successfully!")
        setIsEditing(false)
        // Redirect to dashboard after successful creation/update
        router.push('/shop-owner/dashboard');
      }
    } catch (error) {
      setError("Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusToggle = async (isOpen: boolean) => {
    if (!profile) return;
    try {
      setIsUpdatingStatus(true)
      setError("")

      const result = await updateShopStatus(profile.shop.id, {
        is_open: isOpen,
        opening_time: editData.openingTime,
        closing_time: editData.closingTime,
      })

      if (result.error) {
        setError(result.error)
      } else {
        await loadProfile()
      }
    } catch (error) {
      setError("Failed to update shop status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      // Reset to original profile data
      setEditData({
        ownerName: profile.name,
        ownerEmail: profile.email,
        ownerPhone: profile.phone,
        shopName: profile.shop.name,
        shopType: profile.shop.type,
        shopEmail: profile.shop.email,
        shopPhone: profile.shop.phone,
        shopAddress: profile.shop.address,
        shopLatitude: profile.shop.shop_latitude || null,
        shopLongitude: profile.shop.shop_longitude || null,
        openingTime: (profile.shop.opening_time || "09:00").substring(0, 5),
        closingTime: (profile.shop.closing_time || "18:00").substring(0, 5),
      })
      setIsEditing(false)
    } else {
        // If was in creation mode, just redirect to home or another appropriate page
        router.push('/');
    }
    setError("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // The form is always displayed, but its behavior (create/edit) depends on `profile`
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">
              {profile ? "Shop Profile" : "Create Your Shop Profile"}
            </span>
          </div>
          <div className='flex items-center gap-3'>
            <Link href='/shop-owner/dashboard'>
              <Button variant='outline' size='sm'>Dashboard</Button>
            </Link>
            {profile && (
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User Avatar" />
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center py-6">
        <div className="w-full max-w-4xl space-y-6">
          {error && <div className="p-3 bg-destructive border border-destructive text-destructive-foreground rounded">{error}</div>}
          {success && <div className="p-3 bg-accent border-accent text-accent-foreground rounded">{success}</div>}

          {/* Profile Information Card */}
          <Card className="shadow-lg bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {profile && (
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Profile Picture" />
                      <AvatarFallback className="text-xl">{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <CardTitle className="text-xl text-foreground">{isEditing ? "Edit Profile Information" : profile?.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {user?.email}
                    </CardDescription>
                  </div>
                </div>
                {!isEditing && profile && (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Owner Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="owner-name">Owner Name</Label>
                      <Input id="owner-name" value={editData.ownerName} onChange={(e) => setEditData({ ...editData, ownerName: e.target.value })} disabled={!isEditing} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm text-muted-foreground">{user?.email} <span className="text-xs">(Cannot be changed)</span></p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="owner-phone">Owner Phone</Label>
                      <Input id="owner-phone" type="tel" value={editData.ownerPhone} onChange={(e) => setEditData({ ...editData, ownerPhone: e.target.value })} disabled={!isEditing} />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Shop Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="shop-name">Shop Name</Label>
                      <Input id="shop-name" value={editData.shopName} onChange={(e) => setEditData({ ...editData, shopName: e.target.value })} disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="shop-type">Shop Type</Label>
                      <Select value={editData.shopType} onValueChange={(value) => setEditData({ ...editData, shopType: value })} disabled={!isEditing}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="barbershop">Barbershop</SelectItem>
                          <SelectItem value="salon">Hair Salon</SelectItem>
                          <SelectItem value="spa">Beauty Spa</SelectItem>
                          <SelectItem value="unisex">Unisex Salon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="shop-email">Shop Email</Label>
                      <Input id="shop-email" type="email" value={editData.shopEmail} onChange={(e) => setEditData({ ...editData, shopEmail: e.target.value })} disabled={!isEditing} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="shop-phone">Shop Phone</Label>
                      <Input id="shop-phone" type="tel" value={editData.shopPhone} onChange={(e) => setEditData({ ...editData, shopPhone: e.target.value })} disabled={!isEditing} />
                    </div>
                    <div>
                      <AddressAutocompleteInput
                        id="shop-address"
                        label="Shop Address"
                        value={editData.shopAddress}
                        onChange={(address, lat, lng) => setEditData({ ...editData, shopAddress: address, shopLatitude: lat, shopLongitude: lng })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <>
                  <Separator />
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" />Save Changes</>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {profile && (
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Shop Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                      <div className="flex items-center gap-3">
                          <p className="font-medium">Current Status: </p>
                          <Badge variant={profile.shop.is_open ? "default" : "secondary"}>{profile.shop.is_open ? "Open" : "Closed"}</Badge>
                      </div>
                      <Switch checked={profile.shop.is_open} onCheckedChange={handleStatusToggle} disabled={isUpdatingStatus} />
                   </div>
                   <div className="grid md:grid-cols-2 gap-4">
                      <div>
                          <Label htmlFor="opening-time">Opening Time</Label>
                          <Input id="opening-time" type="time" value={editData.openingTime} onChange={(e) => setEditData({ ...editData, openingTime: e.target.value })} />
                      </div>
                      <div>
                          <Label htmlFor="closing-time">Closing Time</Label>
                          <Input id="closing-time" type="time" value={editData.closingTime} onChange={(e) => setEditData({ ...editData, closingTime: e.target.value })} />
                      </div>
                   </div>
                </CardContent>
              </Card>
          )}
        </div>
      </main>
    </div>
  )
}