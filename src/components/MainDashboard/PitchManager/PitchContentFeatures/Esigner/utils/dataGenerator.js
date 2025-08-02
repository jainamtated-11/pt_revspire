/**
 * Generates eSign data structure for API submission
 */
export function generateESignData(selectedPdf, recipients, placeholders, sequential, public_access, originalPdfId) {
  const data = {
    status: "Draft",
    content_id: originalPdfId || selectedPdf?.id,
    Type: "ESign",
    sequential,
    public_access,
    signature: recipients.map((recipient) => ({
      full_name: recipient.full_name,
      email: recipient.email,
      order: recipient.order,
      status: "Draft",
      placeholder: placeholders
        .filter((p) => p.assigned_to === recipient.id)
        .map((p) => ({
          name: p.name,
          page: p.page,
          type: p.type,
          position: `${p.pdfPosition.x},${p.pdfPosition.y}`,
          value: null,
        })),
    })),
  }
  console.log("[generateESignData] data:", data)
  return data
}
