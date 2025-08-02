import React, { useEffect, useState } from "react";
import useAxiosInstance from "../Services/useAxiosInstance.jsx";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { PenLine, ExternalLink } from "lucide-react";

export default function PitchVersionModal({
  pitchId,
  viewer_id,
  showVersionModal,
  setShowVersionModal,
  orgHex,
}) {
  const axiosInstance = useAxiosInstance();
  const [versionsData, setVersionsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPitchData = async () => {
      setLoading(false);
      try {
        const token = Cookies.get("revspireToken");
        const response = await axiosInstance.post(
          `/view-pitch-versions`,
          { viewer_id: viewer_id, pitchId: pitchId, manual_token: token },
          { withCredentials: true }
        );

        const pitchVersions = response.data.pitchVersions;
        setVersionsData(pitchVersions);
      } catch (error) {
        toast.error("Error fetching pitch data, attempting fallback");
      } finally {
        setLoading(false);
      }
    };

    if (showVersionModal) {
      fetchPitchData();
    }
  }, [showVersionModal, viewer_id, pitchId, axiosInstance]);

  const handlePitchVersionRedirection = async (id) => {
    if (pitchId && id) {
      window.open(`/pitch-version/${pitchId}/${id}`, "_blank");
    }
  };

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && showVersionModal) {
        setShowVersionModal(false);
      }
    };

    const handleClickOutside = (event) => {
      if (showVersionModal && !event.target.closest(".version-sidebar")) {
        setShowVersionModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showVersionModal, setShowVersionModal]);

  const groupedVersions = versionsData.reduce((acc, version) => {
    const date = new Date(version.version_date);
    const dateKey = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(version);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedVersions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <>
      {showVersionModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setShowVersionModal(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          showVersionModal ? "translate-x-0" : "translate-x-full"
        } version-sidebar overflow-hidden flex flex-col`}
      >
        <div
          className="p-5 border-b flex justify-between items-center"
          style={{ borderColor: `${orgHex}20` }}
        >
          <h2 className="text-xl font-semibold" style={{ color: orgHex }}>
            {sortedDates.length > 0 ? "Version History" : "No Versions"}
          </h2>
          <button
            onClick={() => setShowVersionModal(false)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none rounded-full p-1 hover:bg-gray-100 transition duration-150"
            aria-label="Close version history"
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="text-center p-6 text-gray-500">
              <PenLine className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2">No version history available</p>
            </div>
          ) : (
            sortedDates.map((date) => (
              <div key={date} className="mb-6">
                <h3 className="text-sm font-semibold mb-2 px-6 py-1 bg-gray-100 text-gray-700">
                  {date}
                </h3>
                {groupedVersions[date].map((version) => {
                  const versionDate = new Date(version.version_date);
                  const timeString = versionDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });
                  return (
                    <div
                      key={version.id}
                      className="flex items-center justify-between py-3 px-6 hover:bg-white border-l-4 border-transparent hover:border-l-4 transition-all duration-200"
                      style={{
                        borderLeftColor: `${
                          showVersionModal ? orgHex : "transparent"
                        }`,
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <PenLine className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {version?.version_created_by_name || "Unknown user"}
                          </p>
                          <p className="text-xs text-gray-500">{timeString}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handlePitchVersionRedirection(version.id);
                          setShowVersionModal(false);
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 transition duration-150 focus:outline-none"
                        aria-label="Open version"
                        style={{ color: orgHex }}
                      >
                        <ExternalLink className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
