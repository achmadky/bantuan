"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RemovalRequestModal } from "@/components/removal-request-modal"

export default function TawarkanBantuanPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    skill: "",
    city: "",
    phoneNumber: "",
    paymentRange: "",
    description: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/submit-offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        alert("Penawaran bantuan berhasil dikirim! Menunggu persetujuan admin.")
        setFormData({
          name: "",
          skill: "",
          city: "",
          phoneNumber: "",
          paymentRange: "",
          description: "",
        })
        router.push("/")
      } else {
        alert(result.error || "Terjadi kesalahan saat mengirim penawaran")
      }
    } catch (error) {
      console.error("Error submitting offer:", error)
      alert("Terjadi kesalahan saat mengirim penawaran")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <img src="/bantuan-kita-logo.svg" alt="Bantuan-kita Logo" className="h-12 w-12" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Tawarkan Bantuan</h1>
                  <p className="text-gray-600 mt-1">Bagikan keahlian Anda untuk membantu orang lain</p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <RemovalRequestModal
                trigger={
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Hapus Akun
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Bantuan</CardTitle>
            <CardDescription>
              Isi formulir di bawah ini untuk menawarkan bantuan Anda. Penawaran akan ditinjau oleh admin sebelum
              dipublikasikan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Nomor WhatsApp *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="08123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill">Keahlian/Layanan *</Label>
                <Input
                  id="skill"
                  name="skill"
                  type="text"
                  required
                  value={formData.skill}
                  onChange={handleInputChange}
                  placeholder="Contoh: Desain Grafis, Les Matematika, Perbaikan Komputer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Kota *</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Contoh: Jakarta, Bandung, Surabaya"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentRange">Kisaran Tarif (Opsional)</Label>
                <Input
                  id="paymentRange"
                  name="paymentRange"
                  type="text"
                  value={formData.paymentRange}
                  onChange={handleInputChange}
                  placeholder="Contoh: IDR 100.000-200.000/jam"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Layanan *</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Jelaskan secara detail layanan yang Anda tawarkan, pengalaman, dan hal-hal penting lainnya"
                  rows={5}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Mengirim..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Kirim Penawaran
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
