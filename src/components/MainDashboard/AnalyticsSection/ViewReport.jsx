import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import GlobalBackButton from "../../../utility/CustomComponents/GlobalBackButton";

const ViewReport = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract report ID from URL query parameters and credentials from state
  const queryParams = new URLSearchParams(location.search);
  const reportId = queryParams.get("id");
  const { embedUrl, accessToken } = location.state || {};
  const navigate = useNavigate();

  useEffect(() => {
    let report = null;
    let loadingToastId = null;

    const initializeReport = async () => {
      // Check if we have the required data
      if (!reportId) {
        setError("No report ID provided");
        setLoading(false);
        toast.error("No report ID provided");
        return;
      }

      if (!embedUrl || !accessToken) {
        setError("Missing report credentials");
        setLoading(false);
        toast.error("Missing report credentials");
        return;
      }

      try {
        // Show loading toast
        loadingToastId = toast.loading("Loading Power BI report...");

        // Load Power BI client library if not already loaded
        if (!window.powerbi) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://npmcdn.com/powerbi-client@2.21.0/dist/powerbi.min.js";
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        // Get the container element
        const container = document.getElementById("powerbi-container");
        if (!container) {
          throw new Error("Report container not found");
        }

        // Configure and embed the report
        const models = window["powerbi-client"].models;
        const config = {
          type: "report",
          tokenType: models.TokenType.Embed,
          accessToken: accessToken,
          embedUrl: embedUrl,
          settings: {
            panes: {
              filters: { expanded: false, visible: false },
              pageNavigation: { visible: true },
            },
          },
        };

        report = window.powerbi.embed(container, config);

        // Handle report events
        report.on("loaded", () => {
          console.log("Report loaded successfully");
          setLoading(false);
          setError(null);

          // Dismiss loading toast and show success toast
          toast.dismiss(loadingToastId);
          toast.success("Report loaded successfully");

          // Ensure the filter pane is hidden
          report.updateSettings({
            panes: {
              filters: { visible: false },
            },
          });
        });

        report.on("error", (event) => {
          console.error("Report error:", event.detail);
          const message = event?.detail?.message || "Unknown error";

          setError("Error loading report: " + message);
          setLoading(false);

          toast.dismiss(loadingToastId);
          toast.error("Error loading report: " + message);

          // Navigate after short delay to allow user to see the toast
          setTimeout(() => {
            navigate("/content/analytics/reports");
          }, 500);
        });

      } catch (error) {
        console.error("Error initializing report:", error);
        const message = error?.message || "Unknown error";

        setError("Error loading report: " + message);
        setLoading(false);

        toast.dismiss(loadingToastId);
        toast.error("Error loading report: " + message);

        setTimeout(() => {
          navigate("/content/analytics/reports");
        }, 500);
      }
    };

    initializeReport();

    // Cleanup function
    return () => {
      try {
        // Dismiss any active loading toast
        if (loadingToastId) {
          toast.dismiss(loadingToastId);
        }

        // Remove all event listeners from the report
        if (report) {
          report.removeAllListeners();
        }

        // Clear the container
        const container = document.getElementById("powerbi-container");
        if (container) {
          container.innerHTML = "";
        }

        // Remove the Power BI script
        const script = document.querySelector('script[src*="powerbi.min.js"]');
        if (script) {
          document.body.removeChild(script);
        }
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    };
  }, [reportId, embedUrl, accessToken]);

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center my-4 ">
          <GlobalBackButton onClick={() => window.history.back()} />
        </div>

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          )}

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div
              id="powerbi-container"
              className="w-full border border-gray-200 pt-4 px-1 rounded-lg shadow-sm bg-white"
              style={{
                minHeight: "700px",
                height: "calc(100vh - 30px)",
                width: "100%",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewReport;
