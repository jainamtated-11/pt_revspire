import { useState } from "react";
import { motion } from "framer-motion";
import { MdKeyboardArrowUp } from "react-icons/md";
import { AiOutlineCheck } from "react-icons/ai";
import { LuLoaderCircle } from "react-icons/lu";
import { ALLOWED_QUALITIES, ALLOWED_SIZED, ALLOWED_TYPES } from "./constants";
import { X } from "lucide-react";
import { twMerge } from "tailwind-merge";

const UploadDesignModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [type, setType] = useState(ALLOWED_TYPES[1]);
  const [quality, setQuality] = useState(ALLOWED_QUALITIES[1]);
  const [size, setSize] = useState(ALLOWED_SIZED[0]);
  const [showFileTypes, setShowFileTypes] = useState(false);
  const [showQualities, setShowQualities] = useState(false);
  const [showSizes, setShowSizes] = useState(false);

  const handleSubmit = async (e) => {
    try {
      setIsUploading(true);
      const payload = { name, description, type: type.value };

      if (type.value === "pdf") {
        payload.size = size.value;
      } else if (type.value === "mp4" || type.value === "jpg") {
        payload.quality = quality.value;
      }
      await onSubmit({name, description, type : type.value, quality : quality.value, size : size.value});
      setName("");
      setDescription("");
    } catch (error) {
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggle = (setter) => {
    setter((prev) => !prev);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-white space-y-2 rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Upload Design</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md  border-[.3px] border-gray-300 px-2 py-1 text-gray-900 shadow-sm focus:border-[#014d8394] focus:outline-none focus:ring-[.3px] focus:ring-[#014d8394]"
            required
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description{" "}
            <span className="text-gray-500 text-xs">{"(Optional)"}</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md  border-[.3px] border-gray-300 px-2 py-1 text-gray-900 shadow-sm focus:border-[#014d8394] focus:outline-none focus:ring-[.3px] focus:ring-[#014d8394]"
          />
        </div>
        {/* File Type */}
        <div className=" select-none ">
          <div className="flex relative  gap-1 flex-col">
            <span className="block text-sm font-medium text-gray-600">
              File Type
            </span>
            <div
              onClick={() => handleToggle(setShowFileTypes)}
              className=" flex justify-between hover:bg-neutral-100 cursor-pointer border-neutral-200 rounded-md text-neutral-800 gap-1 border px-2 py-2"
            >
              <div className="flex text-xl items-center gap-1">
                {<type.icon />} <span className=" text-sm"> {type.label}</span>
              </div>
              <MdKeyboardArrowUp className="text-xl text-neutral-700" />
            </div>
            {showFileTypes && (
              <div className="absolute mt-6 max-h-[200px] overflow-scroll z-40 bg-neutral-50 top-10 left-0 right-0  flex flex-col gap-2  shadow-lg rounded-lg border border-neutral-100 p-2 py-3  ">
                {ALLOWED_TYPES.map((allowedType, _) => {
                  return (
                    <button
                      key={allowedType.value}
                      onClick={() => {
                        setType(allowedType);
                        handleToggle(setShowFileTypes);
                      }}
                      className={twMerge(
                        `hover:bg-neutral-100 transition-all flex items-center justify-between  rounded-lg  px-3 py-1 `,
                        allowedType.value === type.value &&
                          "bg-neutral-200 hover:bg-neutral-200"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-800 text-xl ">
                          {" "}
                          {<allowedType.icon />}
                        </span>
                        <div className="flex text-neutral-600  items-start text-xs flex-col">
                          <span className="text-neutral-700 text-sm">
                            {allowedType.label}
                          </span>
                          {allowedType.description}
                        </div>
                      </div>

                      {type.value === allowedType.value && <AiOutlineCheck />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {/* Quality */}
        {((type.value === "mp4") ||
         (type.value === "jpg")) && (
            <div className=" select-none ">
              <div className="flex relative  gap-1 flex-col">
                <span className="block text-sm font-medium text-gray-600">
                  Quality
                </span>
                <div
                  onClick={() => handleToggle(setShowQualities)}
                  className=" flex justify-between hover:bg-neutral-100 cursor-pointer border-neutral-200 rounded-md text-neutral-800 gap-1 border px-2 py-2"
                >
                  <div className="flex text-xl items-center gap-1">
                    <span className=" text-sm">{quality.label}</span>
                  </div>
                  <MdKeyboardArrowUp className="text-xl text-neutral-700" />
                </div>
                {showQualities && (
                  <div className="absolute mt-6 z-10 max-h-[200px] overflow-scroll bg-neutral-50 top-10 left-0 right-0  flex flex-col gap-2  shadow-lg rounded-lg border border-neutral-100 p-2 py-3  ">
                    {ALLOWED_QUALITIES.map((allowedQuality, _) => {
                      return (
                        <button
                          key={allowedQuality.value}
                          onClick={() => {
                            setQuality(allowedQuality);
                            handleToggle(setShowQualities);
                          }}
                          className={twMerge(
                            `hover:bg-neutral-100 transition-all flex items-center justify-between  rounded-lg  px-3 py-1 `,
                            allowedQuality.value === quality.value &&
                              "bg-neutral-200 hover:bg-neutral-200"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex text-neutral-600  items-start text-xs flex-col">
                              <span className="text-neutral-700 text-sm">
                                {allowedQuality.label}
                              </span>
                            </div>
                          </div>

                          {quality.value === allowedQuality.value && (
                            <AiOutlineCheck />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        {/* Size */}
        {type.value === "pdf" && (
          <div className=" select-none ">
            <div className="flex relative  gap-1 flex-col">
              <span className="block text-sm font-medium text-gray-600">
                Size
              </span>
              <div
                onClick={() => handleToggle(setShowSizes)}
                className=" flex justify-between hover:bg-neutral-100 cursor-pointer border-neutral-200 rounded-md text-neutral-800 gap-1 border px-2 py-2"
              >
                <div className="flex text-xl items-center gap-1">
                  <span className=" text-sm">{size.label}</span>
                </div>
                <MdKeyboardArrowUp className="text-xl text-neutral-700" />
              </div>
              {showSizes && (
                <div className="absolute mt-6 z-10  max-h-[200px] overflow-scroll bg-neutral-50 top-10 left-0 right-0  flex flex-col gap-2  shadow-lg rounded-lg border border-neutral-100 p-2 py-3  ">
                  {ALLOWED_SIZED.map((allowedSize, _) => {
                    return (
                      <button
                        key={allowedSize.value}
                        onClick={() => {
                          setSize(allowedSize);
                          handleToggle(setShowSizes);
                        }}
                        className={twMerge(
                          `hover:bg-neutral-100 transition-all flex items-center justify-between  rounded-lg  px-3 py-1 `,
                          allowedSize.value === size.value &&
                            "bg-neutral-200 hover:bg-neutral-200"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex text-neutral-600  items-start text-xs flex-col">
                            <span className="text-neutral-700 text-sm">
                              {allowedSize.label}
                            </span>
                          </div>
                        </div>

                        {size.value === allowedSize.value && <AiOutlineCheck />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="text-sm btn-secondary bg-red-100 border-red-200 text-red-800 hover:bg-red-200 py-[3px]"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit()}
            className={`text-sm w-[80px] flex justify-center items-center btn-secondary py-[3px]  ${!name ? 'cursor-not-allowed opacity-50' : ''}`}
            disabled={!name}
          >
            {isUploading ? <LuLoaderCircle className="animate-spin" /> : "Upload"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UploadDesignModal;
