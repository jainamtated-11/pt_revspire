import React, { useContext, useEffect, useState } from "react";
import { MdClose, MdAdd, MdOutlineMailOutline, MdCheck, MdErrorOutline } from "react-icons/md";
import { LuLoaderCircle } from "react-icons/lu";
import RichTextEditor from "../../../UserManager/Organisation/RichTextEditor";
import toast from "react-hot-toast";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../../context/GlobalState";
import EditEmailPlaceholdersDialog from "./EditEmailPlaceholdersDialog";

const SendEmailDialog = ({
  isOpen,
  onClose,
  initialEmailContent = "",
  initialEmailSubject = "",
  selectedPitchId,
  organisationId,
}) => {
  const { viewer_id, organisation_id } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  // Email state
  const [emailContent, setEmailContent] = useState(initialEmailContent);
  const [emailSubject, setEmailSubject] = useState(initialEmailSubject);
  const [recipients, setRecipients] = useState([]);
  const [newRecipient, setNewRecipient] = useState("");
  const [loadingSendEmail, setLoadingSendEmail] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [fieldsData, setFieldsData] = useState({});
  const [showPlaceholdersDialog, setShowPlaceholdersDialog] = useState(false);
  const [externalPlaceholders, setExternalPlaceholders] = useState([]);
  const [validation, setValidation] = useState({
    subject: true,
    recipients: true,
    content: true
  });

  useEffect(() => {
    const fetchEmailPlaceholderFields = async () => {
      try {
        const response = await axiosInstance.post(
          "/email-template/retrieve-email-placeholder-fields",
          {
            viewer_id,
            organisation_id,
          }
        );

        if (response.data.success) {
          setFieldsData(response.data.data);
        } else {
          toast.error("Failed to fetch email placeholder fields");
        }
      } catch (err) {
        console.error("Error fetching email placeholder fields:", err);
      }
    };

    fetchEmailPlaceholderFields();
  }, []);

  const handleAddRecipient = () => {
    if (!newRecipient.trim()) return;
    
    const emails = newRecipient.split(",").map((email) => email.trim());
    let hasInvalid = false;

    emails.forEach((email) => {
      if (!email) return;
      
      if (!validateEmail(email)) {
        toast.error(`"${email}" is not a valid email.`);
        hasInvalid = true;
      } else if (recipients.includes(email)) {
        toast.error(`"${email}" is already in the recipients list.`);
      } else {
        setRecipients((prev) => [...prev, email]);
        toast.success(`Added ${email} to recipients`);
      }
    });
    
    setValidation(prev => ({...prev, recipients: recipients.length > 0 || !hasInvalid}));
    setNewRecipient("");
  };

  const handleRemoveRecipient = (email) => {
    setRecipients(recipients.filter((recipient) => recipient !== email));
    setValidation(prev => ({...prev, recipients: recipients.length > 1}));
    toast.success(`Removed ${email} from recipients`);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    const newValidation = {
      subject: emailSubject.trim().length > 0,
      recipients: recipients.length > 0,
      content: emailContent.trim().length > 0
    };
    setValidation(newValidation);
    return Object.values(newValidation).every(v => v);
  };

  const handleSendEmail = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoadingSendEmail(true);

    try {
      const response = await axiosInstance.post("/send-pitch-share-email", {
        email_ids: recipients,
        viewer_id: viewer_id,
        organisation_id: organisationId,
        emailContent: emailContent,
        emailSubject: emailSubject,
      });

      if (response.status === 200) {
        toast.success("Email sent successfully!");
        resetDialog();
      }
    } catch (error) {
      toast.error("Failed to send email. Please try again.");
    } finally {
      setLoadingSendEmail(false);
    }
  };

  const resetDialog = () => {
    setEmailContent(initialEmailContent);
    setEmailSubject(initialEmailSubject);
    setRecipients([]);
    setNewRecipient("");
    setValidation({
      subject: true,
      recipients: true,
      content: true
    });
    onClose();
  };

  useEffect(() => {
    if (isOpen && selectedPitchId && !initialEmailContent) {
      const loadEmailContent = async () => {
        setLoadingContent(true);
        try {
          const response = await axiosInstance.post(
            "/preview-pitch-share-email",
            {
              pitch_id: selectedPitchId,
              organisation_id: organisationId,
              viewer_id: viewer_id,
            }
          );

          if (response.status === 200) {
            const content = response.data.emailContent;
            setEmailContent(content);
            setEmailSubject(response.data.emailSubject);
            setValidation(prev => ({
              ...prev,
              subject: response.data.emailSubject.trim().length > 0,
              content: content.trim().length > 0
            }));

            // Check for external placeholders
            const placeholders = extractExternalPlaceholders(content);
            if (placeholders.length > 0) {
              setExternalPlaceholders(placeholders);
              setShowPlaceholdersDialog(true);
            }
          }
        } catch (error) {
          console.error("Error loading email content:", error);
          toast.error("Failed to load email template");
        } finally {
          setLoadingContent(false);
        }
      };

      loadEmailContent();
    }
  }, [isOpen, selectedPitchId]);

  const extractExternalPlaceholders = (content) => {
    const regex = /{{external\.([^}]+)}}/g;
    const placeholders = new Set();
    let match;

    while ((match = regex.exec(content)) !== null) {
      placeholders.add(match[1]);
    }

    return Array.from(placeholders);
  };

  const replacePlaceholders = (content, values) => {
    let newContent = content;
    Object.entries(values).forEach(([placeholder, value]) => {
      const regex = new RegExp(`{{external\.${placeholder}}}`, "g");
      newContent = newContent.replace(regex, value);
    });
    return newContent;
  };

  const handlePlaceholderSave = (values) => {
    const newContent = replacePlaceholders(emailContent, values);
    setEmailContent(newContent);
    setShowPlaceholdersDialog(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[99] p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-white px-6 py-4 z-10 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <MdOutlineMailOutline className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  New Message
                </h2>
                <p className="text-xs text-gray-500">Send to your contacts</p>
              </div>
            </div>
            <button
              onClick={resetDialog}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-grow overflow-y-auto px-6 py-4">
            {loadingContent ? (
              <div className="flex justify-center items-center h-full">
                <div className="flex flex-col items-center">
                  <LuLoaderCircle className="animate-spin h-8 w-8 text-blue-600 mb-2" />
                  <p className="text-sm text-gray-500">Loading template...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Email Subject Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      Subject
                      {!validation.subject && (
                        <MdErrorOutline className="ml-1 text-red-500" size={16} />
                      )}
                    </label>
                    {emailSubject && validation.subject && (
                      <MdCheck className="text-green-500" size={16} />
                    )}
                  </div>
                  <div className={`relative rounded-xl overflow-hidden transition-all ${!validation.subject ? 'ring-1 ring-red-500' : 'focus-within:ring-2 focus-within:ring-blue-500'}`}>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => {
                        setEmailSubject(e.target.value);
                        setValidation(prev => ({...prev, subject: e.target.value.trim().length > 0}));
                      }}
                      className="w-full px-4 py-2 focus:outline-none bg-gray-50 rounded-xl"
                      placeholder="Your email subject..."
                    />
                  </div>
                </div>

                {/* Recipients Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      Recipients
                      {!validation.recipients && (
                        <MdErrorOutline className="ml-1 text-red-500" size={16} />
                      )}
                    </label>
                    {recipients.length > 0 && validation.recipients && (
                      <MdCheck className="text-green-500" size={16} />
                    )}
                  </div>
                  <div className={`flex items-center bg-gray-50 rounded-xl overflow-hidden transition-all ${!validation.recipients ? 'ring-1 ring-red-500' : 'focus-within:ring-2 focus-within:ring-blue-500'}`}>
                    <input
                      type="text"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddRecipient()}
                      className="flex-grow px-4 py-2 focus:outline-none bg-transparent"
                      placeholder="Enter email addresses..."
                    />
                    <button
                      onClick={handleAddRecipient}
                      className="px-4 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <MdAdd size={20} />
                    </button>
                  </div>
                  
                  {/* Recipients Tags */}
                  {recipients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {recipients.map((recipient, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm flex items-center group"
                        >
                          <span className="max-w-[120px] truncate">{recipient}</span>
                          <button
                            onClick={() => handleRemoveRecipient(recipient)}
                            className="ml-1 text-blue-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MdClose size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rich Text Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      Content
                      {!validation.content && (
                        <MdErrorOutline className="ml-1 text-red-500" size={16} />
                      )}
                    </label>
                    {emailContent && validation.content && (
                      <MdCheck className="text-green-500" size={16} />
                    )}
                  </div>
                  <div className={`rounded-xl overflow-hidden transition-all ${!validation.content ? 'ring-1 ring-red-500' : 'border border-gray-200'}`}>
                    <RichTextEditor
                      value={emailContent}
                      onChange={(content) => {
                        setEmailContent(content);
                        setValidation(prev => ({...prev, content: content.trim().length > 0}));
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {recipients.length > 0 ? (
                <span>{recipients.length} recipient{recipients.length !== 1 ? 's' : ''}</span>
              ) : (
                <span className="text-red-500">No recipients added</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={resetDialog}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSendEmail}
                disabled={loadingSendEmail || loadingContent}
                className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center justify-center min-w-[120px] ${
                  loadingSendEmail 
                    ? 'bg-blue-400' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md'
                }`}
              >
                {loadingSendEmail ? (
                  <>
                    <LuLoaderCircle className="animate-spin mr-2" size={16} />
                    Sending...
                  </>
                ) : (
                  <>
                    <MdOutlineMailOutline className="mr-2" size={16} />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholders Dialog */}
      <EditEmailPlaceholdersDialog
        isOpen={showPlaceholdersDialog}
        onClose={() => {
          setShowPlaceholdersDialog(false);
          resetDialog();
        }}
        placeholders={externalPlaceholders}
        onSave={handlePlaceholderSave}
      />
    </>
  );
};

export default SendEmailDialog;