import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

export default function TimerModal({
  timerModal,
  setTimerModal,
  setIsActive,
  lastActivity,
  orgHex,
  socket,
}) {
  const handleContinue = () => {
    // Reset inactivity tracking
    setIsActive(true);
    lastActivity.current = Date.now();
    setTimerModal(false); // Hide the modal
  };

  const handleLogout = () => {
    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });
    if (socket) {
      socket.close();
    }
  };

  return (
    <>
      {timerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-sky-700 dark:text-sky-400 mr-2"
                  style={{ color: orgHex }}
                />
                Session Paused
              </h2>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              User seemed inactive for a longer period. Session paused. Click
              Continue to resume or Logout to end the session.
            </p>

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Logout
              </button>
              <button
                onClick={handleContinue}
                style={{ backgroundColor: orgHex }}
                className="px-4 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
