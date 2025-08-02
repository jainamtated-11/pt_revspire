import React, { useState, useEffect, useContext, useCallback } from "react";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../../context/GlobalState";
import { FiEdit3 } from "react-icons/fi";
import { LuLoaderCircle } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

export const AdobeExpressOptions = ({ adobeParams, adobeSDK, item, setShowAdobeOptions }) => {
  const [isCreatingDesign, setIsCreatingDesign] = useState(false);
  const { viewer_id, adobeSdk, initializeAdobeSdk } = useContext(GlobalContext);
  const [base64Asset, setBase64Asset] = useState(null);
  const axiosInstance = useAxiosInstance();
  const navigate = useNavigate();

  const callbacks = {
    onCancel: () => {
      navigate(-1);
    },
    onPublish: (intent, publishParams) => {
      console.log("intent", intent);
      
      const localData = {
        project: publishParams.projectId,
        image: publishParams.asset[0].data,
      };
      console.log("localdata : ", localData);
      navigate(-1);
    },
    onError: (err) => {
      console.error("Error received is", err.toString());
    },
    onLoadStart: () => {
      setHighestZIndexForAdobeIframe()
    }, 
    onLoad : () => {
      setHighestZIndexForAdobeIframe()
    }
  };
  const setHighestZIndexForAdobeIframe = () => {
    // Function to find the highest z-index in the document
    const getHighestZIndex = () => {
      return Math.max(
        ...Array.from(document.querySelectorAll('body *'))
          .map(a => parseFloat(window.getComputedStyle(a).zIndex))
          .filter(a => !isNaN(a))
      );
    };
  
    // Find the Adobe Express iframe
    const iframe = document.querySelector('iframe');
    if (iframe) {
      const highestZIndex = getHighestZIndex();
      iframe.style.zIndex = (highestZIndex + 1).toString();
      iframe.style.position = 'relative';
    }
  };

  const exportOptions = [
    {
      id: "download",
      label: "Download",
      action: {
        target: "download",
      },
      style: {
        uiType: "button",
      },
    },
    {
      id: "save-modified-asset",
      label: "Save image",
      action: {
        target: "publish",
      },
      style: {
        uiType: "button",
      },
    },
  ];

  const getBase64 = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await axiosInstance.post(
          `/open-content`,
          {
            contentId: item.id,
            viewerId: viewer_id,
          },
          {
            responseType: "blob",
            withCredentials: true,
          }
        );

        if (res.data) {
          const reader = new FileReader();
          reader.readAsDataURL(res.data);
          reader.onload = () => {
            resolve(reader.result.toString());
          };
          reader.onerror = (error) => {
            console.log("error", error);
            reject(error);
          };
        } else {
          reject(new Error("No data received"));
        }
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  };

  const createFromAsset = async () => {
    setIsCreatingDesign(true);
    let sdk = null;
    if (!adobeSdk) {
      sdk = await initializeAdobeSdk();
    }

    try {
      if (!adobeSdk && !sdk) {
        console.error("Failed to initialize editor");
        return;
      }

      let appConfig = { callbacks: callbacks };
      const base64Asset = await getBase64();
      setBase64Asset(base64Asset);

      let docConfig = {
        asset: {
          data: base64Asset,
          dataType: "base64",
          type: "image",
        },
      };

      let exportConfig = exportOptions;
      navigate("/adobe")
      if (sdk) {
        sdk.editor.createWithAsset(docConfig, appConfig, exportConfig);
        return;
      }

      adobeSdk.editor.createWithAsset(docConfig, appConfig, exportConfig);
    } catch (error) {
      console.error("Error in createFromAsset:", error);
    } finally {
      setIsCreatingDesign(false);
      setShowAdobeOptions("")
    }
  };


  return (
    <>
    <div className="z-[50]">
      <button
        onClick={createFromAsset}
        className="w-full flex group items-center gap-2 text-left text-neutral-800 font-normal py-2 px-4 hover:bg-cyan-50"
      >
        {isCreatingDesign ? (
          <LuLoaderCircle className="animate-spin group-hover:text-cyan-600 size-[17px]" />
        ) : (
          <FiEdit3 className="group-hover:text-cyan-600 size-[17px]" />
        )}{" "}
        Create Design
      </button>
    </div>
    </>
  );
};
