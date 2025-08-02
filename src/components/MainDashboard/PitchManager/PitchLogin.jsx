import React, { useContext, useEffect, useRef, useState, useMemo, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "react-query"
import { useCookies } from "react-cookie"
import useAxiosInstance from "../../../Services/useAxiosInstance"
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"
import { LuLoaderCircle } from "react-icons/lu"
import { GlobalContext } from "../../../context/GlobalState"
import axios from "axios"
import * as CompanyEmailValidator from "company-email-validator"
import toast from "react-hot-toast"
import LoginForm from "./PitchLoginForm";
import { useMediaQuery } from "react-responsive"
import DeactivatedPitch from "./DeactivatedPitch";

//FONTS FONTS FONTS FONTS FONTS
import "@fontsource/montserrat"; // Default weight (400)
import "@fontsource/montserrat/500.css"; // Semi-bold
import "@fontsource/montserrat/600.css"; // Semi-bold
import "@fontsource/montserrat/700.css"; // Bold

// Utility functions
const getQueryParam = (name, url = window.location.href) => {
  const params = new URLSearchParams(url.split("?")[1])
  return params.get(name)
}

const getCookieValue = (name) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  return match ? decodeURIComponent(match[2]) : null
}

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="flex flex-col items-center gap-2">
      <div className="w-6 h-6 border-4 border-gray-500 border-t-transparent rounded-full animate-spin" />
    </div>
  </div>
)

// Memoized Contact Row Component
const ContactRow = React.memo(({ item, orgHex, onGenerateOtp }) => (
  <tr
    className="transition-colors cursor-pointer border-b hover:bg-opacity-10"
    onClick={() => onGenerateOtp(item)}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${orgHex}1A`)}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
  >
    <td
      className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate"
      title={`${item.first_name} ${item.last_name}`}
    >
      {item.first_name + " " + item.last_name}
    </td>
    <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate" title={item.email}>
      {item.email}
    </td>
  </tr>
))

// Memoized Language Selector Component
const LanguageSelector = React.memo(({ availableLanguages, currentLanguage, setCurrentLanguage, orgHex }) => {
  if (!availableLanguages.length) return null

  return (
    <div className="absolute top-4 right-4 z-10">
      <select
        value={currentLanguage}
        onChange={(e) => setCurrentLanguage(e.target.value)}
        className="bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
        style={{
          borderColor: orgHex,
          color: orgHex,
        }}
      >
        {availableLanguages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
})

// Main PitchLogin Component
const PitchLogin = () => {
  const { pitchId } = useParams()
  const axiosInstance = useAxiosInstance()
  const navigate = useNavigate()
  const tableRef = useRef(null)
  const tableElement = useRef(null)
  const inputRefs = useRef([])

  // State management
  const [pitchContacts, setPitchContacts] = useState([])
  const [pitchDomains, setPitchDomains] = useState([])
  const [loginImageUrl, setLoginImageUrl] = useState("")
  const [clientImageUrl, setClientImageUrl] = useState("")
  const [tableHeight] = useState(320) // Fixed height to prevent layout shift
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  })
  const [privacyPolicySelected, setPrivacyPolicySelected] = useState(false)
  const [cookies, setCookie] = useCookies(["baseURL", "revspireToken"])
  const [contactSfdcId, setContactSfdcId] = useState([])
  const [contactId, setContactId] = useState(null)
  const [owner, setOwner] = useState(null)
  const [isPitchActive, setIsPitchActive] = useState(null)
  const [organisationId, setOrganisationId] = useState(null)
  const [step, setStep] = useState(1)
  const [privacyPolicyLink, setPrivacyPolicyLink] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [ValidateOtpLoading, setValidateOtpLoading] = useState(false)
  const [isSummary, setIsSummary] = useState("")
  const [sentences, setSentences] = useState([])
  const [orgHex, setOrgHex] = useState("#014d83")
  const [companyLogo, setCompanyLogo] = useState("")
  const [pitchCRM, setPitchCRM] = useState("Salesforce")
  const [selectedContactData, setSelectedContactData] = useState(null)
  const [availableLanguages, setAvailableLanguages] = useState([])
  const [domainLogin, setDomainLogin] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("en-EN")
  const [isInvalidOtp, setIsInvalidOtp] = useState(false)
  const [pitchLoginfields, setPitchLoginfields] = useState([])
  const [otp, setOtp] = useState(new Array(4).fill(""))
  const [isOtpValid, setIsOtpValid] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Context and hooks
  const { setMicrosoftClarityProjectId, setRevspireClient } = useContext(GlobalContext)
  const isDesktopOrLaptop = useMediaQuery({ minWidth: 1025 })
  const queryClient = useQueryClient()
  const [publicAccessCookieUserData, setPublicAccessUserData] = useCookies(["userData"])
  const [publicAccessCookieRevspireToken, setPublicAccessRevspireToken] = useCookies(["revspireToken"])

  // Constants
  const columns = ["name", "email"]
  const uiStrings = useMemo(
    () => ({
      welcomeTitle: "Welcome to Your Digital Sales Room",
      privacyText:
        "Your privacy is important to us. By checking this box, you acknowledge and agree to the storing and processing of your personal data as described in the ",
      privacyPolicy: "Privacy Policy",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      continue: "Continue",
      aiSummary: "AI Summary",
      selectContact: "Select a Contact to Generate OTP",
      empty: "Empty",
      otp: "OTP",
      enterOtp: "Enter your one-time password",
      back: "Back",
      submit: "Submit",
      pleaseEnterValidEmail: "Please enter a valid email",
      fillAllFields: "Please fill in all fields and accept Privacy Policy",
      InternalUserDetected: "Internal User Detected",
      InternalUserWarning:
        "We've identified that you're using an internal email address. If you continue, your analytics and activities will be tracked as an external user. Would you like to continue as a external user or log in to your organization's application?",
      Login: "Login",
      InvalideOTP: "Invalid OTP",
    }),
    [],
  )

  const languageOptions = useMemo(
    () => [
      { value: "en-EN", label: "English" },
      { value: "fr-FR", label: "French" },
      { value: "es-ES", label: "Spanish" },
      { value: "it-IT", label: "Italian" },
      { value: "zh-CN", label: "Mandarin" },
      { value: "ja-JA", label: "Japanese" },
      { value: "de-DE", label: "German" },
      { value: "ru-RU", label: "Russian" },
      { value: "ar-AR", label: "Arabic" },
    ],
    [],
  )

  // Memoized URL parameters
  const apiURL = useMemo(() => getQueryParam("apiURL"), [])
  const base_url = useMemo(() => (apiURL ? decodeURIComponent(apiURL) : ""), [apiURL])
  const currentFrontendURL = useMemo(() => window.location.origin, [])
  const encodedApiURL = useMemo(() => (apiURL ? encodeURIComponent(apiURL) : ""), [apiURL])

  // Memoized utility functions
  const lightenColor = useCallback((hex, percent) => {
    percent = Math.min(100, Math.max(0, percent))
    const num = Number.parseInt(hex.replace("#", ""), 16)
    const R = (num >> 16) + Math.round((255 - (num >> 16)) * (percent / 100))
    const G = ((num >> 8) & 0x00ff) + Math.round((255 - ((num >> 8) & 0x00ff)) * (percent / 100))
    const B = (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * (percent / 100))
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`
  }, [])

  // Memoized fetch functions with proper error handling
  const fetchOrganisationDetails = useCallback(
    async (ownerParam, selectedOrganisationId) => {
      if (!ownerParam || !selectedOrganisationId || !base_url) return

      try {
        const response = await axios.post(`${base_url}/view-organisation-details`, {
          viewer_id: ownerParam,
          organisation_id: selectedOrganisationId,
        })

        if (response.data.success) {
          setPrivacyPolicyLink(response?.data?.organisation?.privacy_policy)
        } else {
          console.error("Error fetching organisation details:", response.data.message)
          toast.error("Failed to fetch organisation details.")
        }
      } catch (error) {
        console.error("Network error:", error)
        toast.error("Network error. Please try again.")
      }
    },
    [base_url],
  )

  const fetchPitchData = useCallback(
    async (language_code = null) => {
      if (!base_url || !pitchId) return null

      try {
        const url = language_code
          ? `${base_url}/retrieve-pitch-sections-and-contents/${pitchId}?language_code=${language_code}`
          : `${base_url}/retrieve-pitch-sections-and-contents/${pitchId}`

        const response = await axiosInstance.get(url, { withCredentials: true })

        if (response.data.success) {
          const pitchOwner = response.data.pitch?.owner || null
          setOwner(pitchOwner)
          setIsPitchActive(response.data.pitch?.active)

          const contacts = []
          const domains = []

          response?.data?.pitchContacts?.forEach((item) => {
            if (item.domain && !item.email && !item.first_name && !item.last_name) {
              domains.push({
                id: item.id,
                domain: item.domain,
                pitch: item.pitch,
              })
            } else {
              contacts.push(item)
            }
          })

          if (contacts.length === 0 && domains.length > 0) {
            setDomainLogin(true)
          }

          setPitchContacts(contacts || [])
          setPitchDomains(domains || [])

          const selectedOrganisationId = response.data?.userDetails[0]?.organisation || null
          setOrganisationId(selectedOrganisationId)

          // Call fetchOrganisationDetails only if we have the required parameters
          if (pitchOwner && selectedOrganisationId) {
            fetchOrganisationDetails(pitchOwner, selectedOrganisationId)
          }

          setPitchCRM(response?.data?.crm_connection_details[0]?.crm_name)

          // Process company logo
          if (response.data.orgDetails && response.data.orgDetails.length > 0) {
            const logoData = response?.data?.orgDetails[0]?.company_logo?.data
            if (logoData) {
              const arrayBufferToBase64 = (buffer) => {
                let binaryString = ""
                const bytes = new Uint8Array(buffer)
                const CHUNK_SIZE = 0x8000
                for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
                  const chunk = bytes.subarray(i, i + CHUNK_SIZE)
                  binaryString += String.fromCharCode.apply(null, chunk)
                }
                return btoa(binaryString)
              }
              const companyLogoBase64 = `data:image/png;base64,${arrayBufferToBase64(logoData)}`
              setCompanyLogo(companyLogoBase64)
            }
          }

          // Parse available languages
          if (response.data.pitch?.pitch_translate) {
            try {
              const translatedLanguages = JSON.parse(response.data.pitch.pitch_translate)
              const selectedOptions = languageOptions.filter((option) => translatedLanguages.includes(option.value))
              if (!selectedOptions.some((option) => option.value === "en-EN")) {
                selectedOptions.unshift(languageOptions[0])
              }
              setAvailableLanguages(selectedOptions)
            } catch (error) {
              console.error("Error parsing pitch_translate:", error)
              setAvailableLanguages([languageOptions[0]])
            }
          }

          if (response.data.dsr_primary_color) {
            setOrgHex(`#${response.data.dsr_primary_color}`)
          }

          if (response.data.pitchLoginfields) {
            setPitchLoginfields(response.data.pitchLoginfields)
          }
        }

        setInitialLoading(false)

        return response.data
      } catch (error) {
        console.error("Error fetching pitch data:", error)
        return null
      }
    },
    [base_url, pitchId, axiosInstance, fetchOrganisationDetails, languageOptions],
  )

  // React Query for pitch data
  const { data: pitchData, isLoading: isPitchLoading } = useQuery(
    ["fetchPitchData", pitchId, currentLanguage],
    () => fetchPitchData(currentLanguage),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: false,
      refetchOnReconnect: false,
      enabled: !!base_url && !!pitchId,
      onSuccess: (data) => {
        if (data?.pitchContacts) {
          const sfdcIds = data.pitchContacts.map((contact) => contact.contact_sfdc_id)
          setContactSfdcId(sfdcIds)
        }
      },
    },
  )

  // Image fetching functions
  const fetchLoginImage = useCallback(async () => {
    if (!owner || !base_url || !pitchId) return ""

    try {
      const response = await axiosInstance.post(
        `${base_url}/pitch-preview-content`,
        { viewerId: owner, content_name: `${pitchId}_background_login_image` },
        { responseType: "blob", withCredentials: true },
      )
      const url = URL.createObjectURL(response.data)
      setLoginImageUrl(url)
      return url
    } catch (error) {
      console.error("Error fetching login image:", error)
      return ""
    }
  }, [axiosInstance, base_url, owner, pitchId])

  const fetchClientLogo = useCallback(async () => {
    if (!owner || !base_url || !pitchId) return ""

    try {
      const response = await axiosInstance.post(
        `${base_url}/pitch-preview-content`,
        { viewerId: owner, content_name: `${pitchId}_client_logo` },
        { responseType: "blob", withCredentials: true },
      )
      if (response.status === 200) {
        const url = URL.createObjectURL(response.data)
        setClientImageUrl(url)
        return url
      }
      return ""
    } catch (error) {
      console.error("Error fetching client logo:", error)
      return ""
    }
  }, [axiosInstance, base_url, owner, pitchId])

  // React Query for images
  const { isLoading: isBackgroundImageLoading } = useQuery(["fetchLoginImage", pitchId, owner], fetchLoginImage, {
    enabled: !!owner && !!base_url && !!pitchId,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const { isLoading: isClientLogoLoading } = useQuery(["fetchClientLogo", pitchId, owner], fetchClientLogo, {
    enabled: !!owner && !!base_url && !!pitchId,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  // Fixed useEffect for cookie management - this was likely causing the infinite loop
  useEffect(() => {
    if (!base_url) return

    let baseURLCookie = []
    try {
      baseURLCookie = typeof cookies.baseURL === "string" ? JSON.parse(cookies.baseURL) : []
    } catch (error) {
      console.error("Error parsing baseURL cookie:", error)
      baseURLCookie = []
    }

    const existingEntry = baseURLCookie.find((entry) => entry.frontend === currentFrontendURL)

    if (existingEntry) {
      if (existingEntry.baseURL !== base_url) {
        existingEntry.baseURL = base_url
        setCookie("baseURL", JSON.stringify(baseURLCookie), {
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
          secure: true,
          sameSite: "None",
        })
      }
    } else {
      baseURLCookie.push({ frontend: currentFrontendURL, baseURL: base_url })
      setCookie("baseURL", JSON.stringify(baseURLCookie), {
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        secure: true,
        sameSite: "None",
      })
    }

    setCookie("revspireClient", 1, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      secure: true,
      sameSite: "None",
    })
  }, [base_url, currentFrontendURL]) // Removed cookies.baseURL and setCookie from dependencies

  // Fixed useEffect for public access validation
  const ValidatePublicPitchAccess = useCallback(async () => {
    if (!owner || !pitchId || !base_url) return null

    try {
      const response = await axiosInstance.post(
        `${base_url}/validatePublicPitchAccess`,
        {
          viewer_id: owner,
          pitch_id: pitchId,
        },
        { withCredentials: true },
      )
      return response.data
    } catch (error) {
      console.log("Error from cookie ", error.message)
      return null
    }
  }, [axiosInstance, base_url, owner, pitchId])

  useEffect(() => {
    if (!owner || !pitchId) return

    const checkPublicAccess = async () => {
      const data = await ValidatePublicPitchAccess()
      if (data?.userData) {
        setPublicAccessUserData("userData", JSON.stringify(data.userData), {
          path: "/",
          secure: true,
          sameSite: "strict",
          maxAge: 7200,
        })
      }
    }

    checkPublicAccess()
  }, [owner, pitchId]) // Removed setPublicAccessUserData from dependencies

  // Fixed useEffect for analytics injection
  useEffect(() => {
    const revspireClient = getCookieValue("revspireClient")
    const userDataCookie = getCookieValue("userData")

    if (revspireClient) {
      setRevspireClient(revspireClient)
    }

    if (revspireClient === "1" && userDataCookie) {
      try {
        const userData = JSON.parse(userDataCookie)
        const clarityProjectId = userData.user?.microsoft_clarity_project_id
        const gaMeasurementId = userData.user?.google_analytics_measurement_id

        // Inject Microsoft Clarity
        if (clarityProjectId && !window.clarity) {
          setMicrosoftClarityProjectId(clarityProjectId)
          ;((c, l, a, r, i, t, y) => {
            c[a] =
              c[a] ||
              (() => {
                ;(c[a].q = c[a].q || []).push([])
              })
            t = l.createElement(r)
            t.async = 1
            t.src = "https://www.clarity.ms/tag/" + i
            y = l.getElementsByTagName(r)[0]
            y.parentNode.insertBefore(t, y)
          })(window, document, "clarity", "script", clarityProjectId)
        }

        // Inject Google Analytics
        if (gaMeasurementId && !window.gtag) {
          const gaScript = document.createElement("script")
          gaScript.async = true
          gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`
          document.head.appendChild(gaScript)

          const inlineScript = document.createElement("script")
          inlineScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `
          document.head.appendChild(inlineScript)
        }
      } catch (error) {
        console.error("Error parsing userData cookie:", error)
      }
    }
  }, []) // Empty dependency array since we're reading cookies directly

  // Fixed useEffect for language validation
  useEffect(() => {
    if (availableLanguages.length > 0 && !availableLanguages.some((lang) => lang.value === currentLanguage)) {
      setCurrentLanguage("en-EN")
    }
  }, [availableLanguages]) // Removed currentLanguage from dependencies to prevent loop

  // Fixed useEffect for OTP validation
  useEffect(() => {
    const allOtpFieldsFilled = otp.every((digit) => digit !== "")
    setIsOtpValid(allOtpFieldsFilled)
  }, [otp])

  // Fixed useEffect for AI summary
  useEffect(() => {
    if (!base_url || !pitchId || !owner || !organisationId || !currentLanguage) return

    const aiSummary = async () => {
      try {
        setSentences([])
        const response = await axiosInstance.post(`${base_url}/ai-summarise-dsr`, {
          pitchId: pitchId,
          viewer_id: owner,
          organisation_id: organisationId,
          summary_type: "pitch",
          language_code: currentLanguage,
        })
        setIsSummary(response.data.summary)
      } catch (error) {
        console.error("Error while fetching ai summary", error)
      }
    }

    aiSummary()
  }, [base_url, pitchId, owner, organisationId, currentLanguage])

  // Fixed useEffect for sentence animation
  useEffect(() => {
    if (!isSummary) return

    setSentences([])
    const splitSentences = isSummary.split(".").filter((sentence) => sentence.trim() !== "")

    if (splitSentences?.length > 0) {
      const interval = setInterval(() => {
        setSentences((prev) => {
          if (prev.length < splitSentences.length) {
            return [...prev, splitSentences[prev.length]]
          }
          clearInterval(interval)
          return prev
        })
      }, 300)

      return () => clearInterval(interval)
    }
  }, [isSummary])

  // Event handlers
  const handleSort = useCallback(
    (key) => {
      let direction = "ascending"
      if (sortConfig.key === key && sortConfig.direction === "ascending") {
        direction = "descending"
      }
      setSortConfig({ key, direction })
    },
    [sortConfig],
  )

  const handleChange = useCallback(
    (element, index) => {
      if (isNaN(element.value)) return
      const newOtp = [...otp]
      newOtp[index] = element.value
      setOtp(newOtp)
      setIsInvalidOtp(false)
      if (element.nextSibling && element.value !== "") {
        element.nextSibling.focus()
      }
    },
    [otp],
  )

  const handleKeyDown = useCallback(
    (event, index) => {
      if (event.key === "Backspace") {
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus()
        }
      } else if (event.key === "ArrowRight" && index < otp.length - 1) {
        inputRefs.current[index + 1].focus()
      } else if (event.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1].focus()
      }
    },
    [otp],
  )

  const fetchIPAddress = useCallback(async () => {
    try {
      const response = await fetch("https://ipinfo.io/json")
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.error("Error fetching IP address:", error)
      return "Unknown"
    }
  }, [])

  const generateDSRLoginOtp = useCallback(
    async (item) => {
      if (!pitchContacts.length || !base_url || !owner) return

      try {
        const selectedContactsData = pitchContacts.find((contact) => contact.contact_sfdc_id == item.contact_sfdc_id)
        if (!selectedContactsData) return

        setContactId(selectedContactsData.id)
        const endpoint = `${base_url}/generate-restricted-login-otp`
        await axiosInstance.post(endpoint, {
          contactId: selectedContactsData.id,
          viewer_id: owner,
          organisation_id: selectedContactsData.organisation_id,
          username: item.email,
          pitchId: item.pitch,
        })
        console.log("OTP sent to selected contacts")
      } catch (error) {
        console.error("Error generating OTP:", error)
      }
    },
    [pitchContacts, base_url, axiosInstance, owner],
  )

  const handleGenerateDSROtp = useCallback(
    async (item) => {
      const isCompanyMail = CompanyEmailValidator.isCompanyEmail(item.email) ? 1 : 0
      const userAgent = navigator.userAgent
      const browserName = navigator.userAgentData?.brands?.[0]?.brand || "Unknown"
      const browserVersion = navigator.userAgentData?.brands?.[0]?.version || "Unknown"
      const deviceType = /Mobi|Android/i.test(userAgent) ? "Mobile" : "Desktop"
      const ipAddress = await fetchIPAddress()

      const formattedUserData = {
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
        isCompanyMail: isCompanyMail,
        privacyPolicy: {
          accepted: true,
          acceptedAt: new Date().toISOString(),
        },
        browserInfo: {
          browserName: browserName,
          browserVersion: browserVersion,
          userAgent: userAgent,
          deviceType: deviceType,
          ipAddress: ipAddress,
        },
      }

      setSelectedContactData(formattedUserData)
      setSelectedItem(item)
      setStep(2)
      generateDSRLoginOtp(item)
    },
    [fetchIPAddress, generateDSRLoginOtp],
  )

  const validateDSROtp = useCallback(
    async (otpValue) => {
      if (!selectedItem || !base_url) return

      try {
        setValidateOtpLoading(true)
        setIsInvalidOtp(false)
        const response = await axiosInstance.post(
          `${base_url}/verify-login-otp`,
          {
            otp: Number(otpValue),
            username: selectedItem.email,
            pitch_id: selectedItem.pitch,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        setPublicAccessRevspireToken("revspireToken", response.data.access_token, {
          path: "/",
          secure: true,
          sameSite: "strict",
          maxAge: 7200,
        })

        setCookie("publicPitchContact", JSON.stringify(selectedContactData), {
          path: "/",
          secure: true,
          sameSite: "strict",
          maxAge: 7200,
        })

        setCookie("revspireLicense", JSON.stringify(response.data.userLicenseInfoArray), {
          path: "/",
          secure: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60,
        })

        setValidateOtpLoading(false)
        const crmContact = selectedItem.id
        navigate(`/dsr/${pitchId}/${crmContact}?${encodedApiURL}`)
        return response.data
      } catch (error) {
        if (error.response?.data?.error === "Invalid OTP") {
          toast.error("Invalid OTP")
          setIsInvalidOtp(true)
        }
        setValidateOtpLoading(false)
        throw error
      }
    },
    [
      selectedItem,
      base_url,
      axiosInstance,
      setPublicAccessRevspireToken,
      setCookie,
      selectedContactData,
      navigate,
      pitchId,
      encodedApiURL,
    ],
  )

  const handleSubmit = useCallback(async () => {
    const enteredOtp = otp.join("")
    try {
      await validateDSROtp(enteredOtp)
    } catch (error) {
      console.error("OTP validation failed:", error.response?.data)
      toast.error(error?.response?.data || "OTP validation failed")
    }
  }, [otp, validateDSROtp])

  // Loading state
  const isLoading = isPitchLoading || isBackgroundImageLoading || isClientLogoLoading

  if (initialLoading) {
    return <SkeletonLoader />
  }
  if (isLoading) {
    return <SkeletonLoader />
  }

  if (isPitchActive === 0) {
    return (
      <DeactivatedPitch
        ownerDetails={{
          fullName: `${pitchData?.userDetails?.[0]?.firstName || ""} ${pitchData?.userDetails?.[0]?.lastName || ""}`,
          email: pitchData?.userDetails?.[0]?.email || "",
          profilePhoto: pitchData?.userDetails?.[0]?.profilePhoto || "",
          title: pitchData?.userDetails?.[0]?.jobTitle || "",
          companyLogo: companyLogo,
        }}
        orgHex={orgHex}
      />
    )
  }

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="relative w-full flex justify-center lg:justify-start items-center h-full lg:ml-10">
            {!pitchData?.pitch?.public_access ? (
              domainLogin ? (
                <LoginForm
                  orgHex={orgHex}
                  uiStrings={uiStrings}
                  isDomainLogin={domainLogin}
                  pitchData={pitchData}
                  companyLogo={companyLogo}
                  clientImageUrl={clientImageUrl}
                  pitchDomains={pitchDomains}
                  baseURL={base_url}
                  pitchLoginfields={pitchLoginfields}
                />
              ) : (
                <div
                  className="bg-white max-w-[400px] w-full p-4 rounded-lg border border-neutral-200 overflow-hidden shadow-md"
                  style={{ height: "450px" }}
                >
                  <div>
                    {(clientImageUrl || companyLogo) && (
                      <img
                        src={clientImageUrl || companyLogo}
                        alt="Company Logo"
                        className="mx-auto mb-4 h-10 w-auto"
                        loading="lazy"
                        width="40"
                        height="40"
                      />
                    )}
                    <div>
                      <h2 className="font-semibold text-gray-600 text-center mb-2">{uiStrings.selectContact}</h2>
                    </div>
                    <div
                      className="border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                      style={{ height: `${tableHeight}px` }}
                    >
                      <table ref={tableRef} className="table-auto w-full divide-y divide-gray-200 rounded-lg">
                        <thead className="bg-gray-50 sticky top-0 border-b">
                          <tr>
                            {columns.map((column, index) => (
                              <th
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors truncate"
                                key={index}
                                onClick={() => handleSort(column.toLowerCase())}
                                title={column}
                              >
                                <div className="flex items-center">
                                  <span className="truncate">{column}</span>
                                  <span className="ml-2">
                                    {sortConfig.key === column.toLowerCase() ? (
                                      sortConfig.direction === "ascending" ? (
                                        <FaSortUp className="text-blue-500" />
                                      ) : (
                                        <FaSortDown className="text-blue-500" />
                                      )
                                    ) : (
                                      <FaSort className="text-gray-400" />
                                    )}
                                  </span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pitchContacts.length === 0 ? (
                            <tr>
                              <td colSpan={columns.length} className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center text-gray-500">
                                  <div>{uiStrings.empty}</div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            pitchContacts.map((item) => (
                              <ContactRow
                                key={item.Id || item.id}
                                item={item}
                                orgHex={orgHex}
                                onGenerateOtp={handleGenerateDSROtp}
                              />
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {pitchDomains.length !== 0 && (
                      <div className="flex flex-row justify-between">
                        <div></div>
                        <p
                          className="text-sm mr-1 mt-2 cursor-pointer font-semibold text-slate-600 hover:underline hover:text-teal-950"
                          onClick={() => setDomainLogin(true)}
                        >
                          Other User ?
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              <LoginForm
                orgHex={orgHex}
                uiStrings={uiStrings}
                isDomainLogin={false}
                pitchData={pitchData}
                companyLogo={companyLogo}
                clientImageUrl={clientImageUrl}
                baseURL={base_url}
                pitchLoginfields={pitchLoginfields}
              />
            )}
          </div>
        )
      case 2:
        return (
          <div className="relative w-full flex justify-center lg:justify-start items-center h-full lg:ml-10">
            <div
              className="bg-white max-w-[400px] w-full p-4 rounded-lg border border-neutral-200 overflow-hidden shadow-md"
              style={{ height: "450px" }}
            >
              <div className="w-full flex flex-col items-center">
                {(clientImageUrl || companyLogo) && (
                  <img
                    src={clientImageUrl || companyLogo}
                    alt="Company Logo"
                    className="mx-auto mb-4 h-10 w-auto"
                    loading="lazy"
                    width="40"
                    height="40"
                  />
                )}
                <div className="overflow-x-auto h-64 rounded-lg overflow-y-auto w-full">
                  <div className="flex flex-col items-center justify-center mt-10 space-y-6 px-4 md:px-6">
                    <h2 className="text-lg font-semibold text-gray-800">{uiStrings.otp}</h2>
                    <p className="font-[Montserrat] text-sm text-gray-600">{isInvalidOtp ? uiStrings.InvalideOTP : uiStrings.enterOtp}</p>
                    <div className="flex space-x-2 justify-center">
                      {otp.map((data, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength="1"
                          value={data}
                          onChange={(e) => handleChange(e.target, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          ref={(el) => (inputRefs.current[index] = el)}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="size-10 text-center border border-neutral-300 rounded-lg shadow focus:outline-none text-neutral-700"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-start gap-2 my-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={privacyPolicySelected}
                    onChange={() => setPrivacyPolicySelected(!privacyPolicySelected)}
                  />
                  <p className="font-[Montserrat] text-xs text-neutral-700">
                    {uiStrings.privacyText}
                    <a href={privacyPolicyLink} target="_blank" rel="noopener noreferrer" style={{ color: orgHex }}>
                      {uiStrings.privacyPolicy}
                    </a>
                    .
                  </p>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  className="flex border hover:scale-105 transition-all duration-300 ease-in-out transform hover:shadow-lg border-neutral-300 hover:border-neutral-400 py-1 w-[87px] px-4 bg-gradient-to-b from-neutral-100 to-neutral-200 rounded-lg font-medium items-center gap-2 text-neutral-800 justify-center active:scale-95 disabled:opacity-90"
                  onClick={() => {
                    setStep(1)
                    setOtp(new Array(4).fill(""))
                    setIsInvalidOtp(false)
                  }}
                >
                  <p className="font-[Montserrat]">{uiStrings.back}</p>
                </button>
                <button
                  disabled={!isOtpValid || !privacyPolicySelected || ValidateOtpLoading}
                  style={{
                    backgroundColor: !isOtpValid || !privacyPolicySelected ? lightenColor(orgHex, 30) : orgHex,
                  }}
                  className="hover:scale-110 active:scale-95 transition-all duration-300 ease-in-out transform hover:shadow-lg border px-3 rounded-lg py-2 text-neutral-100 w-28 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                >
                  {ValidateOtpLoading ? (
                    <LuLoaderCircle className="animate-spin h-5 w-5 inline" />
                  ) : (
                    <p className="font-[Montserrat]">{uiStrings.submit}</p>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      {/* Performance optimization meta tags */}
      <link rel="preconnect" href="https://s.clarity.ms" />
      <link rel="preconnect" href="https://www.clarity.ms" />
      <link rel="preconnect" href="https://dev.my.api.revspire.io" />
      <link rel="dns-prefetch" href="https://ipinfo.io" />

      <div>
        <div className="min-w-screen h-screen relative flex justify-center md:justify-normal">
          <div className="flex justify-center items-center absolute inset-0 z-0">
            {loginImageUrl && (
              <img
                src={loginImageUrl || "/placeholder.svg"}
                alt="Background"
                className="object-cover w-full h-full"
                loading="eager"
                fetchpriority="high"
              />
            )}
            <div className="absolute inset-0 bg-black opacity-20" />
          </div>
          <div className="absolute top-10">{renderContent()}</div>
          {isDesktopOrLaptop && (
            <div className="bg-white hidden lg:block h-fit rounded-lg absolute right-10 top-10 w-[48%]">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row">
                    <h1
                      className="font-[Montserrat] font-medium text-left lg:text-3xl xl:text-4xl line-clamp-3"
                      style={{ color: orgHex }}
                    >
                      {pitchData?.pitch?.headline}
                    </h1>
                    {availableLanguages.length > 1 && (
                      <LanguageSelector
                        availableLanguages={availableLanguages}
                        currentLanguage={currentLanguage}
                        setCurrentLanguage={setCurrentLanguage}
                        orgHex={orgHex}
                      />
                    )}
                  </div>
                  <p className="font-[Montserrat] text-left lg:text-xl xl:text-2xl text-neutral-700 line-clamp-4">
                    {pitchData?.pitch?.title}
                  </p>
                </div>
              </div>
              <div className="p-6">
                {sentences.length === 0 ? (
                  <div className="animate-pulse flex flex-col justify-center items-center h-[200px]">
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="flex flex-col justify-start items-start">
                    <h1 className="font-[Montserrat] font-bold text-lg mb-4" style={{ color: orgHex }}>
                      {uiStrings.aiSummary}
                    </h1>
                    <div className="leading-6 space-y-2">
                      <p className="text-justify">{sentences.join(". ")}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PitchLogin
