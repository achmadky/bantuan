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
  const [customReason, setCustomReason] = useState("")
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
    
    // Use custom reason if "Lainnya" is selected
    const finalReason = formData.reason === "Lainnya" ? customReason : formData.reason
    
    if (!formData.name || !formData.phoneNumber || !finalReason) {
      toast.error("Mohon lengkapi semua field yang diperlukan")
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/request-removal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          reason: finalReason
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Success popup
        toast.success("✅ Permohonan penghapusan akun berhasil dikirim! Menunggu persetujuan admin.", {
          duration: 5000,
        })
        setFormData({ name: "", phoneNumber: "", reason: "" })
        setCustomReason("")
        setOpen(false)
      } else {
        // Handle different error scenarios with specific messages
        if (response.status === 404) {
          toast.error("❌ Data tidak ditemukan", {
            description: "Tidak ada akun yang cocok dengan nama dan nomor WhatsApp yang Anda masukkan."
          })
        } else if (response.status === 400 && result.error === "You already have a pending removal request") {
          toast.error("⚠️ Permohonan sudah ada", {
            description: "Anda sudah memiliki permohonan penghapusan yang sedang diproses. Mohon tunggu konfirmasi admin."
          })
        } else if (response.status === 400) {
          toast.error("❌ Data tidak lengkap", {
            description: "Mohon pastikan semua field telah diisi dengan benar."
          })
        } else {
          toast.error("❌ Gagal mengirim permohonan", {
            description: result.error || "Terjadi kesalahan sistem. Silakan coba lagi nanti."
          })
        }
      }
    } catch (error) {
      console.error('Error submitting removal request:', error)
      toast.error("❌ Koneksi bermasalah", {
        description: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi."
      })
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
            Mohon berikan detail Anda untuk meminta penghapusan akun. Tindakan ini memerlukan persetujuan admin.
          </DialogDescription>
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
            <Select onValueChange={(value) => {
              setFormData(prev => ({ ...prev, reason: value }))
              if (value !== "Lainnya") {
                setCustomReason("")
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih alasan" />
              </SelectTrigger>
              <SelectContent>
                {predefinedReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.reason === "Lainnya" && (
              <Textarea
                placeholder="Mohon lampirkan alasan anda"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="mt-2"
                required
              />
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batalkan
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Permohonan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}