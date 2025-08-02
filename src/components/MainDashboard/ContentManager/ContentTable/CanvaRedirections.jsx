import React, { useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  breadcrumbSetter,
  fetchContentsAsync,
} from "../../../../features/content/contentSlice";
import { useCanva } from "../../../../hooks/useCanva";
import { GlobalContext } from "../../../../context/GlobalState";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const CanvaRedirections = () => {
  const dispatch = useDispatch();
  const { handleViewAllDesigns } = useCanva({});
  const { baseURL, viewer_id } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [cookies] = useCookies(["userData"]); // Access cookies

  useEffect(() => {
    console.log("Getting inside this useStrate");
    const params = new URLSearchParams(window.location.search);
    const correlation_jwt = params.get("correlation_jwt");
    if (!correlation_jwt) return;

    const decoded_jwt = JSON.parse(atob(correlation_jwt.split(".")[1]));
    console.log("decoded", decoded_jwt);

    const { correlation_state } = decoded_jwt;
    const decoded_correlation_state = JSON.parse(atob(correlation_state));
    console.log(decoded_correlation_state + "jwt state");

    console.log("correlation state", decoded_correlation_state);
    const { id, breadcrumbs } = decoded_correlation_state;
    if (id) {
      handleViewAllDesigns(id);
    }

    if (breadcrumbs) {
      dispatch(breadcrumbSetter(breadcrumbs));
      dispatch(
        fetchContentsAsync({
          viewer_id,
          folder_id: breadcrumbs[breadcrumbs.length - 1].id,
          baseURL: baseURL,
          organisation_id: cookies.userData?.organisation?.id,
        })
      );
    }

    navigate("/");
  }, []);
  return null;
};

export default CanvaRedirections;
