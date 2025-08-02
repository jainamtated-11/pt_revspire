import React from "react";
import { IoArrowBack } from "react-icons/io5";

function GlobalBackButton({ onClick }) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
                className="group flex justify-center items-center text-white bg-[rgb(124,146,184)]
              hover:bg-[rgba(124,146,184,0.8)]
              border-none outline-none focus:outline-none 
              font-bold text-md h-[35px] w-[35px]  
              rounded-full hover:w-[90px] hover:rounded-[999px] 
              transition-all duration-300 ease-in-out z-9999999"
      >
        <span className="group-hover:hidden font-bold">
          <IoArrowBack size={"1.2rem"} />
        </span>
        <span className="hidden group-hover:block text-md text-white">Back</span>
      </button>
    </>
  );
}

export default GlobalBackButton;