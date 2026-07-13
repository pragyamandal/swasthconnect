/**
 * pdf.service.ts
 *
 * Generates prescription PDFs using pdfkit.
 * Output buffer is passed to cloudinaryService for upload.
 * TRD reference: section 4.9
 */

// TODO: implement with pdfkit — see TRD section 4.9 for the full PDF structure

export interface PrescriptionData {
  doctorName: string;
  specialisation: string;
  licenseNumber: string;
  patientName: string;
  age?: number;
  diagnosis: string;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  doctorNotes?: string;
  followUpDate?: string;
}

export const pdfService = {
  /**
   * Generate a prescription PDF and return it as a Buffer.
   */
  generatePrescription: async (_data: PrescriptionData): Promise<Buffer> => {
    throw new Error('pdfService.generatePrescription — not yet implemented');
  },
};

export type PdfService = typeof pdfService;
