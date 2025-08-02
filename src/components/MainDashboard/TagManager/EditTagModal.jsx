import React, { useState, useContext, useRef, useEffect } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faEdit,
  faXmark,
  faCheck,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { CRUDButton } from "../../../utility/CustomComponents";
import { Grid } from "react-loader-spinner";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import { useSelector, useDispatch } from "react-redux";
import { fetchTagsAsync, UnSelectAll } from "../../../features/tag/tagSlice";
import toast from "react-hot-toast";
import { TbEdit } from "react-icons/tb";
import { MdRemoveCircleOutline } from "react-icons/md";
import { LuLoaderCircle } from "react-icons/lu";
import { LuTags } from "react-icons/lu";
import { evaluateLogic } from "../../../features/tag/logicHandler.js";
import { useCookies } from "react-cookie";

const EditTagModal = ({ tagToEdit, setTagToEdit }) => {
  const [isLoading, setIsLoading] = useState({
    crmConnections: false,
    salesforceObjects: false,
    proceedButton: false,
  });
  // const axiosInstance = useAxiosInstance();
  const path = window.location.href;
  // Global State variables
  const { rawCookie, setRawCookie } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  // state for creating the new tags and contain all the popup data

  const [updatedTag, setUpdatedTag] = useState({
    name: "",
    description: "",
  });

  const [tagLogic1, setTagLogic1] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [isSubmit, setIsSubmit] = useState(false);
  // Define two states: one for validation and one for form submission
  const [isValidating, setIsValidating] = useState(false);
  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [isValidationPhase, setIsValidationPhase] = useState(false);
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);

  const [cookies] = useCookies(["userData", "revspireToken"]);
    
  const token = cookies.revspireToken;
  const organisation_id = cookies.userData?.organisation?.id;

  const [addNewTag, setAddNewTag] = useState({
    name: "",
    description: "",
    addTagPopUp1: false,
    addTagPopUp2: false,
    addTagPopUp3: false,
    addTagPopUp4: false,
    crmConnections: [],
    crmConnection: "",
    crmConnectionId: "",
    connectionName: "",
    salesForceObjects: [],
    primaryObjectId: "",
    primaryObjectName: "",
    fieldDate: "",
    conditionTypes: [],
    conditionType: "",
    conditionTypeId: "",
    valueTypes: [],
    valueType: "Relative",
    relativeTypes: [],
    relativeType: "",
    absoluteType: "",
    advanceTagLogic: "",
    users: [],
    userFields: [],
    userField: "",
    tagConditions: [],
    order: "",
    fieldType: "",
    fieldId: "",
    value: "",
    conditionValueTypeId: "",
    selectedTag: {},
    editTagCondition: false,
    editTagConditionId: "",
    picklistfield: [],
    referencefield: [],
  });

  const [firstRender, setFirstRender] = useState(0);

  useEffect(() => {
    setUpdatedTag({ ...addNewTag });
  }, [addNewTag]);

  useEffect(() => {
    setFirstRender(firstRender + 1);
    if (addNewTag.tagConditions.length) {
      setToggleSliderTag(true);
      if (firstRender > 1) {
        setTagLogic1(generateTagLogic());
      }
    } else {
      setTagLogic1("");
    }
  }, [addNewTag.tagConditions]);

  // Add Tag button Function
  const addTagButtonHandler = async () => {
    try {
      setIsSubmit(true);
      // Assuming these functions are asynchronous and return promises
      await crmConnectionHandler();
      await fetchServiceUser();
      // await salesForceObjectHandler();

      setAddNewTag((prevState) => ({ ...prevState, addTagPopUp1: true }));

      setEditTagLoading(true);
      const id = tagToEdit ? tagToEdit : selectedTag[0].id;

      // Fetch the tag and conditions data
      const response = await axiosInstance.get(
        `/retrieve-tag-and-conditions/${id}?viewer_id=${viewer_id}`,
        {
          withCredentials: true, // Include credentials in the request if necessary
        }
      );

      // If the response is successful, fetch the additional required data
      if (response) {
        const [
          fieldsResponse,
          conditionTypesResponse,
          valueTypesResponse,
          relativeTypesResponse,
        ] = await Promise.all([
          axiosInstance.post(
            `/view-fieldsplusreffields`,
            {
              viewer_id,
              salesforce_object: response.data.tag.salesforce_primary_object,
            },
            { withCredentials: true }
          ),
        ]);

        const salesforceFields = response.data.tagConditions.map(
          (condition) => condition.salesforce_field
        );
        // Update the state with the fetched data
        setAddNewTag((prevState) => ({
          ...prevState,
          addTagPopUp1: true,
          addTagPopUp2: false,
          addTagPopUp4: true,
          primaryObjectId: response.data.tag.salesforce_primary_object,
          primaryObjectName:
            response.data.tag.salesforce_primary_object_api_name,
          name: response.data.tag.name,
          description: response.data.tag.description,
          advanceTagLogic: response.data.tag.advanced_tag_logic,
          picklistValues: salesforceFields,
        }));
        console.log(response);
        console.log(response.data.tag.advanced_tag_logic);
      }
    } catch (error) {
      // Handle any errors that occur during the process
      toast.error("Please try again!");
      console.error(error.message);
    } finally {
      // Ensure loading state is turned off when the operation completes
      setEditTagLoading(false);
      setIsSubmit(false);
    }
  };

  // Fetch CRM Connection
  const crmConnectionHandler = async () => {
    setIsLoading({ ...isLoading, crmConnections: true });
    try {
      const response = await axiosInstance.post(
        `/view-all-crm-connections`,
        {
          viewer_id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      setAddNewTag((prevState) => ({
        ...prevState,
        crmConnections: response.data.connections,
      }));
    } catch (error) {
      toast.error("Failed to fetch CRM connections");
    } finally {
      setIsLoading({ ...isLoading, crmConnections: false });
    }
  };

  const [serviceUserData, setServiceUserData] = useState(null);
  const [organisationId, setOrganisationId] = useState("");
  const [serviceId, setServiceId] = useState("");
  useEffect(() => {
    // Assuming rawCookie is fetched asynchronously, handle state update here
    if (rawCookie && rawCookie.organisation.id) {
      setOrganisationId(rawCookie.organisation.id);
    }
  }, [rawCookie]);

  useEffect(() => {
    if (organisationId) {
      fetchServiceUser();
    }
  }, [organisationId]);

  useEffect(() => {
    if (serviceId) {
      salesForceObjectHandler();
    }
  }, [serviceId]);

  useEffect(() => {
    // Assuming rawCookie is fetched asynchronously, handle state update here
    if (serviceUserData && serviceUserData.length > 0) {
      setServiceId(serviceUserData[0].id);
    }
  }, [serviceUserData]);

  const fetchServiceUser = async () => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        `/get-service-user`,
        {
          organisation: organisationId,
          viewer_id: viewer_id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );

      const crmConnectionId = response.data[0].id;

      // Update addNewTag state with the CRM connection ID
      setAddNewTag((prevState) => ({
        ...prevState,
        crmConnectionId: crmConnectionId,
      }));

      setServiceUserData(response.data);

      if (response.data === "CRM connection not found") {
        // setError("CRM connection not found");
      } else if (
        response.data === "Service CRM user not found in organisation"
      ) {
        // setError("Service CRM user not found in organisation");
      }
    } catch (error) {
      console.error("Error fetching service user:", error);
      // setError("An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  // View salesforce objects based on crm connection ID
  const salesForceObjectHandler = async (id) => {
    setIsLoading({ ...isLoading, salesforceObjects: true });
    try {
      const response = await axiosInstance.post(
        `/view-salesforce-objects`,
        {
          viewer_id: viewer_id,
          crm_connection: serviceId,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      setAddNewTag((prevState) => ({
        ...prevState,
        salesForceObjects: response.data.salesforceObjects,
      }));
    } catch (error) {
      //  toast.error("Failed to fetch Salesforce objects");
    } finally {
      setIsLoading({ ...isLoading, salesforceObjects: false });
    }
  };

  // Define cancelButtonHandler function
  const cancelButtonHandler = (props) => {
    function getdata() {
      <FontAwesomeIcon icon={faPlus} className=" mr-2" />;
    }
    setAddNewTag((prevState) => ({
      ...prevState,
      addTagPopUp1: false,
      addTagPopUp2: false,
      addTagPopUp3: false,
      name: "",
      description: "",
      crmConnectionId: "",
      salesForceObjects: [],
      primaryObjectId: "",
      primaryObjectName: "",
    }));
    setTagToEdit(null);
  };

  const [formSubmitted, setFormSubmitted] = useState(false);

  const areRequiredFieldsFilled = () => {
    if (
      addNewTag.name === "" ||
      addNewTag.description === "" ||
      addNewTag.crmConnectionId === "" || // Corrected variable name
      addNewTag.primaryObjectId === "" // Removed extra comma
    ) {
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (!areRequiredFieldsFilled()) {
      return;
    }
    setIsLoading({ ...isLoading, proceedButton: true });

    // Proceed to the next step in the UI
  };
  // Global State variables
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const dispatch = useDispatch();

  const [editTagLoading, setEditTagLoading] = useState(false);

  const selectedTag = useSelector((state) => state.tags.selectedTags);

  const [toggleSliderTag, setToggleSliderTag] = useState(false);

  useEffect(() => {
    if (tagToEdit) {
      addTagButtonHandler();
    }
  }, [tagToEdit, setTagToEdit]);

  useEffect(() => {
    if (!tagLogic1 && addNewTag.advanceTagLogic) {
      console.log("tagLogic1 doesn't exist");
      setTagLogic1(addNewTag.advanceTagLogic); // Only set tagLogic1, no validation here
    }
  }, [tagLogic1, addNewTag.advanceTagLogic]);

  // Function to handle parentheses and spacing
  const AdvanceTagLogicHandler = (tagLogic) => {
    console.log(tagLogic);
    if (tagLogic?.trim().charAt(0) !== "(") {
      tagLogic = "( " + tagLogic?.trim();
    }
    if (tagLogic.trim().charAt(tagLogic.trim().length - 1) !== ")") {
      tagLogic = tagLogic.trim() + " )";
    }
    console.log(tagLogic);
    const trimmedInput = tagLogic.trim().replace(/\s+/g, " ");
    console.log(trimmedInput);
    return trimmedInput;
  };

  const EditTagAndConditionsHandler = async () => {
    setIsFormSubmit(true);
    const tagConditions = addNewTag.tagConditions;
    const advanceLogic =
      addNewTag.advanceTagLogic || generateTagLogic(tagConditions);
    const formatAdvanceLogic = AdvanceTagLogicHandler(advanceLogic);
    const updatedTagConditions = [];
    for (let i = 0; i < tagConditions.length; i++) {
      console.log(tagCondition.length);
      if (tagConditions[i].hasOwnProperty("id")) {
        updatedTagConditions.push({
          ...tagConditions[i],
          fieldValue: tagConditions[i].salesforce_field,
        });
      } else {
        updatedTagConditions.push(tagConditions[i]);
      }
    }

    console.log(advanceLogic);
    const data = {
      tagId: selectedTag[0].id,
      updated_by: viewer_id,
      name: addNewTag.name,
      description: addNewTag.description,
      advanced_tag_logic: tagLogic1 ? tagLogic1 : addNewTag.advanceTagLogic,
      conditions: updatedTagConditions,
    };
    console.log(data);
    try {
      const response = await axiosInstance.post(
        `/edit-tag-and-conditions`,
        data,
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      console.log(response.data);
      if (response.data.success) {
        dispatch(
          fetchTagsAsync({ viewer_id, baseURL: baseURL, organisation_id })
        );
        dispatch(UnSelectAll());
        calcelButtonHandler();
        toast.success("Tag Updated Successfully !!");
      }

      console.log(data);
    } catch (error) {
      console.error(error);
      console.log(error.message);
    } finally {
      setIsFormSubmit(false);
      setValidationResult(null);
    }
  };

  //  state for holding  the data for the new tag conditions
  const [tagCondition, setTagConditon] = useState({
    fieldValue: "",
    fieldName: "",
    fieldType: "",
    condition_type: "",
    condition_type_name: "",
    condition_value_type_name: "Relative",
    order: 0,
    relative_value: null,
    text_value: null,
    date_value: null,
    int_value: null,
  });

  const [textFieldType, setTextFieldType] = useState([
    "string",
    "textarea",
    "url",
    "picklist",
    "reference",
    "phone",
    "email",
    "id",
    "address",
  ]);
  const [textConditions, setTextConditions] = useState([
    "Not Equals",
    "Does Not Contain",
    "Contains",
    "Equals",
  ]);

  const [intFieldType, setIntFieldType] = useState([
    "int",
    "double",
    "percent",
    "currency",
  ]);

  const [intConditons, setIntConditions] = useState([
    "Greater Than",
    "Not Equals",
    "Lesser Than Or Equals",
    "Greter Than Or Equals",
    "Lesser Than",
    "Equals",
  ]);

  const [dateField, setDateField] = useState(["datetime", "date"]);
  const [dateConditions, setDateConditons] = useState([
    "Greater Than",
    "Not Equals",
    "Lesser Than Or Equals",
    "Greter Than Or Equals",
    "Lesser Than",
    "Equals",
  ]);

  const [booleanField, setBooleanField] = useState(["boolean"]);
  const [booleanConditions, setBooleanConditons] = useState([
    "Equals",
    "Not Equals",
  ]);
  const [booleanValue, setBooleanValue] = useState(["True", "False"]);

  const [editTagCondition, setEditTagCondition] = useState({
    fieldValue: "",
    fieldName: "",
    fieldType: "",
    condition_type: "",
    condition_type_name: "",
    condition_value_type_name: "",
    order: 0,
    relative_value: null,
    text_value: null,
    date_value: null,
    int_value: null,
    selectedValueName: "",
  });

  const [editTagModal, setEditTagModal] = useState({
    id: 0,
    show: false,
  });

  // States for adding new conditions in edit mode
  const [valueSearchInput, setValueSearchInput] = useState("");
  const [valueSearchResults, setValueSearchResults] = useState([]);
  const [isValueSearching, setIsValueSearching] = useState(false);
  const [isValueSelected, setIsValueSelected] = useState(false);
  const valueSearchContainerRef = useRef(null);
  const valueSearchTimeoutRef = useRef(null);
  const socketRefValueSearch = useRef(null);

  // States for editing existing conditions
  const [editValueSearchInput, setEditValueSearchInput] = useState("");
  const [editValueSearchResults, setEditValueSearchResults] = useState([]);
  const [isEditValueSearching, setIsEditValueSearching] = useState(false);
  const [isEditValueSelected, setIsEditValueSelected] = useState(false);
  const editValueSearchContainerRef = useRef(null);
  const editValueSearchTimeoutRef = useRef(null);
  const socketRefEditValueSearch = useRef(null);

  const [isUserInputChanged, setIsUserInputChanged] = useState(false); //value input chnaged in case of edit mode
  const [isFetchingValueName, setIsFetchingValueName] = useState(false); // fetching the value name from websocket in edit tagcondition

  // state for selected field info
  const [selectedFieldInfo, setSelectedFieldInfo] = useState({
    fieldId: "",
    relationshipName: "",
    fieldType: "",
  });

  const fieldNameHandler = (fieldId) => {
    // console.log("fieldId:", fieldId);
    // console.log("userFields:", addNewTag?.userFields);

    if (
      addNewTag &&
      addNewTag.userFields &&
      Array.isArray(addNewTag.userFields)
    ) {
      const field = addNewTag.userFields.find((f) => f.id === fieldId);
      // console.log("found field:", field.processed_name);
      if (field) {
        return field.processed_name;
      }
    }
    return "Field not found";
  };

  const conditionNameHandler = (conditionId) => {
    for (let i = 0; i < addNewTag.conditionTypes.length; i++) {
      if (conditionId === addNewTag.conditionTypes[i].id) {
        return addNewTag.conditionTypes[i].name;
      }
    }
  };

  const valueNameHandler = (condition) => {
    if (condition == null) {
      return "Empty";
    }

    const valueType = addNewTag.relativeTypes.find(
      (value) => value.id === condition
    );
    return valueType.name;
  };

  // handler function for setting the addTagPopUp3 true
  const addCriteriaButtonHandler = () => {
    setAddNewTag((prevState) => ({ ...prevState, addTagPopUp3: true }));
  };

  // Add multiple field ids and types as per tag condition selection
  const FieldHandler = (name) => {
    console.log("infield");
    const field = addNewTag.userFields.find(
      (field) => field.processed_name === name
    );

    // Store the field info including relationship_name
    setSelectedFieldInfo({
      fieldId: field.id,
      relationshipName: field.relationship_name,
      fieldType: field.type,
    });

    console.log("========selectedFieldInfo=====", selectedFieldInfo);

    if (
      textFieldType.includes(field.type) ||
      intFieldType.includes(field.type) ||
      booleanField.includes(field.type)
    ) {
      setTagConditon((prevState) => ({
        ...prevState,
        fieldValue: field.id,
        fieldName: field.processed_name,
        fieldType: field.type,
        condition_type: "",
        condition_type_name: "",
        condition_value_type: addNewTag.valueTypes.find(
          (valyeType) => valyeType.name === "Absolute"
        ).id,
        condition_value_type_name: "Absolute",
        relative_value: null,
        text_value: null,
        date_value: null,
        int_value: null,
      }));
    } else {
      setTagConditon((prevState) => ({
        ...prevState,
        fieldValue: field.id,
        fieldName: field.processed_name,
        fieldType: field.type,
        condition_type: "",
        condition_type_name: "",
        condition_value_type: addNewTag.valueTypes.find(
          (valyeType) => valyeType.name === "Relative"
        ).id,
        condition_value_type_name: "Relative",
        relative_value: null,
        text_value: null,
        date_value: null,
        int_value: null,
      }));
    }
  };

  const EditFieldHandler = (name) => {
    console.log("------EditFieldHandler-----", name);
    const field = addNewTag.userFields.find(
      (field) => field.processed_name === name
    );
    // Store the field info for edit mode too
    setSelectedFieldInfo({
      fieldId: field.id,
      relationshipName: field.relationship_name,
      fieldType: field.type,
    });

    console.log("selectedFieldInfo", selectedFieldInfo);

    console.log("------field-----", field);
    if (
      textFieldType.includes(field?.type) ||
      intFieldType.includes(field?.type) ||
      booleanField.includes(field.type)
    ) {
      if (editTagCondition.hasOwnProperty("id")) {
        setEditTagCondition((prevState) => ({
          ...prevState,
          salesforce_field: field.id,
          fieldValue: field.id,
          fieldType: field.type,
          condition_type: "",
          condition_type_name: "",
          condition_value_type: addNewTag.valueTypes.find(
            (valueType) => valueType.name == "Absolute"
          ).id,
          condition_value_type_name: "Absolute",
          relative_value: null,
          text_value: null,
          int_value: null,
          date_value: null,
        }));
      } else {
        setEditTagCondition((prevState) => ({
          ...prevState,
          fieldValue: field.id,
          fieldName: field.processed_name,
          fieldType: field.type,
          condition_type: "",
          condition_type_name: "",
          condition_value_type: addNewTag.valueTypes.find(
            (valueType) => valueType.name == "Absolute"
          ).id,
          condition_value_type_name: "Absolute",
          text_value: null,
          date_value: null,
          int_value: null,
          relative_value: null,
        }));
      }
    } else {
      if (editTagCondition.hasOwnProperty("id")) {
        setEditTagCondition((prevState) => ({
          ...prevState,
          salesforce_field: field.id,
          fieldValue: field.id,
          fieldType: field.type,
          condition_type: "",
          condition_type_name: "",
          condition_value_type: addNewTag.valueTypes.find(
            (valueType) => valueType.name == "Relative"
          ).id,
          condition_value_type_name: "Relative",
          relative_value: null,
          text_value: null,
          date_value: null,
          int_value: null,
        }));
      } else {
        setEditTagCondition((prevState) => ({
          ...prevState,
          fieldValue: field.id,
          fieldName: field.processed_name,
          fieldType: field.type,
          condition_type: "",
          condition_type_name: "",
          condition_value_type: addNewTag.valueTypes.find(
            (valueType) => valueType.name == "Relative"
          ).id,
          condition_value_type_name: "Relative",
          relative_value: null,
          text_value: null,
          date_value: null,
          int_value: null,
        }));
      }
    }
  };

  // handler function for getting the condition data
  const ConditionHandler = (conditionName) => {
    // Update selectedFieldInfo for edit mode
    const condition = addNewTag.conditionTypes.find(
      (condition) => condition.name === conditionName
    );
    setTagConditon((prevState) => ({
      ...prevState,
      condition_type: condition.id,
      condition_type_name: condition.name,
      relative_value: null,
      text_value: null,
      date_value: null,
      int_value: null,
    }));
  };

  const EditConditionHandler = (conditionName) => {
    // console.log("Condtion Name" , conditionName)
    const condition = addNewTag.conditionTypes.find(
      (condition) => condition.name === conditionName
    );

    if (editTagCondition.hasOwnProperty("id")) {
      setEditTagCondition((prevState) => ({
        ...prevState,
        condition_type: condition.id,
        condition_type_name: condition.name,
        relative_value: null,
        text_value: null,
        date_value: null,
        int_value: null,
      }));
    } else {
      setEditTagCondition((prevState) => ({
        ...prevState,
        condition_type: condition.id,
        condition_type_name: condition.name,
        relative_value: null,
        text_value: null,
        date_value: null,
        int_value: null,
      }));
    }
  };

  // handler function for getting the valueType data
  const ValueTypeHandler = (valueTypeName) => {
    const valueType = addNewTag.valueTypes.find(
      (value) => value.name === valueTypeName
    );
    setTagConditon((prevState) => ({
      ...prevState,
      condition_value_type: valueType.id,
      condition_value_type_name: valueType.name,
      relative_value: null,
      text_value: null,
      date_value: null,
      int_value: null,
    }));
  };

  const EditValueTypeHandler = (valueTypeName) => {
    const valueType = addNewTag.valueTypes.find(
      (value) => value.name === valueTypeName
    );

    if (editTagCondition.hasOwnProperty("id")) {
      setEditTagCondition((prevState) => ({
        ...prevState,
        condition_value_type: valueType.id,
        condition_value_type_name: valueType.name,
        relative_value: null,
        text_value: null,
        date_value: null,
        int_value: null,
      }));
    } else {
      setEditTagCondition((prevState) => ({
        ...prevState,
        condition_value_type: valueType.id,
        condition_value_type_name: valueType.name,
        relative_value: null,
        text_value: null,
        date_value: null,
        int_value: null,
      }));
    }
  };

  const ValueHandler = (valueName) => {
    console.log("invalhnl + valuename is ", valueName);
    if (tagCondition.condition_value_type_name === "Relative") {
      const value = addNewTag.relativeTypes.find(
        (relativeType) => relativeType.name === valueName
      );
      setTagConditon((prevState) => ({
        ...prevState,
        relative_value: value?.id,
        order: addNewTag.tagConditions.length + 1,
      }));
    } else {
      if (textFieldType.includes(tagCondition.fieldType)) {
        setTagConditon((prevState) => ({
          ...prevState,
          relative_value: null,
          order: addNewTag.tagConditions.length + 1,
          text_value: valueName,
        }));
      } else if (intFieldType.includes(tagCondition.fieldType)) {
        setTagConditon((prevState) => ({
          ...prevState,
          relative_value: null,
          order: addNewTag.tagConditions.length + 1,
          int_value: valueName,
        }));
      } else {
        setTagConditon((prevState) => ({
          ...prevState,
          relative_value: null,
          order: addNewTag.tagConditions.length + 1,
          date_value: valueName,
        }));
      }
    }
  };

  const EditValueHandler = (valueName) => {
    console.log("ineditvalhandler");
    if (editTagCondition.condition_value_type_name === "Relative") {
      const value = addNewTag.relativeTypes.find(
        (relativeType) => relativeType.name === valueName
      );
      setEditTagCondition((prevState) => ({
        ...prevState,
        relative_value: value.id,
      }));
    } else {
      if (textFieldType.includes(editTagCondition.fieldType)) {
        setEditTagCondition((prevState) => ({
          ...prevState,
          relative_value: null,
          text_value: valueName,
        }));
      } else if (intFieldType.includes(editTagCondition.fieldType)) {
        setEditTagCondition((prevState) => ({
          ...prevState,
          relative_value: null,
          int_value: valueName,
        }));
      } else {
        setEditTagCondition((prevState) => ({
          ...prevState,
          relative_value: null,
          date_value: valueName,
        }));
      }
    }
  };

  // Handler function for deleting the tag conditions
  const DeleteTagConditionHandler = (id) => {
    const updatedTagConditions = addNewTag.tagConditions.filter(
      (condition) => condition.order !== id
    );
    const tagCondition = updatedTagConditions.map((condition, index) => ({
      ...condition,
      order: index + 1,
    }));
    setAddNewTag((prevState) => ({
      ...prevState,
      tagConditions: tagCondition,
    }));
  };

  const AddTagPopUpCleaner = () => {
    setAddNewTag((prevState) => ({
      ...prevState,
      addTagPopUp3: false,
    }));
    setTagConditon({
      fieldValue: "",
      fieldName: "",
      fieldType: "",
      condition_type: "",
      condition_type_name: "",
      condition_value_type_name: "Relative",
      order: 0,
      relative_value: null,
      text_value: null,
      date_value: null,
      int_value: null,
    });
  };

  const AddTagPopUpEditCleaner = () => {
    setEditTagCondition({
      fieldValue: "",
      fieldName: "",
      fieldType: "",
      condition_type: "",
      condition_type_name: "",
      condition_value_type_name: "",
      order: 0,
      relative_value: null,
      text_value: null,
      date_value: null,
      int_value: null,
    });
    setEditTagModal({
      order: 0,
      show: false,
    });
  };

  const AddTagCondition = () => {
    setAddNewTag((prevState) => ({
      ...prevState,
      addTagPopUp3: false,
      tagConditions: [...addNewTag.tagConditions, tagCondition],
    }));

    setTagConditon({
      fieldValue: "",
      fieldName: "",
      fieldType: "",
      condition_type: "",
      condition_type_name: "",
      condition_value_type: addNewTag.valueTypes.find(
        (valueType) => valueType.name === "Relative"
      ).id,
      condition_value_type_name: "Relative",
      order: 0,
      relative_value: null,
      text_value: null,
      date_value: null,
      int_value: null,
    });
  };

  useEffect(() => {
    if (selectedFieldInfo.relationshipName && editTagCondition.text_value) {
      const fetchNameById = () => {
        setIsFetchingValueName(true); //loader start
        const wsBaseURL = baseURL.replace("https://", "wss://") + "/wss/";
        // Format the protocol header with "token=" prefix
        const wsInstance = new WebSocket(wsBaseURL, [token]);

        wsInstance.onopen = () => {
          console.log("WebSocket connection opened for fetching name by ID");
          wsInstance.send(
            JSON.stringify({
              type: "salesforce_search",
              payload: {
                crmConnectionId: addNewTag.crmConnectionId,
                objectName: selectedFieldInfo.relationshipName, // Use the updated relationshipName
                searchTerm: editTagCondition.text_value, // Use the ID to fetch the name
                fieldNames: ["Name", "Description", "Id"],
              },
            })
          );
        };

        wsInstance.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("data is here ======>>>>>", data);
          if (
            data.status === "success" &&
            Array.isArray(data.searchResults) &&
            data.searchResults.length > 0
          ) {
            const result = data.searchResults[0];
            console.log("here is === =the data result :", result);
            setEditValueSearchInput(result.Name); // Prefill with the name from the response
          } else {
            console.warn("Failed to fetch results");
          }
          setIsFetchingValueName(false); //stop loader
          wsInstance.close(); // Close the WebSocket connection after processing
        };

        wsInstance.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsFetchingValueName(false); //stop loader
        };

        wsInstance.onclose = () => {
          console.log("=======  2 WebSocket connection closed");
          setIsFetchingValueName(false); //stop loader
        };
      };

      fetchNameById(); // Call the function to fetch the name
    }
  }, [selectedFieldInfo, editTagCondition.text_value]);

  const editTagConditionHandler = async (id) => {
    console.log("Edit tag condition handler", id);

    // Find the condition to edit based on the provided ID
    const conditionToEdit = addNewTag.tagConditions.find(
      (condition) => condition.order === id
    );

    setEditTagCondition(conditionToEdit);
    // setEditValueSearchInput(conditionToEdit.text_value || "");
    setEditValueSearchInput("");
    setIsUserInputChanged(false);

    console.log("===== condition to edit ", conditionToEdit);

    // Find the field information based on the salesforce_field or fieldValue
    const field = addNewTag.userFields.find(
      (field) =>
        field.id ===
        (conditionToEdit.salesforce_field || conditionToEdit.fieldValue)
    );

    console.log("===field", field);
    console.log("add new from edit tag condition ", addNewTag);

    // Set selected field information if the field is found
    if (field) {
      setSelectedFieldInfo({
        fieldId: field.id,
        relationshipName: field.relationship_name,
        fieldType: field.type,
      });
    }

    console.log(
      "Selected value name: ====",
      conditionToEdit?.selectedValueName
    );

    // If the field type is a reference, prepare for editing
    if (conditionToEdit?.fieldType === "reference") {
      setIsEditValueSelected(false);
    }

    // If the condition has an ID, set additional properties
    if (conditionToEdit.hasOwnProperty("id")) {
      setEditTagCondition({
        ...conditionToEdit,
        fieldType: addNewTag.userFields.find(
          (field) => field.id === conditionToEdit.salesforce_field
        ).type,
        condition_value_type_name: addNewTag.valueTypes.find(
          (valueType) => valueType.id === conditionToEdit.condition_value_type
        ).name,
        condition_type_name: addNewTag.conditionTypes.find(
          (condition) => condition.id === conditionToEdit.condition_type
        ).name,
      });

      const fieldId = addNewTag.userFields.find(
        (field) => field.id === conditionToEdit.salesforce_field
      ).id;

      const fieldType = addNewTag.userFields.find(
        (field) => field.id === conditionToEdit.salesforce_field
      ).type;

      // Handle specific field types
      if (fieldType === "picklist") {
        await picklistHandler(fieldId);
      }
    } else {
      // If no ID, set the condition value type name
      setEditTagCondition({
        ...conditionToEdit,
        condition_value_type_name: addNewTag.valueTypes.find(
          (valueType) => valueType.id === conditionToEdit.condition_value_type
        ).name,
      });
    }

    // Show the edit tag modal
    setEditTagModal({
      id: id,
      show: true,
    });
  };

  const EditTagConditionHandler = () => {
    const updatedTagConditions = [];
    const conditions = addNewTag.tagConditions;
    for (let i = 0; i < conditions.length; i++) {
      if (conditions[i].order === editTagCondition.order) {
        updatedTagConditions.push(editTagCondition);
      } else {
        updatedTagConditions.push(conditions[i]);
      }
    }
    setAddNewTag((prevState) => ({
      ...prevState,
      tagConditions: updatedTagConditions,
    }));

    console.log("edit tag condtiopn", tagCondition);
    setEditTagCondition({
      fieldValue: "",
      fieldName: "",
      fieldType: "",
      condition_type: "",
      condition_type_name: "",
      condition_value_type_name: "",
      order: 0,
      relative_value: null,
      text_value: null,
      date_value: null,
      int_value: null,
    });
    setEditTagModal({
      order: 0,
      show: false,
    });
  };

  const calcelButtonHandler = () => {
    setAddNewTag((prevState) => ({
      ...prevState,
      addTagPopUp2: false,
      addTagPopUp3: false,
    }));
    setTagConditon({
      fieldValue: "",
      fieldName: "",
      fieldType: "",
      condition_type: "",
      condition_type_name: "",
      condition_value_type_name: "Relative",
      order: 0,
      relative_value: null,
      text_value: null,
      date_value: null,
      int_value: null,
    });
    setEditTagCondition({
      fieldValue: "",
      fieldName: "",
      fieldType: "",
      condition_type: "",
      condition_type_name: "",
      condition_value_type_name: "Relative",
      order: 0,
      relative_value: null,
      text_value: null,
      date_value: null,
      int_value: null,
    });
    setEditTagModal({
      id: 0,
      show: false,
    });
  };

  const picklistHandler = async (fieldValue) => {
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        `/getSalesforcePicklistValues`,
        {
          viewerId: viewer_id,
          salesforce_field_id: fieldValue,
          originURL: path,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      setAddNewTag((prevState) => ({
        ...prevState,
        picklistfield: response.data.picklistValues,
      }));
      setLoading(false);
    } catch (error) {
      console.log("error for fetch picklist ");
      setIsLoading(false);
    }
  };

  // Cleanup for adding new conditions
  const cleanupValueSearch = () => {
    setValueSearchInput("");
    setValueSearchResults([]);
    setIsValueSelected(false);
    setIsValueSearching(false);
    if (socketRefValueSearch.current) {
      socketRefValueSearch.current.close();
      socketRefValueSearch.current = null;
    }
  };

  // Cleanup for editing existing conditions
  const cleanupEditValueSearch = () => {
    setEditValueSearchInput("");
    setEditValueSearchResults([]);
    setIsEditValueSelected(false);
    setIsEditValueSearching(false);
    if (socketRefEditValueSearch.current) {
      socketRefEditValueSearch.current.close();
      socketRefEditValueSearch.current = null;
    }
  };

  // WebSocket effect for adding new conditions
  useEffect(() => {
    let wsInstance = null;

    const setupWebSocket = () => {
      if (
        valueSearchInput.length >= 2 &&
        !isValueSelected &&
        tagCondition.fieldType === "reference" &&
        tagCondition.fieldValue
      ) {
        if (socketRefValueSearch.current) {
          socketRefValueSearch.current.close();
          socketRefValueSearch.current = null;
        }

        const wsBaseURL = baseURL.replace("https://", "wss://") + "/wss/";
        // Format the protocol header with "token=" prefix
        wsInstance = new WebSocket(wsBaseURL, [token]);
        socketRefValueSearch.current = wsInstance;

        wsInstance.onopen = () => {
          console.log(
            "WebSocket connection opened for add condition value search"
          );
          wsInstance.send(
            JSON.stringify({
              type: "salesforce_search",
              payload: {
                crmConnectionId: addNewTag.crmConnectionId,
                objectName: selectedFieldInfo.relationshipName,
                searchTerm: valueSearchInput,
                fieldNames: ["Name", "Description", "Id"],
              },
            })
          );
          setIsValueSearching(true);
        };

        wsInstance.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.status === "success") {
            if (Array.isArray(data.searchResults)) {
              // Handle ID search result (single result)
              console.log("ID search result here:", data.searchResults);
              setValueSearchResults([data.searchResults[0]]); // Wrap in an array for consistency
            } else if (data.searchResults?.searchRecords) {
              // Handle text search results (multiple results)
              console.log(
                "Text search results here:",
                data.searchResults.searchRecords
              );
              setValueSearchResults(data.searchResults.searchRecords);
            }
          } else if (data.status === "error") {
            if (data.error === "expired access/refresh token") {
              // Display error toast for expired access token
              const errorToastId = toast.error(
                "Tokens expired. Please login to Salesforce.",
                {
                  style: { whiteSpace: "nowrap", maxWidth: "500px" },
                }
              );
              console.error("Error :", data);

              // Dismiss the error toast after a short delay
              setTimeout(() => {
                toast.dismiss(errorToastId);

                const loadingToastId = toast.loading(
                  "Redirecting to the Salesforce Login Page"
                );

                // Redirect after a short delay
                setTimeout(() => {
                  toast.dismiss(loadingToastId);
                  window.location.href = authURL;
                }, 1000);
              }, 3000); // Adjust the delay for the error toast
            }
          }

          setIsValueSearching(false);
        };

        wsInstance.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsValueSearching(false);
          setValueSearchResults([]);
        };

        wsInstance.onclose = () => {
          console.log("WebSocket connection closed");
          socketRefValueSearch.current = null;
        };
      }
    };

    if (valueSearchTimeoutRef.current) {
      clearTimeout(valueSearchTimeoutRef.current);
    }

    valueSearchTimeoutRef.current = setTimeout(() => {
      setupWebSocket();
    }, 300);

    return () => {
      if (valueSearchTimeoutRef.current) {
        clearTimeout(valueSearchTimeoutRef.current);
      }
      if (wsInstance) {
        wsInstance.close();
        wsInstance = null;
        socketRefValueSearch.current = null;
      }
    };
  }, [
    valueSearchInput,
    tagCondition.fieldType,
    tagCondition.fieldValue,
    isValueSelected,
    baseURL,
  ]);

  // WebSocket effect for editing existing conditions
  useEffect(() => {
    let wsInstance = null;

    const setupWebSocket = () => {
      console.log("seeting the websocketr");
      if (
        editValueSearchInput.length >= 2 &&
        !isEditValueSelected &&
        editTagCondition.fieldType === "reference"
      ) {
        if (socketRefEditValueSearch.current) {
          console.log("closing the websocket");
          socketRefEditValueSearch.current.close();
          socketRefEditValueSearch.current = null;
        }
        console.log("opening the websocket");

        const wsBaseURL = baseURL.replace("https://", "wss://") + "/wss/";
        // Format the protocol header with "token=" prefix
        wsInstance = new WebSocket(wsBaseURL, [token]);
        socketRefEditValueSearch.current = wsInstance;

        console.log(
          "=====selected field in fo here=============",
          selectedFieldInfo
        );

        wsInstance.onopen = () => {
          console.log(
            "WebSocket connection opened for edit condition value search"
          );
          wsInstance.send(
            JSON.stringify({
              type: "salesforce_search",
              payload: {
                crmConnectionId: addNewTag.crmConnectionId,
                objectName: selectedFieldInfo.relationshipName,
                searchTerm: editValueSearchInput,
                fieldNames: ["Name", "Description", "Id"],
              },
            })
          );
          setIsEditValueSearching(true);
        };

        wsInstance.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.status === "success") {
            if (Array.isArray(data.searchResults)) {
              // Handle ID search result
              console.log("ID search result here:", data.searchResults);
              setEditValueSearchResults([data.searchResults[0]]);
            } else if (data.searchResults?.searchRecords) {
              // Handle text search results (multiple results)
              console.log(
                "Text search results here:",
                data.searchResults.searchRecords
              );
              setEditValueSearchResults(data.searchResults.searchRecords);
            }
          } else if (data.status === "error") {
            if (data.error === "expired access/refresh token") {
              // Display error toast for expired access token
              const errorToastId = toast.error(
                "Tokens expired. Please login to Salesforce.",
                {
                  style: { whiteSpace: "nowrap", maxWidth: "500px" },
                }
              );
              console.error("Error :", data);

              // Dismiss the error toast after a short delay
              setTimeout(() => {
                toast.dismiss(errorToastId);
                // Show loading toast for redirecting to Salesforce
                const loadingToastId = toast.loading(
                  "Redirecting to the Salesforce Login Page"
                );
                // Redirect after a short delay
                setTimeout(() => {
                  toast.dismiss(loadingToastId);
                  window.location.href = authURL;
                }, 1000);
              }, 3000);
            } else {
              console.error("Received invalid data format:", data);
              setEditValueSearchResults([]);
            }
          }
          setIsEditValueSearching(false);
        };

        wsInstance.onerror = (error) => {
          console.error("WebSocket error in edit mode:", error);
          setIsEditValueSearching(false);
          setEditValueSearchResults([]);
        };

        wsInstance.onclose = () => {
          console.log("WebSocket connection closed for edit mode");
          socketRefEditValueSearch.current = null;
        };
      }
    };

    if (editValueSearchTimeoutRef.current) {
      clearTimeout(editValueSearchTimeoutRef.current);
    }

    editValueSearchTimeoutRef.current = setTimeout(() => {
      if (editValueSearchInput.length >= 3 && isUserInputChanged) {
        // Proceed with WebSocket setup
        setupWebSocket();
      }
    }, 300);

    return () => {
      if (editValueSearchTimeoutRef.current) {
        clearTimeout(editValueSearchTimeoutRef.current);
      }

      if (wsInstance) {
        wsInstance.close();
        wsInstance = null;
        socketRefEditValueSearch.current = null;
      }
    };
  }, [
    editValueSearchInput,
    editTagCondition.fieldType,
    editTagCondition.fieldValue,
    isEditValueSelected,
    baseURL,
  ]);

  // Cleanup effect for adding new conditions - click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        valueSearchContainerRef.current &&
        !valueSearchContainerRef.current.contains(event.target)
      ) {
        if (!isValueSelected) {
          setValueSearchResults([]);
          setValueSearchInput("");

          if (socketRefValueSearch.current) {
            console.log(
              "WebSocket disconnected due to clicking outside in add mode"
            );
            socketRefValueSearch.current.close();
            socketRefValueSearch.current = null;
          }
          cleanupValueSearch();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isValueSelected]);

  // Cleanup effect for editing conditions - click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        editValueSearchContainerRef.current &&
        !editValueSearchContainerRef.current.contains(event.target)
      ) {
        if (!isEditValueSelected) {
          setEditValueSearchResults([]);
          setEditValueSearchInput("");

          if (socketRefEditValueSearch.current) {
            console.log(
              "WebSocket disconnected due to clicking outside in edit mode"
            );
            socketRefEditValueSearch.current.close();
            socketRefEditValueSearch.current = null;
          }
          cleanupEditValueSearch();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditValueSelected]);

  // Cleanup on component unmount - for both modes
  useEffect(() => {
    return () => {
      cleanupValueSearch();
      cleanupEditValueSearch();
    };
  }, []);

  // Cleanup when condition type changes - for add mode
  useEffect(() => {
    cleanupValueSearch();
  }, [tagCondition.condition_type_name]);

  if (editTagLoading) {
    return (
      <div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
          <div className="bg-transparent p-6 rounded-md z-50 w-auto">
            <Grid
              visible={true}
              height="40"
              width="40"
              color="#075985"
              ariaLabel="grid-loading"
              radius="12.5"
              wrapperStyle={{}}
              wrapperClass="grid-wrapper"
            />
          </div>
        </div>
      </div>
    );
  }

  const editTagButtonHandler = async () => {
    setEditTagLoading(true);
    const id = tagToEdit ? tagToEdit : selectedTag[0].id;
    try {
      const response = await axiosInstance.get(
        `/retrieve-tag-and-conditions/${id}?viewer_id=${viewer_id}`,
        {
          withCredentials: true, // Include credentials in the request if necessary
        }
      );
      if (response) {
        try {
          // Fetch data from the first endpoint
          const fieldsResponse = await axiosInstance.post(
            `/view-fieldsplusreffields`,
            {
              viewer_id,
              salesforce_object: response.data.tag.salesforce_primary_object,
            },
            {
              withCredentials: true, // Include credentials in the request
            }
          );
          // Fetch data from the other endpoints
          const conditionTypesResponse = await axiosInstance.post(
            `/retrieve-condition-types`,
            {
              viewer_id: viewer_id,
            },
            {
              withCredentials: true, // Include credentials in the request
            }
          );
          // Fetch value types
          const valueTypesResponse = await axiosInstance.post(
            `/retrieve-condition-value-types`,
            {
              viewer_id: viewer_id,
            },
            {
              withCredentials: true, // Include credentials in the request
            }
          );
          // Fetch relative types
          const relativeTypesResponse = await axiosInstance.post(
            `/retrieve-relative-values`,
            {
              viewer_id: viewer_id,
            },
            {
              withCredentials: true, // Include credentials in the request
            }
          );

          // Update the state with the fetched data
          setAddNewTag((prevState) => ({
            ...prevState,
            addTagPopUp1: false,
            addTagPopUp2: true,
            addTagPopUp4: true,
            primaryObjectId: response.data.tag.salesforce_primary_object,
            primaryObjectName:
              response.data.tag.salesforce_primary_object_api_name,
            name: updatedTag.name,
            description: updatedTag.description,
            crmConnection: response.data.crmConnectionDetails,
            tagConditions: response.data.tagConditions,
            conditionTypes: conditionTypesResponse.data.data,
            valueTypes: valueTypesResponse.data.data,
            relativeTypes: relativeTypesResponse.data.data,
            userFields: fieldsResponse.data.data,
          }));
        } catch (error) {
          toast.error("Please try again!");
          console.log(error.message);
        }
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setEditTagLoading(false);
    }
  };

  const generateTagLogic = () => {
    const length = addNewTag.tagConditions.length;
    let tagLogic = "( ";
    for (let i = 1; i <= length; i++) {
      tagLogic += `${i}`;
      if (i < length) {
        tagLogic += " AND ";
      }
    }
    tagLogic += " )";
    return tagLogic;
  };

  // console.log("Length :",addNewTag.tagConditions.length);

  const handleValidateAndSubmit = async () => {
    setIsValidating(true);
    setIsFormSubmit(true);
    setIsSubmitClicked(true); // This is the trigger for showing validation messages

    // If `tagLogic1` is empty but `addNewTag.advanceTagLogic` exists, set it
    if (!tagLogic1 && addNewTag.advanceTagLogic) {
      console.log("Setting tagLogic1 to:", addNewTag.advanceTagLogic);
      setTagLogic1(addNewTag.advanceTagLogic);

      // Perform validation after setting tagLogic1
      const result = evaluateLogic(
        addNewTag.advanceTagLogic,
        addNewTag.tagConditions.length
      );
      console.log("Validation result with addNewTag:", result);
      setValidationResult(result);

      if (result?.status === "error") {
        // console.log("Validation failed", result);
        setIsFormSubmit(false);
        setIsValidating(false);
        return; // Exit to prevent submission
      }
    } else {
      // Perform validation if tagLogic1 is already set
      const result = evaluateLogic(tagLogic1, addNewTag.tagConditions.length);
      // console.log("Validation with tagLogic1:", result);
      setValidationResult(result); // Set the validation result for failure

      if (result?.status === "failure") {
        console.error("Validation failed", result);
        setIsFormSubmit(false);
        setIsValidating(false);
        return; // Stop the submission
      }
    }

    // Proceed with form submission if validation passes
    try {
      const result = evaluateLogic(
        tagLogic1 ? tagLogic1 : addNewTag.advanceTagLogic,
        addNewTag.tagConditions.length
      );
      setValidationResult(result); // Update the validation result

      if (result.status === "success") {
        setValidationResult(result); // Clear validation error on success
        await EditTagAndConditionsHandler(); // Proceed if validation succeeds
      }
    } catch (error) {
      console.error("Form submission failed", error);
    }

    setIsFormSubmit(false);
    setIsValidating(false);
    setIsSubmitClicked(false);
    // setValidationResult(null);
  };

  return (
    <div className="">
      {/* {console.log("tagConditionhere ,", tagCondition)}
      {console.log("edittagcondition value here", editTagCondition)}
      {console.log("Add new tag here,", addNewTag)} */}

      <div>
        {addNewTag.addTagPopUp2 && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 bg-gray-800 bg-opacity-50"></div>
            <div className="bg-white px-6 py-2 rounded-xl shadow-2xl max-w-2xl w-full min-h-[457px] max-h-[calc(100vh-2%)] relative overflow-scroll">
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Edit Tag
              </h3>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Left column */}
                <div className="w-full md:w-[50%] space-y-4">
                  <div className="bg-gray-50 p-4 border border-neutral-200 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Name</span>
                        <div className="font-medium bg-white border text-sm border-gray-200 px-3 py-2 rounded-md text-gray-700">
                          {updatedTag.name}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Primary Object
                        </span>
                        <div className="font-medium bg-white border text-sm border-gray-200 px-3 py-2 rounded-md text-gray-700">
                          {addNewTag.primaryObjectName}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Connection
                        </span>
                        <div className="font-medium bg-white border text-sm border-gray-200 px-3 py-2 rounded-md text-gray-700">
                          {addNewTag.connectionName.split(" ")[0] +
                            " " +
                            addNewTag.crmConnection[0].crm +
                            " " +
                            "Connection"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex gap-2 mb-4 items-center">
                      <button
                        onClick={() => {
                          setToggleSliderTag(!toggleSliderTag);

                          if (toggleSliderTag) {
                            // Reset the validation result when logic is removed
                            const result = evaluateLogic(
                              setAddNewTag.advanceTagLogic,
                              addNewTag.tagConditions.length
                            );
                            console.log("heloooo...................from here");
                            setValidationResult(result);
                          } else {
                            // Initialize tagLogic1 with the value from addNewTag.advanceTagLogic when opening the input
                            // Ensure that it only initializes if tagLogic1 is empty (after submission)
                            setTagLogic1(
                              tagLogic1 ? tagLogic1 : addNewTag.advanceTagLogic
                            );
                            const result = evaluateLogic(
                              tagLogic1,
                              addNewTag.tagConditions.length
                            );
                            setValidationResult(result);
                          }
                        }}
                        className={`px-2 h-[30px] shrink-0 flex justify-center items-center text-sm btn-secondary transition-colors border ${
                          toggleSliderTag
                            ? "w-[20%] text-red-600 py-2 bg-red-100 rounded-lg hover:bg-red-200 border-red-200"
                            : "w-[20%] text-white py-1"
                        }`}
                      >
                        {toggleSliderTag ? "Remove" : "Edit"}
                      </button>

                      {!toggleSliderTag ? (
                        <input
                          type="text"
                          value={
                            tagLogic1 ||
                            addNewTag?.advanceTagLogic ||
                            "Enter logic here"
                          }
                          disabled
                          className="p-2 h-[30px] w-full outline-none text-sm bg-neutral-200 border border-neutral-300 rounded-lg text-neutral-800"
                        />
                      ) : (
                        <div className="flex w-[75%] items-center gap-2">
                          <input
                            type="text"
                            value={tagLogic1 || ""} // Use tagLogic1 here
                            className="p-2 h-[30px] outline-none text-sm bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500 w-full"
                            onChange={(e) => setTagLogic1(e.target.value)} // Update tagLogic1 when the user types
                          />
                        </div>
                      )}
                    </div>

                    {isSubmitClicked && validationResult ? (
                      <div
                        className={`text-sm ml-2 ${
                          validationResult.status === "success"
                            ? "text-green-500"
                            : "text-red-500 tracking-tighter"
                        }`}
                      >
                        {validationResult.message}
                      </div>
                    ) : (
                      <div className="text-sm ml-2 text-neutral-500 tracking-tight">
                        Example: ( ( 1 AND 2 ) OR ( 3 OR 4 ) )
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={addCriteriaButtonHandler}
                    className={`px-2 py-2  h-[30px] shrink-0 flex justify-center items-center text-sm btn-secondary w-full text-white`}
                  >
                    Add Criteria
                  </button>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {addNewTag.tagConditions.map((condition, id) => (
                      <div className="w-full" key={id}>
                        {editTagModal.show === true &&
                        editTagModal.id == condition.order ? null : (
                          <div
                            key={id}
                            className="flex border bg-neutral-100  border-neutral-300 items-center rounded-md gap-3 pr-2 my-2  justify-between w-full"
                          >
                            <div className="flex gap-1 relative overflow-hidden items-center">
                              <div className="text-neutral-700 absolute bg-neutral-200 border-r border-r-neutral-300  font-medium w-[25px] h-full text-sm  flex justify-center items-center">
                                {condition.order}
                              </div>
                              <div className="flex-1 ml-7">
                                <p
                                  className="text-sm text-neutral-700 truncate min-w-[11ch] max-w-[11ch] py-1  tracking-tight"
                                  title={
                                    condition.hasOwnProperty("id")
                                      ? fieldNameHandler(
                                          condition.salesforce_field
                                        )
                                      : condition.fieldName
                                  }
                                >
                                  {condition.hasOwnProperty("id")
                                    ? fieldNameHandler(
                                        condition.salesforce_field
                                      )
                                    : condition.fieldName}
                                </p>
                              </div>

                              <div className="flex-1">
                                <p
                                  className="text-sm text-neutral-700 truncate min-w-[7ch] max-w-[7ch] py-1  tracking-tight"
                                  title={
                                    condition.hasOwnProperty("id")
                                      ? conditionNameHandler(
                                          condition.condition_type
                                        )
                                      : condition.condition_type_name
                                  }
                                >
                                  {condition.hasOwnProperty("id")
                                    ? conditionNameHandler(
                                        condition.condition_type
                                      )
                                    : condition.condition_type_name}
                                </p>
                              </div>

                              <div className="flex-1">
                                <p
                                  className="text-sm text-neutral-700 truncate min-w-[10ch] max-w-[10ch] py-1 pr-2 tracking-tight"
                                  title={
                                    condition.condition_value_type_name ===
                                    "Relative"
                                      ? valueNameHandler(
                                          condition.relative_value
                                        )
                                      : condition.text_value != null
                                      ? condition.text_value
                                      : condition.int_value != null
                                      ? condition.int_value
                                      : condition.date_value
                                  }
                                >
                                  {condition.condition_value_type_name ===
                                  "Relative"
                                    ? valueNameHandler(condition.relative_value)
                                    : condition.text_value != null
                                    ? condition.text_value
                                    : condition.int_value != null
                                    ? condition.int_value
                                    : condition.date_value}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-center shrink-0  text-lg items-center">
                              {/* Edit Tag Conditions */}
                              <button
                                onClick={() => {
                                  editTagConditionHandler(condition.order);
                                }}
                                className="text-neutral-700 mx-1 active:scale-95 transition-all"
                              >
                                <TbEdit />
                              </button>
                              <button
                                onClick={() => {
                                  DeleteTagConditionHandler(condition.order);
                                }}
                                className="text-red-600 active:scale-95 transition-all"
                              >
                                <MdRemoveCircleOutline />
                              </button>
                              {/* Delete Tag Conditions */}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column */}
                <div className="w-full md:w-[50%]">
                  {addNewTag.addTagPopUp3 || editTagModal.show ? (
                    <div
                      className={`  ${
                        addNewTag.addTagPopUp3 || editTagModal.show
                          ? ""
                          : " rounded-lg p-2  border bg-neutral-50 border-neutral-200"
                      }`}
                    >
                      {(addNewTag.addTagPopUp3 || editTagModal.show) && (
                        <div className="w-full ">
                          {addNewTag.addTagPopUp3 && (
                            <div className={` mb-4`}>
                              <div className="px-4 md:px-5 py-3 bg-neutral-50 relative border overflow-hidden rounded-lg">
                                <form
                                  className="space-y-2"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    AddTagCondition();
                                  }}
                                >
                                  <div className="flex justify-center">
                                    <div className=" absolute left-2 top-2 border  rounded  flex justify-center  items-center gap-1 text-xs bg-cyan-50  text-cyan-700 font-semibold px-1 py-[2px]">
                                      <LuTags className=" text-base" /> Add tag
                                      condition #
                                      {addNewTag.tagConditions.length + 1}
                                    </div>
                                    <div className="flex flex-col items-center mt-4 justify-between">
                                      {/* Field Value selection */}
                                      <div className="mt-2 mb-1">
                                        <label className="w-28 inline-block mb-2 text-sm  text-neutral-700 font-semibold dark:text-white">
                                          Field
                                        </label>
                                        <select
                                          id="field"
                                          required
                                          className="inline-block  bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                          value={tagCondition.fieldName || ""}
                                          onChange={(e) => {
                                            FieldHandler(e.target.value);
                                          }}
                                          onClick={() => {
                                            if (
                                              tagCondition.fieldType ==
                                              "picklist"
                                            ) {
                                              picklistHandler(
                                                tagCondition.fieldValue
                                              );
                                            }

                                            if (
                                              tagCondition.fieldType ==
                                              "reference"
                                            ) {
                                              // referenceHandler(
                                              //   tagCondition.fieldValue
                                              // );
                                            }
                                          }}
                                        >
                                          <option value="">Select Field</option>
                                          {Array.isArray(
                                            addNewTag.userFields
                                          ) &&
                                            addNewTag.userFields.map((user) => (
                                              <option
                                                key={user.id}
                                                value={user.processed_name}
                                              >
                                                {user.processed_name}
                                              </option>
                                            ))}
                                        </select>
                                      </div>

                                      {/* Condition Value selection */}
                                      <div className="mb-1">
                                        <label
                                          id="condition"
                                          className=" w-28 inline-block mb-2 text-sm  text-neutral-700 font-semibold dark:text-white"
                                        >
                                          Condition
                                        </label>
                                        <select
                                          required
                                          id="condition"
                                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 inline-block w-full py-1 px-2 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                          value={
                                            tagCondition.condition_type_name
                                          }
                                          onChange={(e) => {
                                            ConditionHandler(e.target.value);
                                          }}
                                        >
                                          <option value="">
                                            Select Condition
                                          </option>
                                          {!textFieldType.includes(
                                            tagCondition.fieldType
                                          ) &&
                                            !intFieldType.includes(
                                              tagCondition.fieldType
                                            ) &&
                                            !booleanField.includes(
                                              tagCondition.fieldType
                                            ) &&
                                            !dateField.includes(
                                              tagCondition.fieldType
                                            ) &&
                                            addNewTag.conditionTypes.map(
                                              (condition) => (
                                                <option
                                                  key={condition.id}
                                                  value={condition.name}
                                                >
                                                  {condition.name}
                                                </option>
                                              )
                                            )}
                                          {booleanField.includes(
                                            tagCondition.fieldType
                                          ) &&
                                            booleanConditions.map(
                                              (condition) => (
                                                <option
                                                  key={condition}
                                                  value={condition}
                                                >
                                                  {condition}
                                                </option>
                                              )
                                            )}
                                          {textFieldType.includes(
                                            tagCondition.fieldType
                                          ) &&
                                            textConditions.map((condition) => (
                                              <option
                                                key={condition}
                                                value={condition}
                                              >
                                                {condition}
                                              </option>
                                            ))}
                                          {intFieldType.includes(
                                            tagCondition.fieldType
                                          ) &&
                                            intConditons.map((condition) => (
                                              <option
                                                key={condition}
                                                value={condition}
                                              >
                                                {condition}
                                              </option>
                                            ))}
                                          {dateField.includes(
                                            tagCondition.fieldType
                                          ) &&
                                            dateConditions.map((condition) => (
                                              <option
                                                key={condition}
                                                value={condition}
                                              >
                                                {condition}
                                              </option>
                                            ))}
                                        </select>
                                      </div>

                                      {/* Value Type selection */}
                                      <div className="mb-1 w-full">
                                        <label
                                          id="valueType"
                                          className="w-28 inline-block mb-2 text-sm  text-neutral-700 font-semibold dark:text-white"
                                        >
                                          Value Type
                                        </label>
                                        <select
                                          required
                                          id="valueType"
                                          disabled={[
                                            "Null",
                                            "Not Null",
                                          ].includes(
                                            tagCondition.condition_type_name
                                          )}
                                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 inline-block w-full px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                          value={
                                            tagCondition.condition_value_type_name
                                          }
                                          onChange={(e) => {
                                            ValueTypeHandler(e.target.value);
                                          }}
                                        >
                                          {dateField.includes(
                                            tagCondition.fieldType
                                          )
                                            ? addNewTag.valueTypes.map(
                                                (value) => (
                                                  <option
                                                    key={value.id}
                                                    value={value.name}
                                                  >
                                                    {value.name}
                                                  </option>
                                                )
                                              )
                                            : addNewTag.valueTypes
                                                .filter(
                                                  (value) =>
                                                    value.name != "Relative"
                                                )
                                                .map((value) => (
                                                  <option
                                                    key={value.id}
                                                    value={value.name}
                                                  >
                                                    {value.name}
                                                  </option>
                                                ))}
                                        </select>
                                      </div>

                                      {/* Value selection */}
                                      <div className="mb-1 w-full">
                                        <div>
                                          <label
                                            id="value"
                                            className=" w-28 inline-block mb-2 text-sm  text-neutral-700 font-semibold dark:text-white"
                                          >
                                            Value
                                          </label>
                                          {/* If user selects absolute type */}
                                          {tagCondition.condition_value_type_name ===
                                            "Absolute" &&
                                            tagCondition.fieldType !=
                                              "boolean" &&
                                            tagCondition.fieldType !==
                                              "picklist" &&
                                            tagCondition.fieldType !==
                                              "reference" && (
                                              <div className="inline-block w-full">
                                                {dateField.includes(
                                                  tagCondition.fieldType
                                                ) ? (
                                                  <input
                                                    required
                                                    id="value"
                                                    step="any"
                                                    disabled={[
                                                      "Null",
                                                      "Not Null",
                                                    ].includes(
                                                      tagCondition.condition_type_name
                                                    )}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    type={
                                                      tagCondition.fieldType ==
                                                      "datetime"
                                                        ? "datetime-local"
                                                        : "date"
                                                    }
                                                    placeholder="Enter a value"
                                                    value={
                                                      tagCondition.date_value ||
                                                      ""
                                                    }
                                                    onChange={(e) => {
                                                      if (
                                                        tagCondition.fieldType ==
                                                          "date" ||
                                                        tagCondition.fieldType ==
                                                          "datetime"
                                                      ) {
                                                        setTagConditon(
                                                          (prevState) => ({
                                                            ...prevState,
                                                            date_value:
                                                              e.target.value,
                                                            order:
                                                              addNewTag
                                                                .tagConditions
                                                                .length + 1,
                                                          })
                                                        );
                                                      }
                                                      // else {
                                                      //   const [date, time] =
                                                      //     e.target.value.split(
                                                      //       "T"
                                                      //     );
                                                      //   // Format time to 24-hour format
                                                      //   const formattedTime =
                                                      //     time.slice(0, -3); // Remove seconds and time zone
                                                      //   // Update state with the formatted date and time
                                                      //   setTagConditon(
                                                      //     (prevState) => ({
                                                      //       ...prevState,
                                                      //       date_value: `${date}T${formattedTime}:00`,
                                                      //       order:
                                                      //         addNewTag
                                                      //           .tagConditions
                                                      //           .length + 1,
                                                      //     })
                                                      //   );
                                                      // }
                                                    }}
                                                  />
                                                ) : textFieldType.includes(
                                                    tagCondition.fieldType
                                                  ) ? (
                                                  <input
                                                    id="value"
                                                    required
                                                    disabled={[
                                                      "Null",
                                                      "Not Null",
                                                    ].includes(
                                                      tagCondition.condition_type_name
                                                    )}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    type="text"
                                                    placeholder="Enter a text value"
                                                    value={
                                                      tagCondition.text_value ||
                                                      ""
                                                    }
                                                    onChange={(e) => {
                                                      ValueHandler(
                                                        e.target.value
                                                      );
                                                    }}
                                                  />
                                                ) : (
                                                  <input
                                                    id="value"
                                                    required
                                                    disabled={[
                                                      "Null",
                                                      "Not Null",
                                                    ].includes(
                                                      tagCondition.condition_type_name
                                                    )}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    type="number"
                                                    placeholder="Enter a text value"
                                                    value={
                                                      tagCondition.int_value ||
                                                      ""
                                                    }
                                                    onChange={(e) => {
                                                      ValueHandler(
                                                        e.target.value
                                                      );
                                                    }}
                                                  />
                                                )}
                                              </div>
                                            )}

                                          {tagCondition.condition_value_type_name ===
                                            "Absolute" &&
                                            tagCondition.fieldType ==
                                              "boolean" && (
                                              <select
                                                required
                                                disabled={[
                                                  "Null",
                                                  "Not Null",
                                                ].includes(
                                                  tagCondition.condition_type_name
                                                )}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full inline-block px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                value={tagCondition.text_value}
                                                onChange={(e) => {
                                                  setTagConditon(
                                                    (prevState) => ({
                                                      ...prevState,
                                                      text_value:
                                                        e.target.value,
                                                      order:
                                                        addNewTag.tagConditions
                                                          .length + 1,
                                                    })
                                                  );
                                                }}
                                              >
                                                <option value="">
                                                  Select Value
                                                </option>
                                                {booleanValue.map(
                                                  (value, index) => (
                                                    <option
                                                      key={index}
                                                      value={value}
                                                    >
                                                      {value}
                                                    </option>
                                                  )
                                                )}
                                              </select>
                                            )}

                                          {/* If user selects relative type */}
                                          {tagCondition.condition_value_type_name ===
                                            "Relative" && (
                                            <select
                                              required
                                              disabled={[
                                                "Null",
                                                "Not Null",
                                              ].includes(
                                                tagCondition.condition_type_name
                                              )}
                                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full inline-block px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                              value={tagCondition.valueName}
                                              onChange={(e) => {
                                                ValueHandler(e.target.value);
                                              }}
                                            >
                                              <option value="">
                                                Select Value
                                              </option>
                                              {addNewTag.relativeTypes.map(
                                                (value) => (
                                                  <option
                                                    key={value.id}
                                                    value={value.name}
                                                  >
                                                    {value.name}
                                                  </option>
                                                )
                                              )}
                                            </select>
                                          )}

                                          {tagCondition.fieldType ===
                                            "picklist" &&
                                            (tagCondition.condition_type_name ===
                                              "Equals" ||
                                            tagCondition.condition_type_name ===
                                              "Not Equals" ? (
                                              loading ? ( // If data is still loading, show the loader
                                                <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  justify-end items-center focus:ring-primary-500 focus:border-primary-500 w-full inline-block px-14 py-1.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                                  <LuLoaderCircle className="text-base ml-14 animate-spin flex justify-end items-center" />
                                                </div>
                                              ) : (
                                                <select
                                                  required
                                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full inline-block px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                  value={
                                                    tagCondition.text_value
                                                  }
                                                  onChange={(e) => {
                                                    setTagConditon(
                                                      (prevState) => ({
                                                        ...prevState,
                                                        text_value:
                                                          e.target.value,
                                                        order:
                                                          addNewTag
                                                            .tagConditions
                                                            .length + 1,
                                                      })
                                                    );
                                                  }}
                                                >
                                                  <option value="">
                                                    Select Value
                                                  </option>
                                                  {addNewTag.picklistfield.map(
                                                    (option) => (
                                                      <option
                                                        key={option.value}
                                                        value={option.value}
                                                      >
                                                        {option.value}
                                                      </option>
                                                    )
                                                  )}
                                                </select>
                                              )
                                            ) : (
                                              <input
                                                id="value"
                                                required
                                                disabled={[
                                                  "Not Null",
                                                  "Null",
                                                ].includes(
                                                  editTagCondition.condition_type_name
                                                )}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                type="text"
                                                placeholder="Enter a text value"
                                                value={
                                                  tagCondition.text_value || ""
                                                }
                                                onChange={(e) =>
                                                  ValueHandler(e.target.value)
                                                }
                                              />
                                            ))}

                                          {tagCondition.fieldType ===
                                            "reference" &&
                                            (tagCondition.condition_type_name ===
                                              "Equals" ||
                                            tagCondition.condition_type_name ===
                                              "Not Equals" ? (
                                              <div
                                                className="relative"
                                                ref={valueSearchContainerRef}
                                              >
                                                <input
                                                  type="text"
                                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full px-2 py-1"
                                                  placeholder="Search..."
                                                  value={valueSearchInput || ""}
                                                  onChange={(e) => {
                                                    setValueSearchInput(
                                                      e.target.value
                                                    );
                                                    setIsValueSelected(false);
                                                  }}
                                                  disabled={isValueSearching}
                                                />

                                                {/* Loading indicator */}
                                                {isValueSearching && (
                                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                    <LuLoaderCircle className="animate-spin text-gray-400 text-lg" />
                                                  </div>
                                                )}

                                                {!isValueSelected && (
                                                  <div className="fixed z-[999] w-[230px] mt-1 bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                    {valueSearchResults.length >
                                                    0
                                                      ? valueSearchResults.map(
                                                          (result) => (
                                                            <div
                                                              key={result.Id}
                                                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                                                              onClick={() => {
                                                                setTagConditon(
                                                                  (
                                                                    prevState
                                                                  ) => ({
                                                                    ...prevState,
                                                                    text_value:
                                                                      result.Id,
                                                                    displayName:
                                                                      result.Name,
                                                                    order:
                                                                      addNewTag
                                                                        .tagConditions
                                                                        .length +
                                                                      1,
                                                                    selectedValueName:
                                                                      result.Name,
                                                                  })
                                                                );
                                                                setValueSearchInput(
                                                                  result.Name
                                                                );
                                                                setIsValueSelected(
                                                                  true
                                                                );
                                                                setValueSearchResults(
                                                                  []
                                                                );
                                                              }}
                                                            >
                                                              <div
                                                                className="text-sm text-gray-800 tracking-tight"
                                                                title={
                                                                  result.Name
                                                                }
                                                              >
                                                                {result.Name}
                                                              </div>
                                                              {result.Description && (
                                                                <div
                                                                  className="text-xs text-gray-500 tracking-tight truncate"
                                                                  title={
                                                                    result.Description
                                                                  }
                                                                >
                                                                  {
                                                                    result.Description
                                                                  }
                                                                </div>
                                                              )}
                                                            </div>
                                                          )
                                                        )
                                                      : valueSearchInput.length >=
                                                          3 &&
                                                        !isValueSearching && (
                                                          <div className="px-3 py-4 text-sm text-gray-500 text-center flex justify-center items-center tracking-tighter">
                                                            No matching result
                                                            found
                                                          </div>
                                                        )}
                                                  </div>
                                                )}
                                              </div>
                                            ) : (
                                              <input
                                                id="value"
                                                required
                                                disabled={[
                                                  "Null",
                                                  "Not Null",
                                                ].includes(
                                                  tagCondition.condition_type_name
                                                )}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                type="text"
                                                placeholder="Enter a text value"
                                                value={
                                                  tagCondition.text_value || ""
                                                }
                                                onChange={(e) =>
                                                  ValueHandler(e.target.value)
                                                }
                                              />
                                            ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2 mt-2 justify-center ">
                                    <button
                                      className={`px-2 py-1  shrink-0 flex justify-center items-center text-sm btn-secondary rounded-lg transition-colors bg-red-100 text-red-600 hover:bg-red-200 hover:border-red-300 border-red-200`}
                                      onClick={AddTagPopUpCleaner}
                                    >
                                      Discard
                                    </button>
                                    <button
                                      type="submit"
                                      className={`px-2 py-1 shrink-0 flex justify-center items-center text-sm btn-secondary rounded-lg transition-colors`}
                                      onClick={() => {
                                        // TagConditionHandler();
                                      }}
                                    >
                                      Confirm
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          )}

                          <div
                            className={`${
                              addNewTag.tagConditions.length > 3 &&
                              addNewTag.tagConditions.length <= 7 &&
                              addNewTag.addTagPopUp3 === true
                                ? "h-[135px]  overflow-y-auto"
                                : "h-auto"
                            }   w-full justify-center `}
                          >
                            {addNewTag.tagConditions.map((condition, id) => (
                              <div className="w-full" key={id}>
                                {editTagModal.show === true &&
                                editTagModal.id === condition.order ? (
                                  <div className={"inline-block w-full"}>
                                    <div className="px-4 md:px-5 py-3 bg-neutral-50 relative border overflow-hidden rounded-lg">
                                      <form
                                        className="space-y-2"
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                        }}
                                      >
                                        <div className="flex justify-center">
                                          <div className="border-cyan-200 absolute left-1 top-1 border  rounded  flex justify-center items-center gap-1 text-xs bg-cyan-50  text-cyan-700 font-semibold px-1 py-[2px]">
                                            <LuTags className=" text-base" />{" "}
                                            Edit tag condition #
                                            {condition.order}
                                          </div>
                                          <div className="flex flex-col items-center mt-4 justify-between">
                                            {/* Field Value selection */}
                                            <div className="mt-2 mb-1">
                                              <label className="w-28 inline-block mb-2 text-sm  text-neutral-700 font-semibold dark:text-white">
                                                Field
                                              </label>
                                              <select
                                                id="field"
                                                className="inline-block bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full  px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                value={
                                                  editTagCondition.hasOwnProperty(
                                                    "id"
                                                  )
                                                    ? fieldNameHandler(
                                                        editTagCondition.salesforce_field
                                                      )
                                                    : editTagCondition.fieldName
                                                }
                                                onChange={(e) => {
                                                  EditFieldHandler(
                                                    e.target.value
                                                  );
                                                }}
                                                onClick={() => {
                                                  if (
                                                    editTagCondition.fieldType ==
                                                    "picklist"
                                                  ) {
                                                    picklistHandler(
                                                      editTagCondition.fieldValue
                                                    );
                                                  }
                                                  if (
                                                    editTagCondition.fieldType ==
                                                    "reference"
                                                  ) {
                                                    // referenceHandler(
                                                    //   editTagCondition.fieldValue
                                                    // );
                                                  }
                                                }}
                                              >
                                                <option value="select">
                                                  Select Field
                                                </option>
                                                {addNewTag.userFields.map(
                                                  (user) => (
                                                    <option
                                                      key={user.id}
                                                      value={user.name}
                                                    >
                                                      {user.name}
                                                    </option>
                                                  )
                                                )}
                                              </select>
                                            </div>

                                            {/* Condition Value selection */}
                                            <div className="mb-1">
                                              <label
                                                id="condition"
                                                className="w-28 inline-block mb-2 text-sm  text-neutral-700 font-semibold dark:text-white"
                                              >
                                                Condition
                                              </label>
                                              <select
                                                id="condition"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 inline-block w-full py-1 px-2 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                value={
                                                  editTagCondition.hasOwnProperty(
                                                    "id"
                                                  )
                                                    ? conditionNameHandler(
                                                        editTagCondition.condition_type
                                                      )
                                                    : editTagCondition.condition_type_name ||
                                                      ""
                                                }
                                                onChange={(e) => {
                                                  EditConditionHandler(
                                                    e.target.value
                                                  );
                                                }}
                                              >
                                                <option value="select">
                                                  Select Condition
                                                </option>
                                                {!textFieldType.includes(
                                                  editTagCondition.fieldType
                                                ) &&
                                                  !intFieldType.includes(
                                                    editTagCondition.fieldType
                                                  ) &&
                                                  !booleanField.includes(
                                                    editTagCondition.fieldType
                                                  ) &&
                                                  !dateField.includes(
                                                    editTagCondition.fieldType
                                                  ) &&
                                                  addNewTag.conditionTypes.map(
                                                    (condition) => (
                                                      <option
                                                        key={condition.id}
                                                        value={condition.name}
                                                      >
                                                        {condition.name}
                                                      </option>
                                                    )
                                                  )}
                                                {textFieldType.includes(
                                                  editTagCondition.fieldType
                                                ) &&
                                                  textConditions.map(
                                                    (condition) => (
                                                      <option
                                                        key={condition}
                                                        value={condition}
                                                      >
                                                        {condition}
                                                      </option>
                                                    )
                                                  )}

                                                {booleanField.includes(
                                                  editTagCondition.fieldType
                                                ) &&
                                                  booleanConditions.map(
                                                    (condition) => (
                                                      <option
                                                        key={condition}
                                                        value={condition}
                                                      >
                                                        {condition}
                                                      </option>
                                                    )
                                                  )}
                                                {intFieldType.includes(
                                                  editTagCondition.fieldType
                                                ) &&
                                                  intConditons.map(
                                                    (condition) => (
                                                      <option
                                                        key={condition}
                                                        value={condition}
                                                      >
                                                        {condition}
                                                      </option>
                                                    )
                                                  )}
                                                {dateField.includes(
                                                  editTagCondition.fieldType
                                                ) &&
                                                  dateConditions.map(
                                                    (condition) => (
                                                      <option
                                                        key={condition}
                                                        value={condition}
                                                      >
                                                        {condition}
                                                      </option>
                                                    )
                                                  )}
                                              </select>
                                            </div>

                                            {/* Value Type selection */}
                                            <div className="w-full mb-1">
                                              <label
                                                id="valueType"
                                                className="w-full inline-block mb-2 text-sm  text-neutral-700 font-semibold dark:text-white"
                                              >
                                                Value Type
                                              </label>
                                              <select
                                                id="valueType"
                                                disabled={addNewTag.conditionTypes.some(
                                                  (condition) =>
                                                    condition.id ===
                                                      editTagCondition.condition_type &&
                                                    (condition.name ===
                                                      "Null" ||
                                                      condition.name ===
                                                        "Not Null")
                                                )}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 inline-block w-full px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                value={
                                                  editTagCondition.condition_value_type_name ||
                                                  ""
                                                }
                                                onChange={(e) => {
                                                  EditValueTypeHandler(
                                                    e.target.value
                                                  );
                                                }}
                                              >
                                                {dateField.includes(
                                                  editTagCondition.fieldType
                                                )
                                                  ? addNewTag.valueTypes.map(
                                                      (value) => (
                                                        <option
                                                          key={value.id}
                                                          value={value.name}
                                                        >
                                                          {value.name}
                                                        </option>
                                                      )
                                                    )
                                                  : addNewTag.valueTypes
                                                      .filter(
                                                        (value) =>
                                                          value.name !=
                                                          "Relative"
                                                      )
                                                      .map((value) => (
                                                        <option
                                                          key={value.id}
                                                          value={value.name}
                                                        >
                                                          {value.name}
                                                        </option>
                                                      ))}
                                              </select>
                                            </div>

                                            {/* Value selection */}
                                            <div className="">
                                              <div>
                                                <label
                                                  id="value"
                                                  className="w-28 inline-block mb-2 text-sm  text-neutral-700 font-semibold dark:text-white"
                                                >
                                                  Value
                                                </label>
                                                {/* If user selects absolute type */}
                                                {editTagCondition.condition_value_type_name ===
                                                  "Absolute" &&
                                                  editTagCondition.fieldType !=
                                                    "boolean" &&
                                                  editTagCondition.fieldType !==
                                                    "picklist" &&
                                                  editTagCondition.fieldType !==
                                                    "reference" && (
                                                    <div className="inline-block w-full">
                                                      {dateField.includes(
                                                        editTagCondition.fieldType
                                                      ) ? (
                                                        <input
                                                          required
                                                          id="value"
                                                          disabled={addNewTag.conditionTypes.some(
                                                            (condition) =>
                                                              condition.id ===
                                                                editTagCondition.condition_type &&
                                                              (condition.name ===
                                                                "Null" ||
                                                                condition.name ===
                                                                  "Not Null")
                                                          )}
                                                          step="any"
                                                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                          type={
                                                            editTagCondition.fieldType ===
                                                            "datetime"
                                                              ? "datetime-local"
                                                              : "date"
                                                          }
                                                          placeholder="Enter a value"
                                                          value={
                                                            editTagCondition.fieldType ===
                                                            "datetime"
                                                              ? editTagCondition.date_value ||
                                                                ""
                                                              : editTagCondition.date_value?.split(
                                                                  "T"
                                                                )[0] || ""
                                                          }
                                                          onChange={(e) => {
                                                            if (
                                                              editTagCondition.fieldType ===
                                                                "date" ||
                                                              editTagCondition.fieldType ===
                                                                "datetime"
                                                            ) {
                                                              const newValue =
                                                                editTagCondition.fieldType ===
                                                                "datetime"
                                                                  ? e.target
                                                                      .value
                                                                  : e.target
                                                                      .value +
                                                                    "T00:00"; // Set a default time if needed

                                                              setEditTagCondition(
                                                                (
                                                                  prevState
                                                                ) => ({
                                                                  ...prevState,
                                                                  date_value:
                                                                    newValue,
                                                                })
                                                              );
                                                            }
                                                          }}
                                                        />
                                                      ) : textFieldType.includes(
                                                          editTagCondition.fieldType
                                                        ) ? (
                                                        <input
                                                          id="value"
                                                          required
                                                          disabled={addNewTag.conditionTypes.some(
                                                            (condition) =>
                                                              condition.id ===
                                                                editTagCondition.condition_type &&
                                                              (condition.name ===
                                                                "Null" ||
                                                                condition.name ===
                                                                  "Not Null")
                                                          )}
                                                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                          type="text"
                                                          placeholder="Enter a text value"
                                                          value={
                                                            editTagCondition.text_value ||
                                                            ""
                                                          }
                                                          onChange={(e) => {
                                                            EditValueHandler(
                                                              e.target.value
                                                            );
                                                          }}
                                                        />
                                                      ) : (
                                                        <input
                                                          id="value"
                                                          required
                                                          disabled={addNewTag.conditionTypes.some(
                                                            (condition) =>
                                                              condition.id ===
                                                                editTagCondition.condition_type &&
                                                              (condition.name ===
                                                                "Null" ||
                                                                condition.name ===
                                                                  "Not Null")
                                                          )}
                                                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                          type="number"
                                                          placeholder="Enter a text value"
                                                          value={
                                                            editTagCondition.int_value ||
                                                            ""
                                                          }
                                                          onChange={(e) => {
                                                            EditValueHandler(
                                                              e.target.value
                                                            );
                                                          }}
                                                        />
                                                      )}
                                                    </div>
                                                  )}

                                                {editTagCondition.condition_value_type_name ===
                                                  "Absolute" &&
                                                  editTagCondition.fieldType ==
                                                    "boolean" && (
                                                    <select
                                                      required
                                                      disabled={addNewTag.conditionTypes.some(
                                                        (condition) =>
                                                          condition.id ===
                                                            editTagCondition.condition_type &&
                                                          (condition.name ===
                                                            "Null" ||
                                                            condition.name ===
                                                              "Not Null")
                                                      )}
                                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full inline-block px-5 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                      value={
                                                        editTagCondition.text_value
                                                      }
                                                      onChange={(e) => {
                                                        setEditTagCondition(
                                                          (prevState) => ({
                                                            ...prevState,
                                                            text_value:
                                                              e.target.value,
                                                          })
                                                        );
                                                      }}
                                                    >
                                                      <option value="">
                                                        Select Value
                                                      </option>
                                                      {booleanValue.map(
                                                        (value, index) => (
                                                          <option
                                                            key={index}
                                                            value={value}
                                                          >
                                                            {value}
                                                          </option>
                                                        )
                                                      )}
                                                    </select>
                                                  )}

                                                {/* If user selects relative type */}
                                                {editTagCondition.condition_value_type_name ==
                                                  "Relative" && (
                                                  <select
                                                    disabled={addNewTag.conditionTypes.some(
                                                      (condition) =>
                                                        condition.id ===
                                                          editTagCondition.condition_type &&
                                                        (condition.name ===
                                                          "Null" ||
                                                          condition.name ===
                                                            "Not Null")
                                                    )}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full inline-block px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    value={valueNameHandler(
                                                      editTagCondition.relative_value
                                                    )}
                                                    onChange={(e) => {
                                                      EditValueHandler(
                                                        e.target.value
                                                      );
                                                    }}
                                                  >
                                                    <option value="value">
                                                      Select Value
                                                    </option>
                                                    {addNewTag.relativeTypes.map(
                                                      (value) => (
                                                        <option
                                                          key={value.id}
                                                          value={value.name}
                                                        >
                                                          {value.name}
                                                        </option>
                                                      )
                                                    )}
                                                  </select>
                                                )}

                                                {editTagCondition.fieldType ===
                                                  "picklist" &&
                                                [
                                                  "Equals",
                                                  "Not Equals",
                                                ].includes(
                                                  editTagCondition.condition_type_name
                                                ) ? (
                                                  loading ? (
                                                    <div className="bg-gray-50 border border-gray-300 flex text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full  px-14 py-1.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                                      <LuLoaderCircle className="text-base ml-10 animate-spin flex justify-end items-center" />
                                                    </div>
                                                  ) : (
                                                    <select
                                                      required
                                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full inline-block px-5 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                      value={
                                                        editTagCondition.text_value
                                                      }
                                                      onChange={(e) => {
                                                        setEditTagCondition(
                                                          (prevState) => ({
                                                            ...prevState,
                                                            text_value:
                                                              e.target.value,
                                                          })
                                                        );
                                                      }}
                                                    >
                                                      <option value="">
                                                        Select Value
                                                      </option>
                                                      {Array.isArray(
                                                        addNewTag.picklistfield
                                                      ) &&
                                                        addNewTag.picklistfield.map(
                                                          (option) => (
                                                            <option
                                                              key={option.value}
                                                              value={
                                                                option.value
                                                              }
                                                            >
                                                              {option.value}
                                                            </option>
                                                          )
                                                        )}
                                                    </select>
                                                  )
                                                ) : (
                                                  editTagCondition.fieldType ===
                                                    "picklist" && (
                                                    <input
                                                      id="value"
                                                      required
                                                      disabled={[
                                                        "Not Null",
                                                        "Null",
                                                      ].includes(
                                                        editTagCondition.condition_type_name
                                                      )}
                                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                      type="text"
                                                      placeholder="Enter a text value"
                                                      value={
                                                        editTagCondition.text_value ||
                                                        ""
                                                      }
                                                      onChange={(e) =>
                                                        EditValueHandler(
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                  )
                                                )}

                                                {/* For Editing Existing Conditions */}
                                                {editTagCondition.fieldType ===
                                                  "reference" &&
                                                (editTagCondition.condition_type_name ===
                                                  "Equals" ||
                                                  editTagCondition.condition_type_name ===
                                                    "Not Equals") ? (
                                                  <div className="relative w-full">
                                                    <input
                                                      type="text"
                                                      value={
                                                        editValueSearchInput ||
                                                        ""
                                                      }
                                                      onChange={(e) => {
                                                        setEditValueSearchInput(
                                                          e.target.value
                                                        );
                                                        setIsEditValueSelected(
                                                          false
                                                        );
                                                        setIsUserInputChanged(
                                                          true
                                                        );
                                                      }}
                                                      className={`w-[235px] px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 
                                                             ${
                                                               isFetchingValueName
                                                                 ? "bg-gray-200/60 text-gray-600"
                                                                 : "bg-white text-gray-900"
                                                             }`}
                                                      placeholder="Search for a value..."
                                                    />

                                                    {(isEditValueSearching ||
                                                      isFetchingValueName) && (
                                                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                        <LuLoaderCircle className="animate-spin text-gray-400 text-lg" />
                                                      </div>
                                                    )}

                                                    {!isEditValueSelected && (
                                                      <div
                                                        ref={
                                                          editValueSearchContainerRef
                                                        }
                                                        className="fixed z-[999] w-[230px] mt-1 bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto"
                                                      >
                                                        {editValueSearchResults.length >
                                                          0 &&
                                                          editValueSearchResults.map(
                                                            (result) => (
                                                              <div
                                                                key={result.Id}
                                                                onClick={() => {
                                                                  setEditTagCondition(
                                                                    (
                                                                      prevState
                                                                    ) => ({
                                                                      ...prevState,
                                                                      text_value:
                                                                        result.Id,
                                                                    })
                                                                  );
                                                                  setEditValueSearchInput(
                                                                    result.Name
                                                                  );
                                                                  // setEditValueSearchInput(editTagCondition?.selectedValueName);
                                                                  setIsEditValueSelected(
                                                                    true
                                                                  );
                                                                  setEditValueSearchResults(
                                                                    []
                                                                  );
                                                                  if (
                                                                    socketRefEditValueSearch.current
                                                                  ) {
                                                                    socketRefEditValueSearch.current.close();
                                                                    socketRefEditValueSearch.current =
                                                                      null;
                                                                  }
                                                                }}
                                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                                                              >
                                                                <div
                                                                  className="text-sm text-gray-800 tracking-tight"
                                                                  title={
                                                                    result.Name
                                                                  }
                                                                >
                                                                  {result.Name}
                                                                </div>
                                                                {result.Description && (
                                                                  <div
                                                                    className="text-xs text-gray-500 tracking-tight truncate"
                                                                    title={
                                                                      result.Description
                                                                    }
                                                                  >
                                                                    {
                                                                      result.Description
                                                                    }
                                                                  </div>
                                                                )}
                                                              </div>
                                                            )
                                                          )}

                                                        {/* editValueSearchInput.length >= 3 && */}
                                                        {console.log(
                                                          isUserInputChanged
                                                        )}

                                                        {editValueSearchInput.length >=
                                                          3 &&
                                                          !isEditValueSearching &&
                                                          editValueSearchResults.length ===
                                                            0 &&
                                                          isUserInputChanged && (
                                                            <div className="px-3 py-4 text-sm text-gray-500 text-center flex justify-center items-center tracking-tighter">
                                                              No results found
                                                            </div>
                                                          )}
                                                      </div>
                                                    )}
                                                  </div>
                                                ) : (
                                                  editTagCondition.fieldType ===
                                                    "reference" && (
                                                    <input
                                                      id="value"
                                                      required
                                                      disabled={[
                                                        "Not Null",
                                                        "Null",
                                                      ].includes(
                                                        editTagCondition.condition_type_name
                                                      )}
                                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1"
                                                      type="text"
                                                      placeholder="Enter a text value"
                                                      value={
                                                        editTagCondition.text_value ||
                                                        ""
                                                      }
                                                      onChange={(e) =>
                                                        EditValueHandler(
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                  )
                                                )}
                                              </div>

                                              <div className="flex space-x-2 mt-2 justify-center ">
                                                <button
                                                  className={`px-2 py-1  shrink-0 flex justify-center items-center text-sm btn-secondary rounded-lg transition-colors bg-red-100 text-red-600 hover:bg-red-200 hover:border-red-300 border-red-200`}
                                                  onClick={() => {
                                                    AddTagPopUpEditCleaner();
                                                  }}
                                                >
                                                  Discard
                                                </button>
                                                <button
                                                  className={`px-2 py-1  shrink-0 flex justify-center items-center text-sm btn-secondary rounded-lg transition-colors`}
                                                  onClick={
                                                    EditTagConditionHandler
                                                  }
                                                >
                                                  Confirm
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </form>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-100 border-2 mb-4 border-dashed border-gray-300 rounded-lg p-8 flex items-center justify-center h-[342px]">
                      <p className="text-gray-500 text-center">
                        Select Add Criteria or Edit an existing criteria to see
                        options here.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between  pt-2 border-t border-gray-200">
                <button
                  className="px-6 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                  onClick={cancelButtonHandler}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`px-6 py-2 w-[101px] h-[38px] flex justify-center items-center text-sm btn-secondary text-white rounded-lg transition-colors ${
                    isValidating || isFormSubmit
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();

                    handleValidateAndSubmit();
                  }}
                >
                  {/* Show loader during validation or form submission */}
                  {isFormSubmit ? (
                    <div className="flex items-center justify-center">
                      <LuLoaderCircle className="animate-spin text-lg" />
                    </div>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="absolute">
          {/* Add Tag Popup */}
          <div>
            {/* addTagPopUp1 */}
            {addNewTag.addTagPopUp1 && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-gray-800 bg-opacity-50"></div>
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full relative">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-semibold text-neutral-800">
                        Edit Tag
                      </h3>
                    </div>

                    <div>
                      <div className="text-xs gap-2 mb-3 flex items-center border border-cyan-100 px-2 py-1 rounded-md bg-cyan-50 text-cyan-800 w-fit">
                        <span>Service User ID :</span>
                        {serviceUserData ? (
                          <div className="font-semibold">
                            {tagToEdit ? tagToEdit : serviceUserData[0].name}
                          </div>
                        ) : (
                          <div>
                            <LuLoaderCircle className="text-base animate-spin" />
                          </div>
                        )}
                      </div>

                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          editTagButtonHandler();
                        }}
                      >
                        <div className="mt-4">
                          <label className="block mb-2 text-sm font-medium text-neutral-800">
                            Tag Name
                          </label>
                          <input
                            value={updatedTag.name || ""}
                            onChange={(e) => {
                              setUpdatedTag((prevState) => ({
                                ...prevState,
                                name: e.target.value,
                              }));
                            }}
                            type="text"
                            className="p-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500 w-full"
                            placeholder="'2024 Opportunities'"
                            required
                          />
                          {formSubmitted && updatedTag.name === "" && (
                            <p className="text-red-500 text-xs mt-1">
                              Please enter tag name
                            </p>
                          )}
                        </div>

                        <div className="mt-4">
                          <label className="block mb-2 text-sm font-medium text-neutral-800">
                            Description
                          </label>
                          <input
                            value={updatedTag.description || ""}
                            onChange={(e) => {
                              setUpdatedTag((prevState) => ({
                                ...prevState,
                                description: e.target.value,
                              }));
                            }}
                            type="text"
                            className="p-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500 w-full"
                            placeholder="'Tag Description...'"
                            required
                          />
                          {formSubmitted && updatedTag.description === "" && (
                            <p className="text-red-500 text-xs mt-1">
                              Please enter Description.
                            </p>
                          )}
                        </div>

                        <div className="mt-4">
                          <label className="block mb-2 text-sm font-medium text-neutral-800">
                            Primary Object
                          </label>
                          <div className="p-2 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-800">
                            {addNewTag.primaryObjectName}
                          </div>
                        </div>

                        <div className="flex justify-between mt-10">
                          <button
                            type="button"
                            className="px-6 py-2 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                            onClick={cancelButtonHandler}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 w-[101px] h-[38px] flex justify-center items-center text-sm btn-secondary text-white rounded-lg transition-colors"
                            onClick={() => {
                              setFormSubmitted(true);
                              handleNextStep();
                            }}
                          >
                            Proceed
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* <CRUDButton
        onClickHandle={addTagButtonHandler}
        label="Edit"
        css="text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
        //css="text-sky-800 text-[14px] flex  gap-2 min-w-[50px] justify-center items-center pt-1 pb-1 pl-5 pr-5 mr-2 ml-3 rounded-md border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
        icon={faEdit}
      /> */}

      <CRUDButton
        onClickHandle={addTagButtonHandler}
        label={
          <span className="flex items-center gap-2">
            <FontAwesomeIcon icon={faEdit} />
            Edit
          </span>
        }
        css="text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
      />
    </div>
  );
};

export default EditTagModal;
