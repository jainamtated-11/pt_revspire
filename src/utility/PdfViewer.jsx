import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

const PdfViewer = ({ pdfUrl, modalSize }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  }

  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  const width = modalSize ? 900 : 150;
  const height = modalSize ? 150 : 150;

  return (
    <>
      <div>
        {loading && (
          <div className="flex justify-center items-center">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        )}
        <div>
          {/* Main PDF Viewer */}
          <div className="flex justify-center items-center">
            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
              <Page
                pageNumber={pageNumber}
                width={width}
                height={height}
                scale={1.8}
                renderMode="canvas"
                loading={loading}
              />
            </Document>
          </div>
          {/* Progress Bar and Navigation */}
          {!loading && (
            <div className="w-full">
              <progress value={pageNumber} max={numPages} className="w-full h-2 bg-gray-200">
                {pageNumber}/{numPages}
              </progress>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PdfViewer;