import { useState, useEffect, useContext, useRef } from "react";
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
import { fetchCrmContactsAsync } from "../../../../features/pitch/editPitchSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../../context/GlobalState";
import {
  setAllContacts,
  setSelectedContacts,
  setPitchContacts,
} from "../../../../features/pitch/editPitchSlice";

function EditPitchStep2() {
  const [activeSection, setActiveSection] = useState("sections");
  const [isLoading, setIsLoading] = useState(false);
  const [previousSection, setPreviousSection] = useState("sections");
  const pitchState = useSelector((state) => state.editPitchSlice);
  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();
  const { viewer_id } = useContext(GlobalContext);

  const showRecommendations =
    !pitchState.isTofu && pitchState.crmType === "salesforce";

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

  useEffect(() => {
    const path = window.location.href;
    if (pitchState.pitchAccess == 0) {
      dispatch(
        fetchCrmContactsAsync({
          axiosInstance,
          selectedCrmType: pitchState.crmType,
          isAccountMode: pitchState.isAccountMode,
          viewerId: viewer_id,
          entityId: pitchState.entityId,
          originURL: path,
          crmConnectionId: pitchState.selectedConnectionId,
        })
      );
    }
  }, [
    pitchState.isTofu,
    pitchState.pitchAccess,
    pitchState.selectedConnectionId,
    pitchState.entityId,
  ]);

  console.log("PITCH CRM CONTACTS", pitchState.crmContacts);

  const isFirstRender = useRef(true);

  // Handle both CRM contacts and existing contacts
  useEffect(() => {
    const formattedExistingContacts = pitchState.existingContacts?.map(
      (contact) => ({
        id: contact.id,
        contactId: contact.contact_sfdc_id,
        firstName: contact.first_name,
        lastName: contact.last_name,
        email: contact.email,
        domain: contact.domain,
        source: "existing",
      })
    );

    const formattedCrmContacts = pitchState.crmContacts?.map((contact) => {
      const [firstName, ...lastNameParts] = contact.Name.split(" ");
      return {
        id: contact.id,
        contactId: contact.id,
        firstName,
        lastName: lastNameParts.join(" "),
        email: contact.Email || "",
        domain: null,
      };
    });

    const manualContacts = pitchState.allContacts.filter((contact) => {
      const isExisting = formattedExistingContacts?.some(
        (existing) => existing.id === contact.id
      );
      const isCrm = formattedCrmContacts?.some(
        (crm) => crm.contactId === contact.contactId
      );
      return !isExisting && !isCrm && !contact.isEditing;
    });

    const combinedContacts = [
      ...manualContacts,
      ...(formattedExistingContacts || []),
      ...(formattedCrmContacts || []).filter(
        (crm) =>
          !formattedExistingContacts?.some(
            (existing) => existing.contactId === crm.contactId
          )
      ),
    ];

    dispatch(setAllContacts(combinedContacts));

    if (isFirstRender.current) {
      const initialContacts = formattedExistingContacts || [];
      dispatch(setSelectedContacts(initialContacts));
      dispatch(setPitchContacts([...initialContacts]));
      isFirstRender.current = false;
    } else {
      const updatedSelectedContacts = pitchState.selectedContacts.filter(
        (selected) =>
          combinedContacts.some((contact) => contact.id === selected.id)
      );
      const manualToAdd = manualContacts.filter(
        (manual) =>
          !updatedSelectedContacts.some((selected) => selected.id === manual.id)
      );

      const newSelectedContacts = [...updatedSelectedContacts, ...manualToAdd];
      dispatch(setSelectedContacts(newSelectedContacts));
      console.log("222");
      dispatch(setPitchContacts([...newSelectedContacts]));
    }
  }, [pitchState.crmContacts]);

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

export default EditPitchStep2;
