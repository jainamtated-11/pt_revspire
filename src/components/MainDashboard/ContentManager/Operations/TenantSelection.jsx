import React, { useState } from "react";
import toast from "react-hot-toast";

function TenantSelection({
  nameSpacesList,
  setNameSpace,
  nameSpace,
  handleOneDriveAuthorize,
  setDisplayTenantChoice,
  handleNamespaceSelection,
}) {
  const [isNamespaceSelected,setIsNamespaceSelected] = useState(false);
  const handleRowClick = (namespace) => {
   
    console.log("this namespace got selected ",namespace)
    localStorage.removeItem("nameSpace")
    localStorage.setItem("nameSpace",namespace);
    setNameSpace(localStorage.getItem("nameSpace"));
    setIsNamespaceSelected(true);
     // Call the function to handle namespace selection
    // handleNamespaceSelection( localStorage.getItem("nameSpace"));
    };

    const handleAuthorizeClick = () => {
      if (!isNamespaceSelected) {
        toast.error("Please select a namespace before authorizing.");
      } else {
        handleNamespaceSelection(nameSpace);
      }
    };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
      <div className="bg-white p-4 rounded-md z-10 w-auto flex content-center items-center flex-col relative">
        <div className="flex flex-row justify-between w-full">
          <div />
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={() => setDisplayTenantChoice(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-2">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Choose OneDrive Tenant
                </th>
              </tr>
            </thead>
            <tbody>
              {nameSpacesList.map((namespace, index) => (
                <tr
                  key={index}
                  className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer ${
                    nameSpace === namespace.namespace ? "bg-gray-200" : ""
                  }`}
                  onClick={() => handleRowClick(namespace.namespace)}
                >
                  <td className="px-6 py-2 flex items-center">
                    <input
                      type="radio"
                      id={`namespace-${index}`}
                      name="namespace"
                      value={namespace.namespace}
                      checked={nameSpace === namespace.namespace}
                      onChange={() => handleRowClick(namespace.namespace)}
                      className="hidden"
                    />
                    <label
                      htmlFor={`namespace-${index}`}
                      className={`w-3 h-3 inline-block rounded-full border border-gray-300 cursor-pointer ${
                        nameSpace === namespace.namespace
                          ? "bg-blue-500"
                          : "bg-white"
                      }`}
                    ></label>
                    <span className="ml-10">{namespace.namespace}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="flex w-48 h-8 px-16 mt-3 mb-2 text-sm justify-center items-center rounded-xl border border-solid border-gray-400 bg-white text-gray-800"
          onClick={handleAuthorizeClick}
        >
          Authorise
        </button>
      </div>
    </div>
  );
}

export default TenantSelection;
