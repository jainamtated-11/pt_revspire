import { useState } from "react";
import HighlightAndTeams from "./HighlightAndTeams";
import SectionsAndContents from "./SectionsAndContents";
import ContentRecommendations from "./ContentRecommendations";
import PitchContacts from "./PitchContacts";
import CustomFields from "./CustomFields";
import {
  Users,
  LayoutGrid,
  FileText,
  Mail,
  ChevronRight,
  TableOfContents,
} from "lucide-react";
import { useSelector } from "react-redux";

function AddPitchStep2() {
  const [activeSection, setActiveSection] = useState("sections");
  const [isLoading, setIsLoading] = useState(false);
  const [previousSection, setPreviousSection] = useState("sections");
  const pitchState = useSelector((state) => state.addPitchSlice);
  const showRecommendations =
    !pitchState.isTofu || pitchState.crmType === "salesforce";

  const sections = [
    {
      id: "sections",
      label: "Sections & Contents",
      icon: LayoutGrid,
      component: <SectionsAndContents />,
    },
    {
      id: "highlights",
      label: "Highlights & Teams",
      icon: Users,
      component: <HighlightAndTeams />,
    },
    ...(showRecommendations
      ? [
          {
            id: "recommendations",
            label: "Suggested Content",
            icon: FileText,
            component: <ContentRecommendations />,
          },
        ]
      : []),
    {
      id: "contacts",
      label: "Pitch Access",
      icon: Mail,
      component: <PitchContacts />,
    },
    {
      id: "customFields",
      label: "Custom Fields",
      icon: TableOfContents,
      component: <CustomFields />,
    },
  ];

  // Handle section change with loading state
  const handleSectionChange = (sectionId) => {
    if (sectionId !== activeSection) {
      setPreviousSection(activeSection);
      setIsLoading(true);
      setActiveSection(sectionId);

      // Simulate loading time (remove in production and replace with actual data loading if needed)
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    }
  };

  // Shimmer placeholder component
  const ShimmerPlaceholder = () => (
    <div className="h-full w-full p-4 space-y-4">
      <div className="h-8 w-1/3 rounded-md shimmer-effect"></div>
      <div className="h-24 w-full rounded-md shimmer-effect"></div>
      <div className="h-12 w-2/3 rounded-md shimmer-effect"></div>
      <div className="h-40 w-full rounded-md shimmer-effect"></div>
      <div className="h-12 w-1/2 rounded-md shimmer-effect"></div>
      <div className="h-24 w-full rounded-md shimmer-effect"></div>
    </div>
  );

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className=" h-full border-r bg-gray-50">
        <nav className="p-2 space-y-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className="group relative flex justify-center"
            >
              <button
                onClick={() => handleSectionChange(section.id)}
                className={`p-3 rounded-md transition-all duration-200
          ${
            activeSection === section.id
              ? "bg-[#014d83] text-white"
              : "text-gray-600 hover:bg-gray-200"
          }
        `}
              >
                <section.icon className="h-5 w-5" />
              </button>

              {/* Tooltip */}
              <span
                className="absolute left-full top-1/2 -translate-y-1/2 ml-5 px-2 py-1 rounded bg-gray-600 text-white text-xs font-semibold whitespace-nowrap
  opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10
  before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2
  before:border-[5px] before:border-transparent before:border-r-gray-600
"
              >
                {section.label}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 h-full ">
        <div className="h-full relative">
          {/* Active content with fade transition */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
          >
            {!isLoading &&
              sections.find((section) => section.id === activeSection)
                ?.component}
          </div>

          {/* Previous content (for smoother transition) */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "hidden"
            }`}
          >
            {
              sections.find((section) => section.id === previousSection)
                ?.component
            }
          </div>

          {/* Shimmer loading effect */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ShimmerPlaceholder />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPitchStep2;
