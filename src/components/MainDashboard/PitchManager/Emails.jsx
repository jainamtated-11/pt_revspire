import { useState, useEffect, useRef } from "react"
import {
  Search,
  Mail,
  ChevronDown,
  ChevronUp,
  Clock,
  X,
  PenSquare,
  ArrowLeft,
} from "lucide-react"
import { format } from "date-fns"
import { useSelector } from "react-redux"
import EmailDraftGeneratorModal from "./EmailDraftModal.jsx"
import { LuLoaderCircle } from "react-icons/lu"

export default function Emails({ showEmailModal, setShowEmailModal }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [expandedThreads, setExpandedThreads] = useState({})
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileList, setShowMobileList] = useState(true)
  const [activeTab, setActiveTab] = useState("inbox")

  const emailListRef = useRef(null)

  const { emails, emailsLoading, emailsError } = useSelector((state) => state.dsr)

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    checkMobileView()
    window.addEventListener("resize", checkMobileView)

    return () => {
      window.removeEventListener("resize", checkMobileView)
    }
  }, [])

  // When an email is selected in mobile view, show the detail view
  useEffect(() => {
    if (isMobileView && selectedEmail) {
      setShowMobileList(false)
    }
  }, [selectedEmail, isMobileView])

  const closeEmailModal = () => {
    setShowEmailModal(false)
  }

  const formatDate = (date) => {
    const now = new Date()
    const emailDate = new Date(date)

    if (emailDate.toDateString() === now.toDateString()) {
      return format(emailDate, "h:mm a")
    } else if (emailDate.getFullYear() === now.getFullYear()) {
      return format(emailDate, "MMM d")
    } else {
      return format(emailDate, "MMM d, yyyy")
    }
  }

  const cleanSummary = (rawSummary = "") => {
    if (!rawSummary) return ""

    // If rawSummary is an object with a summary property, use that
    if (typeof rawSummary === "object" && rawSummary.summary) {
      return rawSummary.summary.trim()
    }

    // Otherwise treat as string
    const summaryString = typeof rawSummary === "string" ? rawSummary : String(rawSummary)
    const summaryMatch = summaryString.match(/Summary:\s*([\s\S]*)/)
    return summaryMatch ? summaryMatch[1].trim() : summaryString
  }

  const toggleThread = (subject) => {
    setExpandedThreads((prev) => ({
      ...prev,
      [subject]: !prev[subject],
    }))
  }

  useEffect(() => {
    if (showEmailModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }, [showEmailModal])

  const processedEmails = Object.entries(emails.groupedEmails || {})
    .map(([threadId, threadEmails]) => {
      const latestEmail = threadEmails[0]
      // Get the summary from the summaries object using the threadId as key
      const summary = emails.summaries?.[threadId] || ""

      return {
        subject: latestEmail.subject,
        summary: summary,
        threadId,
        emails: threadEmails,
        latestEmail,
        date: new Date(latestEmail.date),
      }
    })
    .sort((a, b) => b.date - a.date)

  const initialRecipients = (() => {
    const mailboxEmails = emails.mailboxEmail || []

    if (!selectedEmail?.latestEmail) return []

    const { from, to = [] } = selectedEmail.latestEmail

    const rawRecipients = Array.isArray(to) ? [...to, from] : [from, to]

    // Normalize and filter out mailboxEmails
    return rawRecipients.filter(
      (email) => email && typeof email === "string" && !mailboxEmails.includes(email.toLowerCase()),
    )
  })()

  const filteredEmails = processedEmails.filter((email) =>
    [email.subject, email.summary, ...email.emails.map((e) => e.from)]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  )

  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text
    const parts = text.toString().split(new RegExp(`(${searchTerm})`, "gi"))
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className="bg-yellow-100 dark:bg-yellow-800">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  // Function to sanitize email HTML content
  const sanitizeEmailContent = (html) => {
    if (!html) return ""

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html

    // Remove all style and class attributes
    const allElements = tempDiv.querySelectorAll("*")
    allElements.forEach((el) => {
      el.removeAttribute("style")
      el.removeAttribute("class")
      el.removeAttribute("id")

      // Remove any inline event handlers
      const attributes = el.getAttributeNames()
      attributes.forEach((attr) => {
        if (attr.startsWith("on")) {
          el.removeAttribute(attr)
        }
      })
    })

    // Remove any style/link elements
    const styleElements = tempDiv.querySelectorAll('style, link[rel="stylesheet"]')
    styleElements.forEach((el) => el.remove())

    return tempDiv.innerHTML
  }

  const renderEmailItem = (email) => (
    <div
      key={email.threadId}
      className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 ${
        selectedEmail?.threadId === email.threadId ? "bg-blue-50 dark:bg-blue-900/30" : ""
      }`}
      onClick={() => setSelectedEmail(email)}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-shrink-0 mt-1">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
            {email.latestEmail.from.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {highlightText(email.subject, searchTerm)}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {highlightText(email.latestEmail.from, searchTerm)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 mt-1">
            {highlightText(cleanSummary(email.summary), searchTerm)}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(email.date)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleThread(email.threadId)
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          >
            {expandedThreads[email.threadId] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expandedThreads[email.threadId] && (
        <div className="mt-3 pl-3 border-l-2 border-gray-200 dark:border-gray-600 ml-10">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Thread ({email.emails.length})
          </h4>
          {email.emails.slice(0, 3).map((threadEmail, index) => (
            <div key={index} className="mb-2 pb-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div className="flex justify-between items-center">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                  {highlightText(threadEmail.from, searchTerm)}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(threadEmail.date)}
                </div>
              </div>
            </div>
          ))}
          {email.emails.length > 3 && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+{email.emails.length - 3} more emails</p>
          )}
        </div>
      )}
    </div>
  )

  const renderEmailDetail = () => {
    if (!selectedEmail) {
      return (
        <div className="bg-white dark:bg-gray-800 h-full flex items-center justify-center">
          <div className="text-center p-6">
            <Mail className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No email selected</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Select an email from the list to view details</p>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
        {/* Email Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
          {isMobileView && (
            <button onClick={() => setShowMobileList(true)} className="mr-3 text-gray-500 dark:text-gray-400">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">{selectedEmail.subject}</h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="truncate">{selectedEmail.latestEmail.from}</span>
              <span className="mx-1">•</span>
              <span className="whitespace-nowrap">{formatDate(selectedEmail.date)}</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDraftModalOpen(true)}
              className="flex whitespace-nowrap items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-2 rounded-md text-sm"
            >
              <PenSquare className="h-4 w-4 mr-2" />
              <span>Draft Response</span>
            </button>
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Summary Card */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Summary
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{cleanSummary(selectedEmail.summary)}</p>
          </div>

          {/* Thread */}
          <div className="space-y-4">
            {selectedEmail.emails.map((email, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                    {email.from.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{email.from}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {format(new Date(email.date), "PPp")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      To: {Array.isArray(email.to) ? email.to.join(", ") : email.to}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 email-content">
                  {["<html></html>", "<html></body></html>"].includes(email.content) ? (
                    <div className="italic text-gray-400 dark:text-gray-500">(Email content not available)</div>
                  ) : (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: sanitizeEmailContent(email.content) }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!showEmailModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Email Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search emails..."
                className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={closeEmailModal}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {emailsLoading ? (
            <div className="h-full flex items-center justify-center">
              <LuLoaderCircle className="animate-spin text-4xl text-blue-600 dark:text-blue-400" />
            </div>
          ) : emailsError ? (
            <div className="h-full flex items-center justify-center px-6 text-center">
              <p className="text-base text-gray-900 dark:text-gray-100">
                Error fetching emails. Please check your primary email connection and try again.
                <br />
                If not, contact your admin or support.
              </p>
            </div>
          ) : (
            <div className="h-full flex">
              

              {/* Email List & Detail View */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Email List - Responsive */}
                {(!isMobileView || (isMobileView && showMobileList)) && (
                  <div
                    className={`${isMobileView ? "w-full" : "w-1/3"} border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden flex flex-col`}
                  >

                    {/* Email List */}
                    <div className="flex-1 overflow-y-auto" ref={emailListRef}>
                      {filteredEmails.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                          No emails found matching your search.
                        </div>
                      ) : (
                        filteredEmails.map(renderEmailItem)
                      )}
                    </div>
                  </div>
                )}

                {/* Email Detail - Responsive */}
                {(!isMobileView || (isMobileView && !showMobileList)) && (
                  <div className="flex-1 h-full overflow-hidden">{renderEmailDetail()}</div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Email Draft Generator Modal */}
        {isDraftModalOpen && selectedEmail && (
          <EmailDraftGeneratorModal
            isOpen={isDraftModalOpen}
            onClose={() => setIsDraftModalOpen(false)}
            selectedEmail={selectedEmail}
            initialRecipients={initialRecipients || []}
            initialCCRecipients={selectedEmail?.latestEmail?.cc || []}
          />
        )}
      </div>
    </div>
  )
}
