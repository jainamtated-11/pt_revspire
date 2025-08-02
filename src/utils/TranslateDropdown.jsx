
import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faLanguage } from "@fortawesome/free-solid-svg-icons";

export default function TranslateDropdown({
  orgHex,
  availableLanguages,
  fetchPitchData,
  setLanguageCode,
  languageCode,
  isTranslateDropdownOpen,
  setIsTranslateDropdownOpen,
}) {
  const handleLanguageSelect = async (selectedLanguageCode) => {
    setLanguageCode(selectedLanguageCode);
    if (selectedLanguageCode === "default") {
      await fetchPitchData();
    } else {
      await fetchPitchData(selectedLanguageCode);
    }
    setIsTranslateDropdownOpen(false);
  };

  // First combine all options, then filter out the current selection
  const getAvailableOptions = () => {
    const defaultOption = { value: "default", label: "Default" };
    const allOptions = [defaultOption, ...availableLanguages];

    // Filter out the currently selected language (including "default" if selected)
    const filteredOptions = allOptions.filter((lang) =>
      languageCode === "default"
        ? lang.value !== "default"
        : lang.value !== languageCode
    );
    return filteredOptions;
  };

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isTranslateDropdownOpen) {
        setIsTranslateDropdownOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (isTranslateDropdownOpen && !event.target.closest(".translate-sidebar")) {
        setIsTranslateDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isTranslateDropdownOpen, setIsTranslateDropdownOpen]);

  return (
    <>
      {isTranslateDropdownOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsTranslateDropdownOpen(false)} />
      )}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isTranslateDropdownOpen ? "translate-x-0" : "translate-x-full"
        } translate-sidebar`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold" style={{ color: orgHex }}>Translate</h2>
          <button 
            onClick={() => setIsTranslateDropdownOpen(false)} 
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
          </button>
        </div>
        <div className="py-4">
          {getAvailableOptions().map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleLanguageSelect(lang.value)}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faLanguage} className="h-5 w-5" />
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
