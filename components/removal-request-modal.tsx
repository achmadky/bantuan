"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface RemovalRequestModalProps {
  trigger: React.ReactNode
}

export function RemovalRequestModal({ trigger }: RemovalRequestModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    reason: ""
  })

  const predefinedReasons = [
    "Tidak memerlukan layanan lagi",
    "Masalah privasi",
    "Menemukan solusi alternatif",
    "Alasan pribadi", 
    "Lainnya"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phoneNumber || !formData.reason) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/request-removal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        setFormData({ name: "", phoneNumber: "", reason: "" })
        setOpen(false)
      } else {
        toast.error(result.error || "Failed to submit removal request")
      }
    } catch (error) {
      console.error('Error submitting removal request:', error)
      toast.error("An error occurred while submitting your request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Permohonan Hapus Akun</DialogTitle>
          <DialogDescription>
Mohon berikan detail Anda untuk meminta penghapusan akun. Tindakan ini memerlukan persetujuan admin.          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Nomor WhatsApp</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Alasan Permohonan</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {predefinedReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.reason === "Other" && (
              <Textarea
                placeholder="Please specify your reason"
                value={formData.reason === "Other" ? "" : formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="mt-2"
              />
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}