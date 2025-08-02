import React, { useEffect, useState } from "react";
import "./MiniLogoLoader.css";
import logo from "../../assets/mini-logo.svg";
const MiniLogoLoader1 = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const intervalId = setInterval(() => {
      setActive((prevState) => !prevState);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <img
      src={logo}
      alt="Loading..."
      className={`mini-logo ${active ? "logoActive" : ""}`}
      width="84"
      height="28"
    />
  );
};

export default MiniLogoLoader1;
