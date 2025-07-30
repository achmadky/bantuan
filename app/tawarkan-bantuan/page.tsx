"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function TawarkanBantuanPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
    details?: string[]
  }>({ type: null, message: "" })

  const [formData, setFormData] = useState({
    name: "",
    skill: "",
    city: "",
    paymentRange: "",
    description: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Nama wajib diisi"
    else if (formData.name.trim().length < 2) newErrors.name = "Nama minimal 2 karakter"

    if (!formData.skill.trim()) newErrors.skill = "Keahlian wajib diisi"
    else if (formData.skill.trim().length < 3) newErrors.skill = "Keahlian minimal 3 karakter"

    if (!formData.city.trim()) newErrors.city = "Kota wajib diisi"
    else if (formData.city.trim().length < 2) newErrors.city = "Kota minimal 2 karakter"

    if (!formData.description.trim()) newErrors.description = "Deskripsi wajib diisi"
    else if (formData.description.trim().length < 10) newErrors.description = "Deskripsi minimal 10 karakter"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setSubmitStatus({
        type: "error",
        message: "Mohon perbaiki kesalahan pada form",
      })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: "" })

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
        setSubmitStatus({
          type: "success",
          message: result.message || "Bantuan berhasil dikirim!",
        })

        // Reset form
        setFormData({
          name: "",
          skill: "",
          city: "",
          paymentRange: "",
          description: "",
        })

        // Redirect after 3 seconds
        setTimeout(() => {
          router.push("/")
        }, 3000)
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Gagal mengirim bantuan",
          details: result.details,
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Terjadi kesalahan jaringan. Silakan coba lagi.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={16} className="mr-2" />
                Kembali
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tawarkan Bantuan</h1>
              <p className="text-gray-600 text-sm">Bagikan keahlian Anda dengan komunitas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {submitStatus.type && (
          <Alert
            className={`mb-6 ${submitStatus.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            {submitStatus.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={submitStatus.type === "success" ? "text-green-800" : "text-red-800"}>
              {submitStatus.message}
              {submitStatus.details && (
                <ul className="mt-2 list-disc list-inside">
                  {submitStatus.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              )}
              {submitStatus.type === "success" && (
                <p className="mt-2 text-sm">Anda akan diarahkan ke halaman utama dalam beberapa detik...</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ceritakan bagaimana Anda bisa membantu</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap Anda"
                  className={errors.name ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill">Keahlian / Bantuan yang Ditawarkan *</Label>
                <Input
                  id="skill"
                  name="skill"
                  value={formData.skill}
                  onChange={handleChange}
                  placeholder="Contoh: Pembuatan Website, Desain Grafis, Les Privat"
                  className={errors.skill ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.skill && <p className="text-sm text-red-600">{errors.skill}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Kota atau Lokasi *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Contoh: Jakarta, Bandung, Online"
                  className={errors.city ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentRange">Perkiraan Tarif (Opsional)</Label>
                <Input
                  id="paymentRange"
                  name="paymentRange"
                  value={formData.paymentRange}
                  onChange={handleChange}
                  placeholder="Contoh: IDR 100.000-200.000/jam, IDR 1.000.000-2.000.000/proyek"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Jelaskan pengalaman Anda, bantuan spesifik yang bisa diberikan, dan detail relevan lainnya..."
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                <p className="text-xs text-gray-500">{formData.description.length}/1000 karakter</p>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || submitStatus.type === "success"}>
                {isSubmitting ? (
                  "Mengirim..."
                ) : submitStatus.type === "success" ? (
                  "Berhasil Dikirim!"
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
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
