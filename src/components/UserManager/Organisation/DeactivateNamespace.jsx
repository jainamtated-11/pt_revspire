import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumpster } from "@fortawesome/free-solid-svg-icons";

const DeactivateNamespace = ({ onClick }) => {
  return (
    <button
      type="button"
      className="  bg-white text-sky-800 px-4 py-2 rounded-2xl shadow-md  hover:bg-sky-800 hover:text-white transition duration-300 ease-in-out"
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faDumpster} className="mr-2" />
      Deactivate
    </button>
  );
};

export default DeactivateNamespace;
