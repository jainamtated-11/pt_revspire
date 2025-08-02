import React from "react";
import { HiArrowLeft } from "react-icons/hi";

function GlobalBackButton({ onClick }) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="group flex justify-center items-center text-white bg-[rgb(154,176,214)]
              hover:bg-[rgba(154,176,214,0.8)]
              border-none outline-none focus:outline-none 
              font-medium text-md h-[35px] w-[35px]  
              rounded-full hover:w-[90px] hover:rounded-[999px] 
              transition-all duration-300 ease-in-out z-9999999"
      >
        <span className="group-hover:opacity-0 group-hover:translate-x-[-100%] transition-all duration-300 ease-in-out">
          <HiArrowLeft size={"2.3rem"} />
        </span>
        <span className="absolute opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-[100%] transition-all duration-300 ease-in-out">
          Back
        </span>
      </button>
    </>
  );
}

export default GlobalBackButton;
