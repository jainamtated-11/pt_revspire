import React, { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate} from "react-router-dom";
import { ContentResetToBase } from "../../../features/content/contentSlice";
import { UnSelectAll } from "../../../features/tag/tagSlice";
import { clearSelectedPitch } from "../../../features/pitch/pitchSlice";
import { clearSelectedLayout } from "../../../features/layout/layoutSlice";
import { useDispatch} from "react-redux";
import { GlobalContext } from "../../../context/GlobalState";
import useCheckFrontendPermission from "../../../Services/checkFrontendPermission";
import { BiCustomize } from "react-icons/bi";
import { handleSlackAuth } from "../Organisation/SlackIntegration";
import { HiOutlineUsers, HiOutlineUserGroup } from "react-icons/hi2";
import { VscLayoutPanel } from "react-icons/vsc";
import { HiOutlineUser } from "react-icons/hi2";
import { BsBuilding } from "react-icons/bs";
import { AiOutlineFileSync } from "react-icons/ai";
import { FaDatabase } from "react-icons/fa";
import useAxiosInstance from "../../../Services/useAxiosInstance";


const UserSidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const checkFrontendPermission = useCheckFrontendPermission();
  const axiosInstance = useAxiosInstance();
  const { viewer_id, selectedOrganisationId } = useContext(GlobalContext);

  const {
    setSelectedConnections,
    setSelectedUsers,
    setSelectedUploadId,
    setSelectedProfiles,
    isServiceUserConnected,
    disableDefaultNavigation,
  } = useContext(GlobalContext);

  // Restructured menu items with headers, items, and their permissions
  const MenuSections = [
    {
      header: "User Management",
      items: [
        {
          title: "Users",
          icon: <HiOutlineUsers className="w-5 h-5" />,
          route: "/user/user-management/all-users",
          permission:
            "View All Users;Create Users;Edit Users;Activate/Deactivate Users",
          gap: true,
        },
        {
          title: "Profiles",
          icon: <HiOutlineUser className="w-5 h-5" />,
          route: "/user/profile-management",
          gap: true,
          permission:
            "View All Profiles;Create Profiles;Assign Profile to Users;Edit Profiles;Activate/Deactivate Profiles",
        },
        {
          title: "Groups",
          icon: <HiOutlineUserGroup className="w-5 h-5" />,
          route: "/user/group-management/user-groups",
          permission: "View User Groups;Edit User Groups",
          gap: true,
        },
        {
          title:"Roles",
          icon : <TreeRoundDot />,
          route: "/user/user-management/roles",
          gap:true,
        },
        {
          title: "Bulk User Uploads",
          icon: <AiOutlineFileSync className="w-5 h-5" />,
          route: "/user/user-management/bulk-user-uploads",
          permission:
            "View all Bulk User Uploads;Create Bulk User Upload;Download Bulk User Upload Log",
          gap: true,
        },
      ],
    },
    {
      header: "Settings",
      items: [
        {
          title: "Layout Management",
          icon: <VscLayoutPanel className="w-5 h-5" />,
          route: "/user/layout-management",
          gap: true,
          permission:
            "View All Pitch Layouts;Create Pitch layouts;Edit Pitch layouts;Activate/Deactivate Pitch layouts",
        },
       
        {
          title: "Organisation",
          icon: <BsBuilding className="w-5 h-5" />,
          route: "/user/organisation",
          gap: true,
          permission:
            "View All Company Settings;Edit Company Settings;Tenant Administrator",
        },
        {
          title:"Custom Fields",
          icon : <BiCustomize className="w-5 h-5" />,
          route : "/user/custom-fields",
          gap : true,
        },{
          title : "Data Enrichment",
          icon : <FaDatabase className="w-5 h-5" />,
          route : "/user/data-enrichment",
          gap : true,
        }
      ],
    },
  ];

  // Initial navigation based on permissions
  useEffect(() => {
    dispatch(ContentResetToBase());
    dispatch(UnSelectAll());
    dispatch(clearSelectedPitch());
    setSelectedConnections([]);
  
    const searchParams = new URLSearchParams(window.location.search);
    const crmConnectionId = searchParams.get("crmConnectionId");
    const isSlackRedirection = searchParams.get("isSlackRedirection");
    const code = searchParams.get("code");
  
    // Handle Slack Auth
    if (isSlackRedirection == "1") {
      console.log("code", code);
      let decodedCode;
      if (code) {
        decodedCode = decodeURIComponent(code);
        console.log("code", code);
        console.log("decodedCode", decodedCode);
        localStorage.removeItem("slackCode"); 
        localStorage.setItem("slackCode", decodedCode); 
      }
      handleSlackAuth(decodedCode, viewer_id, selectedOrganisationId, axiosInstance);
      navigate("/user/organisation");
      return;
    }

    if (
      checkFrontendPermission("View All Users") == "1" &&
      isServiceUserConnected &&
      !crmConnectionId &&
      !disableDefaultNavigation
    ) {
      navigate("/user/user-management/all-users");
    } else if (
      checkFrontendPermission(
        "View all Bulk User Uploads;Create Bulk User Upload;Download Bulk User Upload Log"
      ) == "1" &&
      isServiceUserConnected &&
      !crmConnectionId &&
      !disableDefaultNavigation
    ) {
      navigate("/user/user-management/bulk-user-uploads");
    }
  }, []);

  const handleMenuClick = (menuItem) => {
    setSelectedUsers([]);
    setSelectedUploadId([]);
    dispatch(clearSelectedLayout());
    setSelectedProfiles([]);
    navigate(menuItem.route);
  };

  return (
    <div
      className={`fixed top-0 left-0 z-20 flex flex-col flex-shrink-0 ${
        isOpen ? "w-48" : "w-0"
      } h-full pt-16 font-normal duration-75 lg:flex transition-width`}
    >
      <div className="relative flex flex-col flex-1 min-h-0 pt-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="flex-1 space-y-4 bg-white  dark:bg-gray-800 dark:divide-gray-700">
            {MenuSections.map((section, sectionIndex) => {
              // Filter items based on permissions
              const authorizedItems = section.items.filter(
                (item) =>
                  !item.permission ||
                  checkFrontendPermission(item.permission) == "1"
              );

              // Only render section if it has authorized items
              if (authorizedItems.length === 0) return null;

              return (
                <div key={sectionIndex} className="pt-4 first:pt-0">
                  <h3 className="px-2 mb-2 text-xs font-bold text-secondary uppercase tracking-wider hover:bg-transparent">
                    {section.header}
                  </h3>
                  <ul className="space-y-1">
                    {authorizedItems.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <NavLink
                          to={item.route}
                          onClick={() => handleMenuClick(item)}
                          className={({ isActive }) =>
                            `flex items-center px-4 py-2 text-sm  transition-colors rounded-md mx-2 ${
                              isActive
                                ? "bg-primary text-white font-semibold shadow-md w-[90%]"
                                : "text-gray-600 dark:text-gray-400 font-medium hover:bg-primary hover:text-white hover:shadow-md hover:opacity-50"
                            }`
                          }
                        >
                          <span className="w-5 h-5 mr-3">{item.icon}</span>
                          {item.title}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;


export function TreeRoundDot(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1.4em"
      height="1.4em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M12 3a2 2 0 1 0 0 4a2 2 0 0 0 0-4m-1 5.874A4.002 4.002 0 0 1 12 1a4 4 0 0 1 1 7.874V11h4a3 3 0 0 1 3 3v1.126A4.002 4.002 0 0 1 19 23a4 4 0 0 1-1-7.874V14a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1.126A4.002 4.002 0 0 1 5 23a4 4 0 0 1-1-7.874V14a3 3 0 0 1 3-3h4zM19.003 17h-.006a2 2 0 1 0 .006 0M5 17a2 2 0 1 0 0 4a2 2 0 0 0 0-4"
      ></path>
    </svg>
  )
}
