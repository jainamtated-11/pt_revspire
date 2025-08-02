import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState.jsx";

const ShowContent = () => {
  const { TableNameHandler } =
    useContext(GlobalContext);

  return (
    <div>
      <Link
        className="bg-white text-sky-800 px-4 py-2 rounded-2xl shadow-md mr-4 hover:bg-sky-800 hover:text-white transition duration-300 ease-in-out"
        onClick={() => {
          TableNameHandler("content" , "filter");
        }}
      >
        Show Content
      </Link>
    </div>
  );
};

export default ShowContent;
