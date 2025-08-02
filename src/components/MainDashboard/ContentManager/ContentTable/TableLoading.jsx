import React from "react";

const TableLoading = ({ columns = 7, rows = 7 }) => {
  return (
    <div className="w-full relative h-[75vh] overflow-auto border-2 rounded-md">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-100 shadow-md z-10">
            <tr>
              <th className="p-3 font-semibold text-left border-b">
                <div className="h-4 w-4 bg-gray-300 rounded-md animate-pulse"></div>
              </th>
              {Array.from({ length: columns }).map((_, index) => (
                <th
                  key={index}
                  className="p-3 font-semibold text-left border-b"
                >
                  <div className="h-6 bg-gray-300 rounded-sm animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-sans text-sm">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                <td className="p-3 border-b">
                  <div className="h-4 w-4 bg-gray-300 rounded-md animate-pulse"></div>
                </td>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="p-3 border-b">
                    <div className="h-6 bg-gray-200 rounded-sm animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableLoading;
