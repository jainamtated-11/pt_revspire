"use client"

import { useState } from "react"
import {
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Minimize2,
  Maximize2,
  X,
} from "lucide-react"

const ESignSidebar = ({ data, hexColor = "#28747d", isOpen, onToggle }) => {
  const [showHistory, setShowHistory] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  let parsedData
  try {
    parsedData = typeof data === "string" ? JSON.parse(data) : data
  } catch (err) {
    console.error("Failed to parse data:", err)
    return null
  }

  const { status, sequential, signature = [], signature_history = [] } = parsedData

  // Calculate progress
  const totalSigners = signature.length
  const completedSigners = signature.filter((sig) => sig.status === "Success").length
  const progressPercentage = totalSigners > 0 ? (completedSigners / totalSigners) * 100 : 0

  // Get current signer
  const getCurrentSigner = () => {
    if (sequential) {
      return signature.find((sig) => sig.status === "Draft") || null
    }
    return signature.find((sig) => sig.status === "Draft") || null
  }

  const currentSigner = getCurrentSigner()

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }

  // Get status display
  const getStatusDisplay = (signerStatus) => {
    switch (signerStatus) {
      case "Success":
        return {
          color: "#22c55e",
          bgColor: "#dcfce7",
          icon: CheckCircle,
          text: "Signed",
        }
      case "Draft":
        return {
          color: "#f59e0b",
          bgColor: "#fef3c7",
          icon: Clock,
          text: "Pending",
        }
      default:
        return {
          color: "#6b7280",
          bgColor: "#f3f4f6",
          icon: AlertCircle,
          text: "Unknown",
        }
    }
  }

  const getOverallStatus = () => {
    if (status === "InProgress") {
      return {
        color: "#3b82f6",
        bgColor: "#dbeafe",
        text: "In Progress",
      }
    } else if (status === "Completed") {
      return {
        color: "#22c55e",
        bgColor: "#dcfce7",
        text: "Completed",
      }
    }
    return {
      color: "#6b7280",
      bgColor: "#f3f4f6",
      text: status || "Unknown",
    }
  }

  const overallStatus = getOverallStatus()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={onToggle} />

      {/* Floating Sidebar */}
      <div
        className={`
        fixed left-4 top-4 bottom-4 z-50
        w-80 max-w-[calc(100vw-2rem)]
        bg-white/95 backdrop-blur-xl
        border border-gray-200/50
        rounded-2xl shadow-2xl
        flex flex-col
        transition-all duration-300 ease-out
        ${isCollapsed ? "w-16" : "w-80"}
        ${isMinimized ? "h-16" : "h-[calc(100vh-2rem)]"}
        lg:w-80 lg:h-[calc(100vh-2rem)]
      `}
      >
        {/* Header - Always Visible */}
        <div className="flex-shrink-0 p-4 border-b border-gray-100/50">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${hexColor}20` }}
                >
                  <FileText size={20} style={{ color: hexColor }} />
                </div>
                {!isMinimized && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Document Status</h2>
                    <div
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: overallStatus.bgColor,
                        color: overallStatus.color,
                      }}
                    >
                      {overallStatus.text}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200 hidden lg:flex"
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                onClick={onToggle}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Progress Bar - Show when not minimized and not collapsed */}
          {!isMinimized && !isCollapsed && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">
                  {completedSigners}/{totalSigners} signed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: hexColor,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content - Only show when not minimized and not collapsed */}
        {!isMinimized && !isCollapsed && (
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  {sequential ? "Sequential Process" : "Signing Process"}
                </h3>
                {sequential && (
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Sequential</div>
                )}
              </div>

              <div className="space-y-3">
                {signature
                  .sort((a, b) => a.order - b.order)
                  .map((signer, index) => {
                    const statusDisplay = getStatusDisplay(signer.status)
                    const StatusIcon = statusDisplay.icon
                    const isActive = currentSigner?.email === signer.email

                    return (
                      <div
                        key={`${signer.email}-${signer.order}`}
                        className={`relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${
                          isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Connection Line */}
                        {index < signature.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-200" />
                        )}

                        {/* Status Icon */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm"
                          style={{
                            backgroundColor: statusDisplay.bgColor,
                            border: `2px solid ${statusDisplay.color}`,
                          }}
                        >
                          <StatusIcon size={14} style={{ color: statusDisplay.color }} />
                        </div>

                        {/* Signer Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 truncate">{signer.full_name}</span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: statusDisplay.bgColor,
                                color: statusDisplay.color,
                              }}
                            >
                              {statusDisplay.text}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 truncate">{signer.email}</div>
                          {sequential && <div className="text-xs text-gray-400 mt-1">Order: {signer.order}</div>}
                          {isActive && (
                            <div className="text-xs text-blue-600 mt-1 font-medium flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                              Current signer
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Collapsible History Section */}
            {signature_history.length > 0 && (
              <div className="border-t border-gray-100/50">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      History ({signature_history.length})
                    </span>
                  </div>
                  <div
                    className="transition-transform duration-200"
                    style={{
                      transform: showHistory ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </button>

                {/* Animated History Content */}
                <div
                  className={`
                  overflow-hidden transition-all duration-300 ease-out
                  ${showHistory ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                `}
                >
                  <div className="px-4 pb-4 space-y-3">
                    {signature_history
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map((historyItem, index) => {
                        const signer = signature.find((s) => s.order === historyItem.order)
                        const { date, time } = formatTimestamp(historyItem.timestamp)
                        const statusDisplay = getStatusDisplay(historyItem.action)

                        return (
                          <div
                            key={`${historyItem.order}-${historyItem.timestamp}`}
                            className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg backdrop-blur-sm"
                          >
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: statusDisplay.bgColor }}
                            >
                              <CheckCircle size={12} style={{ color: statusDisplay.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900">
                                {signer?.full_name || `Signer ${historyItem.order}`} signed
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {date} at {time}
                              </div>
                              {historyItem.comment && (
                                <div className="flex items-start gap-2 mt-2 p-2 bg-white/80 rounded border border-gray-100">
                                  <MessageSquare size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-xs text-gray-600">{historyItem.comment}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer - Only show when not minimized and not collapsed */}
        {!isMinimized && !isCollapsed && (
          <div className="flex-shrink-0 p-4 border-t border-gray-100/50 bg-gray-50/30">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>Document ID:</span>
                <span className="font-mono text-gray-700 truncate ml-2">{parsedData.content_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Type:</span>
                <span className="text-gray-700">{parsedData.Type}</span>
              </div>
              {parsedData.public_access && (
                <div className="flex items-center justify-between">
                  <span>Access:</span>
                  <span className="text-green-600 font-medium">Public</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ESignSidebar
