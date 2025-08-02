import React, { useEffect, useId, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { fetchModalContentsAsync } from "../features/content/contentSlice";

function Breadcrumbs({
  onBreadcrumbClick,
  breadcrumbs,
  setBreadcrumbs,
  className,
}) {
  const id = useId();
  const breadcrumbsContainerRef = useRef(null);
  const [visibleBreadcrumbs, setVisibleBreadcrumbs] = useState([]);
  const [hiddenBreadcrumbs, setHiddenBreadcrumbs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  
  const handleBreadcrumbClick = (index) => {
    const updatedBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(updatedBreadcrumbs);
    const clickedBreadcrumb = updatedBreadcrumbs[index];
    if (clickedBreadcrumb) {
      onBreadcrumbClick(clickedBreadcrumb.id);
    }
    setShowDropdown(false);
    console.log("Updated BreadCrumb", updatedBreadcrumbs);
  };

  const filteredBreadcrumbs = breadcrumbs.filter(
    (breadcrumb) => breadcrumb.name
  );

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown((prevState) => !prevState);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showDropdown]);

  useEffect(() => {
    const checkOverflow = () => {
      if (!breadcrumbsContainerRef.current) return;

      const containerWidth = breadcrumbsContainerRef.current.offsetWidth - 100;
      let totalWidth = 0;
      let visibleCount = 0;
      const ellipsisWidth = 30;
      const tempDiv = document.createElement("div");
      tempDiv.style.visibility = "hidden";
      tempDiv.style.position = "absolute";
      document.body.appendChild(tempDiv);

      for (let i = filteredBreadcrumbs.length - 1; i >= 0; i--) {
        const breadcrumb = filteredBreadcrumbs[i];
        tempDiv.textContent = breadcrumb.name;
        const breadcrumbWidth = tempDiv.offsetWidth + 40;

        if (
          totalWidth +
            breadcrumbWidth +
            (visibleCount > 0 ? ellipsisWidth : 0) >
          containerWidth
        ) {
          break;
        }

        totalWidth += breadcrumbWidth;
        visibleCount++;
      }

      document.body.removeChild(tempDiv);

      setVisibleBreadcrumbs(filteredBreadcrumbs.slice(-visibleCount));
      setHiddenBreadcrumbs(filteredBreadcrumbs.slice(0, -visibleCount));
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [breadcrumbs]);

  return (
    <nav
      ref={breadcrumbsContainerRef}
      className={`mb-2 py-1.5 text-neutral-700 px-1.5 shadow rounded-lg bg-white relative ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center text-lg space-x-1 md:space-x-2 rtl:space-x-reverse">
        {hiddenBreadcrumbs.length > 0 && (
          <li className="flex items-center relative">
            <button
              ref={buttonRef}
              onClick={toggleDropdown}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FontAwesomeIcon icon={faEllipsisH} />
            </button>
            <div
              ref={dropdownRef}
              className={`absolute mt-2 flex flex-col  font-semibold text-neutral-600 top-full left-0 w-fit  max-w-[250px] p-3 px-4 text-base bg-neutral-100 border border-neutral-300 divide-y divide-gray-100 rounded-lg z-[999999] transition-all duration-300 ease-in-out transform ${
                showDropdown
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              {hiddenBreadcrumbs.map((breadcrumb, index) => (
                <a
                  key={`hidden-${id}-${index}`}
                  href="#"
                  className="block px-4 py-2 truncate text-sm text-neutral-700 hover:bg-neutral-200 cursor-pointer  border border-neutral-100 hover:border-neutral-300 rounded-lg active:scale-95 transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    handleBreadcrumbClick(index);
                  }}
                >
                  {breadcrumb.name}
                </a>
              ))}
            </div>
          </li>
        )}
        {visibleBreadcrumbs.map((breadcrumb, index) => (
          <li className="flex items-center" key={`${id}-${index}`}>
            <a
              href="#"
              className={`text-[16px] px-2 py-[1px] ${
                index === visibleBreadcrumbs.length - 1
                  ? "font-semibold truncate line-clamp-1 text-gray-700"
                  : "text-gray-600 hover:bg-neutral-100 hover:border-neutral-200 rounded-lg transition-all"
              } ${index < visibleBreadcrumbs.length - 1 ? "truncate" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleBreadcrumbClick(hiddenBreadcrumbs.length + index);
              }}
            >
              {breadcrumb.name}
            </a>
            {index < visibleBreadcrumbs.length - 1 && (
              <FontAwesomeIcon
                icon={faChevronRight}
                className="px-1 text-xs text-gray-500"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
