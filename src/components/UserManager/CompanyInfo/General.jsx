import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { Grid } from "react-loader-spinner";
import ResizableTable from "../../../utility/ResizableTable.jsx";
import AllInfo from "./AllInfo.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";

function General() {
  const {
    viewer_id,
    setMoreInfoClicked,
    moreInfoClicked,
    setOrganisationDetails,
    selectedOrganisationId,
    setSelectedOrganisationId,
    organisationDetails,
    organisations,
    setOrganisations,
    activeTab,
    setActiveTab,
    baseURL,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const [loading, setLoading] = useState(true);
  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const crmConnectionId = searchParams.get("crmConnectionId");
    const existingCRMid = searchParams.get("existingCRMid");
    const organisation_id = searchParams.get("OrgId");

    


    if (existingCRMid && crmConnectionId && organisation_id) {
      console.log("First condition is true");
      setActiveTab("Salesforce");
      console.log("Existing CRM ID:", existingCRMid);
      console.log("CRM Connection ID:", crmConnectionId);

      const path = window.location.href;

      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await axiosInstance.post(`/migrate-service-user`, {
            old_crm_connection_id: existingCRMid,
            new_crm_connection_id: crmConnectionId,
            viewer_id: viewer_id,
            organisation_id: organisation_id,
          });

          if (response.status < 200 && response.status >= 300) {
            throw new Error("Failed to migrate service user");
          }

          const data = await response.data;
          if (data.success) {
            resolve("Service user migrated successfully.");

            // Authorisation call after successful migration
            const authorisePromise = new Promise(async (resolve, reject) => {
              try {
                if (!viewer_id || !crmConnectionId) {
                  console.error("viewer_id and crmConnectionId are required.");
                  reject("Viewer ID and connection details are required.");
                  return;
                }

                const url = `${baseURL}/salesforce-authorisation`;

                const fullUrl = new URL(url);
                console.log("Working till here 3");

                fullUrl.searchParams.append(
                  "crm_connection_id",
                  crmConnectionId
                );
                fullUrl.searchParams.append("viewer_id", viewer_id);
                fullUrl.searchParams.append("originURL", path);

                const requestUrl = fullUrl.toString().replace(baseURL, "");

                const response = await axiosInstance.get(requestUrl);

                const responseText = await response.data;

                if (response.status < 200 && response.status >= 300) {
                  throw new Error("Failed to authorize connection");
                }

                try {
                  const data = JSON.parse(responseText);
                  window.location.href = data.authUrl;
                  resolve("Salesforce data synchronized successfully.");
                } catch (jsonError) {
                  console.log("Not a valid JSON response");
                  resolve("Salesforce data synchronized successfully.");
                }
              } catch (error) {
                console.error("Error authorizing connection:", error.message);
                reject("Error authorizing connection: " + error.message);
              }
            });

            toast.promise(authorisePromise, {
              loading: "Authorizing Salesforce connection...",
              success: (msg) => {
                // Remove crmConnectionId from the URL after success
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete("crmConnectionId");
                window.history.replaceState(
                  {},
                  document.title,
                  newUrl.toString()
                );

                return `${msg}`;
              },
              error: (err) => `Failed: ${err}`,
            });
          } else {
            throw new Error(data.message);
          }
        } catch (error) {
          console.error("Error migrating service user:", error.message);
          reject("Error migrating service user: " + error.message);
        }
      });

      toast.promise(promise, {
        loading: "Migrating service user...",
        success: (msg) => {
          // Remove crmConnectionId and existingCRMid from the URL after success
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("crmConnectionId");
          newUrl.searchParams.delete("existingCRMid");
          newUrl.searchParams.delete("OrgId");
          window.history.replaceState({}, document.title, newUrl.toString());

          return `${msg}`;
        },
        error: (err) => `Failed: ${err}`,
      });
    } else if (crmConnectionId) {
      setActiveTab("Salesforce");

      const path = window.location.href;

      // Authorisation call directly
      const promise = new Promise(async (resolve, reject) => {
        try {
          if (!viewer_id || !crmConnectionId) {
            console.error("viewer_id and crmConnectionId are required.");
            reject("Viewer ID and connection details are required.");
            return;
          }

          const url = `${baseURL}/salesforce-authorisation`;

          const fullUrl = new URL(url);
          console.log("Working till here 3");

          fullUrl.searchParams.append("crm_connection_id", crmConnectionId);
          fullUrl.searchParams.append("viewer_id", viewer_id);
          fullUrl.searchParams.append("originURL", path);

          const requestUrl = fullUrl.toString().replace(baseURL, "");

          const response = await axiosInstance.get(requestUrl);

          const responseText = await response.data;

          if (response.status < 200 && response.status >= 300) {
            throw new Error("Failed to authorize connection");
          }

          try {
            const data = JSON.parse(responseText);
            window.location.href = data.authUrl;
            resolve("Salesforce data synchronized successfully.");
          } catch (jsonError) {
            console.log("Not a valid JSON response");
            resolve("Salesforce data synchronized successfully.");
          }
        } catch (error) {
          console.error("Error authorizing connection:", error.message);
          reject("Error authorizing connection: " + error.message);
        }
      });

      toast.promise(promise, {
        loading: "Authorizing Salesforce connection...",
        success: (msg) => {
          // Remove crmConnectionId from the URL after success
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("crmConnectionId");
          window.history.replaceState({}, document.title, newUrl.toString());

          return `${msg}`;
        },
        error: (err) => `Failed: ${err}`,
      });
    }
  }, []);

  const handleGeneralClick = () => {
    setActiveTab("general");
  };

  const handleInfoClick = () => {
    setActiveTab("info");
  };

  useEffect(() => {
    setLoading(true);
    const fetchOrganisations = async () => {
      try {
        const response = await axiosInstance.post(`/view-organisations`, {
          viewer_id: viewer_id,
        });

        if (response.data.success) {
          console.log("Original profiles:", response.data.organisations);
          const transformedProfiles = response.data.organisations.map(
            (user) => ({
              ...user,
              "Created At": user.created_at || "N/A",
              "Created By": user.created_by || "N/A",
              "Updated By": user.updated_by || "N/A",
              "Updated At": user.updated_at || "N/A",
            })
          );
          console.log("Transformed Users:", transformedProfiles);
          setOrganisations(transformedProfiles);
          setLoading(false);

          const firstOrgId = response.data.organisations[0].id;
          try {
            const response = await axiosInstance.post(
              `/view-organisation-details`,
              {
                viewer_id: viewer_id,
                organisation_id: firstOrgId,
              }
            );

            // Handle response data as needed
            setOrganisationDetails(response.data);
            setSelectedOrganisationId(firstOrgId);
            setMoreInfoClicked(true);
          } catch (error) {
            console.error("Error fetching organisation details:", error);
          }
        } else {
          console.error(
            "Failed to fetch organisations:",
            response.data.message
          );
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching organisations:", error);
      }
    };

    fetchOrganisations();
  }, [viewer_id]);

  const handleRowClick = async (id) => {
    console.log("orgid: ", id);
    try {
      const response = await axiosInstance.post(`/view-organisation-details`, {
        viewer_id: viewer_id,
        organisation_id: id,
      });

      // Handle response data as needed
      setOrganisationDetails(response.data);
      setSelectedOrganisationId(id);
      setMoreInfoClicked(true);
    } catch (error) {
      console.error("Error fetching organisation details:", error);
    }
  };
  console.log("details: ", organisationDetails);

  let includedFields = [
    "id",
    "name",
    "primary_contact",
    "currency_name",
    "modified_by_name",
    "created_by_name",
    "updated_at",
    "timezone_name",
  ];
  // Map each object in contents array to a row object containing only the included fields
  const rows = organisations.map((content) => {
    const row = {};

    includedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(content, field)) {
        // Check if the field is created_at or updated_at and format the date
        if (field === "created_at" || field === "updated_at") {
          row[field] = new Date(content[field]).toISOString().split("T")[0];
        } else {
          row[field] = content[field];
        }
      }
    });
    return row;
  });
  includedFields = [
    "id",
    "name",
    "contact",
    "currency",
    "Created By",
    "Updated At",
    "timezone",
  ];
  // Extract columns based on the included fields
  const columns = includedFields;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex justify-center items-center mr-20 mb-48">
          <Grid
            visible={true}
            height={40}
            width={40}
            color="#075985"
            ariaLabel="grid-loading"
            radius={12.5}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-[0.5px]  ">
      <div className="w-full">
        <ResizableTable
          rows={rows}
          columns={columns}
          data={organisations}
          onClick={handleRowClick}
          highlightText={true}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
        />
      </div>
      <div className="bg-white mt-2 w-full rounded-2xl">
        <AllInfo />
      </div>
    </div>
  );
}

export default General;
