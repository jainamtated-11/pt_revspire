import { useState, useEffect, useCallback, useContext } from "react"
import { Search, Calendar, Mail, ChevronDown, ChevronUp, User, Clock, X, PenSquare } from "lucide-react"
import { format } from "date-fns"
import { useSelector } from "react-redux"
import EmailDraftGeneratorModal from "./EmailDraftModal-Mailbox.jsx"
import { LuLoaderCircle } from "react-icons/lu"
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx"
import toast from "react-hot-toast"
import { GlobalContext } from "../../../../context/GlobalState.jsx"
import { useCookies } from "react-cookie"

export default function Emails({ showEmailModal, setShowEmailModal, emailData }) {
    const { viewer_id } = useContext(GlobalContext);
    const cookies = useCookies("userData");
    const organisation_id = cookies.userData?.organisation?.id;
    const [searchTerm, setSearchTerm] = useState("");
    
    const [filteredEmails, setFilteredEmails] = useState([]); 

    const [selectedEmail, setSelectedEmail] = useState(null)
    const [expandedThreads, setExpandedThreads] = useState({})
    const [isDraftModalOpen, setIsDraftModalOpen] = useState(false)


    const [pageIndex, setPageIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [emailsList, setEmailsList] = useState([]); // New state for emails list
    const axiosInstance = useAxiosInstance(); // Add this
    const [initialLoading, setInitialLoading] = useState(false);

    const { emails, emailsLoading, emailsError } = useSelector((state) => state.dsr)

    const closeEmailModal = () => {
        setShowEmailModal(false)
    }

 
    // Filter emails based on search term
useEffect(() => {
    if (!searchTerm.trim()) {
        setFilteredEmails(emailsList);
        return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = emailsList.filter((email) => {
        const searchableContent = [
            email.subject,
            email.summary,
            email.latestEmail.from,
            ...(Array.isArray(email.latestEmail.to) ? email.latestEmail.to : [email.latestEmail.to]),
            ...email.emails.map(e => e.from),
            ...email.emails.map(e => e.content || '')
        ].filter(Boolean).join(' ').toLowerCase();

        return searchableContent.includes(searchLower);
    });

    setFilteredEmails(filtered);
}, [searchTerm, emailsList]);

    const fetchMoreEmails = useCallback(async (page = 0) => {
        console.log("fetchMoreEmails called with page:", page);
        if (!hasMore || isLoadingMore) {
            console.log("Fetch blocked:", { hasMore, isLoadingMore });
            return;
        }

        if (page === 0) {
            setInitialLoading(true);
        } else {
            setIsLoadingMore(true);
        }

        try {
            console.log("Fetching emails for page:", page);
            const response = await axiosInstance.post("/extract-emails", {
                pageSize: 9,
                pageIndex: page,
                email_account : emailData,
            });

            if (response.data) {
                const { mailboxEmail, groupedEmails, pagination, summaries } = response.data;

                // Debug pagination data
                console.log("Raw pagination data:", pagination);

                // Safely calculate total pages
                const pageSize = pagination?.pageSize || 10; // fallback to our request pageSize
                const totalEmails = pagination?.totalThreads || 0;
                const totalPages = pagination?.totalPages || 0;

                console.log("Pagination calculation:", {
                    pageSize,
                    totalEmails,
                    totalPages,
                    currentPage: page
                });

                const emailsArray = Object.entries(groupedEmails || {}).map(([threadId, emails]) => {
                    const latestEmail = emails[0];
                    return {
                        subject: latestEmail.subject,
                        summary: summaries[threadId] || '',
                        threadId,
                        emails: emails,
                        latestEmail: {
                            from: latestEmail.from,
                            to: latestEmail.to,
                            date: latestEmail.date,
                            subject: latestEmail.subject,
                            content: latestEmail.content,
                            cc: latestEmail.cc || []
                        },
                        date: new Date(latestEmail.date),
                    };
                });

                if (page === 0) {
                    setEmailsList(emailsArray);
                } else {
                    setEmailsList(prev => [...prev, ...emailsArray]);
                }

                setPageIndex(page);

                // Update hasMore based on received emails and total
                const hasMoreEmails = emailsArray.length > 0 && (page + 1) * pageSize < totalEmails;
                console.log("Updating hasMore:", hasMoreEmails, {
                    receivedEmails: emailsArray.length,
                    currentPage: page,
                    totalEmails
                });
                setHasMore(hasMoreEmails);
            }

        } catch (error) {
            console.error("Error fetching emails:", error);
            toast.error("Failed to fetch emails");
        } finally {
            if (page === 0) {
                setInitialLoading(false);
            } else {
                setIsLoadingMore(false);
            }
        }
    }, [hasMore, isLoadingMore, axiosInstance, viewer_id, organisation_id]);

    // Add scroll handler for the email list
    const handleScroll = useCallback((e) => {
        const element = e.target;
        if (!element) {
            console.log("No scroll element found");
            return;
        }

        const scrollPosition = element.scrollTop;
        const totalHeight = element.scrollHeight;
        const visibleHeight = element.clientHeight;
        const scrollPercentage = scrollPosition / (totalHeight - visibleHeight);

        // console.log("Scroll Debug:", {
        //   scrollPosition,
        //   totalHeight,
        //   visibleHeight,
        //   scrollPercentage,
        //   hasMore,
        //   isLoadingMore,
        //   currentPage: pageIndex,
        //   willFetch: scrollPercentage >= 0.25 && hasMore && !isLoadingMore
        // });

        // console.log("scrollPercentage:", scrollPercentage);
        // console.log("hasMore:", hasMore);
        // console.log("isLoadingMore:", isLoadingMore);

        // Changed threshold to 0.5 (50%) and simplified condition
        if (scrollPercentage >= 0.25 && hasMore && !isLoadingMore) {
            console.log("Attempting to fetch more emails, page:", pageIndex + 1);
            fetchMoreEmails(pageIndex + 1);
        }
    }, [pageIndex, hasMore, isLoadingMore, fetchMoreEmails]);



    // Initial fetch when modal opens
    useEffect(() => {
        if (showEmailModal) {
            console.log("Modal opened, resetting pagination and fetching first page");
            setPageIndex(0);
            setHasMore(true);
            fetchMoreEmails(0);
        }
    }, [showEmailModal]);

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
        // Handle null, undefined, or non-string values
        if (!rawSummary || typeof rawSummary !== 'string') return "";

        // Extract content after "Summary:" if it exists
        const summaryMatch = rawSummary.match(/Summary:\s*([\s\S]*)/)
        return summaryMatch ? summaryMatch[1].trim() : rawSummary.trim();
    }

    const toggleThread = (subject) => {
        setExpandedThreads((prev) => ({
            ...prev,
            [subject]: !prev[subject],
        }))
    }

    useEffect(() => {
        if (showEmailModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [showEmailModal]);

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
        // Get mailboxEmail from emails and ensure it's an array
        const mailboxEmails = Array.isArray(emails?.mailboxEmail)
            ? emails.mailboxEmail
            : emails?.mailboxEmail
                ? [emails.mailboxEmail]
                : [];

        if (!selectedEmail?.latestEmail) return [];

        const { from, to = [] } = selectedEmail.latestEmail;

        // Ensure to is an array and normalize recipients
        const rawRecipients = Array.isArray(to)
            ? [...to, from]
            : [from, ...(to ? [to] : [])];

        // Filter and normalize recipients
        return rawRecipients.filter(
            (email) =>
                email &&
                typeof email === "string" &&
                !mailboxEmails.includes(email.toLowerCase())
        );
    })();

    // const filteredEmails = processedEmails.filter((email) =>
    //     [email.subject, email.summary, ...email.emails.map((e) => e.from)]
    //         .join(" ")
    //         .toLowerCase()
    //         .includes(searchTerm.toLowerCase()),
    // )

    const renderThreadDetail = (email) => (
        <div className="mt-4 ml-11 pl-4 border-l-2 border-gray-200">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Thread Details</h4>
            {email.emails.map((threadEmail, index) => (
                <div key={index} className="mb-3 pb-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-900">{threadEmail.from}</p>
                        <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(threadEmail.date)}
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 email-content">
                        {["<html></html>", "<html></body></html>"].includes(threadEmail.content) ? (
                            "(Email content not available)"
                        ) : (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: threadEmail.content,
                                }}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    )

    const renderEmailItem = (email) => (
        <div
            key={email.threadId}
            className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedEmail?.threadId === email.threadId ? "bg-blue-50" : ""
                }`}
            onClick={() => setSelectedEmail(email)}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">{email.subject}</h3>
                        <p className="text-sm text-gray-500">From: {email.latestEmail.from}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(email.date)}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleThread(email.threadId)
                        }}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        {expandedThreads[email.threadId] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="mt-2 ml-11">
                <p className="text-sm text-gray-600 line-clamp-2">{cleanSummary(email.summary)}</p>
            </div>

            {expandedThreads[email.threadId] && renderThreadDetail(email)}
        </div>
    )

// The Email modal content
const emailModalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-[95%] sm:w-[90%] md:w-[90%] lg:w-[90%] xl:w-[90%] max-w-7xl h-[90%] overflow-hidden z-50">
                {emailsLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <LuLoaderCircle className="animate-spin text-4xl text-cyan-600" />
                    </div>
                ) : emailsError ? (
                    <>
                        {/* Header */}
                        <header className="bg-white border-b border-gray-200">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex justify-between items-center h-16">
                                    <div className="flex items-center">
                                        <Mail className="h-8 w-8 text-secondary" />
                                        <h1 className="ml-2 text-xl font-semibold text-secondary">Email Dashboard</h1>
                                    </div>
                                    <button
                                        onClick={closeEmailModal}
                                        className="flex items-center text-secondary hover:text-secondary-dark transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </header>

                        {/* Error Content */}
                        <main className="flex justify-center items-center h-[calc(90%-64px)] px-6 text-center text-secondary">
                            <p className="text-base">
                                Error fetching emails. Please check your primary email connection and try again.
                                <br />
                                If not, contact your admin or support.
                            </p>
                        </main>
                    </>
                ) : (
                    <>
                        {/* Header */}
                        <header className="bg-white border-b border-gray-200">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex justify-between items-center h-16">
                                    <div className="flex items-center">
                                        <Mail className="h-8 w-8 text-secondary" />
                                        <h1 className="ml-2 text-xl font-semibold text-secondary">Email Dashboard</h1>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Search className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search emails..."
                                                className="block w-[300px] pl-10 pr-3 py-2 mr-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={closeEmailModal}
                                            className="flex items-center text-secondary hover:text-secondary-dark transition-colors ml-2"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {initialLoading ? (
                            // Centered loader for initial loading
                            <div className="h-[calc(90vh-64px)] flex items-center justify-center">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                                    <p className="mt-4 text-gray-600">Loading emails...</p>
                                </div>
                            </div>
                        ) : (
                            // Main content with split view for subsequent loading
                            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Email List */}
                                    <div className="md:w-1/2 lg:w-2/5 h-[calc(90vh-120px)]">
                                        <div className="bg-white shadow rounded-lg h-full">
                                            <div className="divide-y divide-gray-200 overflow-y-auto h-full email-list-container" onScroll={handleScroll}>
                                                {emailsList.length === 0 ? (
                                                    <div className="p-6 text-center text-gray-500">No emails found.</div>
                                                ) : (
                                                    <>
                                                         {(searchTerm ? filteredEmails : emailsList).map(renderEmailItem)}
                                                        {isLoadingMore && (
                                                            <div className="py-3 px-4 bg-gray-50">
                                                                <div className="flex items-center justify-center space-x-3">
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                                                    <span className="text-sm text-gray-600">Loading more...</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email Detail */}
                                    <div className="md:w-1/2 lg:w-4/5 h-[calc(90vh-120px)]">
                                        {selectedEmail ? (
                                            <div className="bg-white shadow rounded-lg p-6 h-full overflow-y-auto">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h2 className="text-lg font-medium text-gray-900">{selectedEmail.subject}</h2>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => setIsDraftModalOpen(true)}
                                                            className="flex whitespace-nowrap items-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md text-sm"
                                                        >
                                                            <PenSquare className="h-4 w-4 mr-1" />
                                                            Draft Response
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedEmail(null)}
                                                            className="text-gray-400 hover:text-gray-600"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center mb-4">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{selectedEmail.latestEmail.from}</p>
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            <span>{format(new Date(selectedEmail.latestEmail.date), "PPpp")}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="prose max-w-none">
                                                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
                                                        <p className="text-sm text-gray-700 whitespace-pre-line">
                                                            {cleanSummary(selectedEmail.summary)}
                                                        </p>
                                                    </div>

                                                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                                                        Thread ({selectedEmail.emails.length}{" "}
                                                        {selectedEmail.emails.length === 1 ? "email" : "emails"})
                                                    </h3>
                                                    <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-300px)]">
                                                        {selectedEmail.emails.map((email, index) => (
                                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <p className="text-sm font-medium text-gray-900">{email.from}</p>
                                                                    <span className="text-xs text-gray-500">{format(new Date(email.date), "PPpp")}</span>
                                                                </div>
                                                                <div className="text-sm text-gray-700 email-content">
                                                                    {["<html></html>", "<html></body></html>"].includes(email.content) ? (
                                                                        "(Email content not available)"
                                                                    ) : (
                                                                        <div
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: email.content,
                                                                            }}
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white shadow rounded-lg p-6 h-full flex items-center justify-center">
                                                <div className="text-center">
                                                    <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No email selected</h3>
                                                    <p className="text-sm text-gray-500">Select an email from the list to view details</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </main>
                        )}
                    </>
                )}

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
    </div>
)

return <>{showEmailModal && emailModalContent}</>
}
