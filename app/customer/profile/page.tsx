"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Edit, Save, X, Loader2, Scissors } from "lucide-react"
import { AddressAutocompleteInput } from "@/components/ui/address-autocomplete-input"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { updateCustomerProfile, getCustomerProfile } from "@/lib/profile-actions"

interface CustomerProfile {
  id: string
  name: string
  email: string
  age: number
  sex: string
  phone: string
  location: string
  latitude: number | null;
  longitude: number | null;
  created_at: string
}

export default function CustomerProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [editData, setEditData] = useState({
    name: "",
    age: "",
    sex: "",
    phone: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
  })

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const result = await getCustomerProfile(user!.id)

      if (result.error) {
        setError(result.error)
      } else if (result.profile) {
        setProfile(result.profile)
        setEditData({
          name: result.profile.name,
          age: result.profile.age.toString(),
          sex: result.profile.sex,
          phone: result.profile.phone,
          location: result.profile.location,
          latitude: result.profile.latitude || null,
          longitude: result.profile.longitude || null,
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

      const result = await updateCustomerProfile(user!.id, {
        name: editData.name,
        age: Number.parseInt(editData.age),
        sex: editData.sex,
        phone: editData.phone,
        location: editData.location,
        latitude: editData.latitude,
        longitude: editData.longitude,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess("Profile updated successfully!")
        setIsEditing(false)
        await loadProfile() // Reload profile data
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) {
      setError("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditData({
        name: profile.name,
        age: profile.age.toString(),
        sex: profile.sex,
        phone: profile.phone,
        location: profile.location,
        latitude: profile.latitude || null,
        longitude: profile.longitude || null,
      })
    }
    setIsEditing(false)
    setError("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full bg-card">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Profile not found</p>
            <Link href="/customer/home">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/customer/home">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            {user?.is_shop_owner && ( // Assuming user.is_shop_owner exists
              <Link href="/shop-owner/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  Dashboard
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="OGGroom Logo" width={30} height={30} />
              <span className="text-xl font-bold text-foreground">My Profile</span>
            </div>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User Avatar" />
            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex flex-col items-center py-6">
        <div className="w-full max-w-2xl space-y-6">
          {/* Profile Card */}
          <Card className="shadow-lg bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile Picture" />
                    <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl text-foreground">{profile.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </CardDescription>
                  </div>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && <div className="p-3 bg-destructive border border-destructive text-destructive-foreground rounded">{error}</div>}
              {success && (
                <div className="p-3 bg-accent border-accent text-accent-foreground rounded">{success}</div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-foreground">{profile.name}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {profile.email} <span className="text-xs">(Cannot be changed)</span>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="age" className="text-sm font-medium text-muted-foreground">
                      Age
                    </Label>
                    {isEditing ? (
                      <Input
                        id="age"
                        type="number"
                        value={editData.age}
                        onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                        className="mt-1"
                        min="1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-foreground">{profile.age} years old</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sex" className="text-sm font-medium text-muted-foreground">
                      Sex
                    </Label>
                    {isEditing ? (
                      <Select value={editData.sex} onValueChange={(value) => setEditData({ ...editData, sex: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="unisex">Unisex</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-sm text-foreground capitalize">{profile.sex}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">
                      Phone Number
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-foreground flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {profile.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <AddressAutocompleteInput
                      id="location"
                      label="Location"
                      value={editData.location}
                      onChange={(address, lat, lng) => setEditData({ ...editData, location: address, latitude: lat, longitude: lng })}
                      disabled={!isEditing}
                    />
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

          {/* Account Information */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Member since: {new Date(profile.created_at).toLocaleDateString()}</p>
                <p className="mt-1">Account ID: {profile.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}