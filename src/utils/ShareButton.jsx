import { Share2 } from "lucide-react";
import toast from "react-hot-toast";
 
export default function ShareButton({ orgHex, pitchURL }) {
 
  const handleCopyURL = () => {
    const currentURL = pitchURL;
    navigator.clipboard.writeText(currentURL).then(() => {
      toast.success("URL copied to clipboard");
    });
  };

  return (
    <>
      <button
        onClick={handleCopyURL}
        style={{ color: orgHex }}
        className="group lg:flex items-center justify-start gap-2 overflow-hidden transition-all duration-300 ease-in-out w-8 hover:w-32 hidden"
      >
        <Share2 className="h-6 w-6 flex-shrink-0" />
        <span className="whitespace-nowrap text-sm font-semibold opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
          Share Link
        </span>
      </button>

      {/* for mobile view */}
      <button
        onClick={handleCopyURL}
        style={{ color: orgHex }}
        className="flex flex-col whitespace-nowrap items-center justify-center p-4 hover:bg-gray-100 rounded-lg lg:hidden"
      >
        <Share2 className="h-6 w-6 mb-2" />
        <span className="text-sm text-gray-600 font-medium">Share Link</span>
      </button>
    </>
  );
}