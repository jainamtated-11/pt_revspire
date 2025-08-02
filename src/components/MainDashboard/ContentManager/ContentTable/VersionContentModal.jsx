import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { formatDate } from "../../../../constants.js";

function VersionContentModal({
  versionModalOpen,
  viewVersionContent,
  setViewVersionContent,
  setVersionModalOpen,
  selectedVersionContent,
  setSelectedVersionContent,
  UpdateContentVersionHandler,
}) {
  let docUri;

  if (viewVersionContent !== null) {
    if (typeof viewVersionContent === "string") {
      docUri = viewVersionContent;
    } else if (viewVersionContent instanceof Blob) {
      docUri = window.URL.createObjectURL(viewVersionContent);
    } else {
      return null;
    }
  }

  return (
    <>
      {versionModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
          <div className="absolute w-2/4 h-2/3 bg-white  rounded-lg z-50 overflow-hidden">
            <div className="flex justify-between mx-2 mt-2">
              <div>{selectedVersionContent?.latest_content_name}</div>
              <div>
                <button
                  onClick={() => {
                    setVersionModalOpen(false);
                    setViewVersionContent(null);
                    setSelectedVersionContent({});
                  }}
                  className="bg-red-200 px-2 py-1 rounded-lg"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
            <select className="border-2 mx-2 mb-2 rounded-md">
              <option value={selectedVersionContent.latest_content_name}>
                Content Information
              </option>
              <option
                value={selectedVersionContent.latest_content_name}
                disabled
              >
                Content Name : {selectedVersionContent.latest_content_name}
              </option>
              <option
                value={selectedVersionContent.latest_content_description}
                disabled
              >
                Content Description :{" "}
                {selectedVersionContent.latest_content_description}
              </option>
              <option
                value={selectedVersionContent.latest_content_source}
                disabled
              >
                Content Source : {selectedVersionContent.latest_content_source}
              </option>
              <option
                value={selectedVersionContent.latest_content_created_by_name}
                disabled
              >
                Content Created By :{" "}
                {selectedVersionContent.latest_content_created_by_name}
              </option>
              <option
                disabled
                value={formatDate(
                  selectedVersionContent.latest_content_created_at
                )}
              >
                Content Created At :{" "}
                {formatDate(selectedVersionContent.latest_content_created_at)}
              </option>
            </select>

            {selectedVersionContent?.latest_content_mimetype ==
            "application/url" ? (
              <>
                {selectedVersionContent.latest_content_name.includes("pdf") ||
                selectedVersionContent.latest_content_name.includes("pdf") ? (
                  <>
                    <div className="h-[75%] 2xl:h-[80%] w-full ">
                      <DocViewer
                        documents={[
                          {
                            uri: docUri,
                          },
                        ]}
                        pluginRenderers={DocViewerRenderers}
                        config={{
                          header: { disableHeader: false },
                          pdfVerticalScrollByDefault: true,
                        }}
                        theme={{
                          primary: "#5296d8",
                          secondary: "#ffffff",
                          tertiary: "#5296d899",
                          text_primary: "#ffffff",
                          text_secondary: "#5296d8",
                          text_tertiary: "#00000099",
                        }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {selectedVersionContent.latest_content_name.includes(
                      "pptx"
                    ) ||
                    selectedVersionContent.latest_content_name.includes(
                      "xls"
                    ) ||
                    selectedVersionContent.latest_content_name.includes(
                      "xlsx"
                    ) ||
                    selectedVersionContent.latest_content_name.includes(
                      "ppt"
                    ) ||
                    selectedVersionContent.latest_content_name.includes(
                      "pptx"
                    ) ||
                    selectedVersionContent.latest_content_name.includes(
                      "doc"
                    ) ||
                    selectedVersionContent.latest_content_name.includes(
                      "docx"
                    ) ? (
                      <>
                        <div className="px-5 mt-5">
                          <a
                            className="hover:text-blue-600"
                            href={selectedVersionContent.latest_content_content}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {selectedVersionContent.latest_content_content}
                          </a>
                          <h1>Sorry, content type is not supported</h1>
                        </div>
                      </>
                    ) : (
                      <>
                        <iframe
                          src={selectedVersionContent.latest_content_content}
                          className="px-5 pt-5"
                          style={{
                            height: "100%",
                            width: "100%",
                            border: "none",
                            overflow: "auto",
                          }}
                          title="External Website"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {viewVersionContent !== null && (
                  <div className="h-[75%] 2xl:h-[80%]  flex justify-center items-center text-left w-full overflow-y-auto">
                    <DocViewer
                      documents={[
                        {
                          uri: docUri,
                        },
                      ]}
                      pluginRenderers={DocViewerRenderers}
                      config={{
                        header: { disableHeader: true },
                        pdfVerticalScrollByDefault: true,
                        pdfZoom: {
                          defaultZoom: 1.1,
                          zoomJump: 0.2,
                        },
                      }}
                      theme={{
                        primary: "#5296d8",
                        secondary: "#ffffff",
                        tertiary: "#5296d899",
                        text_primary: "#ffffff",
                        text_secondary: "#5296d8",
                        text_tertiary: "#00000099",
                        disableThemeScrollbar: false,
                      }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                )}
              </>
            )}
            <div className="flex justify-center space-x-12 my-1 ">
              <button
                className=" w-16 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                onClick={() => {
                  setVersionModalOpen(false);
                  setViewVersionContent(null);
                  setSelectedVersionContent({});
                }}
              >
                Cancel
              </button>

              <button
                className={`w-16 flex justify-center items-center text-sm btn-secondary text-white rounded-lg transition-colors`}
                onClick={() => {
                  UpdateContentVersionHandler();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default VersionContentModal;
