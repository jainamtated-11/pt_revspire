import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import { IoList, IoGridOutline } from "react-icons/io5";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import Search from "../../../assets/SearchDesign.png";

const ContentAnalyticsModal = ({
  analyticsPopupVisible,
  setAnalyticsPopupVisible,
  analyticsDetails,
  pitchContentEngagements,
  blobs,
  toggleFullscreen,
  orgHex,

}) => {
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    // Save original state
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // Freeze the background
    document.body.style.overflow = "hidden";

    // Restore when modal closes
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const truncateText = (text, maxLength = 30) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const prepareTimelineData = (engagements) => {
    return engagements
      .map((session) => ({
        date: new Date(session.created_at),
        time: session.image_active_seconds,
        watchPercentage: session.video_watch_percent,
        scrollPercentage: session.pdf_scroll_percent,
      }))
      .sort((a, b) => a.date - b.date);
  };
  return (
    <div className="fixed bg-black bg-opacity-50 z-[40] inset-0">
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold">Content Analytics</h2>
            </div>
            <button
              onClick={() => setAnalyticsPopupVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon className="text-2xl" icon={faXmark} />
            </button>
          </div>
          {/* 

          {/* Empty State or Content */}
          {!pitchContentEngagements || pitchContentEngagements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-64 h-64 mb-8">
                <img
                  src={Search} // Make sure to add this image to your assets
                  alt="No content analytics"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Content Engagement Yet
              </h3>
              <p className="text-gray-600 max-w-md">
                This content hasn't received any views or interactions yet.
                Analytics will appear here once users start engaging with this
                content.
              </p>
              <button
                onClick={() => setAnalyticsPopupVisible(false)}
                className="mt-6 px-6 py-2 rounded-full text-white transition-colors"
                style={{ backgroundColor: orgHex }}
              >
                Close
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto p-6 max-h-[calc(90vh-88px)] space-y-8">
              {/* Engagement Timeline Graph */}
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Engagement Timeline</h3>
                <div className="bg-white p-6 rounded-lg border h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareTimelineData(pitchContentEngagements)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(date, "MMM d, h:mm a")}
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
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded shadow">
                                <p className="text-sm font-semibold">
                                  {format(data.date, "MMM d, yyyy h:mm a")}
                                </p>
                                <p className="text-sm">
                                  Time Spent: {formatDuration(data.time)}
                                </p>
                                {data.watchPercentage > 0 && (
                                  <p className="text-sm">
                                    Watch Percentage:{" "}
                                    {Math.round(data.watchPercentage)}%
                                  </p>
                                )}
                                {data.scrollPercentage > 0 && (
                                  <p className="text-sm">
                                    Scroll Percentage:{" "}
                                    {Math.round(data.scrollPercentage)}%
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="time"
                        stroke={orgHex}
                        strokeWidth={2}
                        dot={{
                          stroke: orgHex,
                          strokeWidth: 2,
                          r: 4,
                          fill: "white",
                        }}
                        activeDot={{
                          stroke: orgHex,
                          strokeWidth: 2,
                          r: 6,
                          fill: "white",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Content Interactions Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium">Content Sessions</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-2 rounded ${
                        viewMode === "table"
                          ? "bg-[#014d83]/10 text-[#014d83]"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <IoList size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${
                        viewMode === "list"
                          ? "bg-[#014d83]/10 text-[#014d83]"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <IoGridOutline size={20} />
                    </button>
                  </div>
                </div>

                {viewMode === "list" ? (
                  // List View
                  <div className="space-y-4">
                    {pitchContentEngagements.map((content) => (
                      <div
                        key={content.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="text-lg text-gray-800 font-semibold">
                                {format(
                                  new Date(content.created_at),
                                  "MMM d, yyyy h:mm a"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {content.content_mimetype.includes("pdf") && (
                              <>
                                <div className="flex items-center space-x-4">
                                  <span className="text-sm">
                                    Scroll:{" "}
                                    {Math.round(content.pdf_scroll_percent)}%
                                  </span>
                                  <div className="w-48 h-2 bg-gray-200 rounded-full">
                                    <div
                                      className="h-full bg-[#014d83] rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          content.pdf_scroll_percent,
                                          100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                                <p className="text-sm">
                                  Active Time:{" "}
                                  {formatDuration(content.image_active_seconds)}
                                </p>
                              </>
                            )}

                            {content.content_mimetype.includes("video") && (
                              <>
                                <div className="flex items-center space-x-4">
                                  <span className="text-sm">
                                    Watch:{" "}
                                    {Math.round(content.video_watch_percent)}%
                                  </span>
                                  <div className="w-48 h-2 bg-gray-200 rounded-full">
                                    <div
                                      className="h-full bg-[#014d83] rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          content.video_watch_percent,
                                          100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                                <p className="text-sm">
                                  Active Time:{" "}
                                  {formatDuration(content.image_active_seconds)}
                                </p>
                              </>
                            )}

                            {!content.content_mimetype.includes("pdf") &&
                              !content.content_mimetype.includes("video") && (
                                <p className="text-sm">
                                  Active Time:{" "}
                                  {formatDuration(content.image_active_seconds)}
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Table View
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            No.
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          {analyticsDetails?.content_mimetype.includes(
                            "pdf"
                          ) && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Scroll %
                            </th>
                          )}
                          {analyticsDetails?.content_mimetype.includes(
                            "video"
                          ) && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Watch %
                            </th>
                          )}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Active Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pitchContentEngagements.map((content, index) => (
                          <tr key={content.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(
                                new Date(content.created_at),
                                "MMM d, yyyy h:mm a"
                              )}
                            </td>
                            {content.content_mimetype.includes("pdf") && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {Math.round(content.pdf_scroll_percent)}%
                              </td>
                            )}
                            {content.content_mimetype.includes("video") && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {Math.round(content.video_watch_percent)}%
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDuration(content.image_active_seconds)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentAnalyticsModal;
