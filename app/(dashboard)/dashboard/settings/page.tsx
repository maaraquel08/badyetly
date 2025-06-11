"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"

export default function SettingsPage() {
  const { toast } = useToast()
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [currency, setCurrency] = useState("PHP")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || "")

      // Load user preferences from localStorage
      const userCurrency = localStorage.getItem("userCurrency")
      if (userCurrency) {
        setCurrency(userCurrency)
      }
    }
  }, [user])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await updateProfile({ name })

      if (error) {
        throw error
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)

    setTimeout(() => {
      toast({
        title: "Notification preferences updated",
        description: `Email notifications ${emailNotifications ? "enabled" : "disabled"}.`,
      })
      setIsLoading(false)
    }, 1000)
  }

  const handleSaveCurrency = async () => {
    setIsLoading(true)

    setTimeout(() => {
      toast({
        title: "Currency updated",
        description: `Currency set to ${currency}.`,
      })
      setIsLoading(false)

      // Save to localStorage
      localStorage.setItem("userCurrency", currency)
    }, 1000)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardHeader heading="Settings" text="Manage your account settings and preferences." />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveProfile}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>Set your preferred currency for displaying amounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHP">Philippine Peso (₱)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                  <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                This will change how amounts are displayed throughout the application.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveCurrency} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save currency"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you want to be notified about your dues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email reminders about upcoming and overdue payments.
                </p>
              </div>
              <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveNotifications} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save preferences"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
