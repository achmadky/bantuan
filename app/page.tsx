"use client"

import { useState, useMemo, useEffect } from "react"
import { getApprovedOffers, type Offer } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MapPin,
  DollarSign,
  User,
  Briefcase,
  MessageCircle,
  Plus,
  Search,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [databaseError, setDatabaseError] = useState(false)
  const [filters, setFilters] = useState({
    city: "",
    skill: "",
  })

  const fetchOffers = async () => {
    try {
      setLoading(true)
      setDatabaseError(false)
      const fetchedOffers = await getApprovedOffers()
      setOffers(fetchedOffers)
    } catch (error) {
      console.error("Error fetching offers:", error)
      setDatabaseError(true)
    } finally {
      setLoading(false)
    }
  }

  const refreshOffers = async () => {
    try {
      setRefreshing(true)
      setDatabaseError(false)
      const fetchedOffers = await getApprovedOffers()
      setOffers(fetchedOffers)
    } catch (error) {
      console.error("Error refreshing offers:", error)
      setDatabaseError(true)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  // Calculate filtered offers using useMemo
  const filteredOffers = useMemo(() => {
    let filtered = offers

    if (filters.city) {
      filtered = filtered.filter((offer) => offer.city.toLowerCase().includes(filters.city.toLowerCase()))
    }

    if (filters.skill) {
      filtered = filtered.filter((offer) => offer.skill.toLowerCase().includes(filters.skill.toLowerCase()))
    }

    return filtered
  }, [offers, filters.city, filters.skill])

  const handleWhatsAppClick = (name: string, skill: string) => {
    const message = `Halo ${name}, saya tertarik dengan layanan ${skill} yang Anda tawarkan di Bantuin. Bisakah kita diskusi lebih lanjut?`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  // Get unique cities and skills for suggestions - memoized
  const uniqueCities = useMemo(() => [...new Set(offers.map((offer) => offer.city))], [offers])
  const uniqueSkills = useMemo(() => [...new Set(offers.map((offer) => offer.skill))], [offers])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bantuin</h1>
                <p className="text-gray-600 text-sm">Temukan orang yang bisa membantu Anda</p>
              </div>
              <Link href="/tawarkan-bantuan">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={16} className="mr-2" />
                  Tawarkan Bantuan
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat bantuan tersedia...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bantuin</h1>
              <p className="text-gray-600 text-sm">Temukan orang yang bisa membantu Anda</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={refreshOffers}
                variant="outline"
                size="sm"
                disabled={refreshing}
                className="flex items-center gap-2 bg-transparent"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Memuat..." : "Refresh"}
              </Button>
              <Link href="/tawarkan-bantuan">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={16} className="mr-2" />
                  Tawarkan Bantuan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Database Error Alert */}
      {databaseError && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Database Error:</strong> Tidak dapat terhubung ke database. Silakan coba lagi nanti.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Search size={18} className="text-gray-500" />
            <h2 className="font-medium text-gray-900">Filter Bantuan</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan lokasi..."
                  value={filters.city}
                  onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                  className="pl-10"
                />
              </div>
              {filters.city && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {uniqueCities
                    .filter((city) => city.toLowerCase().includes(filters.city.toLowerCase()))
                    .slice(0, 3)
                    .map((city) => (
                      <button
                        key={city}
                        onClick={() => setFilters((prev) => ({ ...prev, city }))}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-700"
                      >
                        {city}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="relative">
                <Briefcase size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan keahlian..."
                  value={filters.skill}
                  onChange={(e) => setFilters((prev) => ({ ...prev, skill: e.target.value }))}
                  className="pl-10"
                />
              </div>
              {filters.skill && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {uniqueSkills
                    .filter((skill) => skill.toLowerCase().includes(filters.skill.toLowerCase()))
                    .slice(0, 3)
                    .map((skill) => (
                      <button
                        key={skill}
                        onClick={() => setFilters((prev) => ({ ...prev, skill }))}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-700"
                      >
                        {skill}
                      </button>
                    ))}
                </div>
              )}
            </div>
            {(filters.city || filters.skill) && (
              <Button
                variant="outline"
                onClick={() => setFilters({ city: "", skill: "" })}
                className="whitespace-nowrap self-start"
              >
                Reset Filter
              </Button>
            )}
          </div>

          {/* Filter Results Info */}
          {(filters.city || filters.skill) && (
            <div className="mt-3 text-sm text-gray-600">
              Menampilkan {filteredOffers.length} dari {offers.length} bantuan
              {filters.city && (
                <span className="ml-2">
                  <Badge variant="secondary" className="text-xs">
                    Lokasi: {filters.city}
                  </Badge>
                </span>
              )}
              {filters.skill && (
                <span className="ml-2">
                  <Badge variant="secondary" className="text-xs">
                    Keahlian: {filters.skill}
                  </Badge>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {filteredOffers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Briefcase size={48} className="mx-auto" />
            </div>
            {filters.city || filters.skill ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada bantuan ditemukan</h3>
                <p className="text-gray-600 mb-4">Coba ubah filter pencarian Anda</p>
                <Button variant="outline" onClick={() => setFilters({ city: "", skill: "" })} className="mr-4">
                  Reset Filter
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada bantuan tersedia</h3>
                <p className="text-gray-600 mb-6">Jadilah yang pertama menawarkan bantuan!</p>
              </>
            )}
            <Link href="/tawarkan-bantuan">
              <Button>Tawarkan Bantuan Anda</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOffers.map((offer) => (
              <Card key={offer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={18} className="text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{offer.name}</h3>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase size={16} className="text-gray-500" />
                        <span className="text-gray-700">{offer.skill}</span>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{offer.city}</span>
                        </div>

                        {offer.paymentRange && (
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} className="text-gray-400" />
                            <Badge variant="secondary" className="text-xs">
                              {offer.paymentRange}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-700 text-sm leading-relaxed mb-3">{offer.description}</p>

                      <p className="text-xs text-gray-500">
                        Ditambahkan {new Date(offer.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleWhatsAppClick(offer.name, offer.skill)}
                      className="bg-green-600 hover:bg-green-700 ml-4"
                      size="sm"
                    >
                      <MessageCircle size={16} className="mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
