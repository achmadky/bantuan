"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Eye, MapPin, User, Briefcase, RefreshCw, Check, X, ChevronLeft, ChevronRight } from "lucide-react"

interface Offer {
  id: string
  name: string
  skill: string
  city: string
  phoneNumber: string
  paymentRange?: string
  description: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export default function HiddenAdminPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [processingOffers, setProcessingOffers] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({
    pending: 1,
    approved: 1,
    rejected: 1
  })
  const offersPerPage = 5

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/offers")
      const data = await response.json()
      setOffers(data)
    } catch (error) {
      console.error("Gagal mengambil data bantuan:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshOffers = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/admin/offers")
      const data = await response.json()
      setOffers(data)
    } catch (error) {
      console.error("Gagal refresh data bantuan:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const approveOffer = async (offerId: string) => {
    if (processingOffers.has(offerId)) return

    setProcessingOffers((prev) => new Set(prev).add(offerId))

    try {
      const response = await fetch("/api/admin/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ offerId }),
      })

      const result = await response.json()

      if (response.ok) {
        setOffers((prev) =>
          prev.map((offer) => (offer.id === offerId ? { ...offer, status: "approved" as const } : offer)),
        )
        alert("Bantuan berhasil disetujui!")
      } else {
        alert(result.error || "Gagal menyetujui bantuan")
      }
    } catch (error) {
      console.error("Error approving offer:", error)
      alert("Gagal menyetujui bantuan")
    } finally {
      setProcessingOffers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(offerId)
        return newSet
      })
    }
  }

  const rejectOffer = async (offerId: string) => {
    if (processingOffers.has(offerId)) return

    if (!confirm("Apakah Anda yakin ingin menolak bantuan ini?")) return

    setProcessingOffers((prev) => new Set(prev).add(offerId))

    try {
      const response = await fetch("/api/admin/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ offerId }),
      })

      const result = await response.json()

      if (response.ok) {
        setOffers((prev) =>
          prev.map((offer) => (offer.id === offerId ? { ...offer, status: "rejected" as const } : offer)),
        )
        alert("Bantuan berhasil ditolak!")
      } else {
        alert(result.error || "Gagal menolak bantuan")
      }
    } catch (error) {
      console.error("Error rejecting offer:", error)
      alert("Gagal menolak bantuan")
    } finally {
      setProcessingOffers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(offerId)
        return newSet
      })
    }
  }

  const deleteOffer = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus bantuan ini?")) return

    try {
      const response = await fetch(`/api/admin/offers/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setOffers((prev) => prev.filter((offer) => offer.id !== id))
      } else {
        alert("Gagal menghapus bantuan")
      }
    } catch (error) {
      console.error("Gagal menghapus bantuan:", error)
      alert("Gagal menghapus bantuan")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Disetujui"
      case "rejected":
        return "Ditolak"
      case "pending":
        return "Menunggu"
      default:
        return status
    }
  }

  const filterOffers = (status: string) => {
    return offers.filter((offer) => offer.status === status)
  }
  
  // Get current offers for pagination
  const getPaginatedOffers = (status: string) => {
    const filteredOffersByStatus = filterOffers(status)
    const indexOfLastOffer = currentPage[status] * offersPerPage
    const indexOfFirstOffer = indexOfLastOffer - offersPerPage
    return filteredOffersByStatus.slice(indexOfFirstOffer, indexOfLastOffer)
  }
  
  // Change page
  const paginate = (status: string, pageNumber: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [status]: pageNumber
    }))
  }
  
  // Get total pages
  const getTotalPages = (status: string) => {
    return Math.ceil(filterOffers(status).length / offersPerPage)
  }

  const OfferCard = ({ offer }: { offer: Offer }) => (
    <Card key={offer.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">{offer.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(offer.status)}>{getStatusText(offer.status)}</Badge>
            {offer.status === "pending" && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => approveOffer(offer.id)}
                  disabled={processingOffers.has(offer.id)}
                >
                  {processingOffers.has(offer.id) ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Check size={14} />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => rejectOffer(offer.id)}
                  disabled={processingOffers.has(offer.id)}
                >
                  {processingOffers.has(offer.id) ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <X size={14} />
                  )}
                </Button>
              </>
            )}
            <Button variant="destructive" size="sm" onClick={() => deleteOffer(offer.id)}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-gray-500" />
            <span className="text-sm text-gray-900">{offer.skill}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-gray-500" />
              <span className="text-sm text-gray-600">{offer.city}</span>
            </div>

            {offer.paymentRange && (
              <Badge variant="secondary" className="text-xs">
                {offer.paymentRange}
              </Badge>
            )}
          </div>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed mb-3">{offer.description}</p>

        <div className="text-xs text-gray-500">
          📱 {offer.phoneNumber}
          <br />
          Dikirim {new Date(offer.createdAt).toLocaleDateString("id-ID")}
          <br />
          ID: {offer.id}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/bantuan-kita-logo.svg" alt="Bantuan-kita Logo" className="h-12 w-12" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel Admin</h1>
                <p className="text-gray-600 text-sm">Kelola penawaran bantuan</p>
              </div>
            </div>
            <Button
              onClick={refreshOffers}
              variant="outline"
              disabled={refreshing}
              className="flex items-center gap-2 bg-transparent"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Memuat..." : "Refresh"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Menunggu ({filterOffers("pending").length})</TabsTrigger>
            <TabsTrigger value="approved">Disetujui ({filterOffers("approved").length})</TabsTrigger>
            <TabsTrigger value="rejected">Ditolak ({filterOffers("rejected").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {filterOffers("pending").length === 0 ? (
                <p className="text-center text-gray-500 py-8">Tidak ada bantuan yang menunggu</p>
              ) : (
                <>
                  <div className="text-sm text-gray-600 mb-4">
                    Menampilkan {Math.min((currentPage.pending - 1) * offersPerPage + 1, filterOffers("pending").length)}-
                    {Math.min(currentPage.pending * offersPerPage, filterOffers("pending").length)} dari {filterOffers("pending").length} bantuan
                  </div>
                  {getPaginatedOffers("pending").map((offer) => <OfferCard key={offer.id} offer={offer} />)}
                  
                  {/* Pagination */}
                  {filterOffers("pending").length > offersPerPage && (
                    <div className="mt-6">
                      <nav className="flex justify-center">
                        <ul className="flex space-x-2">
                          {currentPage.pending > 1 && (
                            <li>
                              <button
                                onClick={() => paginate("pending", currentPage.pending - 1)}
                                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 flex items-center gap-1"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span>Previous</span>
                              </button>
                            </li>
                          )}
                          
                          {Array.from({ length: getTotalPages("pending") }, (_, i) => i + 1).map((number) => (
                            <li key={number}>
                              <button
                                onClick={() => paginate("pending", number)}
                                className={`px-3 py-1 rounded ${currentPage.pending === number ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                              >
                                {number}
                              </button>
                            </li>
                          ))}
                          
                          {currentPage.pending < getTotalPages("pending") && (
                            <li>
                              <button
                                onClick={() => paginate("pending", currentPage.pending + 1)}
                                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 flex items-center gap-1"
                              >
                                <span>Next</span>
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </li>
                          )}
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <div className="space-y-4">
              {filterOffers("approved").length === 0 ? (
                <p className="text-center text-gray-500 py-8">Tidak ada bantuan yang disetujui</p>
              ) : (
                <>
                  <div className="text-sm text-gray-600 mb-4">
                    Menampilkan {Math.min((currentPage.approved - 1) * offersPerPage + 1, filterOffers("approved").length)}-
                    {Math.min(currentPage.approved * offersPerPage, filterOffers("approved").length)} dari {filterOffers("approved").length} bantuan
                  </div>
                  {getPaginatedOffers("approved").map((offer) => <OfferCard key={offer.id} offer={offer} />)}
                  
                  {/* Pagination */}
                  {filterOffers("approved").length > offersPerPage && (
                    <div className="mt-6">
                      <nav className="flex justify-center">
                        <ul className="flex space-x-2">
                          {currentPage.approved > 1 && (
                            <li>
                              <button
                                onClick={() => paginate("approved", currentPage.approved - 1)}
                                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 flex items-center gap-1"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span>Previous</span>
                              </button>
                            </li>
                          )}
                          
                          {Array.from({ length: getTotalPages("approved") }, (_, i) => i + 1).map((number) => (
                            <li key={number}>
                              <button
                                onClick={() => paginate("approved", number)}
                                className={`px-3 py-1 rounded ${currentPage.approved === number ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                              >
                                {number}
                              </button>
                            </li>
                          ))}
                          
                          {currentPage.approved < getTotalPages("approved") && (
                            <li>
                              <button
                                onClick={() => paginate("approved", currentPage.approved + 1)}
                                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 flex items-center gap-1"
                              >
                                <span>Next</span>
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </li>
                          )}
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="space-y-4">
              {filterOffers("rejected").length === 0 ? (
                <p className="text-center text-gray-500 py-8">Tidak ada bantuan yang ditolak</p>
              ) : (
                <>
                  <div className="text-sm text-gray-600 mb-4">
                    Menampilkan {Math.min((currentPage.rejected - 1) * offersPerPage + 1, filterOffers("rejected").length)}-
                    {Math.min(currentPage.rejected * offersPerPage, filterOffers("rejected").length)} dari {filterOffers("rejected").length} bantuan
                  </div>
                  {getPaginatedOffers("rejected").map((offer) => <OfferCard key={offer.id} offer={offer} />)}
                  
                  {/* Pagination */}
                  {filterOffers("rejected").length > offersPerPage && (
                    <div className="mt-6">
                      <nav className="flex justify-center">
                        <ul className="flex space-x-2">
                          {currentPage.rejected > 1 && (
                            <li>
                              <button
                                onClick={() => paginate("rejected", currentPage.rejected - 1)}
                                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 flex items-center gap-1"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span>Previous</span>
                              </button>
                            </li>
                          )}
                          
                          {Array.from({ length: getTotalPages("rejected") }, (_, i) => i + 1).map((number) => (
                            <li key={number}>
                              <button
                                onClick={() => paginate("rejected", number)}
                                className={`px-3 py-1 rounded ${currentPage.rejected === number ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                              >
                                {number}
                              </button>
                            </li>
                          ))}
                          
                          {currentPage.rejected < getTotalPages("rejected") && (
                            <li>
                              <button
                                onClick={() => paginate("rejected", currentPage.rejected + 1)}
                                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 flex items-center gap-1"
                              >
                                <span>Next</span>
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </li>
                          )}
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
