import { useState, useEffect, useRef, useContext, useCallback } from "react"
import { toast } from "react-hot-toast"
import useAxiosInstance from "../../../../Services/useAxiosInstance"
import { GlobalContext } from "../../../../context/GlobalState"
import { FiX, FiSend, FiAlertCircle, FiMessageSquare, FiChevronLeft, FiWifi, FiWifiOff } from "react-icons/fi"
import { BsCheck2All, BsCheck2 } from "react-icons/bs"
import slackLogo from "../../../../assets/slacklogo.png"

const SlackChat = ({
  chatId,
  onClose,
  ownerName,
  email,
  visitorFullName,
  onShowConversations,
  organisationId,
  canSendMessages,
  hasActiveSession,
}) => {
  const { baseURL } = useContext(GlobalContext)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("connecting")

  const messagesEndRef = useRef(null)
  const axiosInstance = useAxiosInstance()
  const wsRef = useRef(null)
  const refreshIntervalRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const isAutoScroll = useRef(true)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttempts = useRef(0)

  const getCookieValue = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const token = getCookieValue("revspireToken");

  const sendRefreshPayload = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        type: "slack_message",
        payload: {
          chatId: chatId,
          refresh: true,
          external_user_email: email,
        },
      }
      wsRef.current.send(JSON.stringify(payload))
    }
  }, [chatId, email])

  const initWebSocket = useCallback(() => {
    if (!chatId) return

    const cleanBaseURL = baseURL.replace(/^https?:\/\//, "")
    const wsUrl = `wss://${cleanBaseURL}/wss/`

    if (wsRef.current) {
      wsRef.current.close()
    }

    setConnectionStatus("connecting")
    wsRef.current = new WebSocket(wsUrl, [token])

    wsRef.current.onopen = () => {
      setIsConnected(true)
      setConnectionStatus("connected")
      reconnectAttempts.current = 0
      toast.success(`Connected to ${ownerName}`, { duration: 2000 })

      const payload = {
        type: "slack_message",
        payload: {
          chatId: chatId,
          external_user_email: email,
        },
      }
      wsRef.current.send(JSON.stringify(payload))

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      refreshIntervalRef.current = setInterval(sendRefreshPayload, 5000)
    }

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === "slack_message_update" && data.chatId === chatId) {
          setMessages((prev) => {
            const messageMap = new Map()
            prev.forEach((msg) => messageMap.set(msg.id || `${msg.timestamp}-${msg.text}`, msg))

            const newMessages = (data.conversationData?.messages || []).filter((msg) => msg.sender !== "external")

            newMessages.forEach((msg) => {
              const key = msg.id || `${msg.timestamp}-${msg.text}`
              if (!messageMap.has(key)) {
                messageMap.set(key, {
                  ...msg,
                  status: msg.sender === "external" ? "delivered" : undefined,
                })
              }
            })

            const sortedMessages = Array.from(messageMap.values()).sort(
              (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
            )

            setIsLoading(false)
            return sortedMessages
          })
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error)
        setIsLoading(false)
      }
    }

    wsRef.current.onclose = (event) => {
      setIsConnected(false)
      setConnectionStatus("disconnected")

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }

      if (event.code !== 1000 && reconnectAttempts.current < 3) {
        reconnectAttempts.current++
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000)

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`)
          initWebSocket()
        }, delay)
      }
    }

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error)
      setIsConnected(false)
      setConnectionStatus("error")
      setIsLoading(false)
    }
  }, [chatId, baseURL, email, ownerName, sendRefreshPayload])

  useEffect(() => {
    if (chatId) {
      setIsLoading(true)
      initWebSocket()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000)
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [chatId, initWebSocket])

  useEffect(() => {
    if (isAutoScroll.current) {
      scrollToBottom()
    }
  }, [messages])

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const threshold = 150
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    isAutoScroll.current = isNearBottom
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !canSendMessages || isSending) return

    const messageText = newMessage.trim()
    const tempId = Date.now().toString()
    const message = {
      id: tempId,
      text: messageText,
      sender: "external",
      timestamp: new Date().toISOString(),
      status: "sending",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
    setIsSending(true)
    scrollToBottom()

    try {
      await axiosInstance.post("/slack/continue-slack-chat", {
        conversation_id: chatId,
        message: messageText,
        external_user_email: email,
        manual_token: token, // Include token for manual authentication
      })

      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, status: "delivered" } : msg)))
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, status: "failed" } : msg)))
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleClose = () => {
    if (wsRef.current) {
      wsRef.current.close(1000)
    }
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    onClose()
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
          aria-label="Restore chat"
        >
          <img src={slackLogo} alt="Slack" className="w-6 h-6 rounded-full" />
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white animate-pulse"></div>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-xs sm:max-w-sm bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-[#4A154B] to-[#3A0D3B] flex items-center justify-between rounded-lg">
        <div className="flex items-center space-x-2">
          <button
            onClick={onShowConversations}
            disabled={hasActiveSession}
            className="text-white/90 hover:text-white p-1 rounded hover:bg-white/10 transition disabled:opacity-50"
          >
            <FiChevronLeft className="text-sm" />
          </button>
          <div className="flex items-center space-x-2">
            <FiMessageSquare className="text-white text-sm" />
            <div>
              <h3 className="font-medium text-white text-sm">{ownerName}</h3>
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <span className="text-xs text-green-300">Online</span>
                ) : (
                  <span className="text-xs text-red-300">
                    {connectionStatus === "connecting" ? "Connecting..." : "Offline"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={handleMinimize}
            className="text-white/90 hover:text-white p-1 rounded hover:bg-white/10 transition flex items-center justify-center w-5 h-5"
          >
            <span className="text-xs mb-2">_</span>
          </button>
          <button
            onClick={handleClose}
            className="text-white/90 hover:text-white p-1 rounded hover:bg-white/10 transition"
          >
            <FiX className="text-sm" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 p-3 overflow-y-auto max-h-64 bg-gray-50 min-h-[200px]"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#4A154B] border-t-transparent"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-sm text-gray-500">
            No messages yet
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={`${msg.id || msg.timestamp}-${i}`}
              className={`mb-2 flex ${msg.sender === "external" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-2 rounded-lg text-sm ${
                  msg.sender === "external"
                    ? "bg-[#4A154B] text-white rounded-br-none"
                    : "bg-white border border-gray-200 rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                    msg.sender === "external" ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {msg.sender === "external" && (
                    <span>
                      {msg.status === "sending" ? (
                        <div className="animate-spin rounded-full h-2.5 w-2.5 border border-white/50 border-t-transparent"></div>
                      ) : msg.status === "delivered" ? (
                        <BsCheck2All className="text-xs text-green-300" />
                      ) : msg.status === "failed" ? (
                        <FiAlertCircle className="text-red-300 text-xs" />
                      ) : (
                        <BsCheck2 className="text-xs" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-gray-200 bg-white">
        {!canSendMessages && (
          <div className="text-xs text-amber-700 mb-2 px-2 py-1 bg-amber-50 rounded border border-amber-200 flex items-center">
            <FiAlertCircle className="text-amber-600 mr-1" />
            <span>Start a new chat to continue messaging</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={canSendMessages ? "Type your message..." : "View only"}
              rows={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A154B] resize-none disabled:bg-gray-100"
              disabled={!canSendMessages}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !canSendMessages || isSending}
              className="absolute right-1 bottom-1 bg-[#6264A7] text-white p-1.5 rounded disabled:opacity-50 flex items-center justify-center w-7 h-7 mb-1.5"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
              ) : (
                <FiSend className="text-xs" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SlackChat