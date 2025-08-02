import { useState, useEffect, useContext, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Download, X, Save, Sidebar } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import useAxiosInstance from "../../../../../Services/useAxiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignature } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "../../../../../context/GlobalState";
import { useCookies } from "react-cookie";
import { PDFDocument, rgb } from "pdf-lib";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import ESignSidebar from "./ESignSidebar";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
// Helper function to convert text to cursive image
const createTextSignatureImage = (text, width = 300, height = 80) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  // Set canvas size with high DPI
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  // Set canvas style size
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  // Clear canvas with transparent background
  ctx.clearRect(0, 0, width, height);
  // Set font and style
  ctx.font = '32px "Brush Script MT", "Lucida Handwriting", cursive';
  ctx.fillStyle = "#2563eb";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Add text
  ctx.fillText(text, width / 2, height / 2);
  return canvas.toDataURL("image/png");
};
// Signature Modal Component
const SignatureModal = ({
  isOpen,
  onClose,
  onSave,
  placeholderName,
  hexColor = "28747d",
}) => {
  const [mode, setMode] = useState(null); // 'sign' or 'type'
  const [typedText, setTypedText] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const [signatureData, setSignatureData] = useState(null);
  // Create a lighter version for hover backgrounds (20% opacity)
  const hoverBgColor = `${hexColor}30`;//33 hex = 20% opacity
  // State to track which button is hovered
  const [hoveredButton, setHoveredButton] = useState(null);
  useEffect(() => {
    if (mode === "sign" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      // Set up high-quality canvas
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Set canvas style size
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    }
  }, [mode]);
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  const handleSave = () => {
    if (mode === "sign") {
      const canvas = canvasRef.current;
      const signatureDataUrl = canvas.toDataURL();
      onSave({
        type: "signature",
        data: signatureDataUrl,
        name: placeholderName,
      });
    } else if (mode === "type") {
      // Convert typed text to cursive image
      const textImageData = createTextSignatureImage(typedText);
      onSave({
        type: "signature", // Change this to signature so it's treated as image
        data: textImageData,
        name: placeholderName,
        originalText: typedText, // Keep original text for reference
      });
    }
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-2xl mx-4 border border-gray-100 ">
        <div className="flex justify-between items-center mb-2  ">
          <h3 className="text-2xl font-bold text-gray-900">
            {placeholderName}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all duration-200"
          >
            <X className="text-gray-400 text-lg" />
          </button>
        </div>
        {!mode ? (
          <div className="space-y-4">
            <p className="text-gray-600 mb-6">Choose how you'd like to sign:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode("sign")}
                className="p-6 border-2 border-gray-200 rounded-xl transition-all duration-200 flex flex-col items-center gap-3"
                style={{
                  borderColor: hoveredButton === 'sign' ? hexColor : '#e5e7eb',
                  backgroundColor: hoveredButton === 'sign' ? hoverBgColor : 'transparent',
                }}
                onMouseEnter={() => setHoveredButton('sign')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <FontAwesomeIcon
                  icon={faSignature}
                  style={{ color: hexColor }}
                  className="text-3xl"
                />
                <span className="font-semibold">Draw Signature</span>
                <span className="text-sm text-gray-500">
                  Sign with your mouse or finger
                </span>
              </button>
              <button
                onClick={() => setMode("type")}
                className="p-6 border-2 border-gray-200 rounded-xl transition-all duration-200 flex flex-col items-center gap-3"
                style={{
                  borderColor: hoveredButton === 'type' ? hexColor : '#e5e7eb',
                  backgroundColor: hoveredButton === 'type' ? hoverBgColor : 'transparent',
                }}
                onMouseEnter={() => setHoveredButton('type')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span className="text-3xl" style={{ color: hexColor }}>Aa</span>
                <span className="font-semibold">Type Signature</span>
                <span className="text-sm text-gray-500">
                  Type your name in signature style
                </span>
              </button>
            </div>
          </div>
        ) : mode === "sign" ? (
          <div className="space-y-4 ">
            <div className="border-2 border-gray-300 rounded-xl p-4 bg-gray-50">
              <canvas
                ref={canvasRef}
                width={500}
                height={200}
                className="border border-gray-200 bg-white rounded-lg cursor-crosshair w-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={clearCanvas}
                className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200"
              >
                Clear
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  style={{ backgroundColor: hexColor }}
                  className="px-6 py-2 text-white rounded-xl hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Signature
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Type your signature:
              </label>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[${hexColor}] focus:border-[${hexColor}] transition-all duration-200"
                style={{
                  '--focus-ring-color': hexColor,
                  '--focus-border-color': hexColor,
                }}
                autoFocus
              />
            </div>
            {typedText && (
              <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div
                  className="text-4xl text-center py-4"
                  style={{
                    fontFamily: "Brush Script MT, cursive",
                    color: hexColor,
                  }}
                >
                  {typedText}
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <button
                onClick={() => setMode(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={!typedText.trim()}
                style={{ backgroundColor: hexColor }}
                className="px-6 py-2 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                <Save size={16} />
                Save Signature
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
function ESignPreview({ data, hexColor = "#28747d", contentId, organisation_id, pitchEngagementId, showUI = false, onOverlayClick, onClose, content, onClickContentHandler }) {
  const [pdfBlob, setPdfBlob] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfDimensions, setPdfDimensions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [placeholderValues, setPlaceholderValues] = useState({});
  const [editingPlaceholder, setEditingPlaceholder] = useState(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitComment, setSubmitComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const axiosInstance = useAxiosInstance();
  const { viewer_id } = useContext(GlobalContext);
  const [cookies] = useCookies(["publicPitchContact", "revspireClient", "revspireToken"]);
  const contactEmail = cookies.publicPitchContact?.email;
  const revspireClient = cookies.revspireClient;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const token = cookies.revspireToken;
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  let parsedData;
  try {
    parsedData = typeof data === "string" ? JSON.parse(data) : data;
  } catch (err) {
    console.error("Failed to parse data:", err, "Raw data:", data);
  }
  // Sequential signing logic additions
  const isSequential = parsedData?.sequential;
  const signatures = parsedData?.signature || [];
  const currentUserSignature = signatures.find(sig =>
    sig.email?.toLowerCase() === contactEmail?.toLowerCase()
  );
  const onContentClick = async (originalContent) => {
    // Rename keys at the beginning
    const content = {
      ...originalContent,
      content_source: originalContent.content_source,
      content_link: originalContent.content_link,
    };

    // For public sources, just use the content_link directly

    onClickContentHandler(
      content,
      typeof originalContent.content_link === 'string'
        ? JSON.parse(originalContent.content_link)
        : originalContent.content_link,
      originalContent.content_mimetype,
      originalContent.tagline
    );
  };

  // Only check email and show warning if revspireClient is '1'
  if (revspireClient === '1' || revspireClient === 1) {
    if (!currentUserSignature) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center  ">
          <div
            className="w-full h-full rounded-xl p-8 text-center flex flex-col items-center justify-center"
            style={{
              border: `1px solid ${hexColor}20`,  // Lighter border
              backgroundColor: `${hexColor}08`,    // Very subtle background tint
            }}
          >
            <div className="text-4xl mb-4" style={{ color: hexColor }}>✋</div>
            <h3 className="text-xl font-medium mb-3" style={{ color: hexColor }}>
              Not Your Document
            </h3>
            <p className="text-gray-600 mb-6">
              This document is assigned to a different email address.
              <br />
              Please sign in with the correct account to continue.
            </p>

            <button
              onClick={() => {
                // Clear cookies
                document.cookie.split(";").forEach(cookie => {
                  const eqPos = cookie.indexOf("=");
                  const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                });
                window.location.reload();
              }}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 border"
              style={{
                borderColor: hexColor,
                color: hexColor,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${hexColor}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Sign In With Different Account
            </button>
          </div>
        </div>
      );
    }
  }
  const currentUserOrder = currentUserSignature?.order;
  const currentUserStatus = currentUserSignature?.status;
  // Find the minimum order among signatures with status 'Draft'
  const draftSignatures = signatures.filter(sig => sig.status === "Draft");
  const minDraftOrder = draftSignatures.length > 0 ? Math.min(...draftSignatures.map(sig => sig.order)) : null;
  // Find previous signer (for order > 1)
  let previousSigner = null;
  if (isSequential && currentUserOrder > 1) {
    previousSigner = signatures.find(sig => sig.order === currentUserOrder - 1);
  }

  // Determine if we're in draft mode
  const isDraftMode = parsedData?.status == "Draft";

  // Always determine the signedContentId, public or private mode
  let signedContentId = null;

  if (parsedData?.status === "Draft") {
    // When status is Draft, always use the content_id from parsedData
    signedContentId = parsedData.content_id;
    // setShowUI(false); // Force hide UI in Draft mode
    showUI = false;
  } else if (revspireClient === '0' || revspireClient === 0) {
    // public mode logic
    const successSigners = (parsedData?.signature || []).filter(sig => sig.status === 'Success');
    if (successSigners.length > 0) {
      const highestOrderSigner = successSigners.reduce((a, b) => (a.order > b.order ? a : b));
      signedContentId = highestOrderSigner.signed_content_id;
    } else {
      signedContentId = parsedData?.signature?.[0]?.signed_content_id;
    }
  } else {
    // private mode logic (your existing logic)
    if (isSequential) {
      if (currentUserStatus === "Success" && currentUserSignature?.signed_content_id) {
        signedContentId = currentUserSignature.signed_content_id;
      } else if (currentUserOrder > 1 && previousSigner && previousSigner.status === "Success") {
        signedContentId = previousSigner.signed_content_id;
      } else if (currentUserOrder === 1 && currentUserStatus === "Draft") {
        signedContentId = currentUserSignature?.signed_content_id;
      } else {
        signedContentId = parsedData?.signature?.[0]?.signed_content_id;
      }
    } else {
      signedContentId = parsedData?.signature?.[0]?.signed_content_id;
    }
  }
  useEffect(() => {
    const fetchPdf = async () => {
      if (!signedContentId) {
        setError("No document content ID found");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axiosInstance.post(
          `/open-content`,
          {
            contentId: signedContentId,
            viewerId: viewer_id,
          },
          {
            responseType: "blob",
            withCredentials: true,
          }
        );
        const blob = new Blob([response.data], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        setPdfBlob(blobUrl);
        setError(null);
      } catch (err) {
        console.error("Error fetching PDF:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };
    fetchPdf();
    // Only refetch if signedContentId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedContentId]);


  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    // Initialize empty dimensions - they'll be filled by onPageLoadSuccess
    const dimensions = {};
    setPdfDimensions(dimensions);
  };
  const onPageLoadSuccess = (page) => {
    setPdfDimensions((prev) => ({
      ...prev,
      [page.pageNumber]: {
        width: page.originalWidth,
        height: page.originalHeight,
      },
    }));
  };
  const handlePlaceholderClick = (
    placeholder,
    signerEmail,
    placeholderIndex
  ) => {
    const placeholderKey = `${signerEmail}-${placeholderIndex}`;
    if (placeholder.type === "signature") {
      setCurrentPlaceholder({ ...placeholder, key: placeholderKey });
      setSignatureModalOpen(true);
    } else {
      setEditingPlaceholder(placeholderKey);
    }
  };
  const handleTextChange = (placeholderKey, value) => {
    setPlaceholderValues((prev) => ({
      ...prev,
      [placeholderKey]: { type: "text", data: value },
    }));
  };
  const handleSignatureSave = (signatureData) => {
    if (currentPlaceholder) {
      setPlaceholderValues((prev) => ({
        ...prev,
        [currentPlaceholder.key]: signatureData,
      }));
    }
    setCurrentPlaceholder(null);
  };
  const handleDownloadPdf = async () => {
    if (!pdfBlob) return;
    try {
      setIsDownloading(true);
      // Fetch the original PDF
      const response = await fetch(pdfBlob);
      const pdfBytes = await response.blob();
      const pdfDoc = await PDFDocument.load(await pdfBytes.arrayBuffer());
      const pages = pdfDoc.getPages();
      // Process each page
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];
        const pageNum = pageIndex + 1;
        // Get matching signatures for this user
        const matchingSignatures = parsedData.signature.filter(
          (signer) => signer.email === contactEmail
        );
        // Process placeholders for each matching signature
        for (const signer of matchingSignatures) {
          const pageplaceholders =
            signer.placeholder?.filter((p) => p.page === pageNum) || [];
          for (
            let placeholderIndex = 0;
            placeholderIndex < pageplaceholders.length;
            placeholderIndex++
          ) {
            const placeholder = pageplaceholders[placeholderIndex];
            const placeholderKey = `${signer.email}-${placeholderIndex}`;
            const placeholderValue = placeholderValues[placeholderKey];
            if (placeholderValue) {
              const [x, y] = placeholder.position.split(",").map(Number);
              if (placeholderValue.type === "text") {
                // Add regular text to PDF
                page.drawText(placeholderValue.data, {
                  x: Math.max(0, x),
                  y: Math.max(0, y),
                  size: 12,
                  color: rgb(0, 0, 0),
                });
              } else if (placeholderValue.type === "signature") {
                // Handle both drawn and typed signatures as images
                if (
                  placeholderValue.data &&
                  placeholderValue.data.startsWith("data:image/png;base64,")
                ) {
                  try {
                    // Extract base64 data
                    const base64Data = placeholderValue.data.split(",")[1];
                    const imageBytes = Uint8Array.from(atob(base64Data), (c) =>
                      c.charCodeAt(0)
                    );
                    // Embed the image
                    const signatureImage = await pdfDoc.embedPng(imageBytes);
                    const imageDims =
                      placeholderValue.type == "signature"
                        ? signatureImage.scale(0.3)
                        : signatureImage.scale(0.6); // Slightly larger scale for text signatures
                    page.drawImage(signatureImage, {
                      x: Math.max(0, x),
                      y: Math.max(0, y - imageDims.height), // Adjust for image height
                      width: imageDims.width,
                      height: imageDims.height,
                    });
                  } catch (imageError) {
                    console.error(
                      "Error embedding signature image:",
                      imageError
                    );
                    // Fallback to text if image embedding fails
                    page.drawText(
                      placeholderValue.originalText || "Signature",
                      {
                        x: Math.max(0, x),
                        y: Math.max(0, y),
                        size: 16,
                        color: rgb(0, 0, 0),
                      }
                    );
                  }
                }
              }
            }
          }
        }
      }
      // Save and download the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signed-document-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF: " + error.message);
    } finally {
      setIsDownloading(false);
    }
  };
  // Helper: Check if all placeholders for current user are filled
  const allPlaceholdersFilled = () => {
    if (!currentUserSignature) return false;
    return (currentUserSignature.placeholder || []).every((p, idx) => {
      const key = `${currentUserSignature.email}-${idx}`;
      const val = placeholderValues[key];
      if (p.type === "signature") {
        return val && val.type === "signature" && val.data;
      } else {
        return val && val.type === "text" && val.data && val.data.trim();
      }
    });
  };
  // Handler: Submit signatures
  const handleSubmitSignatures = async () => {
    if (!allPlaceholdersFilled()) {
      setNotification({ show: true, type: 'error', message: 'Please fill all placeholders before submitting.' });
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
      return;
    }
    setSubmitModalOpen(true);
  };
  // Handler: Actually submit after comment
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Generate signed PDF
      const response = await fetch(pdfBlob);
      const pdfBytes = await response.blob();
      const pdfDoc = await PDFDocument.load(await pdfBytes.arrayBuffer());
      const pages = pdfDoc.getPages();
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];
        const pageNum = pageIndex + 1;
        const signer = currentUserSignature;
        const pageplaceholders = signer.placeholder?.filter((p) => p.page === pageNum) || [];
        for (let placeholderIndex = 0; placeholderIndex < pageplaceholders.length; placeholderIndex++) {
          const placeholder = pageplaceholders[placeholderIndex];
          const placeholderKey = `${signer.email}-${placeholderIndex}`;
          const placeholderValue = placeholderValues[placeholderKey];
          if (placeholderValue) {
            const [x, y] = placeholder.position.split(",").map(Number);
            if (placeholderValue.type === "text") {
              page.drawText(placeholderValue.data, {
                x: Math.max(0, x),
                y: Math.max(0, y),
                size: 12,
                color: rgb(0, 0, 0),
              });
            } else if (placeholderValue.type === "signature") {
              if (placeholderValue.data && placeholderValue.data.startsWith("data:image/png;base64,")) {
                try {
                  const base64Data = placeholderValue.data.split(",")[1];
                  const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
                  const signatureImage = await pdfDoc.embedPng(imageBytes);
                  const imageDims = signatureImage.scale(0.3);
                  page.drawImage(signatureImage, {
                    x: Math.max(0, x),
                    y: Math.max(0, y - imageDims.height),
                    width: imageDims.width,
                    height: imageDims.height,
                  });
                } catch (imageError) {
                  page.drawText(placeholderValue.originalText || "Signature", {
                    x: Math.max(0, x),
                    y: Math.max(0, y),
                    size: 16,
                    color: rgb(0, 0, 0),
                  });
                }
              }
            }
          }
        }
      }
      const modifiedPdfBytes = await pdfDoc.save();
      const modifiedBlob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      // 2. Upload to /local-upload
      const formData = new FormData();
      formData.append("files", modifiedBlob, `signed-document-${Date.now()}.pdf`);
      formData.append("created_by", viewer_id);
      formData.append("description", "Content");
      formData.append("direct_pitch_content", 1);
      const uploadResponse = await axiosInstance.post(
        `/local-upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      const signed_content_id = uploadResponse.data?.uploadedFiles[0]?.contentId;
      if (!signed_content_id) throw new Error("No content_id returned from upload");

      // 3. Call /respond
      const respondResponse = await axiosInstance.post(
        `/revspire-sign/respond`,
        {
          content_id: contentId,
          signed_content_id,
          content_engagement_id: pitchEngagementId,
          order: currentUserSignature.order,
          action: "Success",
          comment: submitComment,
          viewer_id,
          organisation_id,
        },
        { withCredentials: true }
      );
      // Update the local signature data with the new signed_content_id
      if (respondResponse.data.success) {
        parsedData = respondResponse.data.contentJson;

        // Define the function separately (or better yet, define it outside this scope)
        const getSignedContentIdByOrder = (data, order) => {
          const signature = data.signature.find(sig => sig.order === order);
          return signature ? signature.signed_content_id : null;
        };

        // Then call it
        signedContentId = getSignedContentIdByOrder(parsedData, currentUserSignature.order);

        const response = await axiosInstance.post(
          `/open-content`,
          {
            contentId: signedContentId,
            viewerId: viewer_id,
          },
          {
            responseType: "blob",
            withCredentials: true,
          }
        );


        // Create new blob URL
        const newBlob = new Blob([response.data], { type: "application/pdf" });
        const newBlobUrl = URL.createObjectURL(newBlob);

        // Clean up previous blob URL
        if (pdfBlob) {
          URL.revokeObjectURL(pdfBlob);
        }

        // Update state
        setPdfBlob(newBlobUrl);

        // Set notification
        setNotification({
          show: true,
          type: 'success',
          message: 'Signatures submitted successfully!'
        });

        // Close modal and reset state
        setSubmitModalOpen(false);
        setSubmitComment("");

        // Refetch the PDF with the new signed_content_id
        const blobUrl = URL.createObjectURL(modifiedBlob);
        setPdfBlob(blobUrl);
      } else {
        throw new Error("Failed to update signature status");
      }
    } catch (err) {
      setNotification({ show: true, type: 'error', message: 'Failed to submit signatures: ' + (err?.message || 'Unknown error') });
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    } finally {
      setIsSubmitting(false);
      onClose();
      // Close modal and reset state
    }
  };

  // Sequential: Only allow signing if user is the current drafter (skip if draft mode)
  const canSign = isDraftMode ? false : (!isSequential || (currentUserStatus === "Draft" && currentUserOrder === minDraftOrder));
  const waitingForOthers = isDraftMode ? false : (isSequential && currentUserStatus === "Draft" && currentUserOrder !== minDraftOrder);

  const renderPlaceholders = () => {
    // In draft mode, don't render any placeholders
    if (isDraftMode || !parsedData?.signature || !pdfDimensions[pageNumber]) {
      return null;
    }
    if (!parsedData?.signature || !pdfDimensions[pageNumber]) {
      return null;
    }
    // Only render placeholders for the current user if sequential and canSign
    let matchingSignatures;
    if (isSequential) {
      if (!canSign) return null;
      matchingSignatures = signatures.filter(sig => sig.email === contactEmail);
    } else {
      matchingSignatures = signatures.filter(sig => sig.email === contactEmail);
    }
    return matchingSignatures.flatMap((signer, signerIndex) => {
      return (
        signer.placeholder
          ?.filter((p) => p.page === pageNumber)
          ?.map((placeholder, placeholderIndex) => {
            const placeholderKey = `${signer.email}-${placeholderIndex}`;
            const placeholderValue = placeholderValues[placeholderKey];
            const isEditing = editingPlaceholder === placeholderKey;
            const [x, y] = placeholder.position.split(",").map(Number);

            // Get the actual page dimensions
            const pageWidth = pdfDimensions[pageNumber]?.width || 595;
            const pageHeight = pdfDimensions[pageNumber]?.height || 842;

            // Calculate scaling factor based on rendered width (700px now instead of 600px)
            const scale = 700 / pageWidth;

            // Flip Y coordinate (PDF coordinates start from bottom)
            const flippedY = pageHeight - y;

            // Calculate adjusted position
            const adjustmentOffset = placeholder.type === "signature" ? -10 : -10;
            const adjustedTop = flippedY * scale - adjustmentOffset;
            const style = {
              position: "absolute",
              left: `${x * scale}px`,
              top: `${Math.max(0, adjustedTop)}px`,
              zIndex: 100,
              color: hexColor,
              border: `2px ${placeholder.type === "signature" ? "dashed" : "solid"} ${hexColor}`,
              background: "rgba(255, 255, 255, 0.4)",
              padding: "4px 6px",
              borderRadius: "6px",
              cursor: "pointer",
              minWidth: placeholder.type === "signature" ? "150px" : "100px",
              minHeight: placeholder.type === "signature" ? "60px" : "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            };
            return (
              <div
                key={placeholderKey}
                style={style}
                onClick={() =>
                  handlePlaceholderClick(
                    placeholder,
                    signer.email,
                    placeholderIndex
                  )
                }
                className="hover:shadow-lg transition-all duration-200"
              >
                {placeholder.type === "signature" ? (
                  <div className="flex flex-col items-center">
                    {placeholderValue ? (
                      <img
                        src={placeholderValue.data || "/placeholder.svg"}
                        alt="Signature"
                        className="max-w-full max-h-full"
                        style={{ maxWidth: "140px", maxHeight: "50px" }}
                      />
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faSignature}
                          className="text-xl mb-1"
                        />
                        <span className="text-xs">Click to sign</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full">
                    {isEditing ? (
                      <input
                        type="text"
                        value={placeholderValue?.data || ""}
                        onChange={(e) =>
                          handleTextChange(placeholderKey, e.target.value)
                        }
                        onBlur={() => setEditingPlaceholder(null)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            setEditingPlaceholder(null);
                          }
                        }}
                        className="w-full bg-transparent border-none outline-none text-center"
                        autoFocus
                        placeholder="Enter text"
                      />
                    ) : (
                      <span className="text-sm text-center block">
                        {placeholderValue?.data || placeholder.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          }) || []
      );
    });
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-current animate-pulse"
            style={{
              animationDelay: `${i * 0.2}s`,
              backgroundColor: hexColor,
              opacity: 0.6 + i * 0.2,
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-2">⚠️</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  // Sequential: show waiting message if not user's turn
  if (waitingForOthers) {
    const prevOrder = minDraftOrder;
    const prevSigner = signatures.find(sig => sig.order == prevOrder);
    return (

      <div className="w-full h-full flex flex-col items-center justify-center  ">
        {console.log("prevSignerprevSignerprevSigner", prevSigner, signatures, prevOrder)}
        <div
          className="w-full h-full rounded-xl p-8 text-center flex flex-col items-center justify-center"
          style={{
            border: `1px solid ${hexColor}20`,  // Lighter border
            backgroundColor: `${hexColor}08`,    // Very subtle background tint
          }}
        >
          <div className="text-4xl mb-4" style={{ color: hexColor }}>⏳</div>
          <h3 className="text-xl font-medium mb-3" style={{ color: hexColor }}>
            Waiting for previous signer.
          </h3>
          <p className="text-gray-600 mb-6">
            Waiting for <b>{prevSigner?.full_name || "previous signer"}</b> to complete their signature.
            <br />
            You will be notified to sign once they are done.
          </p>

          <button
            onClick={() => {
              // Clear cookies
              document.cookie.split(";").forEach(cookie => {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
              });
              window.location.reload();
            }}
            className="px-6 py-2 rounded-lg font-medium transition-all duration-200 border"
            style={{
              borderColor: hexColor,
              color: hexColor,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${hexColor}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Sign In With Different Account
          </button>
        </div>
      </div>

    );
  }
  return (
    <div className="relative flex h-screen bg-gray-100">
      {isDraftMode && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full shadow-md border border-gray-200"
            style={{ backgroundColor: hexColor }}>
            <span className="text-sm font-medium text-gray-700">DRAFT MODE</span>
          </div>
        </div>
      )}


      {/* Main Content */}
      <div className="flex-1 flex flex-col  min-w-0 ">

        {/* Sticky Top Bar */}
        {showUI && (
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur flex items-center gap-2 px-8 py-1.5 border-y border-gray-200 shadow-md">
            <button
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
              className="px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-30"
              title="Previous Page"
            >
              <FaCaretLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
              className="px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-30"
              title="Next Page"
            >
              <FaCaretRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="ml-4 flex items-center gap-2 px-4 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ backgroundColor: hexColor }}
            >
              <Download size={16} />
              {isDownloading ? "Downloading..." : "Download"}
            </button>
            {canSign && (
              <button
                onClick={handleSubmitSignatures}
                disabled={isSubmitting}
                className="ml-2 flex items-center gap-2 px-4 py-1 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{ backgroundColor: hexColor }}
              >
                <Save size={16} />
                {isSubmitting ? "Saving..." : "Save Signatures"}
              </button>
            )}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="ml-auto flex items-center gap-2 px-4 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-all duration-200 shadow-sm"
              title="Show Progress"
            >
              <Sidebar size={16} />
              Progress
            </button>
          </div>
        )}

        {/* Notification */}
        {notification.show && (
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3 rounded-lg shadow-lg text-white transition-all duration-300
            ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
          >
            {notification.message}
          </div>
        )}

        {/* PDF Viewer - Scrollable, all pages */}
        <div className="relative flex-1 flex items-center justify-center px-2 py-2">
          {showUI && isSidebarOpen && (
            <ESignSidebar
              data={data}
              hexColor={hexColor}
              isOpen={isSidebarOpen}
              onToggle={toggleSidebar}
            />
          )}
          {pdfBlob && (
            <Document
              file={pdfBlob}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="flex items-center justify-center h-96"><div className="animate-pulse text-gray-500">Loading PDF...</div></div>}
              error={<div className="flex items-center justify-center h-96 text-red-500">Failed to load PDF</div>}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col items-center"
                style={{
                  padding: '32px 0',
                  maxWidth: 800,
                  width: '100%',
                  position: 'relative' // Add this
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  width={700}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onLoadSuccess={onPageLoadSuccess}
                />
                {/* Render placeholders for the current page */}
                {contactEmail && renderPlaceholders()}
              </div>
            </Document>
          )}
          {/* Transparent overlay for click, only if showUI is false */}
          {!showUI && (
            <div
              className="absolute inset-0 z-20 cursor-pointer"
              style={{ background: 'rgba(0,0,0,0.01)' }}
              onClick={() => { onContentClick(content) }}
            />
          )}
        </div>

        {/* Signature Modal */}
        {showUI && (
          <SignatureModal
            isOpen={signatureModalOpen}
            onClose={() => {
              setSignatureModalOpen(false);
              setCurrentPlaceholder(null);
            }}
            onSave={handleSignatureSave}
            placeholderName={currentPlaceholder?.name || "Signature"}
            hexColor={hexColor}
          />
        )}

        {/* Custom Submit Comment Modal */}
        {showUI && submitModalOpen && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-100 relative">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Submit Signatures</h3>
              <p className="text-gray-600 mb-4">Optionally add a comment before submitting your signatures:</p>
              <textarea
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 mb-4 resize-none"
                value={submitComment}
                onChange={e => setSubmitComment(e.target.value)}
                placeholder="Add a comment (optional)"
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  ) : null}
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default ESignPreview;
