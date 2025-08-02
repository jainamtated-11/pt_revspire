import React, { useContext, useState, useRef, useEffect } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { fetchTagsAsync } from "../../../features/tag/tagSlice.js";
import { useDispatch } from "react-redux";
import { TbEdit } from "react-icons/tb";
import { MdRemoveCircleOutline } from "react-icons/md";
import { TableRow } from "../../UserManager/Organisation/MoreInfoDialog.jsx";
import { LuLoaderCircle } from "react-icons/lu";
import { LuTags } from "react-icons/lu";
import { evaluateLogic } from "../../../features/tag/logicHandler.js";
import { FaCheck } from "react-icons/fa";
import { useCookies } from "react-cookie";

export const AddTagPopUp2 = ({
  addNewTag,
  setAddNewTag,
  cancelButtonHandlerPopup1,
}) => {
  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();
  const dialogRef = useRef();
  const [isSubmit, setIsSubmit] = useState(false);
  const [advanceLogicError, setAdvanceLogicError] = useState(false);
  const [advanceTagLogic, setAdvanceTagLogic] = useState("");

  const [toggleSliderTag, setToggleSliderTag] = useState(false);
  const [tagLogic, setTagLogic] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedReference, setHasFetchedReference] = useState(false); // Track if reference data has been fetched
  const [isValidating, setIsValidating] = useState(false);
  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [cookies] = useCookies(["userData", "revspireToken"]);
    
  const token = cookies.revspireToken;
  const organisation_id = cookies.userData?.organisation?.id;

  // WebSocket related states
  const socketRef = useRef(null);

  // Account search states for field add condition
  const [valueSearchInput, setValueSearchInput] = useState("");
  const [valueSearchResults, setValueSearchResults] = useState([]);
  const [isValueSearching, setIsValueSearching] = useState(false);
  const [isValueSelected, setIsValueSelected] = useState(false);
  const valueSearchContainerRef = useRef(null);
  const valueSearchTimeoutRef = useRef(null);

  // Account search states for edit condition
  const [editValueSearchInput, setEditValueSearchInput] = useState("");
  const [editValueSearchResults, setEditValueSearchResults] = useState([]);
  const [isEditValueSearching, setIsEditValueSearching] = useState(false);
  const [isEditValueSelected, setIsEditValueSelected] = useState(false);
  const editValueSearchContainerRef = useRef(null);
  const editValueSearchTimeoutRef = useRef(null);

  const [valueSelectedName, setValueSelectedName] = useState("");
  const [isUserInputChanged, setIsUserInputChanged] = useState(false); //value input chnaged in case of edit mode

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
  // state for holding the tag conditions
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

  // Global state variables
  const {
    baseURL,
    viewer_id,
    authURL,
    isServiceUserConnected,
    isMatchingCRMFound,
  } = useContext(GlobalContext);

  const [selectedFieldInfo, setSelectedFieldInfo] = useState({
    fieldId: "",
    relationshipName: "",
    fieldType: "",
  });

  // handler function for setting the addTagPopUp3 true -done

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
          (valueType) => valueType.name === "Relative"
        )?.id,
        condition_value_type_name: "Relative",
        relative_value: null,
        text_value: null,
        date_value: null,
        int_value: null,
      }));
    }
  };

  const EditFieldHandler = (name) => {
    console.log("infieleditd");
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

    if (
      textFieldType.includes(field.type) ||
      intFieldType.includes(field.type) ||
      booleanField.includes(field.type)
    ) {
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
  };

  const cleanupValueSearch = () => {
    setValueSearchInput(""); // clear input
    setValueSearchResults([]); // Clear results
    setIsValueSelected(false); // Reset selection state
    setIsValueSearching(false); // Reset value searching state
    // Close WebSocket if open
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  // Update your click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        valueSearchContainerRef.current &&
        !valueSearchContainerRef.current.contains(event.target)
      ) {
        // Only clear results if we didn't select an item
        if (!isValueSelected) {
          setValueSearchResults([]);
          setValueSearchInput("");

          // Close WebSocket connection and log
          if (socketRef.current) {
            console.log("WebSocket disconnected due to clicking outside");
            socketRef.current.close();
            socketRef.current = null;
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

  // handler function for getting the condition data
  const ConditionHandler = (conditionName) => {
    const condition = addNewTag.conditionTypes.find(
      (condition) => condition.name.toLowerCase() == conditionName.toLowerCase()
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
    console.log("inedtcdn");
    const condition = addNewTag.conditionTypes.find(
      (condition) => condition.name === conditionName
    );
    setEditTagCondition((prevState) => ({
      ...prevState,
      condition_type: condition.id,
      condition_type_name: condition.name,
      relative_value: null,
      text_value: null,
      date_value: null,
      int_value: null,
    }));
  };

  // handler function for getting the valueType data
  const ValueTypeHandler = (valueTypeName) => {
    console.log("valty");
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
    console.log("inedtval");
    const valueType = addNewTag.valueTypes.find(
      (value) => value.name === valueTypeName
    );
    setEditTagCondition((prevState) => ({
      ...prevState,
      condition_value_type: valueType.id,
      condition_value_type_name: valueType.name,
      relative_value: null,
      text_value: null,
      date_value: null,
      int_value: null,
    }));
  };

  // handler function for getting the value data
  const ValueHandler = (valueName) => {
    console.log("invalhnl + valuename is ", valueName);

    const nextOrder = (addNewTag.tagConditions || []).length + 1;

    if (tagCondition.condition_value_type_name === "Relative") {
      const value = addNewTag.relativeTypes.find(
        (relativeType) => relativeType.name === valueName
      );
      setTagConditon((prevState) => ({
        ...prevState,
        relative_value: value?.id,
        order: nextOrder,
      }));
    } else {
      if (textFieldType.includes(tagCondition.fieldType)) {
        setTagConditon((prevState) => ({
          ...prevState,
          relative_value: null,
          order: nextOrder,
          text_value: valueName,
        }));
      } else if (intFieldType.includes(tagCondition.fieldType)) {
        setTagConditon((prevState) => ({
          ...prevState,
          relative_value: null,
          order: nextOrder,
          int_value: valueName,
        }));
      } else {
        setTagConditon((prevState) => ({
          ...prevState,
          relative_value: null,
          order: nextOrder,
          date_value: valueName,
        }));
      }
    }
  };

  const EditValueHandler = (valueName) => {
    console.log("edtvalhndlr");
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

  // At the beginning of your component
  useEffect(() => {
    setAddNewTag((prevState) => ({
      ...prevState,
      tagConditions: prevState.tagConditions || [],
    }));
  }, []);

  // websocket for value input for add condition
  useEffect(() => {
    let wsInstance = null;

    const setupWebSocket = () => {
      // Only proceed if we have the necessary conditions
      if (
        valueSearchInput.length >= 2 &&
        !isValueSelected &&
        tagCondition.fieldType === "reference" &&
        tagCondition.fieldValue // This should be the field ID
      ) {
        // Close any existing connection
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }

        const wsBaseURL = baseURL.replace("https://", "wss://") + "/wss/";
        // Format the protocol header with "token=" prefix
        wsInstance = new WebSocket(wsBaseURL, [token]);
        socketRef.current = wsInstance;

        wsInstance.onopen = () => {
          console.log(
            "======WebSocket connection opened for the value search======"
          );
          console.log(
            "selectedFieldInfo Realtion name here  ===",
            selectedFieldInfo.relationshipName
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
              }, 3000);
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
          socketRef.current = null;
        };
      } else {
        // Clear results if conditions aren't met
        setValueSearchResults([]);
      }
    };

    // Clear previous timeout if it exists
    if (valueSearchTimeoutRef.current) {
      clearTimeout(valueSearchTimeoutRef.current);
    }

    // Debounce the WebSocket setup
    valueSearchTimeoutRef.current = setTimeout(() => {
      setupWebSocket();
    }, 300);

    // Cleanup function
    return () => {
      if (valueSearchTimeoutRef.current) {
        clearTimeout(valueSearchTimeoutRef.current);
      }
      if (wsInstance) {
        wsInstance.close();
        wsInstance = null;
        socketRef.current = null;
      }
    };
  }, [
    valueSearchInput,
    tagCondition.fieldType,
    tagCondition.fieldValue,
    isValueSelected,
    baseURL,
    viewer_id,
  ]);

  // Cleanup function for value search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        valueSearchContainerRef.current &&
        !valueSearchContainerRef.current.contains(event.target)
      ) {
        setValueSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //  cleanup when changing field type
  useEffect(() => {
    if (tagCondition.fieldType !== "reference") {
      cleanupValueSearch();
    }
  }, [tagCondition.fieldType]);

  // Add cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanupValueSearch();
    };
  }, []);

  useEffect(() => {
    console.log("webcoekt for edit value search");
    let wsInstance = null;

    const setupWebSocket = () => {
      // console.log("setting up websocket for edittagcondition");
      if (
        editValueSearchInput.length >= 2 &&
        !isEditValueSelected &&
        editTagCondition.fieldType === "reference" &&
        editTagCondition.fieldValue
      ) {
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }

        const wsBaseURL = baseURL.replace("https://", "wss://") + "/wss/";
        // Format the protocol header with "token=" prefix
        wsInstance = new WebSocket(wsBaseURL, [token]);
        socketRef.current = wsInstance;

        wsInstance.onopen = () => {
          console.log("WebSocket connection opened for edit value search");
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
          console.error("WebSocket error:", error);
          setIsEditValueSearching(false);
          setEditValueSearchResults([]);
        };

        wsInstance.onclose = () => {
          console.log("WebSocket connection closed");
          socketRef.current = null;
        };
      } else {
        setEditValueSearchResults([]);
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
        socketRef.current = null;
      }
    };
  }, [
    editValueSearchInput,
    editTagCondition.fieldType,
    editTagCondition.fieldValue,
    isEditValueSelected,
    baseURL,
  ]);

  // cleanup for edit value
  const cleanupEditValueSearch = () => {
    setEditValueSearchInput("");
    setEditValueSearchResults([]);
    setIsEditValueSelected(false);
    setIsEditValueSearching(false);
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  // Cleanup function for edit value search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        editValueSearchContainerRef.current &&
        !editValueSearchContainerRef.current.contains(event.target)
      ) {
        setEditValueSearchResults([]);
        setEditValueSearchInput(""); // Clear the input value
        setIsEditValueSelected(false); // Reset the selection state
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const EditTagConditionHandler = () => {
    console.log("edtcndhndlr");
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

    setEditTagCondition({
      fieldId: "",
      fieldName: "",
      conditionId: "",
      conditionName: "",
      valueTypeName: "",
      valueTypeId: "",
      valueName: "",
      valueId: "",
      order: 0,
      relative_value: "",
      text_value: "",
      date_value: "",
      int_value: "",
    });
    setEditTagModal({
      order: 0,
      show: false,
    });
  };

  const fieldNameHandler = (fieldId) => {
    console.log("fldnmhndlr");
    for (let i = 0; i < addNewTag.userFields.length; i++) {
      if (fieldId === addNewTag.userFields[i].id) {
        return addNewTag.userFields[i].processed_name;
      }
    }
  };

  const conditionNameHandler = (conditionId) => {
    console.log("conditionNameHandler");
    for (let i = 0; i < addNewTag.conditionTypes.length; i++) {
      if (conditionId === addNewTag.conditionTypes[i].id) {
        return addNewTag.conditionTypes[i].name;
      }
    }
  };

  const valueNameHandler = (condition) => {
    console.log("valueNameHandler ");
    if (condition == null) {
      return "Empty";
    }

    const valueType = addNewTag.relativeTypes.find(
      (value) => value.id === condition
    );
    return valueType.name;
  };
  // handler function for deleting the tagCondition from the tagConditons
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
      addTagPopUp3: false,
      tagConditions: tagCondition,
    }));
  };

  const editTagConditionHandler = (id) => {
    console.log("editTagConditionHandler");
    const conditionToEdit = addNewTag?.tagConditions?.find(
      (condition) => condition.order === id
    );
    setEditTagCondition(conditionToEdit);
    console.log("=====conditionToEdit", conditionToEdit);

    const field = addNewTag.userFields?.find(
      (field) => field.id === conditionToEdit.fieldValue
    );

    if (field) {
      setSelectedFieldInfo({
        fieldId: field.id,
        relationshipName: field.relationship_name,
        fieldType: field.type,
      });
    }

    // Use conditionToEdit instead of editTagCondition since it has the current value
    console.log("Selected value name:", conditionToEdit?.selectedValueName);

    // Handle reference field prefill
    if (conditionToEdit?.fieldType === "reference") {
      setIsEditValueSelected(false);
      setEditValueSearchInput(conditionToEdit.selectedValueName || ""); // Use conditionToEdit instead
    }

    setEditTagModal({
      id: id,
      show: true,
    });
  };

  const cancelButtonHandler = () => {
    cancelButtonHandlerPopup1();
    cleanupValueSearch(); // the input web socket cleanup
    cleanupEditValueSearch();
    setAddNewTag((prevState) => ({
      ...prevState,
      addTagPopUp2: false,
      addTagPopUp3: false,
      tagConditions: [],
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

  // Function to create and save the
  const createTagHandler = async () => {
    const conditions = addNewTag.tagConditions;

    let data;
    if (toggleSliderTag) {
      data = {
        created_by: viewer_id,
        name: addNewTag.name,
        description: addNewTag.description,
        salesforce_primary_object: addNewTag.primaryObjectId,
        dynamics_primary_table: null,
        // advanced_tag_logic:AdvanceTagLogicHandler(addNewTag.advanceTagLogic),
        advanced_tag_logic: tagLogic,
        tagConditions: conditions,
      };
    } else {
      data = {
        created_by: viewer_id,
        name: addNewTag.name,
        description: addNewTag.description,
        salesforce_primary_object: addNewTag.primaryObjectId,
        dynamics_primary_table: null,
        advanced_tag_logic: tagLogic || addNewTag.advanceTagLogic,
        tagConditions: conditions,
      };
    }
    try {
      setIsSubmit(true);
      const response = await axiosInstance.post(
        `/create-tag-and-conditions`,
        data,
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      toast.success("Tag created successfully");
      cancelButtonHandler();
      cancelButtonHandlerPopup1();
      dispatch(fetchTagsAsync({ viewer_id, baseURL: baseURL }));
      console.log(response.data);
    } catch (error) {
      toast.error("Failed to create tag");
      console.log("error:", error);
    } finally {
      cancelButtonHandler();
      cancelButtonHandlerPopup1();
      setIsSubmit(false);
    }
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

  const AddTagPopUpCleaner = () => {
    setAddNewTag((prevState) => ({
      ...prevState,
      addTagPopUp3: false,
    }));
    cleanupValueSearch();
    cleanupEditValueSearch();
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
    cleanupValueSearch();
    cleanupEditValueSearch();
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
    console.log(tagCondition);
    console.log(editTagCondition);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        cancelButtonHandler();
        cancelButtonHandlerPopup1();
        cleanupValueSearch();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log("tag condition here ", tagCondition);
    if (
      tagCondition.fieldType === "picklist" &&
      (tagCondition.condition_type_name === "Equals" ||
        tagCondition.condition_type_name === "Not Equals")
    ) {
      picklistHandler();
    }
    const shouldFetch =
      tagCondition.fieldType === "reference" &&
      (tagCondition.condition_type_name === "Equals" ||
        tagCondition.condition_type_name === "Not Equals") &&
      tagCondition.fieldValue;

    if (shouldFetch && !hasFetchedReference) {
      // referenceHandler(); // Fetch data if conditions are met and we haven't fetched yet
    }
  }, [tagCondition]); // Only watch tagCondition changes

  useEffect(() => {
    // Reset the fetch status whenever these specific values change, so the fetch can happen again
    setHasFetchedReference(false);
  }, [tagCondition.fieldValue, tagCondition.condition_type_name]);

  const picklistHandler = async () => {
    console.log("Before setIsLoading: ", isLoading); // Log before
    setIsLoading(true);
    console.log("After setIsLoading (should be true): ", isLoading); // Log immediately after
    // console.log(tagCondition)
    try {
      const response = await axiosInstance.post(
        `/getSalesforcePicklistValues`,
        {
          viewerId: viewer_id,
          salesforce_field_id: tagCondition.fieldValue,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      setAddNewTag((prevState) => ({
        ...prevState,
        picklistfield: response.data.picklistValues,
      }));
    } catch (error) {
      console.log("error for fetch picklist ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("...");
  }, [validationResult]);

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

  const validateTagLogic = () => {
    // validation of taglogic
    return evaluateLogic(tagLogic, addNewTag.tagConditions.length);
  };

  const handleValidateAndSubmit = async () => {
    setIsValidating(true);
    setIsFormSubmit(true);
    console.log("Initial 1 ", tagLogic);
    setTagLogic(generateTagLogic); // Set default tagLogic
    // Perform validation
    // const result = evaluateLogic(tagLogic, addNewTag.tagConditions.length);
    const result = validateTagLogic();
    setValidationResult(result);

    // Check validation result
    if (result?.status === "success") {
      console.log("Validation successful");

      // Submit the form
      await createTagHandler();
    } else {
      console.error("Validation failed", result);
    }
    setIsFormSubmit(false);
    setIsValidating(false);

    // cleanupValueSearch(); // the input web socket cleanup
  };

  useEffect(() => {
    if (addNewTag.tagConditions.length > 0) {
      setToggleSliderTag(true);
      setTagLogic(generateTagLogic());
    } else {
      setTagLogic("");
    }
  }, [addNewTag.tagConditions]);

  useEffect(() => {
    // console.log("=======rerender=======")
    console.log("tagConditionhere ,", tagCondition);
    console.log(" useffect edittagcondition value here", editTagCondition);
    console.log("useEffect addneewtagtag here", addNewTag);
    // console.log("Add new tag here,", addNewTag)
    console.log("====selectedFieldInfo here===", selectedFieldInfo);
  }, [
    tagCondition,
    tagCondition.fieldName,
    editTagCondition,
    editTagCondition.fieldName,
    editTagCondition.fieldType,
  ]);

  return (
    <>
      {/* {console.log("Add new tag here :",addNewTag)} */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="absolute inset-0 bg-gray-800 bg-opacity-50"></div>
        <div
          ref={dialogRef}
          className="bg-white px-6 py-2 rounded-xl shadow-2xl max-w-2xl w-full min-h-[457px] max-h-[calc(100vh-2%)] relative overflow-scroll"
        >
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create New Tag
          </h3>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column */}
            <div className="w-full md:w-[55%] space-y-4">
              <div className="bg-gray-50 p-4 border border-neutral-200 rounded-lg">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Name</span>
                    <div className="font-medium bg-white border text-sm border-gray-200 px-3 py-2 rounded-md text-gray-700">
                      {addNewTag.name}
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
                </div>
              </div>

              <div>
                <div className="flex gap-2 mb-4 items-center">
                  {/* Toggle button And Input */}

                  {/* Edit button */}
                  <button
                    onClick={() => {
                      setToggleSliderTag(!toggleSliderTag);
                      if (toggleSliderTag) {
                        // Reset the validation result when logic is removed
                        setValidationResult(null);
                      }
                    }}
                    className={`px-2  h-[30px] shrink-0 flex justify-center items-center text-sm btn-secondary transition-colors border ${
                      toggleSliderTag
                        ? "w-[25%] text-red-600 py-3 bg-red-100 rounded-lg hover:bg-red-200 border-red-200"
                        : "w-full text-white py-2"
                    }`}
                  >
                    {toggleSliderTag ? "Remove" : "Add Tag Logic"}
                  </button>
                  {/* Input field shown when toggle is active */}
                  {toggleSliderTag && (
                    <div className="flex w-[75%] items-center gap-2">
                      {/* Step 2: Input field for tag logic */}
                      <input
                        type="text"
                        value={tagLogic || ""}
                        placeholder="Enter the tag logic"
                        className="p-2 h-[30px] outline-none text-sm bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500 w-full"
                        onChange={(e) => {
                          setTagLogic(e.target.value);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Step 4: Validation Result Message */}
                {validationResult ? (
                  <div
                    className={`text-sm ml-2  ${
                      validationResult.status === "success"
                        ? "text-green-500"
                        : "text-red-500 tracking-tighter "
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
                    editTagModal.id === condition.order ? null : (
                      <div
                        key={id}
                        className="flex border bg-neutral-100 border-neutral-300 items-center rounded-md gap-3 pr-2 my-2 justify-between w-full"
                      >
                        <div className="flex gap-3 relative overflow-hidden items-center">
                          <div className="text-neutral-700 absolute bg-neutral-200 border-r border-r-neutral-300 font-medium w-[25px] h-full text-sm flex justify-center items-center">
                            {condition.order}
                          </div>
                          <div className="flex-1 ml-7 ">
                            <p
                              className="text-sm text-neutral-700 truncate min-w-[11ch] max-w-[11ch] py-1  tracking-tight"
                              title={condition.fieldName}
                            >
                              {condition.fieldName}
                            </p>
                          </div>
                          <div className="flex-1">
                            <p
                              className="text-sm text-neutral-700 truncate min-w-[7ch] max-w-[7ch] py-1  tracking-tight"
                              title={condition.condition_type_name}
                            >
                              {condition.condition_type_name}
                            </p>
                          </div>
                          <div className="flex-1">
                            <p
                              className="text-sm text-neutral-700 truncate min-w-[10ch] max-w-[10ch] py-1 pr-2 tracking-tight"
                              title={
                                condition.condition_value_type_name ===
                                "Relative"
                                  ? valueNameHandler(condition.relative_value)
                                  : condition.text_value !== ""
                                  ? condition.text_value
                                  : condition.int_value !== ""
                                  ? condition.int_value
                                  : condition.date_value
                              }
                            >
                              {condition.condition_value_type_name ===
                              "Relative"
                                ? valueNameHandler(condition.relative_value)
                                : condition.text_value !== ""
                                ? condition.text_value
                                : condition.int_value !== ""
                                ? condition.int_value
                                : condition.date_value}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-center shrink-0 text-lg items-center">
                          {/* Edit Tag Conditions */}
                          <button
                            onClick={() => {
                              editTagConditionHandler(condition.order);
                            }}
                            className="text-neutral-700 mx-2 active:scale-95 transition-all"
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
                                      value={tagCondition.fieldName || "N/A"}
                                      onChange={(e) => {
                                        FieldHandler(e.target.value);
                                      }}
                                    >
                                      <option value="">Select Field </option>
                                      {Array.isArray(addNewTag.userFields) &&
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
                                        tagCondition.condition_type_name || ""
                                      }
                                      onChange={(e) => {
                                        ConditionHandler(e.target.value);
                                      }}
                                    >
                                      <option value="">Select Condition</option>
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
                                        booleanConditions.map((condition) => (
                                          <option
                                            key={condition}
                                            value={condition}
                                          >
                                            {condition}
                                          </option>
                                        ))}
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
                                      disabled={["Null", "Not Null"].includes(
                                        tagCondition.condition_type_name
                                      )}
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 inline-block w-full px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                      value={
                                        tagCondition.condition_value_type_name ||
                                        ""
                                      }
                                      onChange={(e) => {
                                        ValueTypeHandler(e.target.value);
                                      }}
                                    >
                                      {dateField.includes(
                                        tagCondition.fieldType
                                      )
                                        ? addNewTag.valueTypes.map((value) => (
                                            <option
                                              key={value.id}
                                              value={value.name}
                                            >
                                              {value.name}
                                            </option>
                                          ))
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
                                      <div className="flex flex-row">
                                        <label
                                          id="value"
                                          className=" mr-4 inline-block mb-2 text-sm  text-neutral-700 font-semibold dark:text-white"
                                        >
                                          Value
                                        </label>
                                        <div>
                                          {/* {isLoading && (
                                        <LuLoaderCircle className="animate-spin text-sm mt-1" />
                                      )} */}
                                        </div>
                                      </div>

                                      {/* If user selects absolute type */}
                                      {tagCondition.condition_value_type_name ===
                                        "Absolute" &&
                                        tagCondition.fieldType !== "boolean" &&
                                        tagCondition.fieldType !== "picklist" &&
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
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                type={
                                                  tagCondition.fieldType ===
                                                  "datetime"
                                                    ? "datetime-local"
                                                    : "date"
                                                }
                                                placeholder="Enter a value"
                                                value={
                                                  tagCondition.date_value || ""
                                                }
                                                onChange={(e) => {
                                                  if (
                                                    tagCondition.fieldType ===
                                                      "date" ||
                                                    tagCondition.fieldType ===
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
                                                  // else block commented out if not needed
                                                }}
                                              />
                                            ) : textFieldType.includes(
                                                tagCondition.fieldType
                                              ) ? (
                                              <input
                                                id="value"
                                                required
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                type="text"
                                                disabled={[
                                                  "Null",
                                                  "Not Null",
                                                ].includes(
                                                  tagCondition.condition_type_name
                                                )}
                                                placeholder="Enter a text value"
                                                value={
                                                  tagCondition.text_value || ""
                                                }
                                                onChange={(e) => {
                                                  ValueHandler(e.target.value);
                                                }}
                                              />
                                            ) : (
                                              <input
                                                id="value"
                                                required
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                type="number"
                                                placeholder="Enter a text  value"
                                                disabled={[
                                                  "Null",
                                                  "Not Null",
                                                ].includes(
                                                  tagCondition.condition_type_name
                                                )}
                                                value={tagCondition.int_value}
                                                onChange={(e) => {
                                                  ValueHandler(e.target.value);
                                                }}
                                              />
                                            )}
                                          </div>
                                        )}

                                      {tagCondition.condition_value_type_name ===
                                        "Absolute" &&
                                        tagCondition.fieldType == "boolean" && (
                                          <select
                                            required
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full inline-block px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            value={tagCondition.text_value}
                                            onChange={(e) => {
                                              setTagConditon((prevState) => ({
                                                ...prevState,
                                                text_value: e.target.value,
                                                order:
                                                  addNewTag.tagConditions
                                                    .length + 1,
                                              }));
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
                                          <option value="">Select Value</option>
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

                                      {tagCondition.fieldType === "picklist" &&
                                      (tagCondition.condition_type_name ===
                                        "Equals" ||
                                        tagCondition.condition_type_name ===
                                          "Not Equals") ? (
                                        // Check if data is loading
                                        isLoading ? (
                                          // Display a disabled input with a spinner
                                          <div className="loading-container">
                                            <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full  px-1 py-1 h-[30px] flex items-center justify-end">
                                              <LuLoaderCircle className="animate-spin text-lg flex items-center justify-center" />
                                            </div>
                                          </div>
                                        ) : (
                                          // Once data is loaded, show the select dropdown
                                          <select
                                            required
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            value={tagCondition.text_value}
                                            onChange={(e) => {
                                              setTagConditon((prevState) => ({
                                                ...prevState,
                                                text_value: e.target.value,
                                                order:
                                                  addNewTag.tagConditions
                                                    .length + 1,
                                              }));
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
                                                    value={option.value}
                                                  >
                                                    {option.value}
                                                  </option>
                                                )
                                              )}
                                          </select>
                                        )
                                      ) : (
                                        tagCondition.fieldType ===
                                          "picklist" && (
                                          <input
                                            id="value"
                                            required
                                            disabled={[
                                              "Not Null",
                                              "Null",
                                            ].includes(
                                              tagCondition.condition_type_name
                                            )}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            type="text"
                                            placeholder="Enter a text value"
                                            value={
                                              tagCondition.text_value || ""
                                            }
                                            onChange={(e) => {
                                              ValueHandler(e.target.value);
                                            }}
                                          />
                                        )
                                      )}

                                      {tagCondition.fieldType === "reference" &&
                                      (tagCondition.condition_type_name ===
                                        "Equals" ||
                                        tagCondition.condition_type_name ===
                                          "Not Equals") ? (
                                        <div className="relative w-full">
                                          <input
                                            type="text"
                                            value={valueSearchInput || ""}
                                            onChange={(e) => {
                                              setValueSearchInput(
                                                e.target.value
                                              );
                                              setIsValueSelected(false);
                                              // setTagConditon((prevState) => ({
                                              //           ...prevState,
                                              //           text_value: e.target.value,
                                              //           order: addNewTag.tagConditions.length + 1,
                                              //         }));
                                              ValueHandler(e.target.value);
                                            }}
                                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Search for a value..."
                                          />

                                          {isValueSearching && (
                                            <div className="absolute right-3 top-2.5">
                                              <LuLoaderCircle className="animate-spin text-gray-400 text-lg" />
                                            </div>
                                          )}

                                          {/* Render search results */}
                                          {/* {renderValueSearchResults()} */}

                                          {!isValueSelected && (
                                            <div
                                              ref={valueSearchContainerRef}
                                              className="fixed z-[999] w-[230px] mt-1 bg-white  rounded-lg shadow-lg max-h-48 overflow-y-auto"
                                            >
                                              {valueSearchResults.length > 0 &&
                                                valueSearchResults.map(
                                                  (result) => (
                                                    <div
                                                      key={result.Id}
                                                      onClick={() => {
                                                        setTagConditon(
                                                          (prevState) => ({
                                                            ...prevState,
                                                            text_value:
                                                              result.Id,
                                                            selectedValueName:
                                                              result.Name,
                                                          })
                                                        );
                                                        setValueSearchInput(
                                                          result.Name
                                                        );
                                                        setValueSelectedName(
                                                          result.Name
                                                        );
                                                        setIsValueSelected(
                                                          true
                                                        );
                                                        setValueSearchResults(
                                                          []
                                                        );
                                                        if (socketRef.current) {
                                                          socketRef.current.close();
                                                          socketRef.current =
                                                            null;
                                                        }
                                                      }}
                                                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                                                    >
                                                      <div
                                                        className="text-sm text-gray-800 tracking-tight"
                                                        title={result.Name}
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
                                                          {result.Description}
                                                        </div>
                                                      )}
                                                    </div>
                                                  )
                                                )}

                                              {valueSearchInput.length >= 3 &&
                                                !isValueSearching &&
                                                valueSearchResults.length ===
                                                  0 && (
                                                  <div className="px-3 py-4 text-sm text-gray-500 text-center flex justify-center items-center tracking-tighter">
                                                    No results found
                                                  </div>
                                                )}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        tagCondition.fieldType ===
                                          "reference" && (
                                          <>
                                            <input
                                              id="value"
                                              required
                                              disabled={[
                                                "Not Null",
                                                "Null",
                                              ].includes(
                                                tagCondition.condition_type_name
                                              )}
                                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                              type="text"
                                              placeholder="Enter a text value"
                                              value={
                                                tagCondition.text_value || ""
                                              }
                                              onChange={(e) => {
                                                ValueHandler(e.target.value);
                                              }}
                                            />
                                          </>
                                        )
                                      )}
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
                                  className={`px-2 py-1  shrink-0 flex justify-center items-center text-sm btn-secondary rounded-lg transition-colors `}
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
                                    {/* Edit tag condition */}

                                    <div className="flex justify-center">
                                      <div className="border-cyan-200 absolute left-1 top-1 border  rounded  flex justify-center items-center gap-1 text-xs bg-cyan-50  text-cyan-700 font-semibold px-1 py-[2px]">
                                        <LuTags className=" text-base" /> Edit
                                        tag condition #{condition.order}
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
                                                : editTagCondition.fieldName ||
                                                  ""
                                            }
                                            onChange={(e) => {
                                              EditFieldHandler(e.target.value);
                                            }}
                                          >
                                            <option value="select">
                                              Select Field
                                            </option>
                                            {addNewTag.userFields.map(
                                              (user) => (
                                                <option
                                                  key={user.id}
                                                  value={user.processed_name}
                                                >
                                                  {user.processed_name}
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
                                              intConditons.map((condition) => (
                                                <option
                                                  key={condition}
                                                  value={condition}
                                                >
                                                  {condition}
                                                </option>
                                              ))}
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
                                            disabled={[
                                              "Null",
                                              "Not Null",
                                            ].includes(
                                              editTagCondition.condition_type_name
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
                                              editTagCondition.fieldType !==
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
                                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                      type={
                                                        editTagCondition.fieldType ===
                                                        "datetime"
                                                          ? "datetime-local"
                                                          : "date"
                                                      }
                                                      placeholder="Enter a value"
                                                      value={
                                                        editTagCondition.date_value ||
                                                        ""
                                                      }
                                                      onChange={(e) => {
                                                        if (
                                                          editTagCondition.fieldType ===
                                                            "date" ||
                                                          editTagCondition.fieldType ===
                                                            "datetime"
                                                        ) {
                                                          setEditTagCondition(
                                                            (prevState) => ({
                                                              ...prevState,
                                                              date_value:
                                                                e.target.value,
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
                                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full inline-block px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                      type="text"
                                                      disabled={[
                                                        "Null",
                                                        "Not Null",
                                                      ].includes(
                                                        editTagCondition.condition_type_name
                                                      )}
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
                                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full inline-block px-6 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
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
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full inline-block px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                disabled={[
                                                  "Null",
                                                  "Not Null",
                                                ].includes(
                                                  editTagCondition.condition_type_name
                                                )}
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
                                            (editTagCondition.condition_type_name ===
                                              "Equals" ||
                                              editTagCondition.condition_type_name ===
                                                "Not Equals") ? (
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
                                                        value={option.value}
                                                      >
                                                        {option.value}
                                                      </option>
                                                    )
                                                  )}
                                              </select>
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
                                                    ValueHandler(e.target.value)
                                                  }
                                                />
                                              )
                                            )}

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
                                                    editValueSearchInput || ""
                                                  }
                                                  onChange={(e) => {
                                                    setEditValueSearchInput(
                                                      e.target.value
                                                    );
                                                    setIsEditValueSelected(
                                                      false
                                                    );
                                                    setIsUserInputChanged(true);
                                                  }}
                                                  className="w-[230px] px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                  placeholder="Search for a value..."
                                                />

                                                {isEditValueSearching && (
                                                  <div className="absolute right-3 top-2.5">
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
                                                                socketRef.current
                                                              ) {
                                                                socketRef.current.close();
                                                                socketRef.current =
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

                                                    {console.log(
                                                      isUserInputChanged
                                                    )}

                                                    {/* editValueSearchInput.length >= 3 && */}

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
                                                    ValueHandler(e.target.value)
                                                  }
                                                />
                                              )
                                            )}
                                          </div>

                                          <div className="flex space-x-2 mt-2 justify-center ">
                                            <button
                                              className={`px-2 py-1  shrink-0 flex justify-center items-center text-sm btn-secondary rounded-lg transition-colors bg-red-100 text-red-600 hover:bg-red-200 hover:border-red-300 border-red-200`}
                                              onClick={() => {
                                                // EditTagConditionHandler();
                                                AddTagPopUpEditCleaner();
                                              }}
                                            >
                                              Discard
                                            </button>
                                            <button
                                              className={`px-2 py-1  shrink-0 flex justify-center items-center text-sm btn-secondary rounded-lg transition-colors `}
                                              onClick={EditTagConditionHandler}
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
                <div className="bg-gray-100 border-2 mb-4 border-dashed border-gray-300 rounded-lg p-8 flex items-center justify-center md:h-[342px]">
                  <p className="text-gray-500 text-center">
                    Select Add Criteria or Edit an existing criteria to see
                    options here.
                  </p>
                </div>
              )}
            </div>
            {/* ................................................................................... */}
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

                // createTagHandler();
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
    </>
  );
};
