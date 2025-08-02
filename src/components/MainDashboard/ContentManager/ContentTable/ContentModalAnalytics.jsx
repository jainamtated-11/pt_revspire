import React, { useEffect, useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import useAxiosInstance from "../../../../Services/useAxiosInstance";

function ContentModalAnalytics({
  setShowAnalytics,
  showAnalytics,
  content,
  isPitch,
}) {
  if (!content) return null;

  const [engagementData, setEngagementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosInstance = useAxiosInstance();

  useEffect(() => {
    const fetchEngagementData = async () => {
      if (content?.content || content?.id) {
        try {
          setLoading(true);
          setError(null);

          const response = await axiosInstance.post("/get-content-engagement", {
            contentId: content.content || content.id,
          });

          setEngagementData(response.data);
        } catch (err) {
          console.error("Failed to fetch content engagement data:", err);
          setError("Unable to fetch data. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEngagementData();
  }, [content]);

  return (
    <div>
      <div
        className={`border absolute left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl shadow-xl transition-transform duration-300 ease-in-out transform ${
          showAnalytics ? "translate-y-[-100%]" : "translate-y-[100%]"
        }`}
        style={{
          height: "35%",
          bottom: "-35%",
        }}
      >
        {/* Drawer Header */}
        <div className="flex items-center  px-4 py-3 border-b dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-600 dark:text-white">
            Content Analytics
          </h3>
          <button
            className="p-2 mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            onClick={() => setShowAnalytics(false)}
          >
            <IoChevronDown
              className={`text-xl transition-transform duration-300 mb-1 ${
                showAnalytics ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-3rem)] pb-10">
          {loading ? (
            <div className="flex items-center justify-center">
              <h4 className="text-gray-600 font-semibold mt-8 dark:text-white">
                Loading...
              </h4>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : engagementData.message ? (
            <div className="flex items-center justify-center">
              <h4 className="text-gray-600 font-semibold mt-8 dark:text-white">
                {engagementData.message}
              </h4>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pitch Usage Section */}
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium dark:text-white mb-2">
                  Pitch Usage ({engagementData?.nestedData?.length})
                </h4>
                <div className="space-y-2">
                  {engagementData?.nestedData?.map((pitch, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm dark:text-gray-300"
                    >
                      <span>{pitch.pitch_name}</span>
                      <a
                        href={pitch.opportunityUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-800 hover:text-sky-900 font-semibold cursor-pointer"
                      >
                        View Pitch
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement Stats Section */}
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium dark:text-white mb-2">
                  Engagement Stats
                </h4>
                <div className="space-y-2">
                  <p className="text-sm dark:text-gray-300">
                    Unique Content Engagements:{" "}
                    {engagementData?.stats?.uniqueContentEngagements}
                  </p>
                  <p className="text-sm dark:text-gray-300">
                    Total Pitch Engagements:{" "}
                    {engagementData?.stats?.totalPitchEngagements}
                  </p>

                  {/* Conditional rendering based on content type */}
                  {content?.mimetype?.includes("pdf") && (
                    <p className="text-sm dark:text-gray-300">
                      PDF Scroll Percentage:{" "}
                      {engagementData?.stats?.pdfScrollPercent?.avg}%
                    </p>
                  )}

                  {content?.mimetype?.includes("video") && (
                    <p className="text-sm dark:text-gray-300">
                      Video Watch Percentage:{" "}
                      {engagementData?.stats?.videoWatchPercent?.avg}%
                    </p>
                  )}

                  {/* {content?.mimetype?.includes("image") && ( */}
                  <p className="text-sm dark:text-gray-300">
                    Active Time: {engagementData?.stats?.imageActiveSeconds.avg}{" "}
                    seconds
                  </p>
                  {/* )} */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentModalAnalytics;
