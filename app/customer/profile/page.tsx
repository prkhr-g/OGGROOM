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
import Link from "next/link"
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
      })
    }
    setIsEditing(false)
    setError("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Profile not found</p>
            <Link href="/customer/home">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/customer/home">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">My Profile</span>
            </div>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User Avatar" />
            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="container py-6 space-y-6 max-w-2xl">
        {/* Profile Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile Picture" />
                  <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{profile.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
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
            {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
            {success && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
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
                    <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="mt-1 text-sm text-gray-500">
                    {profile.email} <span className="text-xs">(Cannot be changed)</span>
                  </p>
                </div>

                <div>
                  <Label htmlFor="age" className="text-sm font-medium text-gray-700">
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
                    <p className="mt-1 text-sm text-gray-900">{profile.age} years old</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="sex" className="text-sm font-medium text-gray-700">
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
                    <p className="mt-1 text-sm text-gray-900 capitalize">{profile.sex}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
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
                    <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Location
                  </Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </p>
                  )}
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
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p>Member since: {new Date(profile.created_at).toLocaleDateString()}</p>
              <p className="mt-1">Account ID: {profile.id}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
