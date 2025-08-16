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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-6 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto">
              <Link href="/" className="mb-3 sm:mb-0">
                <Button variant="ghost" size="sm" className="sm:mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div className="flex items-center gap-3 sm:gap-4">
                <img src="/bantuan-kita-logo.svg" alt="Bantuan-kita Logo" className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    Tawarkan Bantuan
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1 leading-tight">
                    Bagikan keahlian Anda untuk membantu orang lain
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center w-full sm:w-auto justify-end">
              <RemovalRequestModal
                trigger={
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-sm sm:text-base px-3 sm:px-4">
                    Hapus Akun
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">Informasi Bantuan</CardTitle>
            <CardDescription className="text-sm sm:text-base leading-relaxed">
              Isi formulir di bawah ini untuk menawarkan bantuan Anda. Penawaran akan ditinjau oleh admin sebelum
              dipublikasikan.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nama Lengkap *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap Anda"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium">Nomor WhatsApp *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="08123456789"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill" className="text-sm font-medium">Keahlian/Layanan *</Label>
                <Input
                  id="skill"
                  name="skill"
                  type="text"
                  required
                  value={formData.skill}
                  onChange={handleInputChange}
                  placeholder="Contoh: Desain Grafis, Les Matematika, Perbaikan Komputer"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">Kota *</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Contoh: Jakarta, Bandung, Surabaya"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentRange" className="text-sm font-medium">Kisaran Tarif (Opsional)</Label>
                <Input
                  id="paymentRange"
                  name="paymentRange"
                  type="text"
                  value={formData.paymentRange}
                  onChange={handleInputChange}
                  placeholder="Contoh: IDR 100.000-200.000/jam"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Deskripsi Layanan *</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Jelaskan secara detail layanan yang Anda tawarkan, pengalaman, dan hal-hal penting lainnya"
                  rows={4}
                  className="text-base resize-none"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 h-11 sm:h-10 text-base font-medium" 
                disabled={isSubmitting}
              >
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
