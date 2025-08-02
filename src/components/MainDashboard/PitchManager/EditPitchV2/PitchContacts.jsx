import React from "react";
import ContactManager from "./EditPitchContacts";
import {
  togglePitchAccess,
  setPitchContacts,
  toggleDisableOTP,
  toggleBusinessEmailOnly,
} from "../../../../features/pitch/editPitchSlice";

import { useDispatch, useSelector } from "react-redux";
function PitchContacts() {
  const pitchState = useSelector((state) => state.editPitchSlice);
  const dispatch = useDispatch();

  const PitchAccessOnchangeHandler = (e) => {
    if (e.target.id === "public") {
      dispatch(togglePitchAccess(1));
    } else if (e.target.id === "restricted") {
      dispatch(togglePitchAccess(0));
    }
  };

  return (
    <div className="h-[100%] overflow-y-auto  p-2">
      {/* Access control section */}
      <div className="">
        <h2 className="text-lg font-semibold">Select Access Type</h2>
        <div className="flex space-x-4 mt-1 font-medium">
          {/* Public Access - Always show */}
          <div className="flex items-center text-lg">
            <input
              type="radio"
              id="public"
              name="access"
              value="public"
              checked={pitchState.pitchAccess == 1}
              onChange={(e) => {
                PitchAccessOnchangeHandler(e);
              }}
              className="form-radio text-cyan-700 cursor cursor-pointer"
            />
            <label htmlFor="public" className="ml-2 text-gray-500">
              Public Access
            </label>
          </div>
          {/* Restricted Access - Only show if isToggle is false */}
          <div className="flex items-center">
            <input
              type="radio"
              id="restricted"
              name="access"
              value="restricted"
              checked={pitchState.pitchAccess == 0}
              onChange={(e) => {
                PitchAccessOnchangeHandler(e);
              }}
              className="form-radio text-cyan-700 cursor cursor-pointer disabled:cursor-not-allowed"
            />
            <label htmlFor="restricted" className="ml-2 text-gray-500 text-lg">
              Restricted Access
            </label>
          </div>
        </div>
      </div>

      {/* Render Disable OTP when Public Access is checked */}
      {pitchState.pitchAccess === 1 && (
        <div className=" rounded-md mb-4 w-[100%]">
          <div className="bg-blue-100 hover:bg-blue-100 dark:bg-yellow-900 border text-sm p-2 relative rounded-md border-blue-300 dark:border-yellow-700 text-secondary dark:text-yellow-300">
            Anyone with the link can access pitches created with
            <span className="font-semibold"> public access.</span> This means
            your pitch will be openly available to anyone with the link.
            <br />
            <br />
            Additionally, if you choose to disable OTP verification, users will
            no longer need to confirm their identity by verifying an OTP to
            access the pitch.While this makes access quicker and more convenient
            but can reduce the level of security.
            <div className="flex items-start mt-4 justify-between">
              <div className="flex items-center mr-2">
                <label className="w-24 inline-block mb-2 text-sm font-bold hover:bg-transparent dark:text-white mt-2 text-secondary">
                  Disable OTP:
                </label>
                <div className="inline-flex items-center pl-2 ">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-secondary cursor-pointer"
                    checked={pitchState.disableOTP}
                    onChange={(e) =>
                      dispatch(toggleDisableOTP(e.target.checked))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex items-start mt-4 justify-between">
              <div className="flex items-center mr-2">
                <label className="w-24 inline-block mb-2 text-sm font-bold hover:bg-transparent dark:text-white mt-2 text-secondary">
                  Business Emails:
                </label>
                <div className="inline-flex items-center pl-2 ">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-secondary cursor-pointer"
                    checked={pitchState.businessEmailOnly}
                    onChange={(e) =>
                      dispatch(toggleBusinessEmailOnly(e.target.checked))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {pitchState.pitchAccess === 0 && (
        <div className=" overflow-y-auto bg-gray-100">
          <ContactManager
            contacts={pitchState.pitchContacts}
            setContacts={(contacts) => {
              console.log(
                "New contacts before dispatch:",
                JSON.parse(JSON.stringify(contacts))
              );
              dispatch(setPitchContacts([...contacts]));
            }}
          />
        </div>
      )}
    </div>
  );
}

export default PitchContacts;
