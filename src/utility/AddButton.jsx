import React from "react";
// import Button from "../../ui/Button";
import Button from "./";
import { MdOutlineAddCircleOutline } from "react-icons/md";

function AddButton({ onClick }) {
  return (
    <>
      <Button
        type={"button"}
        className="bg-cyan-700  border border-cyan-700 hover:bg-cyan-800  flex items-center gap-1  mt-2  text-white  mr-6 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 hover:cursor-pointer"
        onClick={onClick}
      >
        <MdOutlineAddCircleOutline className="text-lg" />
        Add
      </Button>
    </>
  );
}

export default AddButton;
