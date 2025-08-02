import { useState, useEffect } from "react"
import TeamsChatPopover from "./TeamsDSRComponents/TeamsChatPopover"
import SlackChatPopover from "./SlackDSRComponents/SlackChatPopover"
import ThreadsDropdown from "./ThreadsDropdown"
import AIAgent from "./AIAgentDSRComponents/aiAgentDSR"
import { FiX, FiArrowRight, FiMessageSquare } from "react-icons/fi"
import { Bot, Users, Zap, MessageSquare } from "lucide-react"
import teamsLogo from "../../../assets/microsoftTeamsLogo.png"
import slackLogo from "../../../assets/slacklogo.png"
import useCheckUserLicense from "../../../Services/checkUserLicense"

// Constants to declare at the top
const CHAT_PLATFORMS = {
  AGENT: "agent",
  TEAMS: "teams",
  SLACK: "slack",
}

const DSRPopover = ({
  ownerDetails,
  viewerDetails,
  client,
  threads,
  setThreads,
  orgHex,
  pitchId,
  contentData,
  pitchData,
  handleOnClickContent,
  setFullscreenBlobUrl,
  popup,
}) => {
  const [showPopover, setShowPopover] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [showThreads, setShowThreads] = useState(false)
  const [agentMode, setAgentMode] = useState(false)
  const [userQuery, setUserQuery] = useState("")
  const [timerCompleted, setTimerCompleted] = useState(false)
  const checkUserLicense = useCheckUserLicense();

  const { conversation, isLoading, sendMessage, resetConversation } = AIAgent(pitchId)

  // Show popover after 15 seconds
  useEffect(() => {
    if (client == 1 && !timerCompleted) {
      const timer = setTimeout(() => {
        setShowPopover(true)
        setTimerCompleted(true)
      }, 15000)
      return () => clearTimeout(timer)
    }
  }, [client, timerCompleted])

  const resetChat = () => {
    setSelectedChat(null)
    setShowPopover(true)
    setShowThreads(false)
    setAgentMode(false)
    resetConversation()
  }

  const handleThreadsSelect = () => {
    setShowThreads(true)
    setShowPopover(false)
  }

  const handleChatSelect = (platform) => {
    if (platform === CHAT_PLATFORMS.AGENT) {
      setAgentMode(true)
      setShowPopover(false)
    } else {
      setSelectedChat(platform)
      setShowPopover(false)
    }
  }

  const handleClosePopover = () => {
    setShowPopover(false)
  }

  const handleOpenPopover = () => {
    setShowPopover(true)
    setTimerCompleted(true)
  }

  const handleSendMessage = async () => {
    await sendMessage(userQuery)
    setUserQuery("")
  }

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    )
  }

  const getProfilePictureUrl = () => {
    const photo = ownerDetails?.profilePhoto

    if (!photo) return null

    if (typeof photo === "string") {
      if (photo.startsWith("blob:") || photo.startsWith("http") || photo.startsWith("data:")) {
        return photo
      }
    }

    if (photo.type === "Buffer" && Array.isArray(photo.data)) {
      try {
        const uint8Array = new Uint8Array(photo.data)
        const blob = new Blob([uint8Array], { type: "image/jpeg" })
        return URL.createObjectURL(blob)
      } catch (error) {
        console.error("Error converting buffer to blob:", error)
        return null
      }
    }

    try {
      const blob = photo instanceof Blob ? photo : new Blob([photo], { type: "image/jpeg" })
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error("Error creating blob URL:", error)
      return null
    }
  }

  return (
    <div className="hidden md:block">
      {/* Always visible chat button */}
      <div className="fixed bottom-4 right-6 z-50">
        <button 
          onClick={handleOpenPopover} 
          className="relative group"
          aria-label="Open chat options"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          <div className="relative bg-white p-3 rounded-full shadow-xl border hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <MessageSquare className="w-5 h-5 text-gray-700" />
            <div
              className="absolute -top-2 -right-1 w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: orgHex }}
            ></div>
          </div>
        </button>
      </div>

      {/* Main Popover */}
      {showPopover && client == 1 && (
        <div className="fixed bottom-20 right-6 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs animate-slide-up relative overflow-hidden border border-gray-100">
            <button
              onClick={handleClosePopover}
              className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 z-10"
            >
              <FiX className="w-4 h-4 text-gray-500" />
            </button>

            <div className="p-4">
              {/* Compact Profile Section */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  {getProfilePictureUrl() ? (
                    <img
                      src={getProfilePictureUrl() || "/placeholder.svg"}
                      alt={ownerDetails?.fullName}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                      onError={(e) => {
                        e.target.style.display = "none"
                        e.target.nextSibling.style.display = "flex"
                      }}
                    />
                  ) : null}

                  <div
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-semibold text-sm"
                    style={{
                      background: `linear-gradient(135deg, ${orgHex}, ${orgHex}dd)`,
                      display: getProfilePictureUrl() ? "none" : "flex",
                    }}
                  >
                    {getInitials(ownerDetails?.fullName)}
                  </div>

                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: orgHex }}
                  >
                    <Zap className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-gray-900">{ownerDetails?.fullName}</h2>
                  {ownerDetails?.title && <p className="text-xs text-gray-500">{ownerDetails.title}</p>}
                </div>
              </div>

              {/* Compact Welcome Message */}
              <div className="mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-700">
                      👋 Hi there! Thanks for visiting our sales room. If you have any question, feel free to get in
                      touch!
                  </p>
                </div>
              </div>

              {/* Compact Options */}
              <div className="space-y-2">
                {/* AI Agent Option */}
                {ownerDetails?.agent_dsr === 1 && 
                (checkUserLicense("Revenue Enablement Elevate") == 1 ||
                checkUserLicense("Revenue Enablement Spark") == 1) && (
                  <button onClick={() => handleChatSelect(CHAT_PLATFORMS.AGENT)} className="w-full group">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 border hover:border-blue-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <span className="font-medium text-gray-900 block text-xs">AI Assistant</span>
                          <span className="text-[11px] text-gray-500">Instant answers</span>
                        </div>
                      </div>
                      <FiArrowRight className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200 w-3.5 h-3.5" />
                    </div>
                  </button>
                )}

                {/* Email Option */}
                {ownerDetails?.email != null && (
                  <button onClick={() => window.location.href = `mailto:${ownerDetails.email}`}className="w-full group">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 border hover:border-yellow-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="w-4 h-4 text-white" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </div>
                        <div className="text-left">
                          <span className="font-medium text-gray-900 block text-xs">Email</span>
                          <span className="text-[11px] text-gray-500">Contact via email</span>
                        </div>
                      </div>
                      <FiArrowRight className="text-gray-400 group-hover:text-yellow-500 group-hover:translate-x-0.5 transition-all duration-200 w-3.5 h-3.5" />
                    </div>
                  </button>
                )}

                {/* Threads Option */}
                <button onClick={handleThreadsSelect} className="w-full group">
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 border hover:border-green-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-gray-900 block text-xs">Threads</span>
                        <span className="text-[11px] text-gray-500">Start discussion</span>
                      </div>
                    </div>
                    <FiArrowRight className="text-gray-400 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all duration-200 w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Teams Option */}
                {ownerDetails?.microsoft_teams_bot_installed === 1 && ownerDetails?.instant_message_dsr === 1 &&                 
                (checkUserLicense("Revenue Enablement Elevate") == 1 ||
                checkUserLicense("Revenue Enablement Spark") == 1) && (
                  <button onClick={() => handleChatSelect(CHAT_PLATFORMS.TEAMS)} className="w-full group">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 border hover:border-blue-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                          <img src={teamsLogo || "/placeholder.svg"} className="w-4 h-4" alt="Teams" />
                        </div>
                        <div className="text-left">
                          <span className="font-medium text-gray-900 block text-xs">Teams</span>
                          <span className="text-[11px] text-gray-500">Chat via Teams</span>
                        </div>
                      </div>
                      <FiArrowRight className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200 w-3.5 h-3.5" />
                    </div>
                  </button>
                )}

                {/* Slack Option */}
                {ownerDetails?.slack_bot_installed === 1 && ownerDetails?.instant_message_dsr === 1 && 
                (checkUserLicense("Revenue Enablement Elevate") == 1 ||
                checkUserLicense("Revenue Enablement Spark") == 1) && (
                  <button onClick={() => handleChatSelect(CHAT_PLATFORMS.SLACK)} className="w-full group">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 border hover:border-purple-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                          <img src={slackLogo || "/placeholder.svg"} className="w-4 h-4" alt="Slack" />
                        </div>
                        <div className="text-left">
                          <span className="font-medium text-gray-900 block text-xs">Slack</span>
                          <span className="text-[11px] text-gray-500">Chat via Slack</span>
                        </div>
                      </div>
                      <FiArrowRight className="text-gray-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all duration-200 w-3.5 h-3.5" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Agent Chat Interface */}
      {agentMode && (
        <AIAgent
          pitchId={pitchId}
          orgHex={orgHex}
          contentData={contentData}
          pitchData={pitchData}
          handleOnClickContent={handleOnClickContent}
          setFullscreenBlobUrl={setFullscreenBlobUrl}
          onClose={() => {
            setAgentMode(false)
            setShowPopover(true)
          }}
        />
      )}

      {selectedChat === CHAT_PLATFORMS.TEAMS && (
        <TeamsChatPopover
          show={true}
          ownerName={ownerDetails.fullName}
          isTeamsInstalled={ownerDetails.microsoft_teams_bot_installed}
          viewerId={viewerDetails.viewer_id}
          ownerId={ownerDetails.id}
          email={viewerDetails.email}
          visitorFullName={viewerDetails.fullName}
          onClose={() => {
            setSelectedChat(null)
            setShowPopover(true)
          }}
        />
      )}

      {selectedChat === CHAT_PLATFORMS.SLACK && (
        <SlackChatPopover
          show={true}
          ownerName={ownerDetails.fullName}
          isSlackConnected={ownerDetails.slack_bot_installed}
          viewerId={viewerDetails.viewer_id}
          ownerId={ownerDetails.id}
          email={viewerDetails.email}
          visitorFullName={viewerDetails.fullName}
          onClose={() => {
            setSelectedChat(null)
            setShowPopover(true)
          }}
        />
      )}

      {showThreads && (
        <ThreadsDropdown
          isOpen={true}
          onClose={() => {
            setShowThreads(false)
            setShowPopover(true)
          }}
          threads={threads}
          setThreads={setThreads}
          primaryColor={orgHex}
          pitchId={pitchId}
          contentData={contentData}
          pitchData={pitchData}
          handleOnClickContent={handleOnClickContent}
          setFullscreenBlobUrl={setFullscreenBlobUrl}
          popup={popup}
        />
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}

export default DSRPopover