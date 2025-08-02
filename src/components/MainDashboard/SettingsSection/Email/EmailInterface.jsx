import { useState, useEffect, useCallback, useContext, useRef } from "react"
import {
  Search,
  Mail,
  X,
  Send,
  Loader,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Clock,
} from "lucide-react"
import { format } from "date-fns"
import { useSelector, useDispatch } from "react-redux"
import { generateEmailDraft, clearEmailDraft } from "../../../../features/dsr/dsrSlice.js"
import { LuLoaderCircle } from "react-icons/lu"
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx"
import toast from "react-hot-toast"
import { GlobalContext } from "../../../../context/GlobalState.jsx"
import { useCookies } from "react-cookie"
import RichTextEditor from "../../../UserManager/Organisation/RichTextEditor"

export default function EmailInterface({ showEmailModal, setShowEmailModal, emailData }) {
  const { viewer_id } = useContext(GlobalContext)
  const cookies = useCookies("userData")
  const organisation_id = cookies.userData?.organisation?.id
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEmails, setFilteredEmails] = useState([])
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [expandedThreads, setExpandedThreads] = useState({})
  const [pageIndex, setPageIndex] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [emailsList, setEmailsList] = useState([])
  const axiosInstance = useAxiosInstance()
  const [initialLoading, setInitialLoading] = useState(false)
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileList, setShowMobileList] = useState(true)
  const [activeTab, setActiveTab] = useState("inbox")
  const [fetchError, setFetchError] = useState(null)
  const [isFetchBlocked, setIsFetchBlocked] = useState(false)
  const retryTimeoutRef = useRef(null)

  const { emails, emailsLoading, emailsError } = useSelector((state) => state.dsr)

  // Email composition states
  const [emailContent, setEmailContent] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const [recipients, setRecipients] = useState([])
  const [cc, setCc] = useState([])
  const [newRecipient, setNewRecipient] = useState("")
  const [newCc, setNewCc] = useState("")

  const dispatch = useDispatch()
  const emailListRef = useRef(null)

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    checkMobileView()
    window.addEventListener("resize", checkMobileView)

    return () => {
      window.removeEventListener("resize", checkMobileView)
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
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

  const fetchMoreEmails = useCallback(
    async (page = 0, keyword = "") => {
      if (isFetchBlocked || isLoadingMore || !hasMore || initialLoading) return

      if (page === 0) {
        setInitialLoading(true)
        setFetchError(null)
      } else {
        setIsLoadingMore(true)
      }

      try {
        const response = await axiosInstance.post("/extract-emails", {
          pageSize: 15,
          pageIndex: page,
          email_account: emailData,
          keyword: keyword
        })

        if (response.data) {
          const { groupedEmails, summaries } = response.data
          const totalEmails = response?.data?.totalEmails || 0
          const pageSize = 15

          const emailsArray = Object.entries(groupedEmails || {}).map(([threadId, emails]) => {
            const latestEmail = emails[0]
            return {
              subject: latestEmail.subject,
              summary: summaries[threadId] || "",
              threadId,
              emails: emails,
              latestEmail: {
                from: latestEmail.from,
                to: latestEmail.to,
                date: latestEmail.date,
                subject: latestEmail.subject,
                content: latestEmail.content,
                cc: latestEmail.cc || [],
              },
              date: new Date(latestEmail.date),
            }
          })

          if (page === 0) {
            setEmailsList(emailsArray)
          } else {
            setEmailsList((prev) => [...prev, ...emailsArray])
          }

          setPageIndex(page)
          setHasMore(emailsArray.length > 0 && (page + 1) * pageSize < totalEmails)
          setIsFetchBlocked(false)
        }
      } catch (error) {
        console.error("Error fetching emails:", error)
        setIsFetchBlocked(true)
        setFetchError({
          message: "Failed to fetch emails",
          details: error.response?.data?.message || error.message,
          status: error.response?.status
        })
        setHasMore(false)

        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
        }
        retryTimeoutRef.current = setTimeout(() => {
          setIsFetchBlocked(false)
        }, 5000)
      } finally {
        if (page === 0) {
          setInitialLoading(false)
        } else {
          setIsLoadingMore(false)
        }
      }
    },
    [hasMore, isLoadingMore, initialLoading, isFetchBlocked, axiosInstance, emailData]
  )

  const handleScroll = useCallback(
    (e) => {
      const element = e.target
      if (!element || isLoadingMore || !hasMore || initialLoading || isFetchBlocked) return

      const scrollPosition = element.scrollTop
      const totalHeight = element.scrollHeight
      const visibleHeight = element.clientHeight

      if (scrollPosition + visibleHeight >= totalHeight * 0.75) {
        fetchMoreEmails(pageIndex + 1)
      }
    },
    [pageIndex, hasMore, isLoadingMore, initialLoading, fetchMoreEmails, isFetchBlocked]
  )

  useEffect(() => {
    const listElement = emailListRef.current
    if (listElement) {
      listElement.addEventListener("scroll", handleScroll)
      return () => {
        listElement.removeEventListener("scroll", handleScroll)
      }
    }
  }, [handleScroll])

  useEffect(() => {
    if (showEmailModal && !initialLoading && emailsList.length === 0) {
      setPageIndex(0)
      setHasMore(true)
      fetchMoreEmails(0)
    }
  }, [showEmailModal, fetchMoreEmails, initialLoading, emailsList.length])

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

  const cleanSummary = (rawSummary) => {
    if (!rawSummary || typeof rawSummary !== "string") return ""
    const summaryMatch = rawSummary.match(/Summary:\s*([\s\S]*)/)
    return summaryMatch ? summaryMatch[1].trim() : rawSummary.trim()
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

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleAddRecipient = () => {
    if (!newRecipient.trim()) return

    const emails = newRecipient.split(",").map((email) => email.trim())

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

    const emails = newCc.split(",").map((email) => email.trim())

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

  const handleGenerateResponse = async () => {
    if (!selectedEmail) return

    setIsGeneratingResponse(true)
    const emailContent = selectedEmail.emails.map((email) => email.content).join("\n\n")

    try {
      const response = await dispatch(
        generateEmailDraft({
          user_input: {
            type: "follow_up",
            currentUser: emails.mailboxEmail,
            latestEmailFrom: selectedEmail.latestEmail.from,
            latestEmailTo: selectedEmail.latestEmail.to,
            details: "",
          },
          email_content: emailContent,
          axiosInstance,
        }),
      )

      if (response.payload) {
        setEmailContent(response.payload.emailDraft)
        setEmailSubject(`Re: ${selectedEmail.subject}`)

        const mailboxEmails = Array.isArray(emails?.mailboxEmail)
          ? emails.mailboxEmail
          : emails?.mailboxEmail
            ? [emails.mailboxEmail]
            : []

        const { from, to = [] } = selectedEmail.latestEmail
        const rawRecipients = Array.isArray(to) ? [...to, from] : [from, ...(to ? [to] : [])]

        const normalizedRecipients = rawRecipients.filter(
          (email) => email && typeof email === "string" && !mailboxEmails.includes(email.toLowerCase()),
        )

        setRecipients(normalizedRecipients)

        const originalCc = selectedEmail.latestEmail.cc || []
        const normalizedCc = Array.isArray(originalCc) ? originalCc : [originalCc]
        setCc(normalizedCc.filter(Boolean))

        setIsComposerOpen(true)
      }
    } catch (error) {
      toast.error("Failed to generate response")
      console.error("Error generating response:", error)
    } finally {
      setIsGeneratingResponse(false)
    }
  }

  const handleSendEmail = async () => {
    if (!recipients.length || !emailContent || !emailSubject) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const response = await axiosInstance.post(
        "/send-dsr-draft-email",
        {
          email_ids: recipients,
          cc: cc,
          emailContent: emailContent,
          emailSubject: emailSubject,
          conversation_id: selectedEmail?.threadId,
        },
        { withCredentials: true },
      )

      if (response.status === 200) {
        toast.success("Email sent successfully!")
        setEmailContent("")
        setEmailSubject("")
        setRecipients([])
        setCc([])
        setIsComposerOpen(false)
      }
    } catch (error) {
      toast.error("Failed to send email")
      console.error("Error sending email:", error)
    }
  }

  useEffect(() => {
    if (!showEmailModal) {
      dispatch(clearEmailDraft())
    }
  }, [showEmailModal, dispatch])

  useEffect(() => {
    setEmailContent("")
    setEmailSubject("")
    setRecipients([])
    setCc([])
    setNewRecipient("")
    setNewCc("")
    dispatch(clearEmailDraft())
    setIsComposerOpen(false)
  }, [selectedEmail, dispatch])

  const sanitizeEmailContent = (html) => {
    if (!html) return ""

    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html

    const allElements = tempDiv.querySelectorAll("*")
    allElements.forEach((el) => {
      el.removeAttribute("style")
      el.removeAttribute("class")
      el.removeAttribute("id")

      const attributes = el.getAttributeNames()
      attributes.forEach((attr) => {
        if (attr.startsWith("on")) {
          el.removeAttribute(attr)
        }
      })
    })

    const styleElements = tempDiv.querySelectorAll('style, link[rel="stylesheet"]')
    styleElements.forEach((el) => el.remove())

    return tempDiv.innerHTML
  }

  const renderFetchError = () => (
    <div className="h-full flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
          <X className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-gray-100">
          {fetchError.status === 404 ? "Endpoint not found" : "Failed to load emails"}
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {fetchError.details || 
            (fetchError.status === 404 
              ? "The email service endpoint is unavailable." 
              : "There was an error connecting to the email service.")}
        </p>
        {fetchError.status === 404 && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Please contact support if this persists.
          </p>
        )}
        <div className="mt-4">
          <button
            onClick={() => {
              setFetchError(null)
              setIsFetchBlocked(false)
              setPageIndex(0)
              setHasMore(true)
              fetchMoreEmails(0, searchTerm)
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  )

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
              onClick={handleGenerateResponse}
              disabled={isGeneratingResponse}
              className="flex whitespace-nowrap items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-2 rounded-md text-sm"
            >
              {isGeneratingResponse ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  <span>AI Reply</span>
                </>
              )}
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
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {selectedEmail.summary && typeof selectedEmail.summary === "object"
                ? cleanSummary(selectedEmail.summary.summary)
                : cleanSummary(selectedEmail.summary)}
            </p>
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

        {/* Composer */}
        {isComposerOpen && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg rounded-t-lg">
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {/* Header with close button */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setIsComposerOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors text-sm font-medium shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </div>
              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {recipients.map((recipient, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 transition-colors"
                    >
                      {recipient}
                      <button
                        className="ml-1 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100"
                        onClick={() => handleRemoveRecipient(recipient)}
                        aria-label={`Remove ${recipient}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddRecipient()}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm transition-colors"
                    placeholder="Add recipient (separate multiple with commas)..."
                  />
                  <button
                    onClick={handleAddRecipient}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CC</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {cc.map((ccEmail, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
                    >
                      {ccEmail}
                      <button
                        className="ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleRemoveCc(ccEmail)}
                        aria-label={`Remove ${ccEmail}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCc}
                    onChange={(e) => setNewCc(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCc()}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm transition-colors"
                    placeholder="Add CC (separate multiple with commas)..."
                  />
                  <button
                    onClick={handleAddCc}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden shadow-sm">
                  <RichTextEditor
                    value={emailContent}
                    onChange={setEmailContent}
                    darkModeClass="dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPageIndex(0)
                    setHasMore(true)
                    fetchMoreEmails(0, searchTerm)
                  }
                }}
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
          ) : fetchError ? (
            renderFetchError()
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
                      {initialLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                        </div>
                      ) : fetchError ? (
                        renderFetchError()
                      ) : emailsList.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">No emails found.</div>
                      ) : (
                        <>
                          {emailsList.map(renderEmailItem)}
                          {isLoadingMore && (
                            <div className="py-3 px-4 bg-gray-50 dark:bg-gray-700 text-center">
                              <div className="inline-flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-300"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">Loading more...</span>
                              </div>
                            </div>
                          )}
                        </>
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
      </div>
    </div>
  )
}