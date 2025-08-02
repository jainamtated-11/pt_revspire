import React, { useState, useEffect, useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { VscFileSubmodule } from "react-icons/vsc";
import { GoTrash } from "react-icons/go";
import { IoPricetagsOutline } from "react-icons/io5";
import { HiOutlinePresentationChartBar } from "react-icons/hi2";
import { MdOutlineMailOutline } from "react-icons/md";
import { LiaStreamSolid } from "react-icons/lia";
import { LiaCommentsSolid } from "react-icons/lia";
import { HiOutlineUser } from "react-icons/hi2";
import { PiPlugs } from "react-icons/pi";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  FilterCleaner,
  SetFilterApplied,
  SetFilterLoading,
} from "../../../../features/filter/fliterSlice";
import { ContentResetToBase } from "../../../../features/content/contentSlice.js";
import { UnSelectAll } from "../../../../features/tag/tagSlice.js";
import useCheckFrontendPermission from "../../../../Services/checkFrontendPermission.jsx";
import useCheckUserLicense from "../../../../Services/checkUserLicense.jsx";
import { SetSearchValue } from "../../../../features/search/searchSlice.js";
import { LucideFileChartColumn } from "lucide-react";
import { handleTeamsAuth } from "../../../UserManager/Organisation/TeamsIntegration.jsx";
import { handleHelloSignAuth } from "../../../UserManager/Organisation/HelloSign/HelloSignIntegration.jsx";
import { handleDocuSignAuth } from "../../../UserManager/Organisation/DocuSign/DocuSignIntegration.jsx";
import { useCookies } from "react-cookie";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";

const Sidebar = ({ isOpen }) => {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const {
    TableNameHandler,
    TagCleanerHandler,
    ContentCleanerHandler,
    setSelectedConnections,
    setConnectionDetails,
    setShowConnectionButtons,
    setObjectDetails,
    setRefDetails,
  } = useContext(GlobalContext);
  const [expandedItems, setExpandedItems] = useState({});
  const checkFrontendPermission = useCheckFrontendPermission();
  const checkUserLicense = useCheckUserLicense();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosInstance = useAxiosInstance();
  const { viewer_id } = useContext(GlobalContext);

  // Function to extract table name from pathname
  const extractIdFromPathname = () => {
    const pathParts = window.location.pathname.split("/");
    const idWithHyphen = pathParts[2];
    const id = idWithHyphen?.split("-")[0];
    return id;
  };

  useEffect(() => {
    const id = extractIdFromPathname();
    TableNameHandler(id, "sideBarTableName");
  }, []);

  useEffect(() => {
    dispatch(ContentResetToBase());
    dispatch(UnSelectAll());

    const searchParams = new URLSearchParams(window.location.search);
    const isTeamsRedirection = searchParams.get("isTeamsRedirection");
    const isHelloSignRedirection = searchParams.get("isHelloSignRedirection");
    const isDocuSignRedirection = searchParams.get("isDocuSignRedirection");

    const code = searchParams.get("code");

    // Handle Teams Auth
    if (isTeamsRedirection == "1") {
      console.log("code", code);
      let decodedCode;
      if (code) {
        decodedCode = decodeURIComponent(code);
        console.log("code", code);
        console.log("decodedCode", decodedCode);
        localStorage.removeItem("teamsCode");
        localStorage.setItem("teamsCode", decodedCode);
      }
      handleTeamsAuth(decodedCode, viewer_id, axiosInstance);
      navigate("/content/settings/profiles");

      const appId = "52883479-7889-47a5-acc6-f1d5546a7eea";
      const deepLink = `https://teams.microsoft.com/l/app/${appId}?installAppPackage=true`;

      window.open(deepLink, "_blank");

      return;
    }

    // Handle HelloSign Auth
    if (isHelloSignRedirection == "1") {
      console.log("code", code);
      let decodedCode;
      if (code) {
        decodedCode = decodeURIComponent(code);
        console.log("code", code);
        console.log("decodedCode", decodedCode);
        localStorage.removeItem("hellosignCode");
        localStorage.setItem("hellosignCode", decodedCode);
      }
      handleHelloSignAuth(decodedCode, viewer_id, axiosInstance);
      navigate("/content/settings/profiles");

      return;
    }

    // Handle DocuSign Auth
    if (isDocuSignRedirection == "1") {
      console.log("code", code);
      let decodedCode;
      if (code) {
        decodedCode = decodeURIComponent(code);
        console.log("code", code);
        console.log("decodedCode", decodedCode);
        localStorage.removeItem("docusignCode");
        localStorage.setItem("docusignCode", decodedCode);
      }
      handleDocuSignAuth(decodedCode, viewer_id, axiosInstance);
      navigate("/content/settings/profiles");

      return;
    }
  }, []);

  const MenuSections = [
    {
      header: "Content",
      items: [
        {
          title: "Content Portal",
          icon: <VscFileSubmodule className="w-5 h-5" />,
          route: "/content/content-portal",
          tablename: "content",
          permission: "View Content;View All Content",
          gap: true,
        },
        {
          title: "Tag Manager",
          icon: <IoPricetagsOutline className="w-5 h-5" />,
          route: "/content/tag-manager",
          tablename: "tag",
          permission: "View Tag;View All Tag",
          license: "Revenue Enablement Spark",
          gap: true,
        },
        {
          title: "Recycle Bin",
          icon: <GoTrash className="w-5 h-5" />,
          route: "/content/recycle-bin",
          permission: "View Recycle Bin;Restore Content",
          gap: true,
        },
      ],
    },
    {
      header: "Pitch",
      items: [
        {
          title: "Pitch Manager",
          icon: <HiOutlinePresentationChartBar className="w-5 h-5" />,
          route: "/content/pitch-manager",
          tablename: "pitch",
          permission: "View Pitch;View All Pitch",
          gap: true,
        },
        {
          title: "Pitch Streams",
          icon: <LiaStreamSolid className="w-5 h-5" />,
          route: "/content/pitch-streams",
          tablename: "pitchStreams",
          permission:
            "View Pitch Stream;Create Pitch Stream;Edit Pitch Stream;Create Pitch Stream;Activate/Deactivate Pitch Stream",
          gap: true,
        },
      ],
    },
    {
      header: "Notifications",
      items: [
        {
          title: "All Threads",
          icon: <LiaCommentsSolid className="w-5 h-5" />,
          route: "/content/all-threads",
          tablename: "thread",
          permission: "View Threads;View All Threads",
          gap: true,
        },
        {
          title: "Group Threads",
          icon: <LiaCommentsSolid className="w-5 h-5" />,
          route: "/content/group-threads",
          tablename: "thread",
          permission: "View Threads;View All Threads",
          gap: true,
        },
      ],
    },

    {
      header: "Analytics",
      items: [
        {
          title: "Reports",
          icon: <LucideFileChartColumn className="w-5 h-5" />,
          route: "/content/analytics/reports",
          permission: "View Reports",
          license: "Revenue Enablement Elevate;Revenue Enablement Spark",
          gap: true,
        },
      ],
    },

    {
      header: "Settings",
      items: [
        {
          title: "Profiles",
          icon: <HiOutlineUser className="w-5 h-5" />,
          route: "/content/settings/profiles",
          gap: true,
        },
        {
          title: "CRM",
          icon: <PiPlugs className="w-5 h-5" />,
          route: "/content/settings/connection",
          permission: "View Connections;View All Connections",
          license: "Revenue Enablement Spark",
          gap: true,
        },
        {
          title: "Mailbox",
          icon: <MdOutlineMailOutline className="w-5 h-5" />,
          route: "/content/settings/mailbox",
          license: "Revenue Enablement Elevate;Revenue Enablement Spark;",
          permission: "View Mailbox;Create Mailbox;Activate/Deactivate Mailbox",
          gap: true,
        },
      ],
    },
  ];

  useEffect(() => {
    if (
      location.pathname === "/" ||
      location.pathname === "/content" ||
      location.pathname === "/content/"
    ) {
      navigate("/content/content-portal");
    }
  }, [location, navigate]);
  useEffect(() => {
    // Check the URL when the component mount
    if (location.pathname === "/content/settings/connection") {
      setActiveMenuItem("Connection");
      setExpandedItems((prev) => ({
        ...prev,
        Settings: true,
      }));
    }
  }, [location]);
  const handleMenuClick = (menuItem) => {
    dispatch(FilterCleaner());
    dispatch(ContentResetToBase());
    dispatch(UnSelectAll([]));
    setSelectedConnections([]);
    setShowConnectionButtons(true);
    setConnectionDetails(null);
    setObjectDetails([]);

    if (menuItem?.tablename) {
      TableNameHandler(menuItem.tablename, "sideBarTableName");
    }

    // Handle specific cleanups
    if (
      [
        "Content Portal",
        "Pitch Manager",
        "Thread Manager",
        "Recycle Bin",
        "Settings",
      ].includes(menuItem.title)
    ) {
      TagCleanerHandler();
    }

    if (
      [
        "Tag Manager",
        "Pitch Manager",
        "Thread Manager",
        "Recycle Bin",
        "Settings",
      ].includes(menuItem.title)
    ) {
      ContentCleanerHandler();
    }

    if (menuItem.title === "Pitch Manager" || menuItem.title === "CRM") {
      dispatch(SetFilterLoading(true));
      dispatch(SetFilterApplied(true));
    }

    navigate(menuItem.route);
    dispatch(SetSearchValue(""));
    setRefDetails(null);
  };

  return (
    <div
      className={`fixed top-0 left-0 z-20 flex flex-col flex-shrink-0 ${
        isOpen ? "w-48" : "w-0"
      } h-full pt-16 font-normal duration-75 lg:flex transition-width`}
    >
      <div className="relative flex flex-col flex-1 min-h-0 pt-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="flex-1  space-y-4 bg-white  dark:bg-gray-800 ">
            {MenuSections.map((section, sectionIndex) => {
              // Filter items based on permissions and licenses
              const authorizedItems = section.items.filter((item) => {
                const hasPermission =
                  !item.permission ||
                  checkFrontendPermission(item.permission) == "1";
                const hasLicense =
                  !item.license || checkUserLicense(item.license) == "1";
                return hasPermission && hasLicense;
              });

              if (authorizedItems.length === 0) return null;

              return (
                <div key={sectionIndex} className="pt-4 first:pt-0">
                  <h3 className="px-2 mb-2 text-xs font-bold text-secondary uppercase tracking-wider bg-transparent hover:bg-transparent">
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
                                ? "bg-primary text-white shadow-md font-semibold w-[90%]"
                                : "text-gray-600 dark:text-gray-400 font-medium hover:bg-primary hover:text-white hover:shadow-md hover:opacity-50"
                            }`
                          }
                        >
                          <span
                            className={`w-5 h-5 mr-3 transition-all ${
                              location.pathname === item.route
                                ? "text-white dark:text-white hover:bg-transparent"
                                : "text-gray-600 group-hover:text-secondary"
                            }`}
                          >
                            {item.icon}
                          </span>

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
export default Sidebar;
