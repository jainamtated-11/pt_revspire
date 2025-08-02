"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import { Document, Page } from "react-pdf"
import PlaceholderElement from "./PlaceholderElement"
import EmbeddedTextField from "./EmbeddedTextField"
import { calculatePdfCoordinates } from "./utils/coordinateUtils"

function PdfViewer({
  pdfBlob,
  pageNumber,
  onDocumentLoadSuccess,
  onPageLoadSuccess,
  placeholderMode,
  embedTextMode,
  pdfDimensions,
  placeholders,
  textFields,
  recipients,
  recipientColorMap,
  selectedElement,
  onSetPlaceholderMode,
  onSetEmbedTextMode,
  onSetPlaceholders,
  onSetTextFields,
  onSetSelectedElement,
  disabled = false,
}) {
  const pdfContainerRef = useRef(null)
  const pageElementRef = useRef(null)
  const PDF_DISPLAY_WIDTH = 600

  const [actualPageDimensions, setActualPageDimensions] = useState({})
  const [pageElementBounds, setPageElementBounds] = useState({})

  const handlePageLoadSuccess = (page) => {
    console.log("Page loaded:", {
      pageNumber: page.pageNumber,
      originalWidth: page.originalWidth,
      originalHeight: page.originalHeight,
      width: page.width,
      height: page.height,
    })

    const displayHeight = (page.originalHeight / page.originalWidth) * PDF_DISPLAY_WIDTH

    const pageDimensions = {
      pdfWidth: page.originalWidth,
      pdfHeight: page.originalHeight,
      displayWidth: PDF_DISPLAY_WIDTH,
      displayHeight: displayHeight,
      scale: PDF_DISPLAY_WIDTH / page.originalWidth,
    }

    setActualPageDimensions((prev) => ({
      ...prev,
      [page.pageNumber]: pageDimensions,
    }))

    setTimeout(() => {
      if (pageElementRef.current) {
        const pageRect = pageElementRef.current.getBoundingClientRect()
        setPageElementBounds((prev) => ({
          ...prev,
          [page.pageNumber]: {
            left: pageRect.left,
            top: pageRect.top,
            width: pageRect.width,
            height: pageRect.height,
          },
        }))
      }
    }, 100)

    onPageLoadSuccess(page)
  }

  useEffect(() => {
    const updatePageBounds = () => {
      if (pageElementRef.current) {
        const pageRect = pageElementRef.current.getBoundingClientRect()
        setPageElementBounds((prev) => ({
          ...prev,
          [pageNumber]: {
            left: pageRect.left,
            top: pageRect.top,
            width: pageRect.width,
            height: pageRect.height,
          },
        }))
      }
    }

    const timer = setTimeout(updatePageBounds, 100)
    window.addEventListener("resize", updatePageBounds)
    window.addEventListener("scroll", updatePageBounds)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", updatePageBounds)
      window.removeEventListener("scroll", updatePageBounds)
    }
  }, [pageNumber, pdfBlob])

  const handlePdfClick = useCallback(
    (e) => {
      if (!placeholderMode && !embedTextMode) return

      const pageElement = pageElementRef.current
      if (!pageElement) {
        console.warn("Page element not found")
        return
      }

      const pageRect = pageElement.getBoundingClientRect()
      const screenX = e.clientX - pageRect.left
      const screenY = e.clientY - pageRect.top

      console.log("Precise click coordinates:", {
        screenX,
        screenY,
        pageRect: {
          left: pageRect.left,
          top: pageRect.top,
          width: pageRect.width,
          height: pageRect.height,
        },
      })

      const currentPageDims = actualPageDimensions[pageNumber]
      if (!currentPageDims) {
        console.warn("Page dimensions not available yet")
        return
      }

      if (screenX < 0 || screenX > pageRect.width || screenY < 0 || screenY > pageRect.height) {
        console.warn("Click outside page bounds")
        return
      }

      const pdfCoords = calculatePdfCoordinates(screenX, screenY, currentPageDims)
      console.log("Calculated PDF coordinates:", pdfCoords)

      if (embedTextMode) {
        const newTextField = {
          id: Date.now(),
          text: "Enter text here",
          page: pageNumber,
          position: { x: screenX, y: screenY },
          pdfPosition: pdfCoords,
          fontSize: "12px",
        }
        onSetTextFields((prev) => [...prev, newTextField])
        onSetEmbedTextMode(false)
      } else {
        const newPlaceholder = {
          id: Date.now(),
          name: placeholderMode === "signature" ? "Please sign here" : "Enter text here",
          type: placeholderMode,
          page: pageNumber,
          position: { x: screenX, y: screenY },
          pdfPosition: pdfCoords,
          assigned_to: null,
          value: null,
        }
        onSetPlaceholders((prev) => [...prev, newPlaceholder])
        onSetPlaceholderMode(null)
      }
    },
    [placeholderMode, embedTextMode, pageNumber, actualPageDimensions],
  )

  const updatePlaceholder = (id, updates) => {
    onSetPlaceholders((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates }
          if (updates.position && actualPageDimensions[pageNumber]) {
            updated.pdfPosition = calculatePdfCoordinates(
              updates.position.x,
              updates.position.y,
              actualPageDimensions[pageNumber],
            )
            console.log("Updated placeholder coordinates:", {
              screen: updates.position,
              pdf: updated.pdfPosition,
            })
          }
          return updated
        }
        return p
      }),
    )
  }

  const deletePlaceholder = (id) => {
    onSetPlaceholders((prev) => prev.filter((p) => p.id !== id))
    if (selectedElement?.id === id) {
      onSetSelectedElement(null)
    }
  }

  const assignPlaceholder = (placeholderId, recipientId) => {
    onSetPlaceholders((prev) => prev.map((p) => (p.id === placeholderId ? { ...p, assigned_to: recipientId } : p)))
  }

  const updateTextField = (id, updates) => {
    onSetTextFields((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = { ...f, ...updates }
          if (updates.position && actualPageDimensions[pageNumber]) {
            updated.pdfPosition = calculatePdfCoordinates(
              updates.position.x,
              updates.position.y,
              actualPageDimensions[pageNumber],
            )
            console.log("Updated text field coordinates:", {
              screen: updates.position,
              pdf: updated.pdfPosition,
            })
          }
          return updated
        }
        return f
      }),
    )
  }

  const deleteTextField = (id) => {
    onSetTextFields((prev) => prev.filter((f) => f.id !== id))
    if (selectedElement?.id === id) {
      onSetSelectedElement(null)
    }
  }

  return (
    <div className="relative w-full flex-grow overflow-auto bg-gray-50">
      <div className="flex justify-center min-h-full py-4">
        <div className="relative">
          <div
            ref={pdfContainerRef}
            className="relative bg-white shadow-xl border border-gray-200 rounded-xl overflow-hidden"
            style={{
              width: PDF_DISPLAY_WIDTH,
              minHeight: actualPageDimensions[pageNumber]?.displayHeight || 800,
            }}
          >
            <Document
              file={pdfBlob}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-96">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading PDF...</p>
                  </div>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-96 text-red-500">
                  <div className="text-center">
                    <p className="font-semibold">Failed to load PDF</p>
                    <p className="text-sm text-gray-500 mt-1">Please try again</p>
                  </div>
                </div>
              }
            >
              <div
                ref={pageElementRef}
                style={{ position: "relative" }}
                onClick={handlePdfClick}
                className={`${(placeholderMode || embedTextMode) && !disabled ? "cursor-crosshair" : "cursor-default"}`}
              >
                <Page
                  key={`page_${pageNumber}`}
                  pageNumber={pageNumber}
                  width={PDF_DISPLAY_WIDTH}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onLoadSuccess={handlePageLoadSuccess}
                />
              </div>
            </Document>

            {/* Placeholders */}
            {placeholders
              .filter((p) => p.page === pageNumber)
              .map((placeholder) => (
                <PlaceholderElement
                  key={placeholder.id}
                  placeholder={placeholder}
                  onUpdate={updatePlaceholder}
                  onDelete={deletePlaceholder}
                  onAssign={assignPlaceholder}
                  isSelected={selectedElement?.id === placeholder.id}
                  onClick={() => onSetSelectedElement(placeholder)}
                  recipients={recipients}
                  color={recipientColorMap[placeholder.assigned_to] || "#6b7280"}
                  disabled={disabled}
                />
              ))}

            {/* Text Fields */}
            {textFields
              .filter((f) => f.page === pageNumber)
              .map((textField) => (
                <EmbeddedTextField
                  key={textField.id}
                  textField={textField}
                  onUpdate={updateTextField}
                  onDelete={deleteTextField}
                  isSelected={selectedElement?.id === textField.id}
                  onClick={() => onSetSelectedElement(textField)}
                  color="#6366f1"
                  disabled={disabled}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PdfViewer
