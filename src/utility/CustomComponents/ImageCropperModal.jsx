import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

// Utility to get cropped image from canvas
function getCroppedImg(imageSrc, croppedAreaPixels) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous"; // Allow CORS images if needed
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext("2d");

      // Fill canvas with white background first
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Then draw the image
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // Export as JPEG
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    };
    image.onerror = (err) => reject(err);
  });
}

const aspectPresets = [
  { label: "Square (1:1)", value: 1 },
  { label: "Landscape (16:9)", value: 16 / 9 },
  { label: "Landscape (12:5)", value: 12 / 5 },
  { label: "Landscape (3:1)", value: 3 / 1 },
  { label: "Photo (4:3)", value: 4 / 3 },
  { label: "No Crop", value: null },
];

const ImageCropperModal = ({ open, image, aspect, onClose, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedAspect, setSelectedAspect] = useState(null);
  

  useEffect(() => {
    setSelectedAspect(aspect ?? null); 
  }, [aspect, open]);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (selectedAspect === null) {
      // No crop mode: convert original image to blob
      const imageBlob = await fetch(image).then((res) => res.blob());
      onSave(imageBlob);
      return;
    }

    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(image, croppedAreaPixels);
    onSave(blob);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl py-2 w-full max-w-md mx-auto relative">
        <div className="flex items-center justify-between mb-4 shadow-lg pb-3 px-5">
          <h3 className="text-xl font-semibold text-gray-900">Crop Image</h3>
          <button
            type="button"
            className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={onClose}
          >
            <FontAwesomeIcon
              className="text-gray-500 text-2xl"
              icon={faXmark}
            />
          </button>
        </div>

        {aspect === undefined && (
          <div className="mb-4 flex flex-wrap gap-2 items-center px-5">
            <span className="font-medium mr-2">Aspect Ratio:</span>
            {aspectPresets.map((preset) => (
              <button
                key={preset.label}
                className={`px-3 py-1 rounded border text-sm transition-colors duration-150 ${
                  selectedAspect === preset.value
                    ? "bg-secondary text-white border-secondary"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                }`}
                onClick={() => setSelectedAspect(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
        <div className="relative w-80 h-80 bg-gray-900 mb-4 mx-auto rounded overflow-hidden px-5 border flex items-center justify-center">
          {selectedAspect === null ? (
            <img src={image} alt="Preview" className="max-w-full max-h-full object-contain" />
          ) : (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={selectedAspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="rect"
              showGrid={true}
            />
          )}
        </div>
        <div className="mb-4 flex items-center gap-3 px-5">
          <span className="font-medium">Zoom:</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-40 accent-secondary"
          />
          <span className="text-xs text-gray-500">{zoom.toFixed(2)}x</span>
        </div>

        <div className=" border-t flex justify-end space-x-3 pb-1 pt-2 px-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
