import axios from "axios";

export const fetchPitches = async (data) => {
  try {
    const response = await axios.post(
      `${data.baseURL}/view-all-pitches-sorted`,
      data,
      {
        withCredentials: true, // Include credentials in the request if necessary
      }
    );
    // return response.data;
    return response;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const { protocol, host } = window.location;
      const loginUrl = `${protocol}//${host}/login`;
      window.location.href = loginUrl;
    }
    return Promise.reject(error);
  }
};

export const fetchCrmConnections = async (axiosInstance, data) => {
  try {
    const response = await axiosInstance.post(
      `/view-all-crm-connections`,
      data, // Now `data` can include viewer_id and other params
      { withCredentials: true }
    );

    const connections = response.data.connections.filter(
      (conn) => conn.is_primary
    );
    return { connections, ids: connections.map((conn) => conn.id) };
  } catch (error) {
    return Promise.reject(error);
  }
};

export const fetchPitchLayouts = async (axiosInstance) => {
  try {
    const response = await axiosInstance.post(`/all-pitch-layout-names`, {
      withCredentials: true,
    });
    return { pitchLayoutNames: response.data.pitchLayoutNames };
  } catch (error) {
    return Promise.reject(error);
  }
};

export const fetchOrgColor = async (axiosInstance, data) => {
  try {
    const response = await axiosInstance.post(`/view-organisation-details`, {
      params: data,
      withCredentials: true,
    });
    return {
      OrganisationColor: response.data.organisation.company_primary_color_hex,
    };
  } catch (error) {
    return Promise.reject(error);
  }
};

export const generateAIContent = async (axiosInstance, data) => {
  let endpoint;
  const basePayload = {
    viewerId: data.viewer_id,
    focus_area: data.focusArea,
    originURL: data.path,
  };

  // Determine endpoint and payload structure based on CRM type
  if (data.selectedCrmType === "zoho") {
    endpoint = "/generateAIDealDetails";
    basePayload.dealId = data.entityId;
  } else if (data.selectedCrmType === "hubspot") {
    endpoint = "/generateAIHubspotDealDetails";
    if (data.isAccountMode) {
      basePayload.accountId = data.entityId;
    } else {
      basePayload.dealId = data.entityId;
    }
  } else if (data.selectedCrmType === "pipedrive") {
    endpoint = "/generateAIPipedriveDealDetails";
    if (data.isAccountMode) {
      basePayload.accountId = data.entityId;
    } else {
      basePayload.dealId = data.entityId;
    }
  } else if (data.selectedCrmType === "dynamics 365") {
    endpoint = "/generateAIDynamicsDetails";
    basePayload.opportunityId = data.entityId;
  } else {
    endpoint = "/generateAIOpportunityDetails";
    basePayload.opportunityId = data.entityId;
  }

  const response = await axiosInstance.post(endpoint, basePayload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  return response; // Return the full response
};

export const fetchSalesforcePitchContentsRecommendation = async (
  axiosInstance,
  data
) => {
  try {
    const response = await axiosInstance.get(
      `/retrieve-pitch-content-recommendation`,
      {
        params: {
          viewer_id: data.viewer_id,
          salesforceId: data.salesforceId,
          originURL: data.path,
        },
        withCredentials: true,
      }
    );

    const flattenedContent = [];

    response?.data?.forEach((item) => {
      const { tag, tagName, content } = item;

      content.forEach((contentItem) => {
        // Add `tag` and `tagName` fields to each content object
        flattenedContent.push({
          ...contentItem,
          tag,
          tagName,
        });
      });
    });
    return flattenedContent;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const fetchCrmContacts = async (axiosInstance, data) => {
  try {
    const {
      selectedCrmType,
      isAccountMode,
      entityId,
      originURL,
      crmConnectionId,
      viewerId,
    } = data;

    let endpoint = "";
    let payload = { originURL, viewerId };
    console.log("getting here 4", data);
    if (selectedCrmType === "salesforce") {
      endpoint = "/getContactsForOpportunityAccount";
      payload.salesforceId = entityId;
    } else if (selectedCrmType === "zoho") {
      endpoint = "/getZohoDealOrAccountContacts";
      payload.crmConnectionId = crmConnectionId;
      if (isAccountMode) {
        payload.accountId = entityId;
      } else {
        payload.dealId = entityId;
      }
    } else if (selectedCrmType === "hubspot") {
      endpoint = "/getHubSpotDealOrAccountContacts";
      payload.crmConnectionId = crmConnectionId;
      if (isAccountMode) {
        payload.accountId = entityId;
      } else {
        payload.dealId = entityId;
      }
    } else if (selectedCrmType === "pipedrive") {
      endpoint = "/getPipedriveDealOrAccountContacts";
      payload.crmConnectionId = crmConnectionId;
      if (isAccountMode) {
        payload.accountId = entityId;
      } else {
        payload.dealId = entityId;
      }
    } else if (selectedCrmType === "dynamics 365") {
      endpoint = "/getDynamicsDealOrAccountContacts";
      payload.crmConnectionId = crmConnectionId;
      if (isAccountMode) {
        payload.accountId = entityId;
      } else {
        payload.opportunityId = entityId;
      }
    } else {
      throw new Error("Unsupported CRM type");
    }

    const response = await axiosInstance.post(endpoint, payload, {
      withCredentials: true,
    });

    // Normalize contact IDs
    const mappedContacts = response?.data.map(({ Id, id, ...rest }) => ({
      ...rest,
      id: Id || id,
    }));

    return mappedContacts;
  } catch (error) {
    if (error.response?.status === 401) {
      const { protocol, host } = window.location;
      window.location.href = `${protocol}//${host}/login`;
    }
    return Promise.reject(error);
  }
};

export const generatePitchStructure = async (axiosInstance, data) => {
  try {
    const response = await axiosInstance.post(
      `/pitch-structure-recommendation`,
      data,
      {
        withCredentials: true,
      }
    );

    return response;
  } catch (error) {
    if (error.response?.status === 401) {
      const { protocol, host } = window.location;
      window.location.href = `${protocol}//${host}/login`;
    }
    return Promise.reject(error);
  }
};

export const fetchPitchSectionsAndContents = async (axiosInstance, pitchId) => {
  try {
    console.log("Making API call with pitchId:", pitchId);
    const response = await axiosInstance.get(
      `/retrieve-pitch-sections-and-contents/${pitchId}`,
      { withCredentials: true }
    );
    console.log("API Response ----:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
};

export const fetchCRMRecordName = async (axiosInstance, data) => {
  const { viewer_id, entityId, path, pitch, organisation_id } = data;
  if (!entityId) return;
  let endpoint, payload;

  const basePayload = {
    viewerId: viewer_id,
    originURL: path,
  };

  switch (pitch) {
    case "salesforce":
      endpoint = "/getSalesforceRecordName";
      payload = { ...basePayload, salesforceId: entityId };
      break;

    case "zoho":
      endpoint = "/getZohoRecordName";
      payload = {
        ...basePayload,
        zohoId: entityId,
        organisationId: organisation_id,
      };
      break;

    case "hubspot":
      endpoint = "/getHubSpotRecordName";
      payload = {
        ...basePayload,
        hubspotId: entityId,
        organisationId: organisation_id,
      };
      break;

    case "pipedrive":
      endpoint = "/getPipedriveRecordName";
      payload = {
        ...basePayload,
        pipedriveId: entityId,
        organisationId: organisation_id,
      };
      break; 

    case "dynamics 365":
      endpoint = "/getDynamicsRecordName";
      payload = {
        ...basePayload,
        dynamicsId: entityId,
        organisationId: organisation_id,
      };
      break;

    default:
      throw new Error(`Unsupported CRM type: ${pitch.crm_type}`);
  }

  const response = await axiosInstance.post(endpoint, payload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  if (response?.data?.authUrl) {
    return response;
  }

  if (pitch === "salesforce") {
    return {
      name: response.data.Name,
      id: response.data.Id,
      type: response.data.Type === "Opportunity" ? "opportunity" : "account",
    };
  } else if (pitch == "zoho") {
    return {
      name: response.data.Deal_Name || response.data.Account_Name,
      id: response.data.id,
      type: response.data.Deal_Name ? "deal" : "account",
    };
  } else if (pitch == "hubspot") {
    return {
      name: response.data.properties.dealname || response.data.properties.name,
      id: response.data.id,
      type: response.data.properties.dealname ? "deal" : "company",
    };
  } else if (pitch == "pipedrive") {
    return {
      name: response.data.title || response.data.name,
      id: entityId,
      type: entityId.toLowerCase().includes("deals") ? "deal" : "company",
    };
  } else if (pitch == "dynamics 365") {
    return {
      name: response.data.name,
      id: response.data.opportunityid || response.data.accountid,
      type: response.data.accountid ? "account" : "opportunity",
    };
  }
};
