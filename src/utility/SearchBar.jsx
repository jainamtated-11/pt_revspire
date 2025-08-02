import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  SearchCleaner,
  SetSearchApplied,
  SetSearchData,
  SetSearchTable,
  SetSearchValue,
} from "../features/search/searchSlice";

const SearchBar = ({ applySearch }) => {
  const [isFocused, setIsFocused] = useState(false);

  const dispatch = useDispatch();
  const search = useSelector((state) => state.search);
  const initialData = useSelector((state) => state.search.initialData);
  const searchFields = useSelector((state) => state.search.searchFields);
  const searchValue = useSelector((state) => state.search.searchValue);

  useEffect(() => {
    dispatch(SetSearchTable(applySearch));
  }, [applySearch]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (!searchValue || searchValue.trim() === "") {
        dispatch(SearchCleaner());
        return;
      }

      const filteredData = initialData.filter((item) => {
        const searchTerm = searchValue.toLowerCase().trim();
        return searchFields.some((field) => {
          const fieldValue = item[field];
          return (
            fieldValue &&
            fieldValue.toString().toLowerCase().includes(searchTerm)
          );
        });
      });

      dispatch(SetSearchData(filteredData));
      dispatch(SetSearchApplied(true));
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchValue]);

  const handleClear = (e) => {
    e.preventDefault();
    dispatch(SetSearchValue(""));
    dispatch(SearchCleaner());
  };

  const handleSearch = (e) => {
    const newValue = e.target.value;
    dispatch(SetSearchValue(newValue));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="w-full  mx-auto border-1 border-gray-300 rounded-md">
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center w-full h-[37px] rounded-md focus-within:shadow-lg bg-white overflow-hidden ${
          isFocused
            ? "ring-2 ring-blue-500 shadow-lg"
            : "border border-gray-300"
        }`}
      >
        <div className="grid place-items-center h-full w-8">
          <Search className="h-4 w-4 text-gray-500" />
        </div>

        <input
          className="peer h-full w-full outline-none text-sm text-gray-700 pr-2 placeholder:text-gray-400"
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="grid place-items-center h-full w-8 text-gray-500 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
