import React, { useEffect, useState } from "react";
import "./MiniLogoLoader.css";
import logo from "../../assets/revspirelogo4.gif"


const MiniLogoLoader = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Initially set active to true to start the animation
    setActive(true);

    // Function to toggle active state every 2 seconds (adjust timing as needed)
    const intervalId = setInterval(() => {
      setActive(prevState => !prevState);
    }, 2000);
    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={`mini-logo ${active ? "logoActive" : ""}`}>
      <div className="app-container h-[500px] w-[900px]">
        <div className="loader-container h-full bg-cover w-full">
          <img className="logos h-full w-full bg-cover  bg-white p-2" src={logo} alt="Logo" />
        </div>
      </div>
    </div>
  );
};

export default MiniLogoLoader;