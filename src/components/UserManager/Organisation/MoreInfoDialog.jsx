import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import ViewLogoModal from "./BrandDetails/ViewLogoModal.jsx";
import EditLogoModal from "./BrandDetails/EditLogoModal.jsx";
import ColorPicker from "../../../components/MainDashboard/PitchManager/ColorPicker.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable.jsx";
import useCheckUserLicense from "../../../Services/checkUserLicense.jsx";
import { Minus, Plus, Info, Clock, Users, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import WarningDialog from "../../../utility/WarningDialog.jsx";
import CurrencyManagement from "./CurrencyManagement.jsx";

function MoreInfoDialog() {
  const { organisationDetails, viewer_id, setOrganisationDetails } =
    useContext(GlobalContext);
  const [isViewLogoOpen, setIsViewLogoOpen] = useState(false);
  const [isEditLogoOpen, setIsEditLogoOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(true);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [selectedItems, setSelectedItems] = useState(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [orgHexColor, setOrgHexColor] = useState("");
  const axiosInstance = useAxiosInstance();
  const [isEditingDescription, setIsEditingDescription] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "Updated At",
    direction: "desc",
  });
  const [showManageLicenses, setShowManageLicenses] = useState(false);

  const [licenses, setLicenses] = useState(
    organisationDetails?.productAssignments ?? []
  );
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const [isEditingTimezone, setIsEditingTimezone] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [name, setName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [primaryContact, setPrimaryContact] = useState("");
  const [phone, setPhone] = useState("");

  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [isEditingWebsite, setIsEditingWebsite] = useState(false);
  const [websiteError, setWebsiteError] = useState("");
  const [documentAnalysis, setDocumentAnalysis] = useState(0);
  const [updatingDocumentAnalysis, setUpdatingDocumentAnalysis] =
    useState(false);

  const [updatingDsrTranslate, setUpdatingDsrTranslate] = useState(false);
  const [dsrTranslate, setDsrTranslate] = useState("");

  const [updatingPlaceholderValue, setUpdatingPlaceholderValue] =
    useState(false);
  const [placeholderValue, setPlaceholderValue] = useState("");

  const checkUserLicense = useCheckUserLicense();
  const [customTenantName, setCustomTenantName] = useState("");
  const [isEditingCustomTenant, setIsEditingCustomTenant] = useState(false);
  const [updatingCustomTenant, setUpdatingCustomTenant] = useState(false);
  const [isDomainUpdateInProgress, setIsDomainUpdateInProgress] =
    useState(false);
  const [showDomainChangeWarning, setShowDomainChangeWarning] = useState(false);

  // Validation of websiute input
  const validateWebsite = (url) => {
    if (!url) {
      setWebsiteError(""); // Clear error if empty
      return { valid: true };
    }

    try {
      // Ensure URL has a protocol
      const testUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      new URL(testUrl);
      setWebsiteError("");
      return { valid: true };
    } catch (e) {
      const errorMsg =
        "Please enter a valid URL (e.g., example.com or https://example.com)";
      setWebsiteError(errorMsg);
      return { valid: false, message: errorMsg };
    }
  };

  useEffect(() => {
    if (!organisationDetails) setDialogLoading(true);
    else setDialogLoading(false);
  }, [organisationDetails]);

  useEffect(() => {
    if (organisationDetails) {
      fetchCompanyLogo();
    }
  }, [organisationDetails]);

  useEffect(() => {
    // Fetch currencies and timezones when component mounts
    fetchCurrencies();
    fetchTimezones();
  }, []);

  const fetchCompanyLogo = async () => {
    if (organisationDetails) {
      const currLogo =
        "data:image/png;base64," +
        organisationDetails.organisation.company_logo;
      setCompanyLogo(currLogo);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await axiosInstance.post("/view-all-currency", {
        //already getting passed form axios instance
      });
      setCurrencies(response.data.currencies);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  const fetchTimezones = async () => {
    try {
      const response = await axiosInstance.post("/view-all-timezone", {
        //already getting passed form axios instance
      });
      setTimezones(response.data.timezones);
    } catch (error) {
      console.error("Error fetching timezones:", error);
    }
  };

  // Function to vlaidate custom tenant
  const validateCustomDomain = (domain) => {
    if (!domain) return { valid: false, message: "Domain cannot be empty" };
    if (domain.length > 25)
      return { valid: false, message: "Domain must be 25 characters or less" };
    if (!/^[a-z0-9-]+$/.test(domain)) {
      return {
        valid: false,
        message:
          "Domain can only contain lowercase letters, numbers, and hyphens",
      };
    }
    if (/^-|-$/.test(domain)) {
      return {
        valid: false,
        message: "Domain cannot start or end with a hyphen",
      };
    }
    if (/\./.test(domain)) {
      return {
        valid: false,
        message:
          "Only the subdomain part is needed (text before the first dot)",
      };
    }
    return { valid: true };
  };

  // Function to update custom domain
  const updateCustomTenantName = async () => {
    const validation = validateCustomDomain(customTenantName);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    // Show our custom warning dialog instead of native confirm
    setShowDomainChangeWarning(true);
  };

  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        const response = await axiosInstance.post(
          `/view-organisation-details`,
          {
            viewer_id: viewer_id,
            organisation_id: organisationDetails?.organisation.id,
          }
        );

        const extractSubdomain = (domain) => {
          if (!domain) return "";
          // Split by dots and take the first part
          const parts = domain.split(".");
          return parts[0] || "";
        };

        setOrganisationDetails(response.data);
        setLicenses(response.data.productAssignments);
        setDocumentAnalysis(response.data.organisation.ai_document_analysis);
        setWebsite(response.data.organisation.website || "");
        setDsrTranslate(response.data.organisation.dsr_translation);
        setPlaceholderValue(
          response.data.organisation.document_placeholder_extraction
        );
        setName(response.data.organisation.name);
        setOrgHexColor(response.data.organisation.company_primary_color_hex);
        setCustomTenantName(
          extractSubdomain(response.data.organisation.custom_tenant_name) || ""
        );
        setIsDomainUpdateInProgress(
          response.data.organisation.custom_domain_changing === 1
        );
      } catch (error) {
        console.error("Error fetching organisation details:", error);
      }
    };

    fetchOrganisations();
  }, [viewer_id, organisationDetails?.organisation?.id]);

  const viewLogo = () => {
    setIsViewLogoOpen(true);
  };

  const editLogo = () => {
    setIsEditLogoOpen(true);
  };

  const updateDocumentAnalysis = async (newVal) => {
    setUpdatingDocumentAnalysis(true);
    try {
      const response = await axiosInstance.post("/update-company-info", {
        viewer_id,
        organisation_id: organisationDetails.organisation.id,
        ai_document_analysis: newVal,
      });
      if (response.data.success) {
        toast.success("Document Analysis updated successfully");
        setDocumentAnalysis(newVal);
      } else {
        toast.error("Failed to update Document Analysis");
      }
    } catch (error) {
      console.error("Error updating Document Analysis:", error);
      toast.error("Error updating Document Analysis");
    } finally {
      setUpdatingDocumentAnalysis(false);
    }
  };

  const updateWebsite = async () => {
    const validation = validateWebsite(website);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    try {
      const response = await axiosInstance.post("/update-company-info", {
        viewer_id,
        organisation_id: organisationDetails.organisation.id,
        website: website,
      });

      if (response.data.success) {
        toast.success("Website updated successfully");
        setIsEditingWebsite(false);
        // Refresh organisation details
        const updatedOrg = await axiosInstance.post(
          "/view-organisation-details",
          {
            viewer_id: viewer_id,
            organisation_id: organisationDetails.organisation.id,
          }
        );
        setOrganisationDetails(updatedOrg.data);
      }
    } catch (error) {
      console.error("Error updating website:", error);
      toast.error("Failed to update website");
    }
  };

  const updateDsrTranslate = async (newVal) => {
    setUpdatingDsrTranslate(true);
    try {
      const response = await axiosInstance.post("/update-company-info", {
        viewer_id,
        organisation_id: organisationDetails.organisation.id,
        dsr_translation: newVal,
      });

      if (response.data.success) {
        toast.success("DSR Translations updated successfully");
        setDsrTranslate(newVal);
      } else {
        toast.error("Failed to update DSR Translate");
      }
    } catch (error) {
      console.error("Error updating DSR Translate:", error);
      toast.error("Error updating DSR Translate");
    } finally {
      setUpdatingDsrTranslate(false);
    }
  };

  const updatePlaceholderValue = async (newVal) => {
    setUpdatingPlaceholderValue(true);
    try {
      const response = await axiosInstance.post("/update-company-info", {
        viewer_id,
        organisation_id: organisationDetails.organisation.id,
        document_placeholder_extraction: newVal,
      });

      if (response.data.success) {
        toast.success("Document Placholder Extraction updated successfully");
        setPlaceholderValue(newVal);
      } else {
        toast.error("Failed to update Placeholder Value");
      }
    } catch (error) {
      console.error("Error updating Placeholder Value:", error);
      toast.error("Error updating Placeholder Value");
    } finally {
      setUpdatingPlaceholderValue(false);
    }
  };

  const columns = ["Name", "Current Profile", "Username"];

  const rowData = ["Full Name", "Current Profile", "Username"];

  const transformActiveUsers = (users) => {
    // Use fallback to ensure `users` is not undefined
    return (users || []).map((user) => ({
      "Full Name": `${user.first_name} ${user.last_name}`,
      "Current Profile": user.profile_name,
      Username: user.username,
    }));
  };

  const OnChangeHandler = (data) => {
    if (data === organisationDetails?.users || data.length === 0) {
      setSelectedItems(data);
      return;
    }

    const idx = selectedItems.findIndex(
      (selectedItem) => selectedItem.username === data.username
    );

    if (idx === -1) {
      setSelectedItems((prevState) => [...prevState, data]);
    } else {
      const updatedSelectedItems = selectedItems.filter(
        (item) => item.username !== data.username
      );
      setSelectedItems(updatedSelectedItems);
    }
  };

  const renderActiveLicenses = () => {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-50">
              <th
                colSpan="4"
                className="py-3 px-4 text-left text-lg font-semibold text-gray-700"
              >
                Active Licenses
              </th>
            </tr>
            <tr>
              <TableHeader>Licenses</TableHeader>
              <TableHeader>Total Purchased</TableHeader>
              <TableHeader>Total Used</TableHeader>
              <TableHeader>Total Available</TableHeader>
              <TableHeader>Expiry Date</TableHeader>
            </tr>
          </thead>
          <tbody>
            {organisationDetails?.productAssignments?.map((assignment) => (
              <tr
                key={assignment.id}
                className="border-b last:border-0 border-gray-200"
              >
                <TableCell>{assignment.product_name}</TableCell>
                <TableCell>{assignment.total_licenses}</TableCell>
                <TableCell>{assignment.license_used}</TableCell>
                <TableCell>
                  {assignment.total_licenses - assignment.license_used}
                </TableCell>
                <TableCell>
                  {new Date(assignment.expiry).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const updateTimezone = async () => {
    try {
      const response = await axiosInstance.post("/update-company-info", {
        viewer_id: viewer_id,
        organisation_id: organisationDetails.organisation.id,
        timezone: selectedTimezone, // This will be the timezone ID
      });

      if (response.data.success) {
        toast.success("Timezone updated successfully");
        setIsEditingTimezone(false);
        // Refresh organisation details
        const updatedOrg = await axiosInstance.post(
          "/view-organisation-details",
          {
            viewer_id: viewer_id,
            organisation_id: organisationDetails.organisation.id,
          }
        );
        setOrganisationDetails(updatedOrg.data);
      }
    } catch (error) {
      console.error("Error updating timezone:", error);
      toast.error("Failed to update timezone");
    }
  };

  const updatePrimaryContact = async () => {
    try {
      const response = await axiosInstance.post("/update-company-info", {
        viewer_id: viewer_id,
        organisation_id: organisationDetails.organisation.id,
        primary_contact_email: primaryContact,
      });

      if (response.data.success) {
        toast.success("Primary contact updated successfully");
        setIsEditingContact(false);
        // Refresh organisation details
        const updatedOrg = await axiosInstance.post(
          "/view-organisation-details",
          {
            viewer_id: viewer_id,
            organisation_id: organisationDetails.organisation.id,
          }
        );
        setOrganisationDetails(updatedOrg.data);
      }
    } catch (error) {
      console.error("Error updating primary contact:", error);
      toast.error("Failed to update primary contact");
    }
  };

  const updatePhone = async () => {
    try {
      const response = await axiosInstance.post("/update-company-info", {
        viewer_id: viewer_id,
        organisation_id: organisationDetails.organisation.id,
        phone: phone,
      });

      if (response.data.success) {
        toast.success("Phone updated successfully");
        setIsEditingPhone(false);
        // Refresh organisation details
        const updatedOrg = await axiosInstance.post(
          "/view-organisation-details",
          {
            viewer_id: viewer_id,
            organisation_id: organisationDetails.organisation.id,
          }
        );
        setOrganisationDetails(updatedOrg.data);
      }
    } catch (error) {
      console.error("Error updating phone:", error);
      toast.error("Failed to update phone");
    }
    setIsEditingPhone(false);
  };

  const updateDescription = async () => {
    try {
      const response = await axiosInstance.post("/update-company-info", {
        viewer_id: viewer_id,
        organisation_id: organisationDetails.organisation.id,
        description: description,
      });

      if (response.data.success) {
        toast.success("Description updated successfully");
        setIsEditingDescription(false);
        // Refresh organisation details
        const updatedOrg = await axiosInstance.post(
          "/view-organisation-details",
          {
            viewer_id: viewer_id,
            organisation_id: organisationDetails.organisation.id,
          }
        );
        setOrganisationDetails(updatedOrg.data);
      }
    } catch (error) {
      console.error("Error updating description:", error);
      toast.error("Failed to update description");
    }
  };

  const updateName = async () => {
    try {
      const response = await axiosInstance.post("/update-company-info", {
        viewer_id: viewer_id,
        organisation_id: organisationDetails.organisation.id,
        name: name,
      });

      if (response.data.success) {
        toast.success("Name updated successfully");
        setIsEditingName(false);
        // Refresh organisation details
        const updatedOrg = await axiosInstance.post(
          "/view-organisation-details",
          {
            viewer_id: viewer_id,
            organisation_id: organisationDetails.organisation.id,
          }
        );
        setOrganisationDetails(updatedOrg.data);
      }
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name");
    }
  };

  if (dialogLoading) {
    return (
      <div className="flex flex-col p-6 gap-2">
        <div className="w-[200px] h-[30px] bg-neutral-200 animate-pulse rounded-lg" />
        <div className="max-w-[500px] w-full h-[30px] bg-neutral-200 animate-pulse rounded-lg" />
        <div className="max-w-[500px] w-full h-[30px] bg-neutral-200 animate-pulse rounded-lg" />
        <div className="max-w-[500px] w-full h-[30px] bg-neutral-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div>
      {showDomainChangeWarning && (
        <WarningDialog
          isOpen={showDomainChangeWarning}
          onCancel={() => setShowDomainChangeWarning(false)}
          title="Custom Domain Change Warning"
          content={
            <>
              <p className="mb-4">Warning: Changing the custom domain will:</p>
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                <li>Invalidate all API tokens</li>
                <li>Force all users in the organization to login again</li>
                <li>Invalidate all links sent to external clients</li>
              </ol>
              <p>
                This process can take up to 30 mins to complete. Do expect
                downtime for all users.
              </p>
              <p className="mt-4 font-semibold">
                Are you sure you want to proceed?
              </p>
            </>
          }
          onConfirm={async () => {
            setUpdatingCustomTenant(true);
            setShowDomainChangeWarning(false);
            try {
              const response = await axiosInstance.post(
                "/update-custom-domain",
                {
                  viewer_id,
                  organisation_id: organisationDetails.organisation.id,
                  newCustomDomain: customTenantName,
                }
              );
              if (response.data.success) {
                toast.success("Custom domain updated successfully");
                setIsEditingCustomTenant(false);
                // Refresh organisation details
                const updatedOrg = await axiosInstance.post(
                  "/view-organisation-details",
                  {
                    viewer_id: viewer_id,
                    organisation_id: organisationDetails.organisation.id,
                  }
                );
                setOrganisationDetails(updatedOrg.data);
              } else {
                toast.error(
                  response.data.message || "Failed to update custom domain"
                );
              }
            } catch (error) {
              console.error("Error updating custom domain:", error);
              toast.error("Error updating custom domain");
            } finally {
              setUpdatingCustomTenant(false);
            }
          }}
          confrimMessage="Proceed"
          isLoading={updatingCustomTenant}
        />
      )}
      {showManageLicenses ? (
        <div className="px-4">
          <div className="flex items-center">
            <button
              className="flex items-center text-gray-700 hover:text-gray-900"
              onClick={() => setShowManageLicenses(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12H3m0 0l6-6m-6 6l6 6"
                />
              </svg>
            </button>
          </div>
          <LicenseManagement
            licenses={licenses}
            selectedLicense={selectedLicense}
            setSelectedLicense={setSelectedLicense}
          />
          {[
            "Revenue Enablement Launch",
            "Revenue Enablement Elevate",
            "Revenue Enablement Spark",
          ].includes(selectedLicense?.product_name) ? (
            <LicenseDetails
              selectedLicense={selectedLicense}
              organisation={organisationDetails?.organisation}
              orgUsers={organisationDetails?.users}
              viewer_id={viewer_id}
            />
          ) : selectedLicense ? (
            <ContactSales />
          ) : null}
        </div>
      ) : (
        <div>
          <div className="relative flex items-center justify-center w-full mt-2">
            <div className="relative bg-gray-800"></div>
            <div className="bg-white p-6 rounded-md overflow-y-auto h-[450px] w-full">
              <div className="gap-4 flex flex-col mt-2">
                <div className="bg-white rounded-lg overflow-hidden border border-neutral-200 mb-6">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="bg-gray-50">
                        <th
                          colSpan="2"
                          className="py-3 px-4 text-left text-lg font-semibold text-gray-700"
                        >
                          Organisation Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <TableRow
                        label="Name"
                        value={
                          <div className="flex items-center gap-2">
                            {isEditingName ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={
                                    name ||
                                    organisationDetails?.organisation?.name
                                  }
                                  onChange={(e) => setName(e.target.value)}
                                  className="border rounded px-2 py-1 w-80"
                                  placeholder="Enter company name"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setIsEditingName(false)}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => {
                                      updateName();
                                      setIsEditingName(false);
                                    }}
                                    className="text-sky-700 hover:text-sky-800"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="w-80">
                                  {organisationDetails?.organisation?.name ||
                                    "-"}
                                </span>
                                <button
                                  onClick={() => setIsEditingName(true)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        }
                      />
                      <TableRow
                        label="Primary Contact"
                        value={
                          <div className="flex items-center gap-2">
                            {isEditingContact ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={
                                    primaryContact ||
                                    organisationDetails?.organisation
                                      ?.primary_contact
                                  }
                                  onChange={(e) =>
                                    setPrimaryContact(e.target.value)
                                  }
                                  className={`border rounded px-2 py-1 w-80`}
                                  placeholder="Enter primary contact"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setIsEditingContact(false)}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => {
                                      updatePrimaryContact();
                                      setIsEditingContact(false);
                                    }}
                                    className="text-sky-700 hover:text-sky-800"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="w-80">
                                  {organisationDetails?.organisation
                                    ?.primary_contact || "-"}
                                </span>
                                <button
                                  onClick={() => setIsEditingContact(true)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        }
                      />
                      <TableRow
                        label="Phone"
                        value={
                          <div className="flex items-center gap-2">
                            {isEditingPhone ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="tel"
                                  value={
                                    phone ||
                                    organisationDetails?.organisation?.phone
                                  }
                                  onChange={(e) => setPhone(e.target.value)}
                                  className={`border rounded px-2 py-1 w-80`}
                                  placeholder="Enter phone number"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setIsEditingPhone(false)}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={updatePhone}
                                    className="text-sky-700 hover:text-sky-800"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="w-80">
                                  {organisationDetails?.organisation?.phone ||
                                    "-"}
                                </span>
                                <button
                                  onClick={() => setIsEditingPhone(true)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        }
                      />
                      <TableRow
                        label="Currency"
                        value={
                          <CurrencyManagement
                            organisationId={organisationDetails?.organisation?.id}
                            viewerId={viewer_id}
                            currentCorporateCurrency={organisationDetails?.organisation?.currency}
                            currencies={currencies}
                          />
                        }
                      />
                      <TableRow
                        label="Timezone"
                        value={
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <select
                                value={
                                  selectedTimezone ||
                                  organisationDetails?.organisation?.timezone
                                }
                                onChange={(e) =>
                                  setSelectedTimezone(e.target.value)
                                }
                                disabled={!isEditingTimezone}
                                className={`border rounded px-2 py-1 w-80 ${
                                  !isEditingTimezone
                                    ? "bg-gray-200"
                                    : "bg-white"
                                }`}
                              >
                                <option value="">Select Timezone</option>
                                {timezones.map((timezone) => (
                                  <option key={timezone.id} value={timezone.id}>
                                    {timezone.name}
                                  </option>
                                ))}
                              </select>
                              {isEditingTimezone ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setIsEditingTimezone(false)}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={updateTimezone}
                                    className="text-sky-700 hover:text-sky-800"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setIsEditingTimezone(true)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        }
                      />
                      {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                        checkUserLicense("Revenue Enablement Spark") ==
                          "1") && (
                        <TableRow
                          label="Custom Domain"
                          value={
                            <div className="flex items-center gap-2">
                              {isEditingCustomTenant ? (
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={customTenantName}
                                      onChange={(e) => {
                                        // Automatically extract and set only the first part before any dots
                                        const value = e.target.value
                                          .toLowerCase()
                                          .split(".")[0];
                                        setCustomTenantName(value);
                                      }}
                                      maxLength={25}
                                      className="border rounded px-2 py-1 w-80"
                                      placeholder="Enter subdomain (e.g., 'acme' not 'acme.revspire.io')"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          setIsEditingCustomTenant(false)
                                        }
                                        className="text-gray-600 hover:text-gray-800"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={updateCustomTenantName}
                                        disabled={updatingCustomTenant}
                                        className="text-sky-700 hover:text-sky-800 flex items-center gap-1"
                                      >
                                        {updatingCustomTenant ? (
                                          <>
                                            <svg
                                              className="animate-spin -ml-1 mr-1 h-4 w-4 text-sky-700"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                            >
                                              <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                              ></circle>
                                              <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                              ></path>
                                            </svg>
                                            Saving...
                                          </>
                                        ) : (
                                          "Save"
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                  {!validateCustomDomain(customTenantName)
                                    .valid && (
                                    <span className="text-xs text-red-500">
                                      {
                                        validateCustomDomain(customTenantName)
                                          .message
                                      }
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <span className="w-80">
                                    {customTenantName || "-"}
                                  </span>
                                  {isDomainUpdateInProgress ? (
                                    <div className="relative group">
                                      <Clock className="w-4 h-4 text-gray-400" />
                                      <div className="absolute hidden group-hover:block z-10 w-64 p-2 bg-gray-800 text-white text-sm rounded-md bottom-full mb-2">
                                        Custom domain is being changed. Please
                                        wait until the process completes.
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        setIsEditingCustomTenant(true)
                                      }
                                      className="text-gray-600 hover:text-gray-800"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          }
                        />
                      )}
                      <TableRow
                        label="Description"
                        value={
                          <div className="flex items-center gap-2">
                            {isEditingDescription ? (
                              <div className="flex items-center gap-2">
                                <textarea
                                  type="text"
                                  value={
                                    description ||
                                    organisationDetails?.organisation
                                      ?.description
                                  }
                                  onChange={(e) =>
                                    setDescription(e.target.value)
                                  }
                                  className="border rounded px-2 py-1 w-80"
                                  placeholder="Enter description"
                                  rows={4} // Set the default number of rows to 4
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      setIsEditingDescription(false)
                                    }
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => {
                                      updateDescription();
                                      setIsEditingDescription(false);
                                    }}
                                    className="text-sky-700 hover:text-sky-800"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="w-80 line-clamp-4">
                                  {" "}
                                  {/* Use line-clamp to limit to 4 lines */}
                                  {organisationDetails?.organisation
                                    ?.description || "-"}
                                </span>
                                <button
                                  onClick={() => setIsEditingDescription(true)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        }
                      />
                      <TableRow
                        label="Website"
                        value={
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              {isEditingWebsite ? (
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={website}
                                      onChange={(e) => {
                                        const newWebsite = e.target.value;
                                        setWebsite(newWebsite);
                                        validateWebsite(newWebsite); // Validate in real-time
                                      }}
                                      className={`border rounded px-2 py-1 w-80 ${
                                        websiteError
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      }`}
                                      placeholder="Enter website URL (e.g., example.com)"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          setIsEditingWebsite(false);
                                          setWebsite(
                                            organisationDetails?.organisation
                                              ?.website || ""
                                          ); // Reset to original value
                                          setWebsiteError(""); // Clear any errors
                                        }}
                                        className="text-gray-600 hover:text-gray-800"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => {
                                          const validation =
                                            validateWebsite(website);
                                          if (validation.valid) {
                                            updateWebsite();
                                            setIsEditingWebsite(false);
                                          }
                                        }}
                                        className={`${
                                          websiteError
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "text-sky-700 hover:text-sky-800"
                                        }`}
                                        disabled={!!websiteError}
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                  {websiteError && (
                                    <span className="text-xs text-red-500">
                                      {websiteError}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <span className="w-80">{website || "-"}</span>
                                  <button
                                    onClick={() => {
                                      setIsEditingWebsite(true);
                                      setWebsite(
                                        organisationDetails?.organisation
                                          ?.website || ""
                                      ); // Initialize with current value
                                      setWebsiteError(""); // Clear any previous errors
                                    }}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        }
                      />
                      {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                        checkUserLicense("Revenue Enablement Spark") == "1") && (
                        <>
                          <TableRow
                            label="AI Document Analysis"
                            value={
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateDocumentAnalysis(
                                      documentAnalysis === 1 ? 0 : 1
                                    )
                                  }
                                  disabled={updatingDocumentAnalysis}
                                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                                    documentAnalysis === 1
                                      ? "bg-blue-600"
                                      : "bg-gray-200"
                                  }`}
                                >
                                  <span
                                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                      documentAnalysis === 1
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                    }`}
                                  ></span>
                                </button>
                                {updatingDocumentAnalysis && (
                                  <span className="text-sm text-gray-500 ml-2">
                                    Loading...
                                  </span>
                                )}
                              </div>
                            }
                          />

                          <TableRow
                            label="DSR Translations"
                            value={
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateDsrTranslate(
                                      dsrTranslate === 1 ? 0 : 1
                                    )
                                  }
                                  disabled={updatingDsrTranslate}
                                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                                    dsrTranslate === 1
                                      ? "bg-blue-600"
                                      : "bg-gray-200"
                                  }`}
                                >
                                  <span
                                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                      dsrTranslate === 1
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                    }`}
                                  ></span>
                                </button>
                                {updatingDsrTranslate && (
                                  <span className="text-sm text-gray-500 ml-2">
                                    Loading...
                                  </span>
                                )}
                              </div>
                            }
                          />

                          <TableRow
                            label="Document Placeholder Extraction"
                            value={
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updatePlaceholderValue(
                                      placeholderValue === 1 ? 0 : 1
                                    )
                                  }
                                  disabled={updatingPlaceholderValue}
                                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                                    placeholderValue === 1
                                      ? "bg-blue-600"
                                      : "bg-gray-200"
                                  }`}
                                >
                                  <span
                                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                      placeholderValue === 1
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                    }`}
                                  ></span>
                                </button>
                                {updatingPlaceholderValue && (
                                  <span className="text-sm text-gray-500 ml-2">
                                    Loading...
                                  </span>
                                )}
                              </div>
                            }
                          />
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="bg-white rounded-lg overflow-hidden border border-neutral-200 mb-6">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="bg-gray-50">
                        <th
                          colSpan="2"
                          className="py-3 px-4 text-left text-lg font-semibold text-gray-700"
                        >
                          Brand Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <TableRow
                        label="Brand Logo"
                        value={
                          <div className="flex justify-center gap-5">
                            <button
                              className="bg-gray-200 hover:bg-gray-300 border border-gray-800 w-[100px] h-[30px] rounded-md"
                              onClick={viewLogo}
                            >
                              View
                            </button>
                            <button
                              className="bg-gray-200 hover:bg-gray-300 border border-gray-800 w-[100px] h-[30px] rounded-md"
                              onClick={editLogo}
                            >
                              Edit
                            </button>

                            <ViewLogoModal
                              isOpen={isViewLogoOpen}
                              onClose={() => setIsViewLogoOpen(false)}
                              viewer_id={viewer_id}
                              organisation_id={
                                organisationDetails.organisation.id
                              }
                              companyLogo={companyLogo}
                            />

                            <EditLogoModal
                              isOpen={isEditLogoOpen}
                              onClose={() => setIsEditLogoOpen(false)}
                              viewer_id={viewer_id}
                              organisation_id={
                                organisationDetails.organisation.id
                              }
                            />
                          </div>
                        }
                      />
                      <TableRow
                        label="Primary Color"
                        value={
                          <div className="flex justify-center items-center">
                            <span
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: `#${orgHexColor}` }}
                            ></span>
                            <span className="ml-2 text-gray-800">
                              {orgHexColor}
                            </span>
                            <button
                              className="ml-10 bg-gray-200 hover:bg-gray-300 border border-gray-800 w-[100px] h-[30px] rounded-md"
                              onClick={() => setIsColorPickerOpen(true)}
                            >
                              Edit
                            </button>
                          </div>
                        }
                      />
                      <ColorPicker
                        isOpen={isColorPickerOpen}
                        setIsOpen={setIsColorPickerOpen}
                        updateType="axios"
                        setColor={setOrgHexColor}
                      />
                    </tbody>
                  </table>
                </div>
                <div>
                  <div className="flex justify-end p-1 mb-3">
                    <button
                      className="bg-secondary text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:outline-none rounded-md px-4 py-2 text-sm font-medium transition"
                      onClick={() => setShowManageLicenses(true)}
                    >
                      Manage Licenses
                    </button>
                  </div>
                  {renderActiveLicenses()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoreInfoDialog;

export const TableRow = ({ label, value }) => (
  <tr className="border-b last:border-0 border-gray-200">
    <td className="py-3 px-4 text-sm font-medium text-gray-500">{label}</td>
    <td className="py-3 px-4 text-sm text-gray-900">{value || "-"}</td>
  </tr>
);

const TableHeader = ({ children }) => (
  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children !== null && children !== undefined ? children : "-"}
  </th>
);

const TableCell = ({ children }) => (
  <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">
    {/* ensure they wont be null */}
    {children !== null && children !== undefined ? children : "-"}
  </td>
);

const LicenseManagement = ({
  licenses,
  selectedLicense,
  setSelectedLicense,
}) => {
  const { viewer_id, organisation_id } = useContext(GlobalContext);
  const [purchasedStorage, setPurchasedStorage] = useState(0);
  const [totalConsumed, setTotalConsumed] = useState(0);
  const [loading, setLoading] = useState(true);
  const axiosInstance = useAxiosInstance();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateLicenseUtilization = (total, used) => {
    return `${Math.round((used / total) * 100)}%`;
  };

  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        const response = await axiosInstance.post(
          `storage/get-content-summary`,
          {
            viewer_id: viewer_id,
            organisation_id: organisation_id,
          }
        );

        if (response.data.success) {
          setPurchasedStorage(response.data.purchased_storage_gb);
          setTotalConsumed(response.data.total_size_gb);
        }
      } catch (error) {
        console.error("Error fetching storage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStorageData();
  }, [viewer_id, organisation_id]);

  // Calculate percentages
  const percentageUsed = ((totalConsumed / purchasedStorage) * 100).toFixed(2);
  const percentageAvailable = (100 - percentageUsed).toFixed(2);

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-2 text-center">
        License Management
      </h2>
      <div className="flex flex-wrap justify-center gap-6">
        {licenses.map((license) => (
          <div
            key={license.id}
            onClick={() => setSelectedLicense(license)}
            className={`border rounded-lg p-6 hover:shadow-sm transition-shadow cursor-pointer ${
              selectedLicense?.id === license.id ? "bg-gray-800 text-white" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className={`text-xl font-semibold ${
                  selectedLicense?.id === license.id
                    ? "text-white"
                    : "text-gray-800"
                }`}
              >
                {license.product_name}
              </h3>
              <span
                className={`text-sm ${
                  selectedLicense?.id === license.id
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                License ID: {license.id}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p
                    className={`text-sm ${
                      selectedLicense?.id === license.id
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    Licenses
                  </p>
                  <p
                    className={`font-medium ${
                      selectedLicense?.id === license.id
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                  >
                    {`${license.total_licenses} Total`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Info className="h-5 w-5 text-green-500" />
                <div>
                  <p
                    className={`text-sm ${
                      selectedLicense?.id === license.id
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    Used Licenses
                  </p>
                  <p
                    className={`font-medium ${
                      selectedLicense?.id === license.id
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                  >
                    {license.license_used}
                    {` (${calculateLicenseUtilization(
                      license.total_licenses,
                      license.license_used
                    )})`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-purple-500" />
                <div>
                  <p
                    className={`text-sm ${
                      selectedLicense?.id === license.id
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    Expiration
                  </p>
                  <p
                    className={`font-medium ${
                      selectedLicense?.id === license.id
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                  >
                    {formatDate(license.expiry)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div>
                <p
                  className={`text-sm ${
                    selectedLicense?.id === license.id
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  Organization
                </p>
                <p className="font-medium">{license.organisation_name}</p>
              </div>
              <div className="flex justify-between items-center space-x-8">
                <div className="text-center">
                  <p
                    className={`text-sm ${
                      selectedLicense?.id === license.id
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    Purchased Storage
                  </p>
                  <p
                    className={`font-medium ${
                      selectedLicense?.id === license.id
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                  >
                    <span className="font-bold">{purchasedStorage} GB</span>
                  </p>
                </div>
                <div className="text-center">
                  <p
                    className={`text-sm ${
                      selectedLicense?.id === license.id
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    Storage Available
                  </p>
                  <p
                    className={`font-medium ${
                      selectedLicense?.id === license.id
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                  >
                    <span className="font-bold">{percentageAvailable}%</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm ${
                    selectedLicense?.id === license.id
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  Price per License
                </p>
                <p
                  className={`font-medium ${
                    selectedLicense?.id === license.id
                      ? "text-white"
                      : "text-gray-800"
                  }`}
                >
                  {license.price_per_license.toLocaleString("en-US", {
                    style: "currency",
                    currency: license.currency_iso_code,
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LicenseDetails = ({ selectedLicense, organisation, viewer_id }) => {
  const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const scriptSrc = "https://checkout.razorpay.com/v1/checkout.js";
    loadRazorpayScript(scriptSrc);
  }, []);

  const [selectedPackExtension, setSelectedPackExtension] =
    useState("No Extension");

  const storageProvided = [
    { storage: 0, price: 0 },
    { storage: 100, price: 150 },
    { storage: 1000, price: 300 },
    { storage: 5000, price: 700 },
  ];

  const [selectedStorage, setSelectedStorage] = useState(0);
  const [selectedAICredits, setSelectedAICredits] = useState(0);
  const [selectedExtension, setSelectedExtension] = useState(0);
  const [totalLicenses, setTotalLicenses] = useState(
    selectedLicense?.total_licenses
  );

  useEffect(() => {
    setTotalLicenses(selectedLicense?.total_licenses);
    console.log("Selected license info", selectedLicense);
  }, [selectedLicense]);

  const isLicenseExpired = (expirydate) => {
    if (expirydate) {
      const currentDate = new Date();
      const expiryDate = new Date(expirydate);
      return expiryDate < currentDate;
    }
    return false;
  };

  const axiosInstance = useAxiosInstance();

  const extensionOptions = isLicenseExpired(selectedLicense?.expiry)
    ? ["Monthly", "Annually"]
    : ["No Extension", "Monthly", "Annually"];

  const noExtensionDays = isLicenseExpired(selectedLicense?.expiry)
    ? 0
    : Math.ceil(
        (new Date(selectedLicense?.expiry).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );

  const extensionUserCost =
    (noExtensionDays / 30) * selectedLicense?.price_per_license;
  const extensionStorageCost =
    (noExtensionDays / 30) * (storageProvided[selectedStorage].price / 12);

  const verifyPaymentHandler = async (res) => {
    console.log("Payment Response", res);
    try {
      const options = {
        razorpay_order_id: res.razorpay_order_id,
        razorpay_payment_id: res.razorpay_payment_id,
        razorpay_signature: res.razorpay_signature,
      };

      const response = await axiosInstance.post(
        `/payment/existing-customer/create-payment`,
        options
      );

      if (response.status === 200) {
        toast.success(response.data.message);
        // dispatch(fetchLicensesAsync({ viewer_id, baseURL: baseURL }));
      }
    } catch (error) {
      console.log("Payment Eror", error);
    }
  };

  const handlePayNow = async () => {
    let totalAmount = 0;
    let totalDays = 0;

    if (selectedPackExtension === "No Extension") {
      totalAmount =
        Number(
          (totalLicenses - selectedLicense?.total_licenses) *
            extensionUserCost.toFixed(2)
        ) +
        Number(extensionStorageCost.toFixed(2)) +
        Number(selectedAICredits);
    } else if (selectedPackExtension === "Monthly") {
      totalAmount =
        Number(totalLicenses * selectedLicense.price_per_license) +
        Number(storageProvided[selectedStorage].price) +
        Number(selectedAICredits);
      totalDays = 30;
    } else if (selectedPackExtension === "Annually") {
      totalAmount =
        Number(12 * totalLicenses * selectedLicense.price_per_license * 0.8) +
        Number(storageProvided[selectedStorage].price) +
        Number(selectedAICredits);
      totalDays = 365;
    }

    try {
      const response = await axiosInstance.post(
        `/payment/existing-customer/create-order`,
        {
          amount: Math.round(totalAmount),
          currency: selectedLicense.currency_iso_code,
          organisation_id: organisation.id,
          viewer_id: viewer_id,
          organisation_product_assignment: selectedLicense.id,
          number_of_licenses: totalLicenses,
          extension_days: totalDays,
          storage: storageProvided[selectedStorage].storage,
          ai_credits: selectedAICredits,
        }
      );
      if (response.status === 200) {
        console.log("payment response", response.data);

        const paymentObject = new window.Razorpay({
          key: response.data.razorpayKeyId,
          amount: totalAmount.toFixed(2),
          order_id: response.data.razorpay_order_id,
          handler: function (response) {
            verifyPaymentHandler(response);
          },
        });
        paymentObject.open();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="px-24 py-6">
      <div className="flex gap-2 justify-start py-2 w-full mb-6">
        {extensionOptions.map((option, index) => (
          <button
            key={option}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              selectedExtension === index
                ? "bg-gray-800 text-white shadow-md"
                : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => {
              setSelectedExtension(index);
              setSelectedPackExtension(option);
            }}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col space-y-2 border-2 p-2 rounded-lg border-gray-200  bg-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Users</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  setTotalLicenses((prev) =>
                    Math.max(
                      selectedLicense?.total_licenses ?? 0,
                      parseInt(prev) - 1
                    )
                  )
                }
                disabled={
                  totalLicenses === (selectedLicense?.total_licenses ?? 0)
                }
                className="flex justify-center items-center bg-white hover:bg-gray-50 border border-gray-300 w-[36px] h-[36px] rounded-full shadow-sm"
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <input
                type="text"
                value={totalLicenses}
                onChange={(e) =>
                  setTotalLicenses(
                    Math.max(
                      selectedLicense?.total_licenses ?? 0,
                      parseInt(e.target.value) || 0
                    )
                  )
                }
                className="w-16 h-[36px] text-center border border-gray-300 rounded-md bg-white"
              />
              <button
                onClick={() => setTotalLicenses((prev) => parseInt(prev) + 1)}
                className="flex justify-center items-center bg-white hover:bg-gray-50 border border-gray-300 w-[36px] h-[36px] rounded-full shadow-sm"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
              <span className="text-sm text-gray-500 ml-2">
                {totalLicenses} Users
              </span>
            </div>
            <div className="text-right text-sm font-semibold">
              $
              {selectedPackExtension === "No Extension"
                ? (totalLicenses - selectedLicense?.total_licenses) *
                  extensionUserCost.toFixed(2)
                : selectedPackExtension === "Monthly"
                ? (totalLicenses * selectedLicense.price_per_license).toFixed(2)
                : (
                    12 *
                    totalLicenses *
                    selectedLicense.price_per_license *
                    0.8
                  ).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2 border-2 p-2 rounded-lg border-gray-200  bg-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Storage</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button
                disabled={selectedStorage === 0}
                onClick={() => setSelectedStorage(selectedStorage - 1)}
                className="flex justify-center items-center bg-white hover:bg-gray-50 border border-gray-300 w-[36px] h-[36px] rounded-full shadow-sm"
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <input
                type="text"
                value={storageProvided[selectedStorage].storage}
                readOnly
                className="w-16 h-[36px] text-center border border-gray-300 rounded-md bg-white"
              />
              <button
                onClick={() => setSelectedStorage(selectedStorage + 1)}
                disabled={selectedStorage === storageProvided.length - 1}
                className="flex justify-center items-center bg-white hover:bg-gray-50 border border-gray-300 w-[36px] h-[36px] rounded-full shadow-sm"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
              <span className="text-sm text-gray-500 ml-2">
                {`${storageProvided[selectedStorage].storage} GB`}
              </span>
            </div>

            <div className="text-right text-sm font-semibold">
              $
              {selectedPackExtension === "No Extension"
                ? extensionStorageCost.toFixed(2)
                : selectedPackExtension === "Monthly"
                ? (Number(storageProvided[selectedStorage].price) / 12).toFixed(
                    2
                  )
                : storageProvided[selectedStorage].price}
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2 border-2 p-2 rounded-lg border-gray-200  bg-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">AI Credits</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button
                disabled={selectedAICredits === 0}
                onClick={() => setSelectedAICredits(selectedAICredits - 1)}
                className="flex justify-center items-center bg-white hover:bg-gray-50 border border-gray-300 w-[36px] h-[36px] rounded-full shadow-sm"
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <input
                type="number"
                min={0}
                value={selectedAICredits}
                onChange={(e) =>
                  setSelectedAICredits(
                    Math.max(0, parseInt(e.target.value) || 0)
                  )
                }
                className="w-40 h-[36px] text-center border border-gray-300 rounded-md bg-white"
              />
              <button
                onClick={() => setSelectedAICredits(selectedAICredits + 1)}
                className="flex justify-center items-center bg-white hover:bg-gray-50 border border-gray-300 w-[36px] h-[36px] rounded-full shadow-sm"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
              <span className="text-sm text-gray-500 ml-2">
                {`${"$ " + selectedAICredits}`}
              </span>
            </div>
            <div className="text-right text-sm font-semibold">
              ${selectedAICredits}
            </div>
          </div>
        </div>

        {/* Total Calculation */}
        <div className="flex justify-between items-center mt-4 p-4 bg-gray-100 rounded-lg">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-lg font-semibold">
            $
            {selectedPackExtension === "No Extension"
              ? (
                  Number(
                    (totalLicenses - selectedLicense?.total_licenses) *
                      extensionUserCost.toFixed(2)
                  ) +
                  Number(extensionStorageCost.toFixed(2)) +
                  Number(selectedAICredits)
                ).toFixed(2)
              : selectedPackExtension === "Monthly"
              ? (
                  Number(totalLicenses * selectedLicense.price_per_license) +
                  Number(parseInt(storageProvided[selectedStorage].price)) +
                  Number(
                    parseInt(Number(selectedAICredits) ? selectedAICredits : 0)
                  )
                ).toFixed(2)
              : (
                  Number(
                    12 * totalLicenses * selectedLicense.price_per_license * 0.8
                  ) +
                  Number(parseInt(storageProvided[selectedStorage].price)) +
                  Number(
                    parseInt(Number(selectedAICredits) ? selectedAICredits : 0)
                  )
                ).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-end">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={handlePayNow}
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};
