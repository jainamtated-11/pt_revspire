import React from "react";
import { useCookies } from "react-cookie";
import Question from "../assets/question.svg";

function ClientError() {
  const [cookies, setCookie, removeCookie] = useCookies([
    "revspireToken",
    "revspireRefreshToken",
  ]);

  const handleClearCookies = () => {
    removeCookie("revspireToken", { path: "/" });
    removeCookie("revspireRefreshToken", { path: "/" });
    window.location.reload();
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-xl p-10 border-l-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <img
            src={Question}
            alt="Error Illustration"
            className="w-[200px] md:w-[250px]"
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 text-lg">
              We ran into an unexpected issue while processing your request.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-gray-700 text-base mb-6 leading-relaxed">
            You can try clearing your session and refreshing the page. If the
            issue continues, please reach out to your Account Manager or
            Administrator for support.
          </p>

          <button
            onClick={handleClearCookies}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-red-500 text-white text-sm font-medium rounded-lg transition duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Clear Cookies & Reload
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientError;
