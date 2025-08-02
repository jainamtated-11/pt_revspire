import React from "react";
import CanvaOptions from "./CanvaOptions";
import canvaImage from "../../../../assets/canva.svg";
import { useCanva } from "../../../../hooks/useCanva";
import { useClickOutside } from "../../../../hooks/useClickOutside";

const Canva = ({
  item,
  activeContent,
  setActiveContent,
  showCanvaOptions,
  setShowCanvaOptions,
  lastColumn, // Add the lastColumn prop here
}) => {
  const {
    dialogRef,
    buttonRef,
    showCanvaButton,
    checkCanvaAsset,
    checkAsset,
    assetDetails,
  } = useCanva(item, setActiveContent);

  const handleCanvaClick = async () => {
    if (showCanvaOptions) {
      setShowCanvaOptions(null);
      return;
    }
    await checkCanvaAsset(item.id);
    setActiveContent(item.id);
    setShowCanvaOptions(showCanvaOptions === item.id ? "" : item.id);
  };

  useClickOutside(dialogRef, buttonRef, () => setShowCanvaOptions(""));

  return (
    <>
      {showCanvaButton(item.mimetype) &&
        (activeContent === item.id || showCanvaOptions === item.id) && (
          <div className="flex items-center">
            <button
              ref={buttonRef}
              onClick={handleCanvaClick}
              className="shrink-0 select-none  transition-all hover:scale-95 active:scale-90"
            >
              <img className="w-5" src={canvaImage} alt="Canva" />
            </button>
          </div>
        )}
      {(showCanvaOptions === item.id || checkAsset) && (
        <div
          ref={dialogRef}
          className={`absolute p-1 ${
            lastColumn ? "-left-48" : "-right-48"
          } top-[-10px] left-6 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl transform transition-all duration-200 ease-in-out z-[9999999999999999]`}
          style={{
            opacity: 1,
            transform: "scale(1)",
          }}
        >
          <div className="space-y-2 flex flex-col">
            <CanvaOptions
              setShowCanvaOptions={setShowCanvaOptions}
              assetDetails={assetDetails}
              canvaId={item.canva_id}
              item={item}
              checkAsset={checkAsset}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Canva;
