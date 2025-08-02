import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Button from "../../../ui/Button";
import { MdOutlineAddCircleOutline } from "react-icons/md";

function AddConnections({ onClick }) {
  return (
    <>
      <Link to="/content/settings/connection">
        <Button
        type={"button"}
          className="btn-secondary  flex items-center gap-1  mt-2  text-white  mr-6 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 "
          onClick={onClick}
        >
          <MdOutlineAddCircleOutline className="text-lg" />
          Add
        </Button>
      </Link>
    </>
  );
}

export default AddConnections;
