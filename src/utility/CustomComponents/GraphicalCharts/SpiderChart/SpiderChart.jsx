"use client"
import { useState, useEffect, useRef } from "react"
import { subDays, subMonths } from "date-fns"

const SpiderChart = ({ pitchEngagements, orgHex, timeframe }) => {
  const svgRef = useRef(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [hoveredUser, setHoveredUser] = useState(null)
  const [selectedMetrics, setSelectedMetrics] = useState(["totalActiveTime", "totalContentEngaged"])

  // Helper function to truncate email addresses smartly
  const truncateEmail = (email, maxLength = 20) => {
    if (!email || !email.includes("@")) return email
    // If the email is short enough, display it fully
    if (email.length <= maxLength) return email
    const [username, domain] = email.split("@")
    // For medium length emails, show first part of username + full domain
    if (username.length > 8 && email.length <= maxLength + 10) {
      return `${username.slice(0, 8)}...@${domain}`
    }
    // For very long emails, truncate both parts
    return `${username.slice(0, 4)}...@${domain.slice(0, 8)}...`
  }

  // Generate contrasting colors from org hex
  const generateContrastColors = (baseHex, count) => {
    // Convert hex to HSL
    const hexToHsl = (hex) => {
      const r = Number.parseInt(hex.slice(1, 3), 16) / 255
      const g = Number.parseInt(hex.slice(3, 5), 16) / 255
      const b = Number.parseInt(hex.slice(5, 7), 16) / 255
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h,
        s,
        l = (max + min) / 2

      if (max === min) {
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }
        h /= 6
      }
      return [h * 360, s * 100, l * 100]
    }

    // Convert HSL to hex
    const hslToHex = (h, s, l) => {
      l /= 100
      const a = (s * Math.min(l, 1 - l)) / 100
      const f = (n) => {
        const k = (n + h / 30) % 12
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, "0")
      }
      return `#${f(0)}${f(8)}${f(4)}`
    }

    const [baseH, baseS, baseL] = hexToHsl(baseHex)
    const colors = []
    for (let i = 0; i < count; i++) {
      const newH = (baseH + (i * 360) / count) % 360
      const newS = Math.max(30, Math.min(90, baseS + i * 20 - 10))
      const newL = Math.max(25, Math.min(75, baseL + i * 15 - 7.5))
      colors.push(hslToHex(newH, newS, newL))
    }
    return colors
  }

  // Process data to get top 7 users with multiple metrics
  const processSpiderData = (engagements) => {
    if (!engagements || engagements.length === 0) return []

    // Filter data based on timeframe
    let filteredData = [...engagements]
    const now = new Date()
    if (timeframe === "week") {
      filteredData = engagements.filter((session) => new Date(session.created_at) >= subDays(now, 7))
    } else if (timeframe === "month") {
      filteredData = engagements.filter((session) => new Date(session.created_at) >= subMonths(now, 1))
    } else if (timeframe === "quarter") {
      filteredData = engagements.filter((session) => new Date(session.created_at) >= subMonths(now, 3))
    }

    // Group by email or create unique identifier
    const userMap = new Map()
    filteredData.forEach((session) => {
      let userKey = "anonymous"
      let displayName = "Anonymous User"

      if (session.session_form_details) {
        const details = session.session_form_details
        // Get email for unique identification (prioritize email fields)
        if (details.email) {
          userKey = details.email.toLowerCase()
          displayName = details.email // Use email as display name
        } else if (details.Email) {
          userKey = details.Email.toLowerCase()
          displayName = details.Email // Use email as display name
        }

        // Only fall back to name fields if no email exists
        if (userKey === "anonymous") {
          if (details.fullname || details.full_name) {
            userKey = (details.fullname || details.full_name).toLowerCase()
            displayName = details.fullname || details.full_name
          } else if (details.firstname && details.lastname) {
            userKey = `${details.firstname} ${details.lastname}`.toLowerCase()
            displayName = `${details.firstname} ${details.lastname}`
          } else if (details.first_name && details.last_name) {
            userKey = `${details.first_name} ${details.last_name}`.toLowerCase()
            displayName = `${details.first_name} ${details.last_name}`
          } else if (details.name) {
            userKey = details.name.toLowerCase()
            displayName = details.name
          } else if (details.firstname || details.first_name) {
            userKey = (details.firstname || details.first_name).toLowerCase()
            displayName = details.firstname || details.first_name
          }
        }
      }

      if (!userMap.has(userKey)) {
        userMap.set(userKey, {
          name: displayName,
          email: userKey !== "anonymous" ? userKey : null,
          totalActiveTime: 0,
          totalContentEngaged: 0,
          sessions: 0,
        })
      }

      const user = userMap.get(userKey)
      user.totalActiveTime += session.active_time_seconds || 0
      user.totalContentEngaged += session.unique_interacted_content || 0
      user.sessions += 1
    })

    // Convert to array and sort by total active time
    const users = Array.from(userMap.values())
      .sort((a, b) => b.totalActiveTime - a.totalActiveTime)
      .slice(0, 7) // Top 7 users

    return users
  }

  const spiderData = processSpiderData(pitchEngagements)

  // Calculate max values for each metric
  const maxValues = {
    totalActiveTime: Math.max(...spiderData.map((user) => user.totalActiveTime), 1),
    totalContentEngaged: Math.max(...spiderData.map((user) => user.totalContentEngaged), 1),
  }

  // Metric definitions
  const metrics = {
    totalActiveTime: {
      label: "Active Time",
      unit: "seconds",
      formatter: (value) => {
        const minutes = Math.floor(value / 60)
        const seconds = value % 60
        return `${minutes}m ${seconds}s`
      },
    },
    totalContentEngaged: {
      label: "Content Engaged",
      unit: "pieces",
      formatter: (value) => `${value}`,
    },
  }

  // Generate colors for selected metrics
  const metricColors = generateContrastColors(orgHex, selectedMetrics.length)

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(1)
    }, 100)
    return () => clearTimeout(timer)
  }, [spiderData])

  // Reset animation when data changes
  useEffect(() => {
    setAnimationProgress(0)
    const timer = setTimeout(() => {
      setAnimationProgress(1)
    }, 100)
    return () => clearTimeout(timer)
  }, [timeframe])

  // SVG dimensions and calculations
  const size = 500
  const center = size / 2
  const maxRadius = size * 0.35
  const ringCount = 3
  const ringLabels = ["Low", "Medium", "High"]
  const ringColors = ["#f4f29b", "#f4c79b", "#d56d65"] // Yellow, Orange, Red

  // Calculate positions for each user
  const userPositions = spiderData.map((user, index) => {
    const angle = (index * 2 * Math.PI) / spiderData.length - Math.PI / 2 // Start from top
    const positions = {}
    selectedMetrics.forEach((metric) => {
      const normalizedValue = user[metric] / maxValues[metric]
      const radius = normalizedValue * maxRadius * animationProgress
      positions[metric] = {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        radius: radius,
      }
    })

    return {
      ...user,
      angle,
      positions,
      labelX: center + (maxRadius + 30) * Math.cos(angle),
      labelY: center + (maxRadius + 30) * Math.sin(angle),
    }
  })

  // Create smooth curved path for polygons
  const createSmoothPolygonPath = (points) => {
    if (points.length < 3) return ""

    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 0; i < points.length; i++) {
      const current = points[i]
      const next = points[(i + 1) % points.length]
      const nextNext = points[(i + 2) % points.length]

      // Calculate control points for smooth curves
      const cp1x = current.x + (next.x - points[(i - 1 + points.length) % points.length].x) * 0.15
      const cp1y = current.y + (next.y - points[(i - 1 + points.length) % points.length].y) * 0.15
      const cp2x = next.x - (nextNext.x - current.x) * 0.15
      const cp2y = next.y - (nextNext.y - current.y) * 0.15

      if (i === 0) {
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`
      } else {
        path += ` S ${cp2x} ${cp2y}, ${next.x} ${next.y}`
      }
    }

    return path + " Z"
  }

  const createStraightPolygonPath = (points) => {
    if (points.length < 3) return "";

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path + " Z";
  };

  // Create smooth curved path for each metric area
  const createSmoothAreaPath = (metric) => {
    if (userPositions.length < 3) return ""

    const points = userPositions.map((user) => user.positions[metric])
    return createSmoothPolygonPath(points)
  }

  const toggleMetric = (metric) => {
    if (selectedMetrics.includes(metric)) {
      if (selectedMetrics.length > 1) {
        setSelectedMetrics(selectedMetrics.filter((m) => m !== metric))
      }
    } else {
      setSelectedMetrics([...selectedMetrics, metric])
    }
  }

  if (spiderData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center p-6">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Engagement Data</h3>
        <p className="text-gray-500 max-w-md text-sm">
          No user engagement data found for the selected timeframe. Try adjusting the date range.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {/* Metric Selection */}
          <div className="mb-6">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Display Metrics</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(metrics).map(([key, metric]) => (
                <button
                  key={key}
                  onClick={() => toggleMetric(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center ${
                    selectedMetrics.includes(key)
                      ? "text-white shadow-xs"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                  style={{
                    backgroundColor: selectedMetrics.includes(key)
                      ? metricColors[selectedMetrics.indexOf(key)]
                      : undefined,
                  }}
                >
                  {selectedMetrics.includes(key) && (
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {metric.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center relative">
            <svg ref={svgRef} width={400} height={400} viewBox="0 0 400 400" className="overflow-visible">
              <defs>
                {/* Enhanced gradients for metric areas */}
                {selectedMetrics.map((metric, index) => (
                  <radialGradient key={metric} id={`spiderGradient-${metric}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={metricColors[index]} stopOpacity="0.3" />
                    <stop offset="70%" stopColor={metricColors[index]} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={metricColors[index]} stopOpacity="0.05" />
                  </radialGradient>
                ))}

                {/* Ring gradients for better shading */}
                {ringColors.map((color, index) => (
                  <radialGradient key={`ring-${index}`} id={`ringGradient-${index}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.1" />
                    <stop offset="50%" stopColor={color} stopOpacity="0.05" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                  </radialGradient>
                ))}

                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1" result="blur" />
                  <feOffset in="blur" dx="1" dy="1" result="offsetBlur" />
                  <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
                </filter>
              </defs>

              {/* Enhanced background rings with smooth curves and shading */}
              {Array.from({ length: ringCount }).map((_, ringIndex) => {
                const radius = (((ringIndex + 1) * maxRadius) / ringCount) * animationProgress
                const points = Array.from({ length: spiderData.length }, (_, i) => {
                  const angle = (i * 2 * Math.PI) / spiderData.length - Math.PI / 2
                  return {
                    x: center + radius * Math.cos(angle),
                    y: center + radius * Math.sin(angle),
                  }
                })

                return (
                  <g key={ringIndex}>
                    {/* Filled ring area with gradient */}
                    <path
                      d={createStraightPolygonPath(points)}
                      fill={`url(#ringGradient-${ringIndex})`}
                      stroke="none"
                      opacity={animationProgress * 0.8}
                      style={{
                        transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />

                    {/* Ring border with straight lines */}
                    <path
                      d={createStraightPolygonPath(points)}
                      fill="none"
                      stroke={ringColors[ringIndex]}
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                      opacity={animationProgress}
                      style={{
                        transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />

                    {/* Ring labels */}
                    <text
                      x={points[0].x}
                      y={points[0].y - 10}
                      fill={ringColors[ringIndex]}
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                      opacity={animationProgress * 0.8}
                      style={{
                        transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {ringLabels[ringIndex]}
                    </text>
                  </g>
                )
              })}

              {/* Axis lines - keep these straight */}
              {Array.from({ length: spiderData.length }, (_, index) => {
                const angle = (index * 2 * Math.PI) / spiderData.length - Math.PI / 2
                const endX = center + maxRadius * Math.cos(angle)
                const endY = center + maxRadius * Math.sin(angle)
                return (
                  <line
                    key={index}
                    x1={center}
                    y1={center}
                    x2={endX}
                    y2={endY}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    opacity={animationProgress * 0.6}
                    style={{
                      transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                )
              })}

              {/* Smooth curved areas for each metric */}
              {userPositions.length >= 3 &&
                selectedMetrics.map((metric, index) => (
                  <path
                    key={metric}
                    d={createSmoothAreaPath(metric)}
                    fill={`url(#spiderGradient-${metric})`}
                    stroke={metricColors[index]}
                    strokeWidth="2"
                    strokeOpacity="0.8"
                    opacity={animationProgress * 0.9}
                    filter="url(#softShadow)"
                    style={{
                      transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                ))}

              {/* User points and labels */}
              {userPositions.map((user, userIndex) => (
                <g key={userIndex}>
                  {/* User points for each metric */}
                  {selectedMetrics.map((metric, metricIndex) => {
                    const pos = user.positions[metric]
                    return (
                      <g key={`${userIndex}-${metric}`}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={hoveredUser === userIndex ? 8 : 6}
                          fill={metricColors[metricIndex]}
                          stroke="white"
                          strokeWidth="2"
                          filter="url(#glow)"
                          opacity={animationProgress}
                          onMouseEnter={() => setHoveredUser(userIndex)}
                          onMouseLeave={() => setHoveredUser(null)}
                          style={{
                            cursor: "pointer",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        />
                        {hoveredUser === userIndex && (
                          <text
                            x={pos.x}
                            y={pos.y - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="500"
                            fill={metricColors[metricIndex]}
                            opacity={animationProgress}
                          >
                            {metrics[metric].formatter(user[metric])}
                          </text>
                        )}
                      </g>
                    )
                  })}

                  {/* User name label - always visible */}
                  <text
                    x={user.labelX}
                    y={user.labelY}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="500"
                    fill="#374151"
                    opacity={animationProgress}
                    style={{
                      transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {user.email
                      ? truncateEmail(user.email)
                      : user.name.length > 12
                        ? `${user.name.slice(0, 12)}...`
                        : user.name}
                  </text>

                  {/* Enhanced hover tooltip */}
                  {hoveredUser === userIndex && (
                    <foreignObject
                      x={user.labelX + 20}
                      y={user.labelY - 60}
                      width="180"
                      height={80 + selectedMetrics.length * 20}
                    >
                      <div className="absolute bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg border border-gray-700">
                        <div className="font-medium mb-1 truncate">{user.name}</div>
                        <div className="space-y-1">
                          {selectedMetrics.map((metric, index) => (
                            <div key={metric} className="flex items-center">
                              <div
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: metricColors[index] }}
                              />
                              <span className="text-gray-300">{metrics[metric].label}:</span>
                              <span className="ml-1 font-medium">{metrics[metric].formatter(user[metric])}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400">
                          {user.sessions} session{user.sessions !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              ))}

              {/* Enhanced center point */}
              <circle
                cx={center}
                cy={center}
                r="4"
                fill={orgHex}
                stroke="white"
                strokeWidth="2"
                opacity={animationProgress}
                filter="url(#glow)"
                style={{
                  transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </svg>
          </div>
        </div>

        {/* Right sidebar with user cards */}
        <div className="lg:w-80 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Top Engagers</h3>
            <div className="space-y-3">
              {userPositions.slice(0, 3).map((user, index) => (
                <div
                  key={index}
                  className="p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredUser(index)}
                  onMouseLeave={() => setHoveredUser(null)}
                >
                  <div className="flex items-start">
                    <div className="flex space-x-1.5 mt-1 mr-3">
                      {selectedMetrics.map((metric, metricIndex) => (
                        <div
                          key={metric}
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: metricColors[metricIndex] }}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <div className="text-xs text-gray-600 mt-1 space-y-1">
                        {selectedMetrics.map((metric) => (
                          <div key={metric} className="flex justify-between">
                            <span className="text-gray-500">{metrics[metric].label}:</span>
                            <span className="font-medium">{metrics[metric].formatter(user[metric])}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-1 mt-1 border-t border-gray-100">
                          <span className="text-gray-500">Sessions:</span>
                          <span className="font-medium">{user.sessions}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metric Legend */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Metrics</h3>
            <div className="space-y-2">
              {selectedMetrics.map((metric, index) => (
                <div key={metric} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: metricColors[index] }} />
                  <span className="text-xs font-medium text-gray-700">{metrics[metric].label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpiderChart