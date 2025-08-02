import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { X, Send, Loader } from "lucide-react"
import { generateEmailDraft, clearEmailDraft } from "../../../features/dsr/dsrSlice"
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx"
import SendDSREmailDialog from "./DSREmailDraft"

const EMAIL_TYPES = [
  { id: "follow_up", label: "Follow-up Email" },
  { id: "initial_outreach", label: "Initial Outreach" },
  { id: "proposal", label: "Proposal" },
  { id: "meeting_request", label: "Meeting Request" },
  { id: "custom", label: "Custom Email" },
]

export default function EmailDraftGeneratorModal({ isOpen, onClose, selectedEmail, initialRecipients, initialCCRecipients }) {
  const [emailType, setEmailType] = useState("follow_up")
  const [additionalDetails, setAdditionalDetails] = useState("")
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false)
  const dispatch = useDispatch()
  const axiosInstance = useAxiosInstance()

  const { emails, emailDraft, emailDraftLoading, emailDraftError } = useSelector((state) => state.dsr)

  const handleGenerate = () => {
    if (!selectedEmail) return

    // Get all email content from the thread
    const emailContent = selectedEmail.emails.map((email) => email.content).join("\n\n")

    // Construct the user input with type and additional details
    const user_input = {
      type: emailType,
      currentUser: emails.mailboxEmail,
      latestEmailFrom: selectedEmail.latestEmail.from,
      latestEmailTo: selectedEmail.latestEmail.to,
      details: additionalDetails,
    }

    dispatch(
      generateEmailDraft({
        user_input,
        email_content: emailContent,
        axiosInstance,
      }),
    ).then((response) => {
      if (response.payload && !emailDraftLoading) {
        setIsSendEmailDialogOpen(true)
      }
    })
  }

  const handleClose = () => {
    dispatch(clearEmailDraft())
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-secondary">Generate Email Draft</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {emailDraftError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {emailDraftError}
                </div>
              )}

              <div>
                <label htmlFor="emailType" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Type
                </label>
                <select
                  id="emailType"
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                >
                  {EMAIL_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Context or Instructions
                </label>
                <textarea
                  id="additionalDetails"
                  rows={4}
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Add any details about the client, specific points to address, or tone preferences..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
                <p className="text-sm">
                  Generating an email draft based on thread: <strong>{selectedEmail?.subject}</strong>
                </p>
                <p className="text-sm mt-1">
                  The AI will analyze the email thread context and generate an appropriate response.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={emailDraftLoading}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2"
                >
                  {emailDraftLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Generate Draft</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SendDSREmailDialog
        isOpen={isSendEmailDialogOpen}
        onClose={() => {
          setIsSendEmailDialogOpen(false)
        }}
        initialEmailContent={emailDraft?.emailDraft || ""}
        initialEmailSubject={selectedEmail?.subject || ""}
        initialRecipients={initialRecipients}
        initialCCRecipients={
          typeof initialCCRecipients === "string"
            ? initialCCRecipients.split(",").map(email => email.trim()).filter(email => email)
            : []
        }
      />
    </>
  )
}
