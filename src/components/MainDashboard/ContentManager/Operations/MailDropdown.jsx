import React, { useState, useRef, useEffect } from "react";
import { faEnvelope, faLink, faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast from "react-hot-toast";
import WarningDialog from "../../../../utility/WarningDialog";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import SendEmailDialog from "./SendEmailDialog";
import useCheckUserLicense from "../../../../Services/checkUserLicense";

const MailDropdown = ({ selectedPitches }) => {
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const checkUserLicense = useCheckUserLicense();
  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLinkClick = () => {
    try {
      if (selectedPitches.length > 0 && selectedPitches[0].pitch_custom_link) {
        const linkToCopy = selectedPitches[0].pitch_custom_link;
        navigator.clipboard.writeText(linkToCopy).then(() => {
          toast.success("Copied link successfully!");
        });
      } else {
        throw new Error("No link available for the selected pitch.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowDropdown(false);
    }
  };

  const handleEmailClick = () => {
    if (!selectedPitches.length) {
      toast.error("No pitch selected");
      return;
    }
    setModalOpen(true);
    setShowDropdown(false);
  };

  let Menus = [];
  if (
    checkUserLicense("Revenue Enablement Elevate") == "1" ||
    checkUserLicense("Revenue Enablement Spark") == "1"
  ) {
    Menus = [
      {
        title: "Email",
        icon: <FontAwesomeIcon icon={faEnvelope} className="mr-3" />,
        onClick: handleEmailClick,
      },
      {
        title: "Link",
        icon: <FontAwesomeIcon icon={faLink} className="mr-3" />,
        onClick: handleLinkClick,
      },
    ];
  } else {
    Menus = [
      {
        title: "Link",
        icon: <FontAwesomeIcon icon={faLink} className="mr-3" />,
        onClick: handleLinkClick,
      },
    ];
  }

  return (
    <>
      <button
        onClick={handleToggleDropdown}
        className=" flex flex-row items-center text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1  hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
      >
        <FontAwesomeIcon icon={faShare} className="mr-1 w-4 h-4 " />
        <span className="text-sm">Share</span>
      </button>
      <div className="absolute ml-[84px] flex items-center" ref={dropdownRef}>
        <div
          className={`absolute mt-[100px] ml-[50px] min-w-36 w-full p-1 px-2 text-base bg-neutral-100 border border-neutral-300 divide-y divide-gray-100 rounded-lg z-[999999] transition-all duration-300 ease-in-out transform ${
            showDropdown
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <ul className="flex flex-col">
            {Menus.map((Menu, index) => (
              <li
                key={index}
                className="flex px-4 py-2 text-sm items-center text-neutral-700 hover:bg-neutral-200 cursor-pointer border border-neutral-100 hover:border-neutral-300 rounded-lg active:scale-95 transition-all"
                onClick={(event) => {
                  event.stopPropagation();
                  Menu.onClick();
                }}
              >
                {Menu.icon}
                {Menu.title}
              </li>
            ))}
          </ul>
        </div>

        {showWarningDialog && (
          <WarningDialog
            title="Mailbox Setup Required"
            content="No active primary mailbox found for the user. Please setup a primary mailbox before sharing pitches."
            confrimMessage="Setup Mailbox"
            onCancel={() => {
              setShowWarningDialog(false);
              setShowDropdown(false);
            }}
            onConfirm={() => {
              navigate("/content/settings/mailbox");
            }}
          />
        )}

        <SendEmailDialog
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          selectedPitchId={selectedPitches[0]?.id}
          organisationId={organisation_id}
        />
      </div>
    </>
  );
};

export default MailDropdown;
