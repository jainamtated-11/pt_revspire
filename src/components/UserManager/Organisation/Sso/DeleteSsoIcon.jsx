import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumpster } from "@fortawesome/free-solid-svg-icons";
import { MdDelete } from "react-icons/md";

const DeleteSsoIcon = ({ onClick }) => {
  return (
    <button
      type="button"
      className="btn-secondary bg-red-500  border-red-400 bg-opacity-80"
      onClick={onClick}
    >
      Delete SSO
    </button>
  );
};

export default DeleteSsoIcon;
