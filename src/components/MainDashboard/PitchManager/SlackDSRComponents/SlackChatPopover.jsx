import { useState, useEffect, useContext, useCallback } from "react"
import { toast } from "react-hot-toast"
import useAxiosInstance from "../../../../Services/useAxiosInstance"
import SlackChat from "./SlackChat"
import { FiX, FiMessageSquare, FiArrowRight, FiChevronDown, FiUsers } from "react-icons/fi"
import { GlobalContext } from "../../../../context/GlobalState"
import slackLogo from "../../../../assets/slacklogo.png"

const SlackChatPopover = ({
  show,
  ownerName,
  isSlackConnected,
  viewerId,
  ownerId,
  email,
  visitorFullName,
  onClose,
}) => {
  const { baseURL } = useContext(GlobalContext)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [showChatWindow, setShowChatWindow] = useState(false)
  const [canSendMessages, setCanSendMessages] = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)
  const [existingChats, setExistingChats] = useState([])
  const [showChatList, setShowChatList] = useState(false)
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [hasActiveSession, setHasActiveSession] = useState(false)

  const axiosInstance = useAxiosInstance()

  const getCookieValue = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const token = getCookieValue("revspireToken");

  useEffect(() => {
    if (show && !hasActiveSession) {
      setShowConnectDialog(true)
      fetchExistingChats()
    }
  }, [show, hasActiveSession])

  const fetchExistingChats = useCallback(async () => {
    if (hasActiveSession) return

    try {
      setIsLoadingChats(true)
      const response = await axiosInstance.post("/slack/get-slack-conversations", {
        external_user_email: email,
        manual_token: token, // Include token for manual authentication
      })
      setExistingChats(response.data.data || [])
    } catch (error) {
      console.error("Error fetching Slack conversations:", error)
      toast.error("Failed to load existing chats")
      setExistingChats([])
    } finally {
      setIsLoadingChats(false)
    }
  }, [email, axiosInstance, hasActiveSession])

  const handleStartChat = async () => {
    if (hasActiveSession) {
      toast.error("Please finish your current conversation first")
      return
    }

    setIsConnecting(true)
    try {
      const response = await axiosInstance.post("/slack/start-slack-chat", {
        external_user_email: email,
        initial_message: `Hi ${ownerName}, I'd like to connect with you about the sales room.`,
        full_name: visitorFullName,
        manual_token: token, // Include token for manual authentication
      })

      if (response.data.success) {
        setActiveChatId(response.data.conversationId)
        setIsTransitioning(true)
        setCanSendMessages(true)
        setHasActiveSession(true)

        setTimeout(() => {
          setShowChatWindow(true)
          setShowConnectDialog(false)
          setIsTransitioning(false)
        }, 300)
      }
    } catch (error) {
      console.error("Error starting Slack chat:", error)
      toast.error("Failed to start chat. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSelectChat = async (chatId) => {
    if (hasActiveSession) {
      toast.error("Please finish your current conversation first")
      return
    }

    try {
      setIsTransitioning(true)
      setActiveChatId(chatId)
      setCanSendMessages(false)
      setHasActiveSession(true)

      setTimeout(() => {
        setShowChatWindow(true)
        setShowConnectDialog(false)
        setIsTransitioning(false)
      }, 300)
    } catch (error) {
      console.error("Error loading chat:", error)
      toast.error("Failed to load chat")
      setIsTransitioning(false)
    }
  }

  const handleCloseChat = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setShowChatWindow(false)
      setActiveChatId(null)
      setHasActiveSession(false)
      setShowConnectDialog(true)
      setIsTransitioning(false)
      fetchExistingChats()
    }, 300)
  }

  const handleClosePopover = () => {
    setHasActiveSession(false)
    setActiveChatId(null)
    onClose()
  }

  const handleRestorePopover = () => {
    setIsMinimized(false)
    if (!hasActiveSession) {
      setShowConnectDialog(true)
      fetchExistingChats()
    } else {
      setShowChatWindow(true)
    }
  }

  if (!isSlackConnected) return null

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleRestorePopover}
          className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
          aria-label="Restore Slack chat"
        >
          <img src={slackLogo} alt="Slack" className="w-6 h-6 rounded-full" />
          {hasActiveSession && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white animate-pulse"></div>
          )}
        </button>
      </div>
    )
  }

  return (
    <>
      {isTransitioning && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-xs sm:max-w-sm bg-white rounded-lg shadow-xl flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#4A154B] border-t-transparent"></div>
        </div>
      )}

      {showConnectDialog && !isTransitioning && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-xs sm:max-w-sm bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-[#4A154B] p-2 rounded-lg">
                <FiMessageSquare className="text-white text-sm" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Chat with {ownerName}</h3>
                <p className="text-xs text-gray-600 mt-1">Connect via Slack</p>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  setShowChatList(!showChatList);
                  if (!showChatList) fetchExistingChats();
                }}
                disabled={hasActiveSession}
                className="w-full flex justify-between items-center text-xs text-gray-700 p-2 rounded hover:bg-gray-50 transition disabled:opacity-50"
              >
                <div className="flex items-center space-x-2">
                  <FiUsers className="text-gray-500 text-sm" />
                  <span>
                    {isLoadingChats ? 'Loading...' : `Previous chats (${existingChats.length})`}
                  </span>
                </div>
                <FiChevronDown className={`transition-transform duration-200 text-xs ${showChatList ? "rotate-180" : ""}`} />
              </button>

              {showChatList && (
                <div className="mt-2 border border-gray-100 rounded max-h-40 overflow-y-auto">
                  {isLoadingChats ? (
                    <div className="p-3 flex justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#4A154B] border-t-transparent"></div>
                    </div>
                  ) : existingChats.length === 0 ? (
                    <div className="p-3 text-center text-xs text-gray-500">
                      No previous conversations
                    </div>
                  ) : (
                    existingChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => !hasActiveSession && handleSelectChat(chat.id)}
                        className={`p-2 border-b border-gray-50 last:border-b-0 text-xs ${
                          hasActiveSession ? "cursor-not-allowed opacity-50" : "hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        <div className="flex justify-between">
                          <div>
                            {new Date(chat.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-gray-400">
                            {chat.conversation_data?.messages?.length || 0} msgs
                          </div>
                        </div>
                        <div className="text-gray-600 truncate mt-0.5">
                          {chat.conversation_data?.messages?.[0]?.text || "No messages"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-t border-gray-200">
            <button
              onClick={handleClosePopover}
              className="text-xs text-gray-600 hover:text-gray-800 flex items-center space-x-1"
            >
              <FiX className="text-xs" />
              <span>Close</span>
            </button>
            <button
              onClick={handleStartChat}
              disabled={isConnecting || hasActiveSession}
              className="bg-[#4A154B] text-white px-3 py-1.5 rounded text-xs font-medium flex items-center space-x-1 disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-2.5 w-2.5 border border-white border-t-transparent"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>New Chat</span>
                  <FiArrowRight className="text-xs" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {showChatWindow && activeChatId && !isTransitioning && (
        <SlackChat
          chatId={activeChatId}
          onClose={handleCloseChat}
          ownerName={ownerName}
          email={email}
          visitorFullName={visitorFullName}
          onShowConversations={() => {
            if (!hasActiveSession) {
              setIsTransitioning(true);
              setTimeout(() => {
                setShowChatWindow(false);
                setShowConnectDialog(true);
                setIsTransitioning(false);
              }, 300);
            }
          }}
          organisationId={ownerId}
          canSendMessages={canSendMessages}
          hasActiveSession={hasActiveSession}
        />
      )}
    </>
  )
}

export default SlackChatPopover