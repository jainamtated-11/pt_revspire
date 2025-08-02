import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUp } from "@fortawesome/free-solid-svg-icons";

function MakePrimary({ onClick }) {
  return (
    <div>
      <button
        type="button"
        className="bg-white text-secondary px-4 py-2 rounded-2xl shadow-md mr-4 hover:bg-sky-800 hover:text-white transition duration-300 ease-in-out"
        onClick={onClick}
      >
        <FontAwesomeIcon icon={faCircleUp} className="mr-2" />
        Make Primary
      </button>
    </div>
  );
}

export default MakePrimary;
