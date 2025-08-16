"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, User, Briefcase, Plus, MessageCircle, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Offer {
  name: string
  skill: string
  city: string
  phoneNumber: string
  paymentRange?: string
  description: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

interface PaginatedResponse {
  data: Offer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "")

  if (cleaned.startsWith("0")) {
    return "62" + cleaned.substring(1)
  }

  if (!cleaned.startsWith("62")) {
    return "62" + cleaned
  }

  return cleaned
}

function WhatsAppButton({ name, skill, phoneNumber }: { name: string; skill: string; phoneNumber: string }) {
  const handleWhatsAppClick = () => {
    const formattedPhone = formatPhoneNumber(phoneNumber)
    const message = `Halo ${name}, saya tertarik dengan layanan ${skill} yang Anda tawarkan di Bantuan-Kita. Bisakah kita diskusi lebih lanjut?`
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <Button onClick={handleWhatsAppClick} className="bg-green-600 hover:bg-green-700 text-white">
      <MessageCircle className="w-4 h-4 mr-2" />
      WhatsApp
    </Button>
  )
}

export default function HomePage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchBantuan, setSearchBantuan] = useState("")
  const [searchCity, setSearchCity] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [searchLoading, setSearchLoading] = useState(false)

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchOffers(1, searchBantuan, searchCity)
  }, [])

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1)
      fetchOffers(1, searchBantuan, searchCity)
    }, 500)

    setSearchTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [searchBantuan, searchCity])

  const fetchOffers = async (page: number = 1, skill?: string, city?: string) => {
    try {
      setSearchLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5'
      })

      if (skill) params.append('skill', skill)
      if (city) params.append('city', city)

      const response = await fetch(`/api/offers?${params.toString()}`)
      const data: PaginatedResponse = await response.json()
      
      setOffers(data.data)
      setPagination(data.pagination)
      setCurrentPage(page)
    } catch (error) {
      console.error("Gagal mengambil data bantuan:", error)
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchBantuan("")
    setSearchCity("")
    setCurrentPage(1)
    fetchOffers(1)
  }

  const handlePageChange = (page: number) => {
    fetchOffers(page, searchBantuan, searchCity)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Memuat bantuan tersedia...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <img src="/bantuan-kita-logo.svg" alt="Bantuan-kita Logo" className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Bantuan-kita</h1>
                <p className="text-gray-600 text-xs sm:text-sm leading-tight">Temukan bantuan yang Anda butuhkan</p>
              </div>
            </div>
            <Link href="/tawarkan-bantuan" className="w-full sm:w-auto">
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto text-sm px-4 py-2">
                <Plus size={16} />
                <span>Tawarkan Bantuan</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Filter Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bantuan */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Cari bantuan..."
                  value={searchBantuan}
                  onChange={(e) => setSearchBantuan(e.target.value)}
                  className="pl-10 text-base"
                  disabled={searchLoading}
                />
              </div>

              {/* Search City */}
              <div className="relative flex-1">
                <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Cari kota..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="pl-10 text-base"
                  disabled={searchLoading}
                />
              </div>

              {/* Clear Filters */}
              {(searchBantuan || searchCity) && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters} 
                  className="whitespace-nowrap bg-transparent w-full sm:w-auto" 
                  disabled={searchLoading}
                >
                  Reset Filter
                </Button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-xs sm:text-sm text-gray-600">
            {searchLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Mencari...
              </span>
            ) : (
              <>
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} bantuan
              </>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {offers.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-sm sm:text-base">
              {pagination.total === 0
                ? "Belum ada bantuan yang tersedia"
                : "Tidak ada bantuan yang sesuai dengan filter Anda"}
            </p>
            {(searchBantuan || searchCity) && (
              <Button variant="outline" onClick={clearFilters} className="mt-4 bg-transparent">
                Reset Filter
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {offers.map((offer, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <User size={18} className="text-blue-600 flex-shrink-0" />
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">{offer.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-900 leading-tight">{offer.skill}</span>
                    </div>

                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{offer.city}</span>
                      </div>

                      {offer.paymentRange && (
                        <Badge variant="secondary" className="text-xs w-fit">
                          Rp {offer.paymentRange}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-3">{offer.description}</p>

                  <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-3">
                    <div className="text-xs text-gray-500 order-2 xs:order-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Tersedia • {new Date(offer.createdAt).toLocaleDateString("id-ID")}
                    </div>
                    <div className="order-1 xs:order-2">
                      <WhatsAppButton name={offer.name} skill={offer.skill} phoneNumber={offer.phoneNumber} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 sm:mt-8">
            <nav className="flex justify-center">
              <ul className="flex flex-wrap justify-center gap-1 sm:gap-2">
                {pagination.hasPrev && (
                  <li>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-2 sm:px-3 py-1 sm:py-2 rounded border border-gray-300 hover:bg-gray-50 flex items-center gap-1 text-sm"
                      disabled={searchLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>
                  </li>
                )}
                
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (pagination.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else {
                    const start = Math.max(1, currentPage - 2);
                    const end = Math.min(pagination.totalPages, start + 4);
                    pageNumber = start + i;
                    if (pageNumber > end) return null;
                  }
                  
                  return (
                    <li key={pageNumber}>
                      <button
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-2 sm:px-3 py-1 sm:py-2 rounded text-sm ${
                          currentPage === pageNumber 
                            ? 'bg-blue-600 text-white' 
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                        disabled={searchLoading}
                      >
                        {pageNumber}
                      </button>
                    </li>
                  );
                })}
                
                {pagination.hasNext && (
                  <li>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-2 sm:px-3 py-1 sm:py-2 rounded border border-gray-300 hover:bg-gray-50 flex items-center gap-1 text-sm"
                      disabled={searchLoading}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        )}
      </main>
    </div>
  )
}
