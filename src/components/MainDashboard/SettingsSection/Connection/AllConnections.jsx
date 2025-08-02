import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward } from "@fortawesome/free-solid-svg-icons";

function AllConnections({ onClick }) {
  return (
    <button
      type="button"
      className="bg-white text-sky-800 px-4 py-2 rounded-2xl shadow-md mr-4 hover:bg-sky-800 hover:text-white transition duration-300 ease-in-out"
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faBackward} className="mr-2" />
      All Connections
    </button>
  );
}

export default AllConnections;
