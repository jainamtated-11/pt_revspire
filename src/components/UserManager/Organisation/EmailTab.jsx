import React, { useContext, useEffect, useState } from "react";
import { MdOutlineAddCircleOutline, MdClose } from "react-icons/md";
import "react-quill/dist/quill.snow.css";
import RichTextEditor from "./RichTextEditor";
import { GlobalContext } from "../../../context/GlobalState";
import { useCookies } from "react-cookie";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable";
import GlobalAddButton from "../../../utility/CustomComponents/GlobalAddButton";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { use } from "react";
import { FaFileCircleCheck } from "react-icons/fa6";
import { FaEdit, FaRegEdit } from "react-icons/fa";
import Select from "react-select";

const EmailTab = () => {
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;
  const dispatch = useDispatch();

  const axiosInstance = useAxiosInstance();
  const [sortConfig, setSortConfig] = useState({
    key: "Updated At",
    direction: "desc",
  });

  // Modal realted states
  const [isModalOpen, setModalOpen] = useState(false);
  const [editorContent, setEditorContent] = useState(""); //store editor data

  // templates relates states
  const [isActivate, setIsActivate] = useState(false);
  const [isDeactivate, setIsDeactivate] = useState(false);
  const [templateName, setTemplateName] = useState(""); // State to manage the input name
  const [subject, setSubject] = useState(""); //manage subject name

  // States to manage error messages
  const [nameError, setNameError] = useState("");
  const [contentError, setContentError] = useState("");
  const [subjectError, setSubjectError] = useState("");

  const [selectedEmailTemplates, setSelectedEmailTemplates] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // const emailTemplates = useSelector((state) => state.email.emailTemplates);
  // const selectedEmailTemplates = useSelector((state) => state.email.selectedEmailTemplates);
  // const loading = useSelector((state) => state.email.loading);
  console.log("Editor Content", editorContent);

  // Edit email tepmplate States
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for the edit modal

  const [fieldsData, setFieldsData] = useState({});
  const columnsHeading = [
    "Name",
    "Created By",
    "Updated By",
    "Created At",
    "Updated At",
    "Active",
  ];

  const rows = [
    "name",
    "created_by_name",
    "updated_by_name",
    "created_at",
    "updated_at",
    "is_active",
  ];

  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const groupByOptions = [
    { value: null, label: "No grouping" },
    { value: "name", label: "Name" },
    { value: "created_by_name", label: "Created By" },
    { value: "updated_by_name", label: "Updated By" },
    { value: "is_active", label: "Active Status" },
  ];

  // Custom styles for the Select component
  const customStyles = {
    option: (base, { data }) => ({
      ...base,
      backgroundColor: data.isCustom ? "#F0F9FF" : "white", // Light blue for custom, white for normal
      color: "#1F2937", // Standard text color
      "&:hover": {
        backgroundColor: data.isCustom ? "#E1F0FF" : "#f3f4f6", // Slightly darker blue on hover
      },
    }),
    // Keep all other styles default
    control: (base) => ({
      ...base,
      minHeight: "38px",
      width: "200px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
    }),
  };

  const handleResetAllStates = () => {
    setEditorContent(""); // Reset editor data when closing
    setNameError("");
    setContentError("");
    setTemplateName("");
    setEditorContent("");
    setSubject("");
    setSubjectError("");
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false); //for create template
    setIsEditModalOpen(false); //for edit template
    handleResetAllStates();
  };

  // ✅ This function will receive data from the RichTextEditor
  const handleEditorChange = (content) => {
    setEditorContent(content);
  };

  useEffect(() => {
    console.log("selected Items are :", selectedEmailTemplates);
  }, [selectedEmailTemplates]);

  const handleCheckboxChange = (row) => {
    console.log("template is ,", row);

    const idx = selectedEmailTemplates.findIndex(
      (selectedItem) => selectedItem.id === row.id
    );

    if (idx === -1) {
      // If the template is not selected, add it to the selection
      setSelectedEmailTemplates([...selectedEmailTemplates, row]);
    } else {
      // If the template is already selected, remove it from the selection
      setSelectedEmailTemplates(
        selectedEmailTemplates.filter(
          (selectedItem) => selectedItem.id !== row.id
        )
      );
    }
  };

  const convertEditorContentToBackendFormat = (editorContent) => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = editorContent;

    // Find all spans with our specific styling
    const spans = tempDiv.querySelectorAll("span");

    spans.forEach((span) => {
      const backgroundColor = span.style.backgroundColor;
      const text = span.textContent;

      // Check if it's an internal or external reference based on styling
      if (
        backgroundColor === "rgb(250, 240, 240)" ||
        backgroundColor === "rgb(230, 243, 255)"
      ) {
        // Extract the reference path (e.g., @internal.user.username or @external.anything)
        const referenceMatch = text.match(/@(internal|external)\.([\w.]+)/);

        if (referenceMatch) {
          const [fullMatch, type, path] = referenceMatch;
          // Create the template syntax (e.g., {{internal.user.username}})
          const templateSyntax = `{{${type}.${path}}}`;

          // Replace the span with the template syntax
          const textNode = document.createTextNode(templateSyntax);
          span.parentNode.replaceChild(textNode, span);
        }
      }
    });

    // Return the converted HTML
    return tempDiv.innerHTML;
  };

  // Function to handle template creation
  const createEmailTemplate = async () => {
    // Clear previous error messages
    setNameError("");
    setContentError("");
    setSubjectError("");

    if (subject.length > 200) {
      setSubjectError("Subject cannot be more than 200 characters");
      toast.error("Subject cannot be more than 200 characters");
      return;
    }

    if (!templateName || !editorContent || !subject) {
      if (!templateName) {
        setNameError("Template name is required.");
        toast.error("Name can't be empty");
        return;
      }
      if (!editorContent) {
        setContentError("Template content cannot be empty.");
        toast.error("Content cannot be empty");
        return;
      }
      if (!subject) {
        setSubjectError("Subject cannot be empty");
        toast.error("Subject cannot be empty");
        return;
      }
    }

    const templateData = {
      name: templateName,
      viewer_id,
      organisation_id,
      template_content: convertEditorContentToBackendFormat(editorContent),
      subject: subject,
    };

    try {
      const response = await axiosInstance.post(
        "/email-template/add-email-template",
        templateData
      );
      console.log("Add template response :", response);
      if (response.data.message == "Email template added successfully") {
        toast.success("Email template created successfully");
      } else {
        toast.error("Failed to create template!");
      }
    } catch (error) {
      console.error("Error creating email template:", error);
      toast.error("Error in creating email template");
    } finally {
      handleCloseModal();
      fetchEmailTemplates();
      handleResetAllStates();
    }
  };

  const fetchEmailTemplates = async () => {
    console.log("fetchign email templates :::::");
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/email-template/get-all-email-templates",
        {
          viewer_id,
          organisation_id,
        }
      );
      if (response.data.success) {
        console.log("response data ", response.data);
        setEmailTemplates(response.data.templates);
      } else {
        console.error("Failed to email templates:", response.data.message);
        toast.error("Failed in fetching email templates");
      }
    } catch (error) {
      console.error("Error fetching email templates:", error);
      toast.error("Error in fetching email templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailTemplates();
  }, []);

  function convertBackendToQuillFormat(htmlContent) {
    if (!htmlContent) return "";

    // Handle case where content might already be converted
    if (htmlContent.includes('style="background-color: rgb(230, 243, 255)')) {
      return htmlContent;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      const body = doc.body;

      const regex = /\{\{(internal|external)\.[^\}]+\}\}/g;
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
      const textNodes = [];

      while (walker.nextNode()) textNodes.push(walker.currentNode);

      textNodes.forEach((node) => {
        if (!node.nodeValue || !regex.test(node.nodeValue)) return;

        const parent = node.parentNode;
        const fragment = document.createDocumentFragment();
        let remainingText = node.nodeValue;
        let match;

        regex.lastIndex = 0; // Reset regex last index

        while ((match = regex.exec(remainingText)) !== null) {
          const prefix = remainingText.slice(0, match.index);
          if (prefix) fragment.appendChild(document.createTextNode(prefix));

          const fullMatch = match[0];
          const type = match[1];
          const variable = fullMatch.slice(2, -2);

          const span = document.createElement("span");
          span.textContent = `@${variable}`;
          span.style.backgroundColor =
            type === "internal" ? "rgb(250, 240, 240)" : "rgb(230, 243, 255)";
          span.style.color =
            type === "internal" ? "rgb(245, 130, 136)" : "rgb(39, 104, 168)";

          fragment.appendChild(span);
          remainingText = remainingText.slice(match.index + fullMatch.length);

          regex.lastIndex = 0; // Reset regex to avoid skipping matches
        }

        if (remainingText)
          fragment.appendChild(document.createTextNode(remainingText));
        parent.replaceChild(fragment, node);
      });

      return body.innerHTML;
    } catch (error) {
      console.error("Conversion error:", error);
      return htmlContent; // Fallback to original content
    }
  }

  const handleEditTemplate = async () => {
    const templateId = selectedEmailTemplates[0].id; // Get the ID of the selected template
    console.log("Edit template clicked", selectedEmailTemplates[0]);

    // Prepare the payload for the API request
    const payload = {
      viewer_id,
      organisation_id,
      template_id: templateId,
    };

    try {
      // Make the API call to fetch the template data
      const response = await axiosInstance.post(
        "/email-template/get-email-template-by-id",
        payload
      );

      if (response.data.success) {
        const template = response.data.template; // Get the template data from the response
        setTemplateName(template.name);
        setSubject(template.subject || "");
        // Convert backend format to Quill format FIRST
        const quillFormattedContent = convertBackendToQuillFormat(
          template.template_content
        );

        // Set the converted content to editorContent
        setEditorContent(quillFormattedContent);
        setIsEditModalOpen(true); // Open the edit modal
        console.log("Fethced editor content :::", template.template_content);
      } else {
        toast.error("Failed to fetch template data");
      }
    } catch (error) {
      console.error("Error fetching template data:", error);
      toast.error("Error fetching template data");
    }
  };

  const editTemplateSubmit = async () => {
    // Clear previous error messages
    setNameError("");
    setContentError("");
    setSubjectError("");

    // Validate the subject length
    if (subject.length > 200) {
      setSubjectError("Subject cannot be more than 200 characters");
      toast.error("Subject cannot be more than 200 characters");
      return;
    }

    // Validate inputs
    if (!templateName || !editorContent || !subject) {
      if (!templateName) {
        setNameError("Template name is required.");
        toast.error("Name can't be empty");
      }
      if (!editorContent) {
        setContentError("Template content cannot be empty.");
        toast.error("Content cannot be empty");
      }
      if (!subject) {
        setSubjectError("Subject cannot be empty");
        toast.error("Subject cannot be empty");
      }
      return;
    }

    // Prepare the payload for the edit request
    const templateData = {
      id: selectedEmailTemplates[0].id,
      name: templateName,
      viewer_id,
      organisation_id,
      template_content: convertEditorContentToBackendFormat(editorContent),
      subject: subject,
    };

    try {
      // Send the request to update the email template
      const response = await axiosInstance.post(
        "/email-template/edit-email-template",
        templateData
      );
      console.log("Update template response:", response);

      // Check the response for success
      if (response.data.message === "Email template updated successfully") {
        toast.success("Email template updated successfully");
      } else {
        toast.error("Failed to update template!");
      }
    } catch (error) {
      console.error("Error updating email template:", error);
      toast.error("Error in updating email template");
    } finally {
      // Close the modal and refetch templates
      setIsEditModalOpen(false);
      handleResetAllStates();
      fetchEmailTemplates();
    }
  };

  const handleActivateTemplate = async () => {
    // Extract template IDs from selectedEmailTemplates
    const templateIds = selectedEmailTemplates.map((template) => template.id);

    try {
      const response = await axiosInstance.post(
        "/email-template/activate-template",
        {
          viewer_id,
          organisation_id,
          template_ids: templateIds,
        }
      );

      if (response.data.success) {
        toast.success(`Activated  templates successfully`);
      } else {
        toast.error(`Failed to activate templates`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to activate templates");
    } finally {
      // Refetch the templates
      fetchEmailTemplates();
    }
  };

  const handleDeactivateTemplate = async () => {
    // Extract template IDs from selectedEmailTemplates
    const templateIds = selectedEmailTemplates.map((template) => template.id);

    try {
      // Send the request with the array of template IDs
      const response = await axiosInstance.post(
        "/email-template/deactivate-template",
        {
          viewer_id,
          organisation_id,
          template_ids: templateIds,
        }
      );

      if (response.data.success) {
        toast.success(`Deactivated  templates successfully`);
      } else {
        toast.error(`Failed to deactivate templates`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to deactivate templates");
    } finally {
      // Refetch the templates
      fetchEmailTemplates();
    }
  };

  const allActivated = selectedEmailTemplates.every(
    (template) => template.is_active
  ); //all selected templates are activated or not
  const allDeactivated = selectedEmailTemplates.every(
    (template) => !template.is_active
  ); //all selected templates are deactivated or not

  return (
    <div className="w-full px-8 py-1">
      <div className="flex justify-between items-center">
        <div className="h-[40px]">
          {selectedEmailTemplates.length === 0 ? (
            <div>
              <GlobalAddButton onClick={handleOpenModal} />
            </div>
          ) : (
            selectedEmailTemplates.length > 0 &&
            (allActivated || allDeactivated) && (
              <div className="flex justify-start items-center space-x-1 overflow-x-auto w-[40vw] py-0.5 mb-2 rounded-lg pl-2 border-b shadow-lg dropdown-container">
                {selectedEmailTemplates.length === 1 && (
                  <button
                    className="flex items-center text-secondary text-[14px] w-[80px] my-0.5 px-1 pl-4 pr-4 py-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                    onClick={handleEditTemplate}
                  >
                    <FaEdit className="mr-1" style={{ fontSize: "16px" }} />
                    Edit
                  </button>
                )}
                {allDeactivated && (
                  <button
                    className=" flex items-center text-secondary text-[14px] my-0.5 px-1 pl-4 pr-4 py-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                    onClick={handleActivateTemplate}
                  >
                    <FaFileCircleCheck
                      className="mr-1"
                      style={{ fontSize: "16px" }}
                    />
                    Activate
                  </button>
                )}
                {allActivated && (
                  <button
                    className=" flex items-center text-secondary text-[14px] my-0.5 px-1 pl-4 pr-4 py-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                    onClick={handleDeactivateTemplate}
                  >
                    <FaFileCircleCheck
                      className="mr-1"
                      style={{ fontSize: "16px" }}
                    />
                    Deactivate
                  </button>
                )}
              </div>
            )
          )}
        </div>

        <div className="flex items-center">

          <Select
            value={groupByOptions.find(option => option.value === groupByColumn)}
            onChange={(selectedOption) => setGroupByColumn(selectedOption?.value)}
            options={groupByOptions}
            styles={customStyles}
          />
        </div>

        
      </div>

      <div className="py-2">
        <ResizableTable
          data={emailTemplates}
          columnsHeading={columnsHeading}
          rowKeys={rows}
          loading={loading}
          OnChangeHandler={handleCheckboxChange}
          selectedItems={selectedEmailTemplates}
          noCheckbox={false}
          disableSelectAll={true}
          heightNotFixed={true}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          groupByColumn={groupByColumn}
          expandedGroups={expandedGroups}
          setExpandedGroups={setExpandedGroups}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[99]">
          <div className=" shadow-2xl w-[80%] max-w-4xl h-[90%] relative bg-white flex flex-col">
            {/* Header */}
            <div className="sticky top-0  bg-white border-b px-6 py-4 shadow-md z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create Email Template
                </h2>
                <button
                  className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={handleCloseModal}
                >
                  <MdClose size={24} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-6 py-4 flex-grow overflow-y-auto">
              <div className="space-y-6">
                {/* Template Name Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Template Name
                  </label>
                  <div>
                    <input
                      value={templateName}
                      onChange={(e) => {
                        setTemplateName(e.target.value);
                        setNameError("");
                      }}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-700 focus:border-sky-700 transition-colors"
                      placeholder="Enter template name..."
                    />
                    {nameError && (
                      <p className="mt-1 text-sm text-red-500">{nameError}</p>
                    )}
                  </div>
                </div>

                {/* Subject Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <div>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-700 focus:border-sky-700 transition-colors"
                      placeholder="Enter email subject..."
                    />
                    {subjectError && (
                      <p className="mt-1 text-sm text-red-500">
                        {subjectError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rich Text Editor */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Content
                  </label>
                  <div className="w-full min-h-[50px] ">
                    <RichTextEditor
                      value={editorContent}
                      onChange={handleEditorChange}
                      fieldsData={fieldsData}
                    />
                  </div>
                  {contentError && (
                    <p className="mt-1 text-sm text-red-500">{contentError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="space-x-16 flex justify-end p-2 border-t mb-2 shadow-md z-10"
              style={{ boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)" }}
            >
              <div className=" mt-2 flex space-x-[20px] justify-between mr-8 ">
                <button
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  className={`px-6 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md  focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={createEmailTemplate}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[99]">
          <div className=" shadow-2xl w-[80%] max-w-4xl h-[90%] relative bg-white flex flex-col">
            {/* Header */}
            <div className="sticky top-0  bg-white border-b px-6 py-4 shadow-md z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Email Template
                </h2>
                <button
                  className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={handleCloseModal}
                >
                  <MdClose size={24} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Form Content - Same structure as create modal */}
            <div className="px-6 py-4 flex-grow overflow-y-auto">
              <div className="space-y-6">
                {/* Template Name Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Template Name
                  </label>
                  <div>
                    <input
                      value={templateName}
                      onChange={(e) => {
                        setTemplateName(e.target.value);
                        setNameError("");
                      }}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-700 focus:border-sky-700 transition-colors"
                      placeholder="Enter template name..."
                    />
                    {nameError && (
                      <p className="mt-1 text-sm text-red-500">{nameError}</p>
                    )}
                  </div>
                </div>

                {/* Subject Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <div>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-700 focus:border-sky-700 transition-colors"
                      placeholder="Enter email subject..."
                    />
                    {subjectError && (
                      <p className="mt-1 text-sm text-red-500">
                        {subjectError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rich Text Editor */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Content
                  </label>
                  <div className="w-full min-h-[450px]">
                    <RichTextEditor
                      value={editorContent}
                      onChange={handleEditorChange}
                      fieldsData={fieldsData}
                    />
                  </div>
                  {contentError && (
                    <p className="mt-1 text-sm text-red-500">{contentError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="space-x-16 flex justify-end p-2 border-t mb-2 shadow-md z-10"
              style={{ boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)" }}
            >
              <div className=" mt-2 flex space-x-[20px] justify-between mr-8 ">
                <button
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  className={`px-6 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md  focus:outline-none focus:ring-2  disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={editTemplateSubmit}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTab;
