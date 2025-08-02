import { useState, useEffect, useRef } from "react"
import { FiX, FiSend, FiExternalLink } from "react-icons/fi"
import { Bot, Sparkles, FileText } from "lucide-react"
import useSound from "use-sound"
import useAxiosInstance from "../../../../Services/useAxiosInstance"
import useContent from "../ThreadsComponents/hooks/useContent"
import { useContext } from "react"
import { GlobalContext } from "../../../../context/GlobalState"

// Helper to parse markdown-like syntax and render safe HTML
const parseFormattedText = (text) => {
  // Decode escaped characters
  let decoded = text
    .replace(/\\"/g, '"')       // Handle escaped double quotes
    .replace(/\\n/g, '\n')      // Escaped newlines
    .replace(/\\\\/g, '\\')     // Escaped backslashes

  // Apply markdown-like formatting
  decoded = decoded
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
    .replace(/_(.*?)_/g, '<em>$1</em>')                // Italic

  // Replace newlines with <br/>
  decoded = decoded.replace(/\n/g, '<br/>')

  return decoded
}

// Streaming Text Component with Word-by-Word and Shimmer Effect
const StreamingText = ({ text, isStreaming, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const words = text.split(" ")

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text)
      setCurrentWordIndex(words.length)
      return
    }

    if (currentWordIndex < words.length) {
      const timer = setTimeout(() => {
        const endIndex = Math.min(currentWordIndex + 4, words.length)
        const newText = words.slice(0, endIndex).join(" ")
        setDisplayedText(newText)
        setCurrentWordIndex(endIndex)
      }, 70)

      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [text, currentWordIndex, isStreaming, onComplete, words])

  return (
    <span className="relative">
      <span
        className={isStreaming && currentWordIndex < words.length ? "streaming-text" : ""}
        dangerouslySetInnerHTML={{ __html: parseFormattedText(displayedText) }}
      />
      {isStreaming && currentWordIndex < words.length && (
        <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1 opacity-70 shimmer-cursor"></span>
      )}
    </span>
  )
}

// Color utility functions
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

const generateColorVariants = (orgHex) => {
  const rgb = hexToRgb(orgHex)
  if (!rgb) return {}

  return {
    primary: orgHex,
    primaryRgb: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    light: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    medium: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
    gradient: `linear-gradient(135deg, ${orgHex}, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8))`,
    subtleShadow: `0 4px 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
  }
}

const AIAgent = ({
  pitchId,
  onClose,
  orgHex = "#6366f1",
  contentData,
  pitchData,
  handleOnClickContent,
  setFullscreenBlobUrl,
}) => {
  const { viewer_id } = useContext(GlobalContext)
  const axiosInstance = useAxiosInstance()
  const [userQuery, setUserQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState([
    {
      role: "assistant",
      content: "👋 Hi there! I'm your AI assistant. How can I help you with this sales room?",
      isStreaming: false,
    },
  ])
  const [streamingMessageIndex, setStreamingMessageIndex] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Sound hooks
  const [playSend] = useSound("/sounds/send.mp3", { volume: 0.3 })
  const [playReceive] = useSound("/sounds/receive.mp3", { volume: 0.3 })
  const [playError] = useSound("/sounds/error.mp3", { volume: 0.3 })

  // Generate color variants based on orgHex
  const colors = generateColorVariants(orgHex)

  // Use the same useContent hook as ThreadsDropdown
  const { handleContentClick: handleContentClickInternal, isLoading: contentLoading } = useContent(
    axiosInstance,
    viewer_id,
    setFullscreenBlobUrl,
    handleOnClickContent,
  )

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  const sendMessage = async (userQuery) => {
    if (!userQuery.trim()) return

    try {
      playSend()
    } catch (e) {
      // Ignore sound errors
    }

    const newUserMessage = { role: "user", content: userQuery, isStreaming: false }
    setConversation((prev) => [...prev, newUserMessage])
    setIsLoading(true)

    try {
      const response = await axiosInstance.post("/ai-search/pitch/ai-agent", {
        pitch_id: pitchId,
        query: userQuery,
      })

      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        type: response.data.type,
        searchResults: response.data.searchResults,
        isStreaming: true,
      }

      setConversation((prev) => [...prev, assistantMessage])
      setStreamingMessageIndex(conversation.length + 1) // +1 because we added user message

      try {
        playReceive()
      } catch (e) {
        // Ignore sound errors
      }
    } catch (error) {
      console.error("Error calling AI agent:", error)
      try {
        playError()
      } catch (e) {
        // Ignore sound errors
      }
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again later.",
          isStreaming: false,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStreamingComplete = (messageIndex) => {
    setStreamingMessageIndex(null)
    setConversation((prev) => prev.map((msg, idx) => (idx === messageIndex ? { ...msg, isStreaming: false } : msg)))
  }

  const resetConversation = () => {
    setConversation([
      {
        role: "assistant",
        content: "Hi there! I'm your AI assistant. How can I help you with this sales room?",
        isStreaming: false,
      },
    ])
    setStreamingMessageIndex(null)
  }

  const handleSendMessage = async () => {
    await sendMessage(userQuery)
    setUserQuery("")
    inputRef.current?.focus()
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle content click to view content
  const handleContentClick = (contentId) => {
    handleContentClickInternal(contentId, pitchData)
  }

  return (
    <>
      <div
        className="fixed bottom-6 right-6 z-50 w-80 bg-white/55 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden animate-slide-up flex flex-col"
        style={{
          boxShadow: `${colors.subtleShadow}, 0 20px 40px -12px rgba(0, 0, 0, 0.2)`,
          height: "min(60vh, 500px)", // Fixed maximum height
          maxHeight: "80vh", // Ensure it never exceeds viewport
        }}
      >
        {/* Fixed Header - Always Visible */}
        <div
          className="relative px-4 py-3 text-white overflow-hidden flex-shrink-0"
          style={{
            background: colors.gradient,
          }}
        >
          <div className="relative flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-xs text-white/70">Online</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetConversation()
                onClose()
              }}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Chat Area - Takes remaining space */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50 min-h-0 custom-scrollbar">
          {conversation.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                {/* Assistant Avatar */}
                {message.role === "assistant" && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: colors.gradient }}
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">AI</span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-3 py-2.5 shadow-sm border text-sm ${
                    message.role === "user"
                      ? "text-white ml-4 border-transparent"
                      : "bg-white text-gray-800 mr-4 border-gray-100"
                  }`}
                  style={
                    message.role === "user"
                      ? {
                          background: colors.gradient,
                        }
                      : {}
                  }
                >
                  <div className="leading-relaxed">
                    <StreamingText
                      text={message.content}
                      isStreaming={message.isStreaming && streamingMessageIndex === index}
                      onComplete={() => handleStreamingComplete(index)}
                    />
                  </div>

                  {/* Compact Sources */}
                  {message.searchResults?.length > 0 && !message.isStreaming && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-1 mb-2">
                        <FileText className="w-3 h-3 text-gray-500" />
                        <span className="font-medium text-xs text-gray-600">Sources</span>
                      </div>
                      <div className="space-y-1.5">
                        {message.searchResults.slice(0, 2).map((result, i) => (
                          <button
                            key={i}
                            onClick={() => handleContentClick(result.content)}
                            disabled={contentLoading}
                            className="group w-full text-left p-2 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-200 disabled:opacity-50"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-gray-800 truncate group-hover:text-blue-700 flex-1">
                                {result.tagline || "Content reference"}
                              </p>
                              <FiExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 ml-2 flex-shrink-0" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Compact Loading */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 mb-1">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: colors.gradient }}
                >
                  <Sparkles className="w-3 h-3 text-white animate-spin" />
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl px-3 py-2.5 shadow-sm mr-4 ml-2">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ backgroundColor: colors.primary }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ backgroundColor: colors.primary, animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ backgroundColor: colors.primary, animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Input Area - Always Visible */}
        <div className="border-t border-gray-100 p-3 bg-white/90 flex-shrink-0">
          <div className="flex space-x-2 items-end">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userQuery.trim()}
              className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
                isLoading || !userQuery.trim()
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "text-white shadow-md hover:shadow-lg"
              }`}
              style={
                !(isLoading || !userQuery.trim())
                  ? {
                      background: colors.gradient,
                    }
                  : {}
              }
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .streaming-text {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }
        
        .shimmer-cursor {
          background: linear-gradient(
            90deg,
            transparent 0%,
            currentColor 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </>
  )
}

export default AIAgent
