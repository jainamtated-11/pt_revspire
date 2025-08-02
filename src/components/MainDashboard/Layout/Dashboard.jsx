import React, { useContext, useState } from "react";
import Sidebar from "./Sidebar/Sidebar.jsx";
import UserSidebar from "../../UserManager/Layout/UserSidebar.jsx";
import MainContent from "./MainContent.jsx";
import MainContentUser from "../../UserManager/Layout/MainContentUser.jsx";
import Header from "./Header.jsx";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import StickyBanner from "../SettingsSection/Connection/StickyBanner.jsx";
import WarningStickyBanner from "../SettingsSection/Connection/WarningStickyBanner.jsx";
function Dashboard() {
  const [activeMenuItem, setActiveMenuItem] = useState([0, 0]);
  const [activeMenuItemUser, setActiveMenuItemUser] = useState([0, 0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { dashboardState } = useContext(GlobalContext);

  const handleMenuItemClick = (parentIndex, childIndex) => {
    setActiveMenuItem([parentIndex, childIndex]);
  };

  const handleMenuItemClickUser = (parentIndex, childIndex) => {
    setActiveMenuItemUser([parentIndex, childIndex]);
  };

  return (
    <>
      <div className="relative flex flex-col h-screen overflow-hidden">
        <StickyBanner className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50" />
        <WarningStickyBanner className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50" />
        <Header />
        <div className="flex flex-1 overflow-hidden ">
          {dashboardState === "home" ? (
            <>
              <Sidebar
                onMenuItemClick={handleMenuItemClick}
                isOpen={isSidebarOpen}
              />
              <div
                className={`relative flex-1 h-screen overflow-hidden bg-background dark:bg-gray-900 ${
                  isSidebarOpen ? "ml-48" : ""
                }`}
              >
                <MainContent activeMenuItem={activeMenuItem} />
              </div>
            </>
          ) : (
            <>
              <UserSidebar
                onMenuItemClickUser={handleMenuItemClickUser}
                isOpen={isSidebarOpen}
              />
              <div
                className={`relative flex-1 h-screen overflow-y-auto bg-background dark:bg-gray-900 ${
                  isSidebarOpen ? "ml-48" : ""
                }`}
              >
                <MainContentUser activeMenuItem={activeMenuItemUser} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
