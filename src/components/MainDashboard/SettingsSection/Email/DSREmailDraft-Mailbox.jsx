import { useState, useEffect, useMemo } from "react"
import { MdClose } from "react-icons/md"
import { LuLoaderCircle } from "react-icons/lu"
import { Send } from "lucide-react"
import RichTextEditor from "../../../UserManager/Organisation/RichTextEditor"
import toast from "react-hot-toast"
import useAxiosInstance from "../../../../Services/useAxiosInstance";

const SendDSREmailDialog = ({
  isOpen,
  onClose,
  initialEmailContent = "",
  initialEmailSubject = "",
  initialRecipients = [],
  initialCCRecipients = [],
}) => {
  // Ensure initialRecipients is an array
  // Normalize initial recipients, handling various input types
  const normalizedInitialRecipients = useMemo(() => {
    // If initialRecipients is not an array, convert to array
    const recipientsArray = Array.isArray(initialRecipients)
      ? initialRecipients
      : initialRecipients
        ? [initialRecipients]
        : []

    // Normalize recipients to email strings
    return recipientsArray
      .map((recipient) => (typeof recipient === "string" ? recipient : recipient.email || recipient))
      .filter(Boolean) // Remove any undefined or empty values
  }, [initialRecipients])

  const normalizedInitialCc = useMemo(() => {
    // If initialCc is not an array, convert to array
    const ccArray = Array.isArray(initialCCRecipients) ? initialCCRecipients : initialCCRecipients ? [initialCCRecipients] : []

    // Normalize cc to email strings
    return ccArray
      .map((recipient) => (typeof recipient === "string" ? recipient : recipient.email || recipient))
      .filter(Boolean) // Remove any undefined or empty values
  }, [initialCCRecipients])

  const [emailContent, setEmailContent] = useState(initialEmailContent)
  const [emailSubject, setEmailSubject] = useState(initialEmailSubject)
  const [recipients, setRecipients] = useState(normalizedInitialRecipients)
  const [cc, setCc] = useState(normalizedInitialCc)
  const [newRecipient, setNewRecipient] = useState("")
  const [newCc, setNewCc] = useState("")
  const [loadingSendEmail, setLoadingSendEmail] = useState(false)

  const axiosInstance = useAxiosInstance()

  // Update content when props change
  // Initialize state with initial props
  useEffect(() => {
    setEmailContent(initialEmailContent)
    setEmailSubject(initialEmailSubject)

    // Set initial recipients only if not already set
    if (recipients.length === 0) {
      setRecipients(normalizedInitialRecipients)
    }

    // Set initial cc only if not already set
    if (cc.length === 0) {
      setCc(normalizedInitialCc)
    }
  }, [initialEmailContent, initialEmailSubject, normalizedInitialRecipients, normalizedInitialCc])

  const handleAddRecipient = () => {
    if (!newRecipient.trim()) return

    const emails = String(newRecipient || "").split(",").map((email) => email.trim())

    emails.forEach((email) => {
      if (!validateEmail(email)) {
        toast.error(`"${email}" is not a valid email.`)
      } else if (recipients.includes(email)) {
        toast.error(`"${email}" is already in the recipients list.`)
      } else {
        setRecipients((prev) => [...prev, email])
      }
    })
    setNewRecipient("")
  }

  const handleRemoveRecipient = (email) => {
    setRecipients(recipients.filter((recipient) => recipient !== email))
  }

  const handleAddCc = () => {
    if (!newCc.trim()) return

    const emails = String(newCc || "").split(",").map((email) => email.trim())

    emails.forEach((email) => {
      if (!validateEmail(email)) {
        toast.error(`"${email}" is not a valid email.`)
      } else if (cc.includes(email)) {
        toast.error(`"${email}" is already in the CC list.`)
      } else {
        setCc((prev) => [...prev, email])
      }
    })
    setNewCc("")
  }

  const handleRemoveCc = (email) => {
    setCc(cc.filter((ccEmail) => ccEmail !== email))
  }

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSendEmail = async () => {
    if (!recipients.length || !emailContent || !emailSubject) {
      toast.error("All fields must be filled.")
      return
    }

    setLoadingSendEmail(true)

    try {
      const response = await axiosInstance.post(
        "/send-dsr-draft-email",
        {
          email_ids: recipients,
          cc: cc,
          emailContent: emailContent,
          emailSubject: emailSubject,
        },
        { withCredentials: true },
      )

      if (response.status === 200) {
        toast.success("Email sent successfully!")
        onClose()
      }
    } catch (error) {
      toast.error("Failed to send email. Please try again.")
      console.error("Error sending email:", error)
    } finally {
      setLoadingSendEmail(false)
    }
  }

  const resetDialog = () => {
    setRecipients([])
    setNewRecipient("")
    setCc([])
    setNewCc("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[99] transition-opacity duration-200">
      <div className="w-[90%] max-w-4xl h-[90%] bg-white rounded-md shadow-lg flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-medium text-gray-800">Send Email</h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={resetDialog}
            aria-label="Close"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-6 py-5 flex-grow overflow-y-auto">
          <div className="space-y-5">
            {/* Email Subject Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email subject..."
              />
            </div>

            {/* Recipients Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Recipients</label>
              <div className="flex">
                <input
                  type="text"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddRecipient()}
                  className="w-full px-3 py-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add recipient email (separate multiple with commas)..."
                />
                <button
                  onClick={handleAddRecipient}
                  className="ml-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  aria-label="Add recipient"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Recipients Tags */}
            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 max-h-[110px] overflow-y-auto">
                {recipients.map((recipient, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-sm bg-gray-100 text-gray-800"
                  >
                    {recipient}
                    <button
                      className="ml-1.5 text-gray-500 hover:text-gray-700"
                      onClick={() => handleRemoveRecipient(recipient)}
                      aria-label={`Remove ${recipient}`}
                    >
                      <MdClose size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* CC Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">CC</label>
              <div className="flex">
                <input
                  type="text"
                  value={newCc}
                  onChange={(e) => setNewCc(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCc()}
                  className="w-full px-3 py-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add CC email (separate multiple with commas)..."
                />
                <button
                  onClick={handleAddCc}
                  className="ml-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  aria-label="Add CC"
                >
                  Add
                </button>
              </div>
            </div>

            {/* CC Tags */}
            {cc.length > 0 && (
              <div className="flex flex-wrap gap-2 max-h-[110px] overflow-y-auto">
                {cc.map((ccEmail, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-sm bg-gray-100 text-gray-800"
                  >
                    {ccEmail}
                    <button
                      className="ml-1.5 text-gray-500 hover:text-gray-700"
                      onClick={() => handleRemoveCc(ccEmail)}
                      aria-label={`Remove ${ccEmail}`}
                    >
                      <MdClose size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Rich Text Editor */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Content</label>
              <div className="border border-gray-300 rounded-md">
                <RichTextEditor value={emailContent} onChange={setEmailContent} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={resetDialog}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
              onClick={handleSendEmail}
              disabled={loadingSendEmail}
            >
              {loadingSendEmail ? (
                <LuLoaderCircle className="animate-spin h-4 w-4" />
              ) : (
                <>
                  <Send className="mr-1.5" size={18} />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SendDSREmailDialog
