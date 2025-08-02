import React from "react";

// bg-[#e4e3e3]
const TilsLoading = ({ len = 7 }) => {
  return (
    <div
      role="status"
      className="w-full p-4 space-y-4 border border-gray-200 divide-y divide-gray-200 rounded shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700"
    >
      {Array.from({ length: len }).map((_, index) => (
        <div className="flex justify-start pt-4" key={index}>
          <div
            className="flex border bg-[#f1f2f5]
             animate-pulse border-gray-300 w-[220px] h-[120px] rounded-lg"
          ></div>
          <div className="flex border bg-[#f3f4f6] animate-pulse  border-gray-300 w-[220px] h-[120px] rounded-lg ml-6"></div>
          <div className="flex border bg-[#f3f4f6] animate-pulse  border-gray-300 w-[220px] h-[120px] rounded-lg ml-6"></div>
          <div className="flex border bg-[#f3f4f6] animate-pulse  border-gray-300 w-[220px] h-[120px] rounded-lg ml-6"></div>
          <div className="flex border bg-[#f3f4f6] animate-pulse  border-gray-300 w-[220px] h-[120px] rounded-lg ml-6"></div>
        </div>
      ))}
    </div>
  );
};

export default TilsLoading;
