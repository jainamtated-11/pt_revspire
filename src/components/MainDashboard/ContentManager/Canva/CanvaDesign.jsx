import { motion } from "framer-motion";
import { useCanva } from "../../../../hooks/useCanva";
import { useContext, useState } from "react";
import { Check } from "lucide-react";
import { FiImage } from "react-icons/fi";
import { GlobalContext } from "../../../../context/GlobalState";
import { useSelector } from "react-redux";

const CanvaDesign = ({ design, id, handleSelectedDesign, selectedDesign }) => {
    const { correlationState, getCurrentURL } =
      useCanva(design);
    const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);
    const currentUrl = getCurrentURL();
    const [isChecked, setIsChecked] = useState(false);
  
    const handleViewCanvaDesign = async (design) => {
      if (!design) return;
      console.log("current url :",currentUrl);
      const state = {
        id: id,
        baseURL: `${currentUrl}/canva-redirection`,
        breadcrumbs: breadcrumbs ?? null,
      };
      const encodedState = correlationState(state);
      const url = new URL(design.urls.view_url);
      const params = new URLSearchParams(url.search);
      params.append("correlation_state", encodedState);
      url.search = params.toString();
      window.open(url, "_self");
    };
  
    const handleEditCanvaDesign = async (design) => {
      if (!design) return;
  
      const state = {
        id: id,
        baseURL: `${currentUrl}/canva-redirection`,
        breadcrumbs: breadcrumbs ?? null,
      };
      const encodedState = correlationState(state);
      const url = new URL(design.urls.edit_url);
      const params = new URLSearchParams(url.search);
      params.append("correlation_state", encodedState);
      url.search = params.toString();
      window.open(url, "_self");
    };
  
    const checkIsSelected = () => {
      if (!selectedDesign) return false;
  
      return design.id === selectedDesign.id;
    };
  
    return (
      <div
        key={design.id}
        className="relative shadow-lg border border-neutral-300 w-full max-w-md aspect-square rounded-2xl overflow-hidden group"
      >
        {/* Checkbox */}
        <motion.button
          className="absolute top-2 left-4 z-10 w-5 h-5 rounded-md bg-white/90 border border-neutral-300 flex items-center justify-center"
          onClick={() => handleSelectedDesign(design)}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            initial={false}
            animate={
              checkIsSelected()
                ? {
                    scale: 1,
                    opacity: 1,
                  }
                : {
                    scale: 0,
                    opacity: 0,
                  }
            }
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
          >
            <Check className="w-4 h-4 text-blue-500 stroke-[3]" />
          </motion.div>
        </motion.button>
  
        {/* View Button */}
        <motion.button
          onClick={() => handleViewCanvaDesign(design)}
          className="absolute top-2 right-16 border  z-10 bg-cyan-100 text-cyan-900 border-cyan-200 rounded-md px-2 py-[0.7px] flex items-center gap-2 opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            opacity: {
              duration: 0.2,
            },
          }}
        >
          <span className="text-sm font-medium">View</span>
        </motion.button>
        {/* Edit Button */}
        <motion.button
          onClick={() => handleEditCanvaDesign(design)}
          className="absolute top-2 right-4 z-10 bg-cyan-100 text-cyan-900 border-cyan-200 rounded-md px-2 border py-[0.7px] flex items-center gap-2 opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            opacity: {
              duration: 0.2,
            },
          }}
        >
          <span className="text-sm font-medium">Edit</span>
        </motion.button>
  
        {/* Image */}
        <motion.div
          className="w-full flex items-center justify-center h-full"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
        >
          {design.thumbnailUrl ? (
            <img
              className="w-full h-full object-cover rounded-2xl"
              src={design.thumbnailUrl}
              alt={"Canva Design"}
            />
          ) : (
            <FiImage className="text-5xl m-auto text-neutral-400" />
          )}
        </motion.div>
  
        {/* Selection Overlay */}
        <motion.div
          className="absolute inset-0 border-2 rounded-2xl pointer-events-none"
          initial={false}
          animate={{
            borderColor: isChecked ? "#22d3ee" : "transparent",
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
    );
  };

  export default CanvaDesign;
  