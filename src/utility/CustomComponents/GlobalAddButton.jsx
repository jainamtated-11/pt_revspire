import React from "react";
import { HiPlusCircle } from "react-icons/hi";

function GlobalAddButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex justify-center items-center text-primary 
                hover:bg-primary hover:text-white 
                border-none outline-none focus:outline-none 
                font-medium text-md h-[35px] w-[35px]  
                rounded-full hover:w-[90px] hover:rounded-[999px] 
                transition-all duration-300 ease-in-out 
                relative overflow-hidden"
    >
      {/* Default state: Show the "+" icon */}
      <span className="group-hover:opacity-0 group-hover:translate-x-[-100%] transition-all duration-300 ease-in-out">
        <HiPlusCircle size={"2.3rem"} />
      </span>

      {/* Hover state: Show the "Add" text */}
      <span className="absolute opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-[100%] transition-all duration-300 ease-in-out">
        Add
      </span>
    </button>
  );
}

export default GlobalAddButton;
