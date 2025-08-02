import React, { useState, useEffect, useRef, useContext } from "react";
import AddFolder from "../Operations/AddFolder.jsx";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GlobalButton from "../ContentTable/GlobalButton.jsx";
import Foldericon from "../../../../assets/add-folder.png"
import {
  faPlus,
  faFileCirclePlus,
  faFolderPlus,
} from "@fortawesome/free-solid-svg-icons";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import Button from "../../../ui/Button.jsx";

export default function AddDropdown() {
  const [showDropdown, setShowDropdown] = useState(false);

  // Adding new folder Modal
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { setDriveSelection } = useContext(GlobalContext);
  // const fileUpload = useRef(); // Reference to the file input in AddContent component

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleItemClick = (onClickHandler, event) => {
    event.stopPropagation();
    setShowDropdown(false);
    onClickHandler();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowDropdown]);

  const Menus = [
    {
      title: "Add Content",
      icon: <FontAwesomeIcon icon={faFileCirclePlus} className="mr-3" />,
      // onClick: () => fileUpload.current.click(), // Trigger the file input click event
      onClick: () => setDriveSelection(true),
    },

    {
      title: "Add Folder",
     
      icon: <img src= {Foldericon} alt="" className="mr-3 w-[.9rem] object-contain  h-4"/>,
      onClick: () => setFolderModalOpen(true),
    },
  ];

  return (
    <div className="absolute flex justify-center items-center" ref={dropdownRef}>
      <GlobalButton
      handleToggleDropdown = {handleToggleDropdown}
      />
      <div
        className={`absolute mt-[150px] left-0 min-w-48 w-full p-3 px-4 text-base bg-neutral-100 border border-neutral-300 divide-y divide-gray-100 rounded-lg z-[999999] transition-all duration-300 ease-in-out transform ${
          showDropdown
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <ul className="flex flex-col ">
          {Menus.map((Menu, index) => (
            <li
              key={index}
              className=" flex px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-200 cursor-pointer  border border-neutral-100 hover:border-neutral-300 rounded-lg active:scale-95 transition-all"
              onClick={(event) => handleItemClick(Menu.onClick, event)}
            >
              {Menu.src}
              {Menu.icon}
              {Menu.title}
            </li>
          ))}
        </ul>
      </div>

      <AddFolder
        folderModalOpen={folderModalOpen}
        setFolderModalOpen={setFolderModalOpen}
      />
    </div>
  );
}
