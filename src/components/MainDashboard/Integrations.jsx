// ℹ️ this comp. are used in Header file

import React, { useRef, useEffect, useState, useContext } from "react";
import { integrations } from "../../constants";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { LuLoaderCircle } from "react-icons/lu";
import { GlobalContext } from "../../context/GlobalState";
import { useCookies } from "react-cookie";
import IntegrationImage from "../../assets/extension.png";

const Integrations = ({
  showIntegrations,
  handleShowIntegrations,
  viewer_id,
  setShowIntegrations,
}) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [loadingStates, setLoadingStates] = useState({});
  const { integrationsConnection, setIntegrationsConnection } =
    useContext(GlobalContext);
  const [canvaAccessCookie, canvaAccessCookieSet, canvaAccessCookieRemove] =
    useCookies(["canvaAccessToken"]);
  const [canvaRefreshCookie, canvaRefreshCookieSet, canvaRefreshCookieRemove] =
    useCookies(["canvaRefreshToken"]);

  const handleIntegrationClick = async (handler, id) => {
    if (handler) {
      setLoadingStates((prev) => ({ ...prev, [id]: true }));
      try {
        await handler({
          viewerID: viewer_id,
          navigate,
          setIsLoading: (isLoading) =>
            setLoadingStates((prev) => ({ ...prev, [id]: isLoading })),
        });
      } catch (error) {
        console.error(`Error in integration ${id}:`, error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowIntegrations(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowIntegrations]);

  useEffect(() => {
    if (
      canvaAccessCookie.canvaAccessToken &&
      canvaRefreshCookie.canvaRefreshToken
    ) {
      setIntegrationsConnection((prev) => ({
        ...prev,
        canva: true,
      }));
    }
  }, [canvaAccessCookie, canvaRefreshCookie, setIntegrationsConnection]);

  return (
    <div ref={dropdownRef} className="relative z-[9999]">
      <button
        className={`flex items-center hover:text-gray-600 text-bg-sky-700 transition-all font-semibold rounded-md ${
          showIntegrations ? "rotate-[45deg]" : ""
        }`}
        onClick={() => handleShowIntegrations(!showIntegrations)}
      >
        <img
          className="w-7 h-7 text-black rounded-lg hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-400"
          src={IntegrationImage}
          alt=""
        />
      </button>
      <div
        className={`flex flex-col z-50 absolute mt-5 rounded-md p-2 border border-neutral-300 dark:border-gray-700 
      bg-neutral-100 dark:bg-gray-800 w-[350px] right-0 transition-all duration-200 
      ${
        showIntegrations
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
      >
        <div className="flex items-center py-4 gap-1">
          <span className="h-[2px] rounded-lg w-full bg-neutral-500 dark:bg-gray-600"></span>
          <span className="text-neutral-600 dark:text-gray-300 shrink-0 text-lg font-semibold">
            Add a new app
          </span>
          <span className="h-[2px] w-full rounded-lg bg-neutral-500 dark:bg-gray-600"></span>
        </div>
        {integrations.map(
          (
            { text, id, iconURL, iconAlt, desc, handler, disconnect },
            index
          ) => (
            <React.Fragment key={id}>
              <button
                onClick={
                  !integrationsConnection[id]
                    ? () => handleIntegrationClick(handler, id)
                    : () =>
                        disconnect({
                          canvaAccessCookieRemove,
                          canvaRefreshCookieRemove,
                          setIntegrationsConnection,
                          integrations,
                        })
                }
                className="flex transition-all items-center hover:bg-neutral-200 dark:hover:bg-gray-700 
              bg-neutral-100 dark:bg-gray-800 border border-neutral-100 dark:border-gray-700 
              hover:border-neutral-300 dark:hover:border-gray-600 px-2 py-1 rounded-lg text-lg gap-1 w-full"
              >
                <div className="flex gap-3 items-center w-full">
                  <img className="w-8 shrink-0" src={iconURL} alt={iconAlt} />
                  <div className="text-left flex flex-col flex-grow">
                    <h4 className="text-lg text-neutral-800 dark:text-gray-200 font-semibold">
                      {text}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-gray-400 line-clamp-1">
                      {desc}
                    </p>
                  </div>
                  <div
                    className="px-2 py-1 h-[38px] min-w-[86.21px] flex items-center justify-center 
                  border border-neutral-700 dark:border-gray-600 rounded-lg shrink-0 
                  text-neutral-800 dark:text-gray-200"
                  >
                    {loadingStates[id] ? (
                      <LuLoaderCircle className="animate-spin text-xl dark:text-gray-200" />
                    ) : integrationsConnection[id] ? (
                      "Disconnect"
                    ) : (
                      "Connect"
                    )}
                  </div>
                </div>
              </button>
              {index < integrations.length - 1 && (
                <div className="my-2 h-[1px] rounded-xl bg-neutral-400 dark:bg-gray-600" />
              )}
            </React.Fragment>
          )
        )}
      </div>
    </div>
  );
};

export default Integrations;
