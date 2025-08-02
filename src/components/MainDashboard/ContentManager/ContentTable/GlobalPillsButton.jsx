import React from "react";

function GlobalPillsButton({ text, loader, buttonClick, buttonLoader, icon }) {
  const handleButtonClick = () => {
    // Call both the passed "onClick" function and the handleToggleDropdown

    if (buttonClick) buttonClick();
  };

  return (
    <>
      <button
        type="button"
        disabled={buttonLoader}
        onClick={handleButtonClick}
        className={`bg-primary flex justify-center items-center 
          ${text === "Change Password" || text === "Update" ? "bg-secondary p-3 min-w-[90px]" : "w-[90px]"} 
          ${text === "Upload" ? "bg-white border-2 border-gray-400 min-w-[100px] " : "border-none"}
          outline-none focus:outline-none 
          font-medium text-md h-[35px] rounded-[999px] 
          transition-all duration-300 ease-in-out z-9999999`}
      >
        <span
          className={`text-md  ${
            text == "Upload" ? "text-[#1c4075]" : "text-white"
          }`}
        >
          {loader ? (
            <div className={`flex justify-center items-center `}>
              <svg
                className="animate-spin h-5 w-[2.2rem] text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            </div>
          ) : 
            icon ? icon : text
          }
        </span>
      </button>
    </>
  );
}

export default GlobalPillsButton;
