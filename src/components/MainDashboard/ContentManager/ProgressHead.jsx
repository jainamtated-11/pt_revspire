import React from "react";
import toast from "react-hot-toast";
import "./ProgressHead.css";
export default function Progressbar({ filled }) {
  // Optionally dismiss the toast when progress reaches 100%
  if (filled >= 100) {
    toast.dismiss();
  }

  return (
    <div
      className="toastProgress"
      // style={{
      //   backgroundColor: "#ffffff",
      // }}
    >
      <div className="progressbar">
        <div
          style={{
            height: "100%",
            width: `${filled}%`,
            backgroundColor: "#66ff66",
            transition: "width 0.5s",
          }}
        ></div>
      </div>
      <div className="progressPercentBox">
        File Uploading...
        <span className="progressPercent">{filled}%</span>
      </div>
    </div>
  );
}
