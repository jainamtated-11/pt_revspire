import React, { useEffect, useRef, useState } from "react";

const HTMLBlockPreview = ({ data }) => {
  const previewRef = useRef(null);
  const [htmlCode, setHtmlCode] = useState("");
  const JsonData = JSON.parse(data);

  useEffect(() => {
    if (JsonData.html) {
      setHtmlCode(JsonData.html);
    }
  }, []);

  useEffect(() => {
    if (previewRef.current && htmlCode) {
      const iframe = document.createElement("iframe");
      iframe.srcdoc = htmlCode;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.style.borderRadius = "8px";

      previewRef.current.innerHTML = "";
      previewRef.current.appendChild(iframe);
    }
  }, [htmlCode]);

  return (
    <div className=" w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
      {/* Header with close button only */}

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-white">
        <div
          ref={previewRef}
          className="w-full h-full min-h-[400px] rounded-lg bg-white border border-gray-200 overflow-hidden"
        >
          {!htmlCode && (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-500 border-2 border-dashed border-gray-300">
              <p>No HTML content to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HTMLBlockPreview;
