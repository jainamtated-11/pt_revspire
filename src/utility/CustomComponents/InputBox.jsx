import React from "react";

const InputBox = ({
  label,
  loading = false,
  data = [],
  OnChangeHandler,
  value,
  name,
}) => {
  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
      <label className="text-sm font-medium text-gray-700 sm:w-24">
        {label}:
      </label>
      <div className="relative w-full sm:w-48">
        {loading ? (
          <div className="w-full bg-gray-100 border border-gray-300 text-gray-400 text-sm rounded-lg p-2.5 flex items-center justify-between">
            <span>Loading {label}...</span>
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <select
            className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-1 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            required
            value={value}
            onChange={OnChangeHandler}
          >
            <option value="" disabled>
              Select {label}
            </option>
            {data.map((d, index) => (
              <option key={index} value={d.name || d.tablename} className="capitalize">
                {label === "Object" ? d.tablename : d.name?.replace('_', ' ')}
              </option>
            ))}
          </select>
        )}
        {!loading && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputBox;
