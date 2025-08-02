import React from "react";
import { HiPlusCircle } from "react-icons/hi";

function GlobalButton({ handleToggleDropdown, addPitch }) {
  const handleButtonClick = () => {
    // Call both the passed "onClick" function and the handleToggleDropdown
    if (handleToggleDropdown) handleToggleDropdown();
    if (addPitch) addPitch();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleButtonClick}
        className="group flex justify-center items-center text-primary 
              hover:bg-primary 
             border-none outline-none focus:outline-none 
             font-medium text-md h-[35px] w-[35px]  
             rounded-full hover:w-[90px] hover:rounded-[999px] 
             transition-all duration-300 ease-in-out z-9999999"
      >
        <span className="group-hover:hidden">
          <HiPlusCircle size={"2.3rem"} />
        </span>
        <span className="hidden group-hover:block text-md text-white">Add</span>
      </button>
    </>
  );
}

export default GlobalButton;
