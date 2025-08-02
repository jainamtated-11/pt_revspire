import React, { useEffect, useRef } from "react";
import adobeExpressLogo from "../../../../assets/adobe.svg";
import { AdobeExpressOptions } from "./AdobeExpressOptions";

const AdobeExpress = ({
  item,
  activeContent,
  setActiveContent,
  showAdobeOptions,
  setShowAdobeOptions,
  lastColumn, // Add the lastColumn prop here
}) => {
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);

  const handleAdobeClick = async () => {
    setActiveContent(item.id);
    setShowAdobeOptions(showAdobeOptions === item.id ? "" : item.id);
  };

  const showAdobeButton = (mimeType) => mimeType?.includes("image/");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowAdobeOptions("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowAdobeOptions]);

  return (
    <>
      {showAdobeButton(item.mimetype) &&
        (activeContent === item.id || showAdobeOptions === item.id) && (
          <div className="flex items-center">
            <button
              ref={buttonRef}
              onClick={handleAdobeClick}
              className="shrink-0 select-none  transition-all hover:scale-95 active:scale-90"
            >
              <img className="w-5" src={adobeExpressLogo} alt="Adobe Express" />
            </button>
          </div>
        )}
      {showAdobeOptions === item.id && (
        <div
          ref={dialogRef}
          className={`absolute p-1 ${
            lastColumn ? "-left-48" : "-right-48"
          } top-[-34px] mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl transform transition-all duration-200 ease-in-out z-[99999999]`}
          style={{
            opacity: 1,
            transform: "scale(1)",
          }}
        >
          <div className="space-y-2  flex flex-col">
            <AdobeExpressOptions
              item={item}
              setShowAdobeOptions={setShowAdobeOptions}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AdobeExpress;
