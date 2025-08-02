import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

function ContentModal1({ content, setSelectedContent }) {
  const { viewContent, setViewContent, contentModalOpen, setContentModalOpen } =
    useContext(GlobalContext);

  let docUri;

  if (viewContent) {
    docUri = typeof viewContent === "string" ? viewContent : window.URL.createObjectURL(viewContent);
  }

  // Close modal on Esc key press
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const closeModal = () => {
    setContentModalOpen(false);
    setViewContent(null);
    setSelectedContent(null);
  };

  return (
    <>
      {contentModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
          <div className="absolute w-2/4 h-2/3 bg-white py-10 p-4 rounded-lg z-50 overflow-hidden">
            <div className=" absolute top-2 right-4">
           
            <button onClick={closeModal} className="bg-red-200 px-2 py-1  rounded-lg">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {content?.content_mimetype ? (
              <>
                {/* Check for different mimetypes */}
                {content.content_mimetype.includes("application/pdf") && (
                  <DocViewer
                    documents={[{ uri: docUri }]}
                    pluginRenderers={DocViewerRenderers}
                    config={{ header: { disableHeader: false }, pdfVerticalScrollByDefault: true }}
                    style={{ width: "100%", height: "100%" }}
                  />
                )}
                {content.content_mimetype.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document") && (
                  <DocViewer
                    documents={[{ uri: docUri }]}
                    pluginRenderers={DocViewerRenderers}
                    config={{ header: { disableHeader: false }, pdfVerticalScrollByDefault: true }}
                    style={{ width: "100%", height: "100%" }}
                  />
                )}
                {content.content_mimetype.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") && (
                  <DocViewer
                    documents={[{ uri: docUri }]}
                    pluginRenderers={DocViewerRenderers}
                    config={{ header: { disableHeader: false }, pdfVerticalScrollByDefault: true }}
                    style={{ width: "100%", height: "100%" }}
                  />
                )}
                {content.content_mimetype.includes("application/vnd.openxmlformats-officedocument.presentationml.presentation") && (
                  <DocViewer
                    documents={[{ uri: docUri }]}
                    pluginRenderers={DocViewerRenderers}
                    config={{ header: { disableHeader: false }, pdfVerticalScrollByDefault: true }}
                    style={{ width: "100%", height: "100%" }}
                  />
                )}
                {content.content_mimetype.includes("video/") && (
                  <video src={docUri} controls className="w-full h-full rounded-lg object-contain" />
                )}
                {content.content_mimetype.includes("image/") && (
                  <img src={docUri} alt="" className="w-full h-full object-contain" />
                )}
                {content.content_mimetype === "application/url" && (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <h1 className="text-center">Opening URL...</h1>
                    <a
                      href={content.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline mt-2"
                    >
                      Click here if the URL doesn't open automatically
                    </a>
                  </div>
                )}
                {/* For unsupported types */}
                {!content.content_mimetype.includes("pdf") &&
                  !content.content_mimetype.includes("video/") &&
                  !content.content_mimetype.includes("image/") &&
                  !content.content_mimetype.includes("pptx") && (
                    <div>
                      <h1>Sorry, content type is not supported</h1>
                      {/* <a href={content.content} target="_blank" rel="noreferrer">
                        Download File
                      </a> */}
                    </div>
                  )}
              </>
            ) : (
              <h1>No content available</h1>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ContentModal1;
