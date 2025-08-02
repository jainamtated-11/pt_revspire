import React, { useState, useContext } from "react";
import { GlobalContext } from "../context/GlobalState.jsx";

const SortDropDown = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const handleSortClick = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const {
    setSortProperty,
    setSortValueType,
    sortValueType,
    sortProperty,
    sortHandler,
  } = useContext(GlobalContext);

  const handleSortPropertyChange = (e) => {
    setSortProperty(e.target.value);
  };

  const handleSortvalueChange = (e) => {
    setSortValueType(e.target.value);
  };
  console.log(sortProperty);
  console.log(sortValueType);
  return (
    <div className="z-0 absolute bg-white rounded-lg ">
      <button
        className="px-4 border-2 rounded-lg border-black"
        onClick={handleSortClick}
      >
        Sort &#9662;
      </button>
      {dropdownVisible && (
        <div className="px-4 border-2 border-black rounded-xl mt-2">
          <ul>
            <li className="pt-2">
              <input
                type="radio"
                id="nameOption"
                name="options"
                value="name"
                checked={sortProperty === "name"}
                onChange={handleSortPropertyChange}
              />
              <label htmlFor="nameOption"> Name</label>
            </li>
            <li className="pt-2">
              <input
                type="radio"
                id="typeOption"
                name="options"
                value="type"
                checked={sortProperty === "type"}
                onChange={handleSortPropertyChange}
              />
              <label htmlFor="typeOption"> Type</label>
            </li>
            <li className="pt-2">
              <input
                type="radio"
                id="createdByOption"
                name="options"
                value="createdBy"
                checked={sortProperty === "createdBy"}
                onChange={handleSortPropertyChange}
              />
              <label htmlFor="createdByOption"> Created By</label>
            </li>
            <li className="pt-2">
              <input
                type="radio"
                id="createdDateOption"
                name="options"
                value="createdDate"
                checked={sortProperty === "createdDate"}
                onChange={handleSortPropertyChange}
              />
              <label htmlFor="createdDateOption"> Created Date</label>
            </li>
            <li className="pt-2">
              <input
                type="radio"
                id="modifiedByOption"
                name="options"
                value="modifiedBy"
                checked={sortProperty === "modifiedBy"}
                onChange={handleSortPropertyChange}
              />
              <label htmlFor="modifiedByOption"> Modified By</label>
            </li>
            <li className="pt-2">
              <input
                type="radio"
                id="modifiedDateOption"
                name="options"
                value="modifiedDate"
                checked={sortProperty === "modifiedDate"}
                onChange={handleSortPropertyChange}
              />
              <label htmlFor="modifiedDateOption"> Modified Date</label>
            </li>
            <div className="border-t-2 border-slate-400"></div>
          </ul>
          <ul className="mt-6">
            <li className="pt-2">
              <input
                type="radio"
                id="ascending"
                name="options"
                value="ascending"
                checked={sortValueType === "ascending"}
                onChange={handleSortvalueChange}
              />
              <label htmlFor="ascending"> Ascending</label>
            </li>
            <li className="pt-2">
              <input
                type="radio"
                id="descending"
                name="options"
                value="descending"
                checked={sortValueType === "descending"}
                onChange={handleSortvalueChange}
              />
              <label htmlFor="descending"> Descending</label>
            </li>
          </ul>
          <div className="my-2">
            <button
              className="px-2 border-2 border-pink-600 bg-pink-300 rounded-xl "
              onClick={handleSortClick}
            >
              Cancel
            </button>
            <button className="px-2 border-2 border-black rounded-xl ml-4">
              Sort
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropDown;
