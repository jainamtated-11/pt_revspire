import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export const handleCanvaAuthorization = async (args) => {
  const { viewerID, navigate, setIsLoading } = args;
  const userData = JSON.parse(Cookies.get("userData") || "{}");
  const organisation_id = userData?.organisation?.id;
  const baseURL = `https://${userData?.organisation?.tenant_api_name}.${userData?.organisation?.domain}`;
  const OriginURL = `https://${userData?.organisation?.tenant_name}.${userData?.organisation?.domain}`;
  try {
    setIsLoading(true);

    const response = await axios.post(`${baseURL}/canva-authurl`, {
      viewer_id: viewerID,
      OriginURL,
      organisation_id,
    });

    const { authUrl, CanvaCodeVerifier } = response.data;
    const windowFeatures = ["popup", "height=800", "width=800"];
    console.log("Auth URL before sending", authUrl);
    const authPopup = window.open(authUrl, "", windowFeatures.join(","));

    return new Promise((resolve, reject) => {
      window.addEventListener("message", (event) => {
        console.log("EVENT", event);
        const { status, code } = event.data;
        if (status && code && status === "success") {
          authPopup.close();
          navigate(
            `/canva-callback?code=${code}&canvaCodeVerifier=${CanvaCodeVerifier}`
          );
          resolve();
        } else if (status === "failed") {
          authPopup.close();
          toast.error("Authentication failed. Please try again.");
          reject(new Error("Authentication failed"));
        }
      });
    });
  } catch (error) {
    console.error("Canva error:", error);
    toast.error("An error occurred. Please try again.");
    throw error;
  } finally {
    setIsLoading(false);
  }
};

export const disconnectCanva = async (args) => {
  const { setIntegrationsConnection, integrations } = args;
  console.log(integrations);
  Cookies.remove("canvaAccessToken", { path: "/" });
  Cookies.remove("canvaRefreshToken", { path: "/" });
  setIntegrationsConnection({ ...integrations, canva: false });
};
