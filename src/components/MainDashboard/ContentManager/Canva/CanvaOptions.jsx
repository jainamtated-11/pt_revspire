import React from "react";
import { FiUpload, FiEdit3 } from "react-icons/fi";
import { IoCheckmarkSharp } from "react-icons/io5";
import { LuLoaderCircle } from "react-icons/lu";
import { twMerge } from "tailwind-merge";
import { useCanva } from "../../../../hooks/useCanva";

const CanvaOptions = ({  item, assetDetails,setShowCanvaOptions, checkAsset }) => {
  const {
    uploadStatus,
    handleCanvaSync,
    handleCreateCanvaDesign,
    isCreatingDesign,
    isViewDesign,
    handleUploadAndCreateCanvaDesign,
    isUploadAndCreateDesign,
    handleViewAllDesigns,
  } = useCanva(item);

  if (checkAsset)
    return (
      <div className="my-[30px] flex justify-center items-center">
        <LuLoaderCircle className="animate-spin text-neutral-500" />
      </div>
    );

  return (
    <div className="z-[50] ">
      { (assetDetails || uploadStatus === "uploaded") ? (
        <>
          <button
            onClick={handleCreateCanvaDesign}
            className="w-full flex group items-center gap-2 text-left text-neutral-800 font-normal py-2 px-4 hover:bg-cyan-50"
          >
            {isCreatingDesign ? (
              <LuLoaderCircle className="animate-spin group-hover:text-cyan-600 size-[17px]" />
            ) : (
              <FiEdit3 className="group-hover:text-cyan-600 size-[17px]" />
            )}{" "}
            Create Design
          </button>
          <button
            onClick={async() => {
              await handleViewAllDesigns();
              setShowCanvaOptions(null);
            }}
            className="w-full flex items-center group gap-2 text-left text-neutral-800 font-normal py-2 px-4 hover:bg-cyan-50"
          >
            {isViewDesign ? (
              <LuLoaderCircle className="animate-spin group-hover:text-cyan-600 size-[17px]" />
            ) : (
              <IoCheckmarkSharp className="group-hover:text-cyan-600 size-[17px]" />
            )}{" "}
            View All Design
          </button>
        </>
      ) : (
        <>
          <button
            onClick={handleCanvaSync}
            disabled={uploadStatus === "uploading"}
            className={twMerge(
              "w-full flex group items-center gap-2 text-neutral-800 font-normal py-2 px-4 hover:bg-cyan-50",
              uploadStatus === "uploading" ? "cursor-not-allowed" : "text-left"
            )}
          >
            {uploadStatus === "uploading" ? (
              <LuLoaderCircle className="animate-spin group-hover:text-cyan-600 size-[17px]" />
            ) : (
              <FiUpload className="group-hover:text-cyan-600 size-[17px]" />
            )}
            {uploadStatus === "uploading" ? "Uploading..." : "Upload as asset"}
          </button>
          <button
            onClick={handleUploadAndCreateCanvaDesign}
            className="w-full flex items-center group gap-2 text-left text-neutral-800 font-normal py-2 px-4 hover:bg-cyan-50"
          >
            {isUploadAndCreateDesign ? (
              <LuLoaderCircle className="animate-spin group-hover:text-cyan-600 size-[17px]" />
            ) : (
              <FiEdit3 className="group-hover:text-cyan-600 size-[17px]" />
            )}{" "}
            Create Design
          </button>
        </>
      )}
    </div>
  );
};

export default CanvaOptions;
