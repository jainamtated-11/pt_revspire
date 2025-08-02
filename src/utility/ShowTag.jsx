import React, { useContext } from "react";
import { GlobalContext } from "../context/GlobalState.jsx";

const ShowTag = () => {
  const { TableNameHandler } = useContext(GlobalContext);

  return (
    <div>
      <button
        className="bg-white text-sky-800 px-4 py-2 rounded-2xl shadow-md mr-4 hover:bg-sky-800 hover:text-white transition duration-300 ease-in-out"
        onClick={() => {
          TableNameHandler("tag", "filter");
        }}
      >
        Show Tag
      </button>
    </div>
  );
};

export default ShowTag;
