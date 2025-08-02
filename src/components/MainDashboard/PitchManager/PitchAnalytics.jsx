import { useState, useEffect } from "react"
import { FaRegFile } from "react-icons/fa"
import { IoClose, IoList, IoArrowBack, IoChevronDown, IoChevronUp } from "react-icons/io5"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts"
import Search from "../../../assets/SearchDesign.png"
import { CiFileOn } from "react-icons/ci"
import { TbFileTypeDocx } from "react-icons/tb"
import { LuFileSpreadsheet } from "react-icons/lu"
import { GrDocumentPpt } from "react-icons/gr"
import { BsFiletypePptx } from "react-icons/bs"
import { FaRegFileWord } from "react-icons/fa"
import { FaRegFileExcel } from "react-icons/fa"
import { MdOutlineSlowMotionVideo } from "react-icons/md"
import { FaRegFilePdf } from "react-icons/fa6"
import { AiOutlineYoutube } from "react-icons/ai"
import { RiVimeoLine } from "react-icons/ri"
import { FiLink } from "react-icons/fi"
import { IoImagesOutline } from "react-icons/io5"
import { subDays, subMonths, format } from "date-fns"
import SpiderChart from "../../../utility/CustomComponents/GraphicalCharts/SpiderChart/SpiderChart"

function PitchAnalytics({ pitchEngagements, setPitchAnalyticsOpen, orgHex }) {
  const [selectedSession, setSelectedSession] = useState(null)
  const [viewMode, setViewMode] = useState("timeline")
  const [timeframe, setTimeframe] = useState("all")
  const [granularity, setGranularity] = useState("day")
  const [isUserInfoExpanded, setIsUserInfoExpanded] = useState(false)
  const [expandedUser, setExpandedUser] = useState(null)
  const [chartType, setChartType] = useState("timeline") // New state for chart type
  const [spiderTimeframe, setSpiderTimeframe] = useState("all") // Separate timeframe for spider chart

  useEffect(() => {
    // Save original state
    const originalStyle = window.getComputedStyle(document.body).overflow
    // Freeze the background
    document.body.style.overflow = "hidden"
    // Restore when modal closes
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  useEffect(() => {
    // Reset scroll position when selected session changes
    if (selectedSession) {
      const container = document.querySelector(".overflow-y-auto")
      if (container) {
        container.scrollTop = 0
      }
    }
  }, [selectedSession])

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getContentTypeIcon = (mimetype, contentSource) => {
    if (contentSource?.toLowerCase() === "youtube") return <AiOutlineYoutube />
    if (contentSource?.toLowerCase() === "vimeo") return <RiVimeoLine />
    if (mimetype.includes("pdf")) return <FaRegFilePdf />
    if (mimetype.includes("image")) return <IoImagesOutline />
    if (mimetype.includes("video")) return <MdOutlineSlowMotionVideo />
    if (mimetype == "application/vnd.ms-excel") return <FaRegFileExcel />
    if (mimetype == "application/msword") return <FaRegFileWord />
    if (mimetype == "application/vnd.openxmlformats-officedocument.presentationml.presentation")
      return <BsFiletypePptx />
    if (mimetype == "application/vnd.ms-powerpoint") return <GrDocumentPpt />
    if (mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return <LuFileSpreadsheet />
    if (mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return <TbFileTypeDocx />
    if (mimetype == "application/url") return <FiLink />
    if (mimetype == "application/octet-stream") return <CiFileOn />
    return <FaRegFile />
  }

  // Prepare data for the graph
  const prepareGraphData = (contents) => {
    if (!contents) return []
    return contents.map((content) => ({
      name: content.content_tagline,
      activeTime: content.image_active_seconds || 0,
      contentType: getContentTypeIcon(content.content_mimetype, content.content_source),
    }))
  }

  // Updated function to prepare timeline data with aggregation
  const prepareTimelineData = (engagements) => {
    if (!engagements || engagements.length === 0) return []

    // Filter data based on selected timeframe
    let filteredData = [...engagements]
    const now = new Date()
    if (timeframe === "week") {
      filteredData = engagements.filter((session) => new Date(session.created_at) >= subDays(now, 7))
    } else if (timeframe === "month") {
      filteredData = engagements.filter((session) => new Date(session.created_at) >= subMonths(now, 1))
    } else if (timeframe === "quarter") {
      filteredData = engagements.filter((session) => new Date(session.created_at) >= subMonths(now, 3))
    }

    // Group by day, week, or month based on granularity
    const groupedData = {}
    filteredData.forEach((session) => {
      let dateKey
      const sessionDate = new Date(session.created_at)
      if (granularity === "day") {
        dateKey = format(sessionDate, "yyyy-MM-dd")
      } else if (granularity === "week") {
        // Get the week start date (Sunday)
        const weekStart = new Date(sessionDate)
        weekStart.setDate(sessionDate.getDate() - sessionDate.getDay())
        dateKey = format(weekStart, "yyyy-MM-dd")
      } else if (granularity === "month") {
        dateKey = format(sessionDate, "yyyy-MM")
      }

      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          date: new Date(dateKey),
          time: 0,
          interacted: 0,
          total: 0,
          sessions: 0,
        }
      }

      groupedData[dateKey].time += session.active_time_seconds
      groupedData[dateKey].interacted += session.interacted_content
      groupedData[dateKey].total += session.total_content
      groupedData[dateKey].sessions += 1
    })

    // Convert to array and sort by date
    return Object.values(groupedData).sort((a, b) => a.date - b.date)
  }

  // Add this helper function to get initials or truncated name
  const formatUserName = (sessionFormDetails) => {
    if (!sessionFormDetails || typeof sessionFormDetails !== "object") {
      return "Anonymous User"
    }
    // Normalize keys: lowercase, remove underscores, etc.
    const normalized = {}
    for (const key in sessionFormDetails) {
      const normalizedKey = key.toLowerCase().replace(/[_\s]/g, "")
      normalized[normalizedKey] = sessionFormDetails[key]
    }

    const { fullname, firstname, lastname, name } = normalized

    const normalizeValue = (val) => (typeof val === "string" ? val.trim() : "")
    const truncate = (str) => (str.length > 15 ? `${str.slice(0, 15)}...` : str)

    if (fullname) return truncate(normalizeValue(fullname))
    if (firstname && lastname) return truncate(`${normalizeValue(firstname)} ${normalizeValue(lastname)}`)
    if (firstname) return truncate(normalizeValue(firstname))
    if (lastname) return truncate(normalizeValue(lastname))
    if (name) return truncate(normalizeValue(name))
    return "Anonymous User"
  }

  // New function to prepare chronological timeline of content interactions
  const prepareContentTimeline = (contentEngagements = []) =>
    [...contentEngagements]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((content, idx) => ({
        ...content,
        order: idx + 1,
        timestamp: new Date(content.created_at),
      }))

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedSession ? "Session Analytics" : "Pitch Analytics"}
              </h2>
              <p className="text-gray-600 mt-1">
                {selectedSession ? "Detailed engagement insights" : "Track your pitch performance"}
              </p>
            </div>
            <button
              onClick={() => setPitchAnalyticsOpen(false)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all duration-200"
            >
              <IoClose size={28} />
            </button>
          </div>

          {/* Empty State */}
          {!pitchEngagements || pitchEngagements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-64 h-64 mb-8">
                <img
                  src={Search || "/placeholder.svg"} // Make sure to add this image to your assets
                  alt="No analytics data"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Engagement Data Yet</h3>
              <p className="text-gray-600 max-w-md">
                This pitch hasn't received any views or interactions yet. Once someone views your pitch, you'll see
                detailed analytics here.
              </p>
              <button
                onClick={() => setPitchAnalyticsOpen(false)}
                className="mt-6 px-6 py-2 rounded-full text-white transition-colors"
                style={{ backgroundColor: orgHex }}
              >
                Close
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto p-6 max-h-[calc(95vh-120px)] relative">
              {!selectedSession ? (
                // Sessions List View with new Timeline Graph
                <div className="space-y-6">
                  {/* Chart Type Toggle and Engagement Timeline Graph */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {chartType === "spider" ? "User Engagement Spider Chart" : "Engagement Timeline"}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {chartType === "spider"
                            ? "Visual representation of top users by engagement time"
                            : "Track engagement patterns over time"}
                        </p>
                      </div>
                      <div className="flex space-x-4">
                        {/* Chart Type Toggle */}
                        <div className="flex items-center space-x-3">
                          <label className="text-sm font-semibold text-gray-700">Chart Type:</label>
                          <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => setChartType("timeline")}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                chartType === "timeline"
                                  ? "bg-white text-gray-900 shadow-sm"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              Timeline
                            </button>
                            <button
                              onClick={() => setChartType("spider")}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                chartType === "spider"
                                  ? "bg-white text-gray-900 shadow-sm"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              Spider Chart
                            </button>
                          </div>
                        </div>

                        {/* Conditional filters based on chart type */}
                        {chartType === "timeline" ? (
                          <>
                            <div className="flex items-center space-x-3">
                              <label htmlFor="timeframe" className="text-sm font-semibold text-gray-700">
                                Timeframe:
                              </label>
                              <select
                                id="timeframe"
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="all">All Time</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                                <option value="quarter">Last 90 Days</option>
                              </select>
                            </div>
                            <div className="flex items-center space-x-3">
                              <label htmlFor="granularity" className="text-sm font-semibold text-gray-700">
                                Group By:
                              </label>
                              <select
                                id="granularity"
                                value={granularity}
                                onChange={(e) => setGranularity(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="day">Day</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                              </select>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <label htmlFor="spiderTimeframe" className="text-sm font-semibold text-gray-700">
                              Filter By:
                            </label>
                            <select
                              id="spiderTimeframe"
                              value={spiderTimeframe}
                              onChange={(e) => setSpiderTimeframe(e.target.value)}
                              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="all">All Time</option>
                              <option value="week">Last 7 Days</option>
                              <option value="month">Last 30 Days</option>
                              <option value="quarter">Last 90 Days</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conditional Chart Rendering */}
                    {chartType === "spider" ? (
                      <SpiderChart pitchEngagements={pitchEngagements} orgHex={orgHex} timeframe={spiderTimeframe} />
                    ) : (
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={prepareTimelineData(pitchEngagements)}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(date) => {
                                if (granularity === "day") return format(date, "MMM d")
                                if (granularity === "week") return `Week of ${format(date, "MMM d")}`
                                if (granularity === "month") return format(date, "MMM yyyy")
                                return format(date, "MMM d")
                              }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              interval={0}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              label={{
                                value: "Time Spent (seconds)",
                                angle: -90,
                                position: "insideLeft",
                                style: { textAnchor: "middle" },
                              }}
                            />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg">
                                      <p className="text-sm font-semibold text-gray-900">
                                        {granularity === "day" && format(data.date, "MMM d, yyyy")}
                                        {granularity === "week" && `Week of ${format(data.date, "MMM d, yyyy")}`}
                                        {granularity === "month" && format(data.date, "MMMM yyyy")}
                                      </p>
                                      <p className="text-sm text-gray-600">Time Spent: {formatDuration(data.time)}</p>
                                      <p className="text-sm text-gray-600">
                                        Content Viewed: {data.interacted} / {data.total}
                                      </p>
                                      <p className="text-sm text-gray-600">Sessions: {data.sessions}</p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="time"
                              stroke={orgHex}
                              strokeWidth={3}
                              dot={{
                                stroke: orgHex,
                                strokeWidth: 2,
                                r: 5,
                                fill: "white",
                              }}
                              activeDot={{
                                stroke: orgHex,
                                strokeWidth: 2,
                                r: 7,
                                fill: "white",
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Modern Sessions List */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Recent Sessions</h3>
                      <p className="text-gray-600 mt-1">Click on any session to view detailed analytics</p>
                    </div>
                    <div className="grid gap-6">
                      {pitchEngagements.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          className="group bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:border-gray-200 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="space-y-4">
                            <div className="flex flex-row justify-between items-start">
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  Session from {format(new Date(session.created_at), "MMM dd, yyyy")}
                                </h4>
                                <p className="text-gray-500 text-sm mt-1">
                                  {format(new Date(session.created_at), "h:mm a")}
                                </p>
                              </div>
                              {session?.session_form_details && (
                                <div
                                  className="relative group self-start sm:self-auto"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setExpandedUser(expandedUser === session.id ? null : session.id)
                                  }}
                                >
                                  <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-100">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                      {formatUserName(session.session_form_details)
                                        .split(" ")
                                        .map((name) => name[0])
                                        .join("")
                                        .toUpperCase()}
                                    </div>
                                    <span className="text-sm text-gray-700">
                                      {formatUserName(session.session_form_details)}
                                    </span>
                                    <span className="text-gray-400">
                                      {expandedUser === session.id ? (
                                        <IoChevronUp size={14} />
                                      ) : (
                                        <IoChevronDown size={14} />
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                            {expandedUser === session.id && (
                              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Contact Information */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                      Contact Information
                                    </h4>
                                    <div className="space-y-2">
                                      {Object.entries(session.session_form_details)
                                        .filter(
                                          ([key]) => !["browserInfo", "privacyPolicy", "isCompanyMail"].includes(key),
                                        )
                                        .map(([key, value]) => (
                                          <div key={key} className="grid grid-cols-3 gap-2">
                                            <span className="text-sm font-medium text-gray-500 col-span-1 capitalize">
                                              {key.replace(/_/g, " ")}:
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 col-span-2 break-words">
                                              {value?.toString() || "N/A"}
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                  {/* Technical Information */}
                                  {session.session_form_details.browserInfo && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Technical Information
                                      </h4>
                                      <div className="space-y-2">
                                        {Object.entries(session.session_form_details.browserInfo).map(
                                          ([key, value]) => (
                                            <div key={key} className="grid grid-cols-3 gap-2">
                                              <span className="text-sm font-medium text-gray-500 col-span-1 capitalize">
                                                {key.replace(/([A-Z])/g, " $1").trim()}:
                                              </span>
                                              <span className="text-sm font-medium text-gray-900 col-span-2 break-words">
                                                {value?.toString() || "N/A"}
                                              </span>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
                                <p className="text-sm font-medium text-blue-600 mb-1">Duration</p>
                                <p className="font-bold text-lg text-blue-900">
                                  {formatDuration(session.active_time_seconds)}
                                </p>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3">
                                <p className="text-sm font-medium text-green-600 mb-1">Content Viewed</p>
                                <p className="font-bold text-lg text-green-900">
                                  {session.unique_interacted_content} / {session.total_content}
                                </p>
                              </div>
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3">
                                <p className="text-sm font-medium text-purple-600 mb-1">Engagement Rate</p>
                                <p className="font-bold text-lg text-purple-900">
                                  {session && session.total_content > 0
                                    ? Math.round((session.unique_interacted_content / session.total_content) * 100)
                                    : 0}
                                  %
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Session Detail View (keeping the existing detailed view)
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setSelectedSession(null)}
                      className="group flex items-center space-x-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-full px-6 py-3 transition-all duration-300 transform hover:scale-105"
                    >
                      <IoArrowBack className="w-5 h-5 text-gray-700" />
                      <span className="font-semibold text-gray-700">Back to Sessions</span>
                    </button>
                  </div>
                  {/* Enhanced Analytics Cards */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm font-medium">Contents Viewed</p>
                          <p className="text-2xl font-bold mt-2">
                            {selectedSession.unique_interacted_content} / {selectedSession.total_content}
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <IoList className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm font-medium">Duration</p>
                          <p className="text-2xl font-bold mt-2">
                            {formatDuration(selectedSession.active_time_seconds)}
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm font-medium">Engagement Rate</p>
                          <p className="text-2xl font-bold mt-2">
                            {selectedSession?.total_content > 0
                              ? Math.round(
                                  (selectedSession.unique_interacted_content / selectedSession.total_content) * 100,
                                )
                              : 0}
                            %
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modern User Information Section */}
                  {selectedSession.session_form_details && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div
                        className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:from-gray-100 hover:to-gray-50 transition-all duration-200"
                        onClick={() => setIsUserInfoExpanded(!isUserInfoExpanded)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {formatUserName(selectedSession?.session_form_details)
                                .split(" ")
                                .map((name) => name[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">User Information</h3>
                            <p className="text-gray-600">
                              {formatUserName(selectedSession?.session_form_details) || "Anonymous User"}
                            </p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-200">
                          {isUserInfoExpanded ? <IoChevronUp size={24} /> : <IoChevronDown size={24} />}
                        </button>
                      </div>
                      {isUserInfoExpanded && (
                        <div className="p-4 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Form Details */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                Contact Information
                              </h4>
                              <div className="space-y-3">
                                {Object.entries(selectedSession.session_form_details)
                                  .filter(([key]) => !["browserInfo", "privacyPolicy", "isCompanyMail"].includes(key))
                                  .map(([key, value]) => (
                                    <div
                                      key={key}
                                      className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors"
                                    >
                                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        {key.replace(/_/g, " ")}
                                      </p>
                                      <p className="font-semibold text-gray-900">{value?.toString() || "N/A"}</p>
                                    </div>
                                  ))}
                                {/* Email Type */}
                                {selectedSession.session_form_details.isCompanyMail !== undefined && (
                                  <div className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                      Email Type
                                    </p>
                                    <span
                                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                        selectedSession.session_form_details.isCompanyMail
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {selectedSession.session_form_details.isCompanyMail
                                        ? "Company Email"
                                        : "Personal Email"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Technical Details */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                Technical Details
                              </h4>
                              {/* Browser Information */}
                              {selectedSession.session_form_details.browserInfo && (
                                <div className="space-y-3">
                                  {Object.entries(selectedSession.session_form_details.browserInfo).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors"
                                      >
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                          {key.replace(/([A-Z])/g, " $1").trim()}
                                        </p>
                                        <p className="font-semibold text-gray-900">{value}</p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                              {/* Privacy Policy */}
                              {selectedSession.session_form_details.privacyPolicy && (
                                <div className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Privacy Policy
                                  </p>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <span
                                        className={`w-3 h-3 rounded-full ${
                                          selectedSession.session_form_details.privacyPolicy.accepted
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                        }`}
                                      />
                                      <span className="font-semibold text-gray-900">
                                        {selectedSession.session_form_details.privacyPolicy.accepted
                                          ? "Accepted"
                                          : "Not Accepted"}
                                      </span>
                                    </div>
                                    {selectedSession.session_form_details.privacyPolicy.acceptedAt && (
                                      <p className="text-sm text-gray-600">
                                        {format(
                                          new Date(selectedSession.session_form_details.privacyPolicy.acceptedAt),
                                          "MMM d, yyyy 'at' h:mm a",
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Modern Content Interactions Section */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Content Interactions</h3>
                        <p className="text-gray-600 mt-1">Chronological timeline of user engagement</p>
                      </div>
                      <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode("timeline")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            viewMode === "timeline"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Timeline
                        </button>
                        <button
                          onClick={() => setViewMode("table")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            viewMode === "table"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Table
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            viewMode === "list"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Cards
                        </button>
                      </div>
                    </div>
                    <div className="min-h-[500px]">
                      {selectedSession.pitchContentEngagements.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <IoList className="w-12 h-12 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-lg">No content interactions recorded</p>
                          <p className="text-gray-400 text-sm mt-1">
                            User viewed the pitch but didn't interact with specific content
                          </p>
                        </div>
                      ) : viewMode === "timeline" ? (
                        // New Timeline View
                        <div className="relative">
                          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                          <div className="space-y-6">
                            {prepareContentTimeline(selectedSession.pitchContentEngagements).map((content) => (
                              <div key={content.id} className="relative flex items-start space-x-6">
                                {/* Timeline dot */}
                                <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white border-4 border-blue-500 rounded-full shadow-lg">
                                  <span className="text-xl">
                                    {getContentTypeIcon(content.content_mimetype, content.content_source)}
                                  </span>
                                </div>
                                {/* Content card */}
                                <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h4 className="text-lg font-bold text-gray-900">{content.content_tagline}</h4>
                                      <p className="text-sm text-gray-500 mt-1">
                                        Step {content.order} •{" "}
                                        {format(new Date(content.created_at), "MMM d, yyyy 'at' h:mm a")}
                                      </p>
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                      {formatDuration(content.image_active_seconds)}
                                    </span>
                                  </div>
                                  {/* Content-specific metrics */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {content.content_mimetype.includes("pdf") && (
                                      <div className="bg-red-50 rounded-lg p-3">
                                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                                          PDF Scroll
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <span className="text-sm font-bold text-red-900">
                                            {Math.round(content.pdf_scroll_percent)}%
                                          </span>
                                          <div className="flex-1 h-2 bg-red-200 rounded-full">
                                            <div
                                              className="h-full bg-red-500 rounded-full transition-all duration-300"
                                              style={{ width: `${Math.min(content.pdf_scroll_percent, 100)}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {content.content_mimetype.includes("video") && (
                                      <div className="bg-purple-50 rounded-lg p-3">
                                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                                          Video Watch
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <span className="text-sm font-bold text-purple-900">
                                            {Math.round(content.video_watch_percent)}%
                                          </span>
                                          <div className="flex-1 h-2 bg-purple-200 rounded-full">
                                            <div
                                              className="h-full bg-purple-500 rounded-full transition-all duration-300"
                                              style={{ width: `${Math.min(content.video_watch_percent, 100)}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <div className="bg-green-50 rounded-lg p-3">
                                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                                        Active Time
                                      </p>
                                      <p className="text-sm font-bold text-green-900 mt-1">
                                        {formatDuration(content.image_active_seconds)}
                                      </p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3">
                                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                                        Interaction
                                      </p>
                                      <p className="text-sm font-bold text-blue-900 mt-1">
                                        {format(new Date(content.created_at), "h:mm a")}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : viewMode === "list" ? (
                        // Enhanced Card View
                        <div className="grid gap-6">
                          {selectedSession.pitchContentEngagements.map((content) => (
                            <div
                              key={content.id}
                              className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-all duration-200"
                            >
                              <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                                  {getContentTypeIcon(content.content_mimetype, content.content_source)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-lg font-bold text-gray-900">{content.content_tagline}</h4>
                                    <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
                                      {formatDuration(content.image_active_seconds)}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                    {content.content_mimetype.includes("pdf") && (
                                      <div className="text-center">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                          PDF Scroll
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                          {Math.round(content.pdf_scroll_percent)}%
                                        </p>
                                      </div>
                                    )}
                                    {content.content_mimetype.includes("video") && (
                                      <div className="text-center">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                          Video Watch
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                          {Math.round(content.video_watch_percent)}%
                                        </p>
                                      </div>
                                    )}
                                    <div className="text-center">
                                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Active Time
                                      </p>
                                      <p className="text-lg font-bold text-gray-900">
                                        {formatDuration(content.image_active_seconds)}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Viewed At
                                      </p>
                                      <p className="text-sm font-medium text-gray-700">
                                        {format(new Date(content.created_at), "h:mm a")}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {format(new Date(content.created_at), "MMM d, yyyy 'at' h:mm a")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Enhanced Table View
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Order
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Content
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Interaction Time
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Scroll %
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Watch %
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Active Time
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {prepareContentTimeline(selectedSession.pitchContentEngagements).map((content) => (
                                  <tr key={content.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                        {content.order}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-3">
                                        <span className="text-xl">
                                          {getContentTypeIcon(content.content_mimetype, content.content_source)}
                                        </span>
                                        <div>
                                          <p
                                            className="text-sm font-semibold text-gray-900 max-w-[200px] truncate"
                                            title={content.content_tagline}
                                          >
                                            {content.content_tagline}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                      {format(new Date(content.created_at), "MMM d, h:mm a")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm font-semibold text-gray-900">
                                        {Math.round(content.pdf_scroll_percent || 0)}%
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm font-semibold text-gray-900">
                                        {Math.round(content.video_watch_percent || 0)}%
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm font-semibold text-gray-900">
                                        {formatDuration(content.image_active_seconds)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Engagement Graph */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Content Engagement Overview</h3>
                      <p className="text-gray-600 mt-1">Visual breakdown of time spent on each content piece</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[450px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={prepareGraphData(selectedSession.pitchContentEngagements)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis
                            label={{
                              value: "Time (seconds)",
                              angle: -90,
                              position: "insideLeft",
                              style: { textAnchor: "middle" },
                            }}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg">
                                    <p className="text-sm font-semibold text-gray-900">{payload[0].payload.name}</p>
                                    <p className="text-sm text-gray-600">Time: {formatDuration(payload[0].value)}</p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Bar
                            dataKey="activeTime"
                            fill={orgHex}
                            radius={[8, 8, 0, 0]}
                            className="hover:opacity-80 transition-opacity"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PitchAnalytics