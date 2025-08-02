import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faChartBar, faTimes } from "@fortawesome/free-solid-svg-icons";
import clarity from "../../src/assets/clarity.png";

export default function AnalyticsDropdown({
  isAnalyticsDropdownOpen,
  setIsAnalyticsDropdownOpen,
  analyticsMode,
  setAnalyticsMode,
  setPitchAnalyticsOpen,
  clarityProjectId,
  handleClarityAnalytics,
  orgHex,
}) {
  const handleOptionClick = (option) => {
    switch (option) {
      case "content":
        setAnalyticsMode(!analyticsMode);
        break;
      case "pitch":
        setPitchAnalyticsOpen(true);
        break;
      case "recordings":
        handleClarityAnalytics("recordings");
        break;
      case "heatmaps":
        handleClarityAnalytics("heatmaps");
        break;
    }
    setIsAnalyticsDropdownOpen(false);
  };

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isAnalyticsDropdownOpen) {
        setIsAnalyticsDropdownOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (isAnalyticsDropdownOpen && !event.target.closest(".analytics-sidebar")) {
        setIsAnalyticsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isAnalyticsDropdownOpen, setIsAnalyticsDropdownOpen]);

  return (
    <>
      {isAnalyticsDropdownOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsAnalyticsDropdownOpen(false)} />
      )}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isAnalyticsDropdownOpen ? "translate-x-0" : "translate-x-full"
        } analytics-sidebar`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold" style={{ color: orgHex }}>Analytics</h2>
          <button 
            onClick={() => setIsAnalyticsDropdownOpen(false)} 
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
          </button>
        </div>
        <div className="py-4">
          <button
            onClick={() => handleOptionClick("pitch")}
            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faChartLine} className="h-5 w-5" />
            <span>Pitch Analytics</span>
          </button>
          <button
            onClick={() => handleOptionClick("content")}
            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faChartBar} className="h-5 w-5" />
            <span>Content Analytics</span>
          </button>

          {clarityProjectId && (
            <>
              <button
                onClick={() => handleOptionClick("recordings")}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <img
                  src={clarity}
                  className="h-5 w-5 object-contain"
                  alt="Clarity Logo"
                />
                <span>Recordings</span>
              </button>
              <button
                onClick={() => handleOptionClick("heatmaps")}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <img
                  src={clarity}
                  className="h-5 w-5 object-contain"
                  alt="Clarity Logo"
                />
                <span>Heatmaps</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
