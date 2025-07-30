import { z } from "zod"

export const offerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  skill: z.string().min(3, "Keahlian minimal 3 karakter").max(200, "Keahlian maksimal 200 karakter"),
  city: z.string().min(2, "Kota minimal 2 karakter").max(100, "Kota maksimal 100 karakter"),
  phoneNumber: z.string().min(10, "Nomor HP minimal 10 digit").max(15, "Nomor HP maksimal 15 digit"),
  paymentRange: z.string().max(100, "Tarif maksimal 100 karakter").optional(),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").max(1000, "Deskripsi maksimal 1000 karakter"),
})

export type OfferFormData = z.infer<typeof offerSchema>

export function validateOffer(data: any): { success: boolean; data?: OfferFormData; errors?: string[] } {
  try {
    const validatedData = offerSchema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => err.message),
      }
    }
    return { success: false, errors: ["Validasi gagal"] }
  }
}
