import { useState, useContext, useEffect } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { pdfjs } from "react-pdf"
import { PDFDocument } from "pdf-lib"
import useAxiosInstance from "../../../../../Services/useAxiosInstance"
import { GlobalContext } from "../../../../../context/GlobalState"
import { useCookies } from "react-cookie"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import PdfSelectorModal from "./PdfSelectorModal"
import AddRecipientsModal from "./AddRecipientsModal"
import ActionBar from "./ActionBar"
import PdfViewer from "./PdfViewer"
import { generateESignData } from "./utils/dataGenerator"
import toast from "react-hot-toast"

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export function lightenHexColor(hex, amount = 0.2) {
  const parsedHex = hex.replace("#", "")
  const num = Number.parseInt(parsedHex, 16)
  const r = Math.min(255, ((num >> 16) & 0xff) + 255 * amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + 255 * amount)
  const b = Math.min(255, (num & 0xff) + 255 * amount)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function EsignerModal({ onClose, hexColor, onClickHandler, contentWhileEditing, onActionEdit, onSignRevoke }) {
  const { viewer_id } = useContext(GlobalContext)
  const [cookies] = useCookies(["revspireToken"])
  const token = cookies.revspireToken
  const axiosInstance = useAxiosInstance()

  // PDF states
  const [pdfSelectorModalOpen, setPdfSelectorModalOpen] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState(null)
  const [pdfBlob, setPdfBlob] = useState(null)
  const [blobLoading, setBlobLoading] = useState(false)
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pdfDimensions, setPdfDimensions] = useState({})

  // Recipients and placeholders
  const [recipients, setRecipients] = useState([])
  const [placeholders, setPlaceholders] = useState([])
  const [textFields, setTextFields] = useState([])
  const [selectedElement, setSelectedElement] = useState(null)

  // UI states
  const [addRecipientsModalOpen, setAddRecipientsModalOpen] = useState(false)
  const [placeholderMode, setPlaceholderMode] = useState(null)
  const [embedTextMode, setEmbedTextMode] = useState(false)
  const [loading, setLoading] = useState(false)

  // Toggle states
  const [sequenceEnabled, setSequenceEnabled] = useState(true)
  const [accessEnabled, setAccessEnabled] = useState(true)

  // Load existing eSign data when contentWhileEditing is provided
  useEffect(() => {
    if (contentWhileEditing) {
      loadExistingESignData()
    }
  }, [contentWhileEditing])

  const processPlaceholdersWithDimensions = (recipientsData, pdfDimensions) => {
    const allPlaceholders = []
    recipientsData.forEach((sig, recipientIndex) => {
      const sigPlaceholders = sig.placeholder || []
      sigPlaceholders.forEach((placeholder, placeholderIndex) => {
        const [x, y] = placeholder.position.split(",").map(Number)
        const pageDims = pdfDimensions[placeholder.page] || pdfDimensions[1]
        let scaledX = x
        let flippedY = y
        if (pageDims) {
          scaledX = (x * pageDims.displayWidth) / pageDims.pdfWidth
          flippedY = pageDims.displayHeight - (y * pageDims.displayHeight) / pageDims.pdfHeight - 16
        }
        allPlaceholders.push({
          id: `placeholder_${recipientIndex}_${placeholderIndex}`,
          name: placeholder.name,
          page: placeholder.page,
          type: placeholder.type,
          position: { x: scaledX, y: flippedY },
          pdfPosition: { x, y },
          assigned_to: `recipient_${recipientIndex + 1}`,
          value: placeholder.value,
        })
      })
    })
    setPlaceholders(allPlaceholders)
  }

  const loadExistingESignData = async () => {
    try {
      setBlobLoading(true)
      const contentLinkData = JSON.parse(contentWhileEditing.content_link)
      setSequenceEnabled(contentLinkData.sequential || true)
      setAccessEnabled(contentLinkData.public_access || true)
      const recipientsData = contentLinkData.signature || []
      const populatedRecipients = recipientsData.map((sig, index) => ({
        id: `recipient_${index + 1}`,
        full_name: sig.full_name,
        email: sig.email,
        order: sig.order,
      }))
      setRecipients(populatedRecipients)
      
      const pdfContentId =  contentLinkData.content_id
      if (pdfContentId) {
        const response = await axiosInstance.post(
          `/open-content`,
          {
            viewerId: viewer_id,
            contentId: pdfContentId,
            manual_token: token,
          },
          {
            responseType: "blob",
            withCredentials: true,
          },
        )
        const blob = new Blob([response.data], { type: "application/pdf" })
        const blobUrl = URL.createObjectURL(blob)
        setPdfBlob(blobUrl)
        setSelectedPdf({
          id: pdfContentId,
          name: contentWhileEditing.name || "Document",
        })

        const loadingTask = pdfjs.getDocument(blobUrl)
        loadingTask.promise.then((pdf) => {
          pdf.getPage(1).then((page) => {
            const viewport = page.getViewport({ scale: 1 })
            const dims = {
              pdfWidth: viewport.width,
              pdfHeight: viewport.height,
              displayWidth: 600,
              displayHeight: (viewport.height / viewport.width) * 600,
              scale: 600 / viewport.width,
            }
            setPdfDimensions((prev) => {
              const newDims = { ...prev, 1: dims }
              processPlaceholdersWithDimensions(recipientsData, newDims)
              return newDims
            })
          })
        })
      }
      setBlobLoading(false)
    } catch (error) {
      console.log("data in not in editing mode")
      setBlobLoading(false)
    }
  }

  // Color mapping for recipients
  const recipientColors = ["#3b82f6", "#f59e42", "#22c55e", "#eab308", "#a855f7", "#ef4444", "#14b8a6", "#6366f1"]

  const recipientColorMap = {}
  recipients.forEach((r, idx) => {
    recipientColorMap[r.id] = recipientColors[idx % recipientColors.length]
  })

  const onPdfSelected = async (pdfData) => {
    try {
      setBlobLoading(true)
      setSelectedPdf(pdfData)
      setPdfSelectorModalOpen(false)

      const response = await axiosInstance.post(
        `/open-content`,
        {
          viewerId: viewer_id,
          contentId: pdfData.id,
          manual_token: token,
        },
        {
          responseType: "blob",
          withCredentials: true,
        },
      )

      const blob = new Blob([response.data], { type: "application/pdf" })
      const blobUrl = URL.createObjectURL(blob)
      setPdfBlob(blobUrl)
      setBlobLoading(false)
    } catch (error) {
      console.error("Error fetching PDF:", error)
      setBlobLoading(false)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log("Document loaded with", numPages, "pages")
    setNumPages(numPages)
  }

  const onPageLoadSuccess = (page) => {
    console.log("Page load success:", {
      pageNumber: page.pageNumber,
      originalWidth: page.originalWidth,
      originalHeight: page.originalHeight,
    })

    setPdfDimensions((prev) => ({
      ...prev,
      [page.pageNumber]: {
        width: page.originalWidth,
        height: page.originalHeight,
        displayWidth: 600,
        displayHeight: (page.originalHeight / page.originalWidth) * 600,
      },
    }))
  }
  
  // Helper to determine if we're editing a draft
  const isEditingDraft =
  !!contentWhileEditing &&
  (() => {
    try {
      const link = JSON.parse(contentWhileEditing.content_link);
      // Check both 'status' and 'state' properties
      return link.status === "Draft" || link.state === "Draft";
    } catch {
      return false;
    }
  })();
  // Helper to determine if we're viewing an InProgress document
  const isInProgress =
    !!contentWhileEditing &&
    (() => {
      try {
        const link = JSON.parse(contentWhileEditing.content_link)
        return link.status === "InProgress"
      } catch {
        return false
      }
    })()

  // Handle revoke functionality
  const handleRevoke = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.post("/revspire-sign/revoke", {
        content_id: contentWhileEditing.content_id || contentWhileEditing.content,
      })

      if (response.data.success) {
        toast.success("Signature request revoked successfully!")
        const editedContentId = contentWhileEditing.content_id;
        const editedData = response.data.contentJson;
        onSignRevoke({editedContentId,editedData })
        onClose()
      } else {
        toast.error("Failed to revoke: " + response.data.message)
      }
    } catch (error) {
      console.error("Error revoking signature request:", error)
      toast.error("Failed to revoke signature request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Save as Draft (edit or create)
  const handleSaveAsDraft = async () => {
    setLoading(true)
    const unassignedPlaceholders = placeholders.filter((p) => !p.assigned_to)
    if (unassignedPlaceholders.length > 0) {
      toast.error("Please assign all placeholders to recipients")
      setLoading(false)
      return
    }

    let signedContentId = selectedPdf?.id

    if (textFields && textFields.length > 0) {
      try {
        const response = await fetch(pdfBlob)
        const pdfBytes = await response.blob()
        const pdfDoc = await PDFDocument.load(await pdfBytes.arrayBuffer())
        const pages = pdfDoc.getPages()

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i]
          const pageNum = i + 1
          const pageTextFields = textFields.filter((f) => f.page === pageNum)

          for (const textField of pageTextFields) {
            if (textField.text && textField.pdfPosition) {
              try {
                page.drawText(textField.text, {
                  x: textField.pdfPosition.x,
                  y: textField.pdfPosition.y,
                  size: Number.parseInt(textField.fontSize) || 12,
                })
              } catch (textError) {
                console.error("Error adding text to PDF:", textError)
              }
            }
          }
        }

        const modifiedPdfBytes = await pdfDoc.save()
        const modifiedBlob = new Blob([modifiedPdfBytes], {
          type: "application/pdf",
        })
        const formData = new FormData()
        formData.append("files", modifiedBlob, selectedPdf?.name || "document.pdf")
        formData.append("created_by", viewer_id)
        formData.append("description", "Content")
        formData.append("direct_pitch_content", 1)

        const uploadResponse = await axiosInstance.post(`/local-upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        })

        if (uploadResponse.data && uploadResponse.data.uploadedFiles) {
          signedContentId = uploadResponse.data.uploadedFiles[0].contentId
        } else {
          toast.error("Failed to upload modified PDF.")
          setLoading(false)
          return
        }
      } catch (error) {
        console.error("Error uploading modified PDF:", error)
        toast.error("Failed to upload modified PDF.")
        setLoading(false)
        return
      }
    }

    const eSignData = generateESignData(
      selectedPdf,
      recipients,
      placeholders,
      sequenceEnabled,
      accessEnabled,
      selectedPdf?.id,
    )

    if (eSignData.signature && Array.isArray(eSignData.signature)) {
      eSignData.signature = eSignData.signature.map((sig) => ({
        ...sig,
        signed_content_id: signedContentId,
      }))
    }

    if (isEditingDraft) {
      try {
        const payload = {
          content_id: contentWhileEditing.content_id || contentWhileEditing.content,
          name: contentWhileEditing.name || "eSign Document",
          description: contentWhileEditing.description || "eSign document edited via EsignerModal",
          parameters: eSignData,
        }
        const response = await axiosInstance.post("/pitch-content-feature/edit-feature", payload)
        toast.success("Draft updated successfully!")
        // onClickHandler && onClickHandler([response.data.content])
        const editedData = payload;
        const editedContentId = contentWhileEditing.content_id;
        onActionEdit({ editedContentId, editedData });
        onClose()
      } catch (error) {
        console.error("Error editing draft feature:", error)
        toast.error("Failed to update draft. Please try again.")
      } finally {
        setLoading(false)
      }
      return
    }

    const payload = {
      name: "eSign Document",
      description: "eSign document created via EsignerModal",
      parameters: eSignData,
    }

    try {
      const response = await axiosInstance.post("/pitch-content-feature/create-feature", payload)
      const contentWithTagline = {
        ...response.data.content,
        tagline: response.data.content.name,
      }
      onClickHandler && onClickHandler([contentWithTagline])
      onClose()
      toast.success("Document saved as draft successfully!")
    } catch (error) {
      console.error("Error creating feature:", error)
      toast.error("Failed to save as draft. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Send (edit or create)
  const handleSend = async () => {
    setLoading(true)
    const unassignedPlaceholders = placeholders.filter((p) => !p.assigned_to)
    if (unassignedPlaceholders.length > 0) {
      toast.error("Please assign all placeholders to recipients")
      setLoading(false)
      return
    }

    let signedContentId = selectedPdf?.id

    if (textFields && textFields.length > 0) {
      try {
        const response = await fetch(pdfBlob)
        const pdfBytes = await response.blob()
        const pdfDoc = await PDFDocument.load(await pdfBytes.arrayBuffer())
        const pages = pdfDoc.getPages()

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i]
          const pageNum = i + 1
          const pageTextFields = textFields.filter((f) => f.page === pageNum)

          for (const textField of pageTextFields) {
            if (textField.text && textField.pdfPosition) {
              try {
                page.drawText(textField.text, {
                  x: textField.pdfPosition.x,
                  y: textField.pdfPosition.y,
                  size: Number.parseInt(textField.fontSize) || 12,
                })
              } catch (textError) {
                console.error("Error adding text to PDF:", textError)
              }
            }
          }
        }

        const modifiedPdfBytes = await pdfDoc.save()
        const modifiedBlob = new Blob([modifiedPdfBytes], {
          type: "application/pdf",
        })
        const formData = new FormData()
        formData.append("files", modifiedBlob, selectedPdf?.name || "document.pdf")
        formData.append("created_by", viewer_id)
        formData.append("description", "Content")
        formData.append("direct_pitch_content", 1)

        const uploadResponse = await axiosInstance.post(`/local-upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        })

        if (uploadResponse.data && uploadResponse.data.uploadedFiles) {
          signedContentId = uploadResponse.data.uploadedFiles[0].contentId
        } else {
          toast.error("Failed to upload modified PDF.")
          setLoading(false)
          return
        }
      } catch (error) {
        console.error("Error uploading modified PDF:", error)
        toast.error("Failed to upload modified PDF.")
        setLoading(false)
        return
      }
    }

    const eSignData = generateESignData(
      selectedPdf,
      recipients,
      placeholders,
      sequenceEnabled,
      accessEnabled,
      selectedPdf?.id,
    )
    eSignData.status = "InProgress"

    if (eSignData.signature && Array.isArray(eSignData.signature)) {
      eSignData.signature = eSignData.signature.map((sig) => ({
        ...sig,
        signed_content_id: signedContentId,
      }))
    }

    if (isEditingDraft) {
      try {
        const payload = {
          content_id: contentWhileEditing.content_id || contentWhileEditing.content,
          name: contentWhileEditing.name || "eSign Document",
          description: contentWhileEditing.description || "eSign document edited via EsignerModal",
          parameters: eSignData,
        }
        const response = await axiosInstance.post("/pitch-content-feature/edit-feature", payload)

        try {
          const sendResponse = await axiosInstance.post("/revspire-sign/send", {
            content_id: payload.content_id,
          })
          if (sendResponse.data.success) {
            toast.success("Document sent successfully! " + sendResponse.data.message)
          } else {
            toast.error("Document updated but failed to send: " + sendResponse.data.message)
          }
        } catch (sendError) {
          console.error("Error sending document:", sendError)
          toast.error("Document updated but failed to send. Please try again.")
        }
        // onClickHandler && onClickHandler([response.data.content])
        // onActionEdit()
        const editedData = payload;
        const editedContentId = contentWhileEditing.content_id;
        onActionEdit({ editedContentId, editedData });
        onClose()
      } catch (error) {
        console.error("Error editing draft feature:", error)
        toast.error("Failed to update and send. Please try again.")
      } finally {
        setLoading(false)
      }
      return
    }

    const payload = {
      name: "eSign Document",
      description: "eSign document created via EsignerModal",
      parameters: eSignData,
    }

    try {
      const response = await axiosInstance.post("/pitch-content-feature/create-feature", payload)
      const contentWithTagline = {
        ...response.data.content,
        tagline: response.data.content.name,
      }

      try {
        const sendResponse = await axiosInstance.post("/revspire-sign/send", {
          content_id: response.data.content.id,
        })
        if (sendResponse.data.success) {
          toast.success("Document sent successfully! " + sendResponse.data.message)
        } else {
          toast.error("Document created but failed to send: " + sendResponse.data.message)
        }
      } catch (sendError) {
        console.error("Error sending document:", sendError)
        toast.error("Document created but failed to send. Please try again.")
      }
      onClickHandler && onClickHandler([contentWithTagline])
      onClose()
    } catch (error) {
      console.error("Error creating feature:", error)
      toast.error("Failed to create and send document. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      console.log("Starting PDF download with text fields:", textFields)

      const response = await fetch(pdfBlob)
      const pdfBytes = await response.blob()
      const pdfDoc = await PDFDocument.load(await pdfBytes.arrayBuffer())
      const pages = pdfDoc.getPages()

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const pageNum = i + 1
        const pageTextFields = textFields.filter((f) => f.page === pageNum)

        console.log(`Processing page ${pageNum} with ${pageTextFields.length} text fields`)

        for (const textField of pageTextFields) {
          if (textField.text && textField.pdfPosition) {
            console.log("Adding text to PDF:", {
              text: textField.text,
              position: textField.pdfPosition,
              fontSize: textField.fontSize,
            })

            try {
              page.drawText(textField.text, {
                x: textField.pdfPosition.x,
                y: textField.pdfPosition.y,
                size: Number.parseInt(textField.fontSize) || 12,
              })
            } catch (textError) {
              console.error("Error adding text to PDF:", textError)
            }
          }
        }
      }

      const modifiedPdfBytes = await pdfDoc.save()
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `document-with-text-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log("PDF download completed successfully")
    } catch (error) {
      console.error("Error modifying PDF:", error)
      toast.error("Failed to generate PDF. Please try again.")
    }
  }

  const normalizedHexColor = hexColor.startsWith("#") ? hexColor : `#${hexColor}`

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl flex flex-col w-full h-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Modals */}
        {pdfSelectorModalOpen && (
          <PdfSelectorModal
            onClose={() => setPdfSelectorModalOpen(false)}
            hexColor={normalizedHexColor}
            onPdfSelected={onPdfSelected}
          />
        )}

        <AddRecipientsModal
          isOpen={addRecipientsModalOpen}
          onClose={() => setAddRecipientsModalOpen(false)}
          recipients={recipients}
          setRecipients={setRecipients}
          hexColor={normalizedHexColor}
        />

        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: normalizedHexColor }} />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">E-Signature Studio</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Action Bar */}
        {pdfBlob && (
          <ActionBar
            recipients={recipients}
            onAddRecipients={() => setAddRecipientsModalOpen(true)}
            onDownloadPdf={handleDownloadPdf}
            onSetPlaceholderMode={setPlaceholderMode}
            onSetEmbedTextMode={setEmbedTextMode}
            pageNumber={pageNumber}
            numPages={numPages}
            onPageChange={setPageNumber}
            embedTextMode={embedTextMode}
            pdfBlob={pdfBlob}
            hexColor={normalizedHexColor}
            sequenceEnabled={sequenceEnabled}
            setSequenceEnabled={setSequenceEnabled}
            accessEnabled={accessEnabled}
            setAccessEnabled={setAccessEnabled}
            disabled={isInProgress}
          />
        )}

        {/* Main Content */}
        {blobLoading ? (
          <div className="flex-grow flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-4xl" style={{ color: normalizedHexColor }} />
              <p className="text-gray-600 font-medium">Loading document...</p>
            </div>
          </div>
        ) : !pdfBlob ? (
          <div className="flex-grow flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-lg">
              <button
                className="group w-full h-64 sm:h-80 flex flex-col items-center justify-center gap-6 border-3 border-dashed rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                onClick={() => setPdfSelectorModalOpen(true)}
                style={{
                  borderColor: normalizedHexColor,
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${normalizedHexColor}08`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                <div
                  className="p-6 rounded-full transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${normalizedHexColor}15` }}
                >
                  <Upload className="text-5xl sm:text-6xl" style={{ color: normalizedHexColor }} />
                </div>
                <div className="text-center px-4">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: normalizedHexColor }}>
                    Upload Your Document
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Select a PDF to start creating your e-signature workflow
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <PdfViewer
            pdfBlob={pdfBlob}
            pageNumber={pageNumber}
            onDocumentLoadSuccess={onDocumentLoadSuccess}
            onPageLoadSuccess={onPageLoadSuccess}
            placeholderMode={placeholderMode}
            embedTextMode={embedTextMode}
            pdfDimensions={pdfDimensions}
            placeholders={placeholders}
            textFields={textFields}
            recipients={recipients}
            recipientColorMap={recipientColorMap}
            selectedElement={selectedElement}
            onSetPlaceholderMode={setPlaceholderMode}
            onSetEmbedTextMode={setEmbedTextMode}
            onSetPlaceholders={setPlaceholders}
            onSetTextFields={setTextFields}
            onSetSelectedElement={setSelectedElement}
            disabled={isInProgress}
          />
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 p-3 sm:p-4 border-t bg-gray-50/50">
          {isInProgress ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
              >
                Close
              </button>
              <button
                onClick={handleRevoke}
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Revoking..." : "Revoke Request"}
              </button>
            </>
          ) : isEditingDraft ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsDraft}
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-white rounded-xl focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                style={{
                  backgroundColor: normalizedHexColor,
                  focusRingColor: `${normalizedHexColor}50`,
                }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-white rounded-xl focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg"
                style={{
                  backgroundColor: normalizedHexColor,
                  focusRingColor: `${normalizedHexColor}50`,
                  filter: "brightness(1.1)",
                }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Sending..." : "Send for Signature"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsDraft}
                disabled={!pdfBlob || loading}
                className="px-6 py-3 text-sm font-medium text-white rounded-xl focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                style={{
                  backgroundColor: normalizedHexColor,
                  focusRingColor: `${normalizedHexColor}50`,
                }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Saving..." : "Save as Draft"}
              </button>
              <button
                onClick={handleSend}
                disabled={!pdfBlob || loading}
                className="px-6 py-3 text-sm font-medium text-white rounded-xl focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg"
                style={{
                  backgroundColor: normalizedHexColor,
                  focusRingColor: `${normalizedHexColor}50`,
                  filter: "brightness(1.1)",
                }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Sending..." : "Send for Signature"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EsignerModal
