"use client"

import { useState } from "react"
import { Users, Download, Plus, Type, PenTool, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

function ActionBar({
  recipients,
  onAddRecipients,
  onDownloadPdf,
  onSetPlaceholderMode,
  onSetEmbedTextMode,
  pageNumber,
  numPages,
  onPageChange,
  embedTextMode,
  pdfBlob,
  hexColor,
  sequenceEnabled,
  setSequenceEnabled,
  accessEnabled,
  setAccessEnabled,
  disabled = false,
}) {
  const [showPlaceholderMenu, setShowPlaceholderMenu] = useState(false)

  const handlePlaceholderMenu = () => {
    if (recipients.length === 0) return
    setShowPlaceholderMenu(!showPlaceholderMenu)
  }

  const baseButtonStyle = `
    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium 
    transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
    focus:outline-none focus:ring-2 focus:ring-offset-1
  `

  const primaryButtonStyle = `
    ${baseButtonStyle} text-white shadow-lg hover:shadow-xl
  `

  const secondaryButtonStyle = `
    ${baseButtonStyle} bg-white border border-gray-200 text-gray-700 
    hover:bg-gray-50 hover:border-gray-300 shadow-sm
  `

  const accentButtonStyle = `
    ${baseButtonStyle} text-white shadow-md hover:shadow-lg
  `

  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-3">
        {/* Left section: Main actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Add Recipients */}
          <button
            onClick={onAddRecipients}
            disabled={disabled}
            className={`${primaryButtonStyle} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{
              backgroundColor: hexColor,
              focusRingColor: `${hexColor}50`,
            }}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Recipients</span>
            {recipients.length > 0 && (
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{recipients.length}</span>
            )}
          </button>

          {/* Add Embedded Text */}
          <button
            onClick={() => {
              onSetEmbedTextMode(!embedTextMode)
              onSetPlaceholderMode(null)
            }}
            disabled={disabled}
            className={`${embedTextMode ? accentButtonStyle : secondaryButtonStyle} ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={
              embedTextMode
                ? {
                    backgroundColor: "#6366f1",
                    focusRingColor: "#6366f150",
                  }
                : {}
            }
          >
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">Add Text</span>
          </button>

          {/* Add Placeholder */}
          <div className="relative">
            <button
              onClick={handlePlaceholderMenu}
              disabled={recipients.length === 0 || disabled}
              className={`${secondaryButtonStyle} ${
                recipients.length === 0 || disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Placeholder</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Placeholder Dropdown */}
            {showPlaceholderMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-30 min-w-[160px] overflow-hidden">
                <button
                  onClick={() => {
                    onSetPlaceholderMode("text")
                    setShowPlaceholderMenu(false)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm transition-colors"
                >
                  <Type className="w-4 h-4" />
                  Text Field
                </button>
                <button
                  onClick={() => {
                    onSetPlaceholderMode("signature")
                    setShowPlaceholderMenu(false)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm transition-colors"
                >
                  <PenTool className="w-4 h-4" />
                  Signature
                </button>
              </div>
            )}
          </div>

          {/* Download PDF */}
          <button
            onClick={onDownloadPdf}
            disabled={!pdfBlob || disabled}
            className={`${secondaryButtonStyle} ${pdfBlob && !disabled ? "" : "opacity-50 cursor-not-allowed"}`}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>

        {/* Right section: Page nav + Toggles */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Page Navigation */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
            <button
              onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
              className="p-1 text-gray-600 disabled:opacity-30 hover:bg-white rounded-sm transition-all"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="px-2 py-0.5 text-xs font-medium text-gray-700 min-w-[50px] text-center">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
              className="p-1 text-gray-600 disabled:opacity-30 hover:bg-white rounded-sm transition-all"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-3">
            {/* Sequence Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-700 hidden sm:inline">Sequential</span>
              <button
                onClick={() => setSequenceEnabled(!sequenceEnabled)}
                disabled={disabled}
                className={`relative w-8 h-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-offset-1 ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: sequenceEnabled ? hexColor : "#e5e7eb",
                  focusRingColor: `${hexColor}50`,
                }}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                    sequenceEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Access Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-700 hidden sm:inline">Public</span>
              <button
                onClick={() => setAccessEnabled(!accessEnabled)}
                disabled={disabled}
                className={`relative w-8 h-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-offset-1 ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: accessEnabled ? hexColor : "#e5e7eb",
                  focusRingColor: `${hexColor}50`,
                }}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                    accessEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActionBar
