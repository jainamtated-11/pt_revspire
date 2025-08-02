import React, { useContext, useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "react-query";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import {
  faCalendarDays,
  faXmark,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  ChartNoAxesCombined,
  Mail,
  MessageSquare,
  Languages,
  History,
  Newspaper,
} from "lucide-react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import MainLogo from "../../../../src/assets/RevSpire-logo.svg";
import toast from "react-hot-toast";
import DynamicLayout from "./DynamicLayout.jsx";
import Cookies from "js-cookie";
import { useCookies } from "react-cookie";
import logo from "../../../../src/assets/RevSpire-logo.svg";
import PitchAnalytics from "./PitchAnalytics.jsx";
import ContentAnalyticsModal from "./ContentAnalyticsModal.jsx";
import ThreadsDropdown from "./ThreadsDropdown.jsx";
import NewsDropdown from "./NewsDropdown.jsx";
import demoProfilePic from "../../../assets/profile_avatar.png";
import { Document, Page } from "react-pdf";
import { useDispatch } from "react-redux";
import { fetchEmails } from "../../../features/dsr/dsrSlice.js";
import Emails from "./Emails.jsx";
import useCheckUserLicense from "../../../Services/checkUserLicense.jsx";
import useCheckFrontendPermission from "../../../Services/checkFrontendPermission.jsx";
import ProcessOverviewPreview from "./PitchContentFeatures/ProcessOverview/ProcessOverviewPreview.jsx";
import ImageComponent from "../../../utils/ImageComponent.jsx";
import ShareButton from "../../../utils/ShareButton.jsx";
import VideoComponent from "../../../utils/VideoComponent.jsx";
import AnalyticsDropdown from "../../../utils/AnalyticsDropdown.jsx";
import TranslateDropdown from "../../../utils/TranslateDropdown.jsx";
import TimerModal from "../../../utils/TimerModal.jsx";
import PitchVersionModal from "../../../utils/PitchVersionModal.jsx";
import FullScreenPopup from "./fullScreenPopup.jsx";
import { bufferToDataUrl } from "../../../utils/dsrUtils.js";
import MemoizedDocViewer from "../../../utility/MemoizedDocViewer.jsx";
import DSRPopover from "./DSRPopover.jsx";
import ActionPlanPreview from "./PitchContentFeatures/ActionPlan/ActionPlanPreview.jsx";
import DeactivatedPitch from "./DeactivatedPitch.jsx";
import ESignPreview from "./PitchContentFeatures/Esigner/ESignPreview.jsx";
import UserMessagePreview from "./PitchContentFeatures/UserMessage/UserMessagePreview.jsx";
import HTMLBlockPreview from "./PitchContentFeatures/HTMLBlock/HTMLBlockPreview.jsx";
import FileUploadPreview from "./PitchContentFeatures/FileUploader/FileUploadPreview.jsx";
const AnalyticsNotificationBar = ({ orgHex }) => {
  return (
    <div
      className=" text-white py-2 px-4 text-center text-sm"
      style={{ backgroundColor: orgHex }}
    >
      Content Analytics enabled - Click on any content to view its analytics
    </div>
  );
};

const DSR = () => {
  const { pitchId, crmContact } = useParams();
  const dispatch = useDispatch();
  const { viewer_id, baseURL, revspireClient } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const [fullscreenBlobUrl, setFullscreenBlobUrl] = useState(null);
  const [fullscreenBlobName, setFullscreenBlobName] = useState("");
  const [fullscreenMimeType, setFullscreenMimeType] = useState("");
  const [selectedContent, setSelectedContent] = useState(null);
  const [copied, setCopied] = useState(false);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [timerModal, setTimerModal] = useState(false);
  const [totalContent, setTotalContent] = useState(0);
  const viewedPercentageRef = useRef(0);
  const videoVewTimeRef = useRef(0);
  const videoRef = useRef(null);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [languageCode, setLanguageCode] = useState("default");
  const [videoId, setVideoId] = useState("");
  const [titleFromLayout, setTitleFromLayout] = useState("");
  const scrollContainerRef = useRef(null);
  const lastScrollTopRef = useRef(0);
  const lastTimestampRef = useRef(Date.now());
  const scrollPositionRef = useRef(0);
  const SCROLL_SPEED_THRESHOLD = 1500;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const checkUserLicense = useCheckUserLicense();
  const checkFrontendPermission = useCheckFrontendPermission();

  const [pitchEngagementId, setPitchEngagementId] = useState(null);
  const pitchContentEngagementIdRef = useRef(null);

  const interactedContentRef = useRef(0);

  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const imageRef = useRef(null);
  const imageActiveTimeRef = useRef(0);
  const [imageId, setImageId] = useState("");

  const [fullscreenIntervalId, setFullscreenIntervalId] = useState(null);
  const [imageTrackingIntervalId, setImageTrackingIntervalId] = useState(null);

  const [analyticsPopupVisible, setAnalyticsPopupVisible] = useState(false);
  const [analyticsDetails, setAnalyticsDetails] = useState(null);
  const [pitchContentEngagements, setPitchContentEngagements] = useState([]);
  const [pitchEngagements, setPitchEngagements] = useState([]);
  const [clarityProjectId, setClarityProjectId] = useState("");
  const [clarityEnabled, setClarityEnabled] = useState(false);

  const [backgroundImageData, setBackgroundImageData] = useState(null);
  const [isBackgroundImageLoading, setIsBackgroundImageLoading] =
    useState(false);

  const [clientLogoData, setClientLogoData] = useState(null);
  const [isClientLogoLoading, setIsClientLogoLoading] = useState(true);

  const [pitchData, setPitchData] = useState(null);
  const [layout, setLayout] = useState("");
  const [pitchLayoutId, setPitchLayoutId] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [analyticsMode, setAnalyticsMode] = useState(false);

  const clarityModalRef = useRef(null);

  const activeTime = useRef(0);
  const [isActive, setIsActive] = useState(false);
  const lastActivity = useRef(Date.now());

  const [pitchAnalyticsOpen, setPitchAnalyticsOpen] = useState(false);
  const [orgHex, setOrgHex] = useState("#014d83");

  const [isThreadsDropdownOpen, setIsThreadsDropdownOpen] = useState(false);
  const [threads, setThreads] = useState([]);

  const [isAnalyticsDropdownOpen, setIsAnalyticsDropdownOpen] = useState(false);
  const [isTranslateDropdownOpen, setIsTranslateDropdownOpen] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);

  const [selectedText, setSelectedText] = useState("");
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [showButton, setShowButton] = useState(false);

  const [isContentLoading, setIsContentLoading] = useState(true);
  const [customButtons, setCustomButtons] = useState(null);
  const [publicAccessForm, setPublicAccessForm] = useState({
    name: "",
    email: "",
    privacyAccepted: false,
  });

  const [publicLinkLoading, setPublicLinkLoading] = useState(false);
  const [publicLink, setPublicLink] = useState(null);

  // warning dialogue in case of deactivated pitch
  const [isPitchActive, setIsPitchActive] = useState(false);

  const [inactivityTimer, setInactivityTimer] = useState(120);
  const [blobsLoading, setBlobsLoading] = useState(true);
  const [contentData, setContentData] = useState([]); // State to store

  // Email modal states
  const [showEmailModal, setShowEmailModal] = useState(false);

  // News sidebar states
  const [isNewsDropdownOpen, setIsNewsDropdownOpen] = useState(false);

  // Move PDF-related state to component level
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfProgress, setPdfProgress] = useState(0);

  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // orgwebsitelink
  const [orgWebsiteLink, setOrgWebsiteLink] = useState("");

  const languageOptions = [
    { value: "en-EN", label: "English" },
    { value: "fr-FR", label: "French" },
    { value: "es-ES", label: "Spanish" },
    { value: "it-IT", label: "Italian" },
    { value: "zh-CN", label: "Mandarin" },
    { value: "ja-JA", label: "Japanese" },
    { value: "de-DE", label: "German" },
    { value: "ru-RU", label: "Russian" },
    { value: "ar-AR", label: "Arabic" },
  ];

  const [cookies] = useCookies(["revspireToken"]);

  const token = cookies.revspireToken;

  const customButtonLogos = {
    CalendarLogo: faCalendarDays,
  };

  const hasEmailPermissions = useMemo(() => {
    // Use exact permission strings as they appear in the list
    const viewMailboxPermission =
      checkFrontendPermission("View Mailbox") == "1";
    const createMailboxPermission =
      checkFrontendPermission("Create Mailbox") == "1";

    // Combine permissions
    const hasPermission = viewMailboxPermission || createMailboxPermission;
    return hasPermission;
  }, [checkFrontendPermission]);

  const isFormValid = () => {
    const { name, email, privacyAccepted } = publicAccessForm;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return name.trim() !== "" && emailRegex.test(email) && privacyAccepted;
  };

  const handlePublicFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPublicAccessForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePublicAccess = () => {
    Cookies.set(
      "revspireClientContact",
      JSON.stringify({
        name: publicAccessForm.name,
        email: publicAccessForm.email,
      }),
      {
        expires: 1,
        path: "/",
        sameSite: "Lax",
        secure: true,
      }
    );

    setIsLogoLoaded(true);
  };

  useEffect(() => {
    const wsBaseURL = baseURL.replace("https://", "wss://") + "/wss/";
    // Format the protocol header with "token=" prefix
    const ws = new WebSocket(wsBaseURL, [token]);
    ws.onopen = () => {
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.type === "dsr_engagement") {
        setPitchEngagementId(response?.pitchEngagementId?.pitch_engagement_id);
      }
      if (response.type === "create_dsr_content_engagement") {
        pitchContentEngagementIdRef.current = response?.dsrContentEngagementId;
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [baseURL]);

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const isRevspireClient = Cookies.get("revspireClient") === "1";
      if (isRevspireClient && pitchData) {
        // Get and parse the publicPitchContact cookie
        const publicPitchContactStr = Cookies.get("publicPitchContact");
        // Keep the session form details as a string instead of parsing and re-stringify
        const sessionFormDetails = publicPitchContactStr || null;

        const analyticsData = {
          type: "dsr_engagement",
          payload: {
            pitch: pitchId,
            viewerId: viewer_id,
            active_time_seconds: 0,
            total_content: totalContent,
            interacted_content: 0,
            pitch_content_engagements: [],
            dsr_abandoner: null,
            crm_contact: crmContact ?? null,
            session_form_details: sessionFormDetails,
          },
        };
        socket.send(JSON.stringify(analyticsData));
      }
    }
  }, [socket, pitchData]);

  const sendAnalyticsData = (data) => {
    const isRevspireClient = Cookies.get("revspireClient") === "1";
    if (isRevspireClient && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else if (!isRevspireClient) {
      console.log("Analytics not sent: revspireClient cookie is not set to 1");
    } else {
      console.error("WebSocket is not connected");
    }
  };

  const handleScroll = () => {
    const scrollTop = scrollContainerRef.current.scrollTop;
    const currentTime = Date.now();
    const timeElapsed = (currentTime - lastTimestampRef.current) / 1000; // In seconds
    const distanceScrolled = Math.abs(scrollTop - lastScrollTopRef.current);
    const scrollSpeed = distanceScrolled / timeElapsed; // Pixels per second

    if (scrollSpeed <= SCROLL_SPEED_THRESHOLD) {
      const scrollHeight = scrollContainerRef.current.scrollHeight;
      const clientHeight = scrollContainerRef.current.clientHeight;
      const scrolledPercentage =
        (scrollTop / (scrollHeight - clientHeight)) * 100;

      scrollPositionRef.current = scrolledPercentage;
    }

    lastScrollTopRef.current = scrollTop;
    lastTimestampRef.current = currentTime;
  };

  useEffect(() => {
    const isRevspireClient = Cookies.get("revspireClient") === "1";

    const handleActivity = () => {
      if (!blobsLoading) {
        lastActivity.current = Date.now();
        if (!timerModal && !contentLoading) {
          setIsActive(true);
          setTimerModal(false);
        }
      }
    };

    const clearAllCookies = () => {
      Cookies.remove("revspireClient", { path: "/" });
      Cookies.remove("publicPitchContact", { path: "/" });
      Cookies.remove("userData", { path: "/" });
      Cookies.remove("revspireToken", { path: "/" });

      window.location.reload();
    };

    const intervalId = setInterval(() => {
      // Only run inactivity checks when blobsLoading is false
      if (isRevspireClient && !blobsLoading) {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivity.current;

        if (timeSinceLastActivity > inactivityTimer * 1000) {
          setTimerModal(true);
          setIsActive(false);
        }
      }

      // Analytics tracking only when blobsLoading is false
      if (!blobsLoading && ((isActive && isRevspireClient) || !timerModal)) {
        activeTime.current = activeTime.current + 1;

        if (activeTime.current % 5 === 0) {
          const data = {
            type: "edit_dsr_engagement",
            payload: {
              pitch_engagement: pitchEngagementId,
              active_time_seconds: activeTime.current,
              interacted_content: interactedContentRef.current,
            },
          };
          if (!timerModal) {
            sendAnalyticsData(data);
          }
        }
      }
    }, 1000);

    // Only add activity listeners when blobsLoading is false
    if (isRevspireClient && !timerModal && !blobsLoading) {
      window.addEventListener("mousemove", handleActivity);
      window.addEventListener("keydown", handleActivity);
      window.addEventListener("click", handleActivity);
    }

    return () => {
      clearInterval(intervalId);
      if (isRevspireClient && !timerModal && !blobsLoading) {
        window.removeEventListener("mousemove", handleActivity);
        window.removeEventListener("keydown", handleActivity);
        window.removeEventListener("click", handleActivity);
      }
    };
  }, [isActive, lastActivity, contentLoading, timerModal, blobsLoading]);

  const getCookieValue = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  useEffect(() => {
    let timer;
    if (copied) {
      timer = setTimeout(() => {
        setCopied(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [copied]);

  const fetchPitchData = async (language_code = null) => {
    try {
      setIsContentLoading(true);
      const url = language_code
        ? `/retrieve-pitch-sections-and-contents/${pitchId}?language_code=${language_code}`
        : `/retrieve-pitch-sections-and-contents/${pitchId}`;

      const response = await axiosInstance.get(url, {
        withCredentials: true,
      });

      const data = response?.data;
      if (data) {
        // Extract contents from pitch sections
        const extractedContents = data.pitchSections.flatMap((section) =>
          section.contents.map((content) => ({
            id: content.id,
            content: content.content,
            tagline: content.tagline,
          }))
        );

        setIsPitchActive(data.pitch.active);
        setContentData(extractedContents); // Store the extracted contents
        // Handle company logo
        if (data.orgDetails?.[0]?.company_logo?.data) {
          setInactivityTimer(
            data.orgDetails[0].pitch_inactivity_seconds || 120
          );
          const logoData = data.orgDetails[0].company_logo.data;
          const logoType = data.orgDetails[0].company_logo.type;
          const logoUrl = bufferToDataUrl(logoData, logoType);
          setCompanyLogoUrl(logoUrl);
        } else {
          setCompanyLogoUrl(null);
        }

        if (data.orgDetails?.[0]?.website) {
          setOrgWebsiteLink(data.orgDetails[0].website);
        }

        // Parse the pitch_translate string to array and set selected languages
        if (data.pitch.pitch_translate) {
          const translatedLanguages = response.data.pitch.pitch_translate;

          // Filter selected languages from the language options
          const selectedOptions = languageOptions.filter((option) =>
            translatedLanguages.includes(option.value)
          );

          setAvailableLanguages(selectedOptions);
        }

        // Batch state updates
        const updates = {
          pitchData: data,
          pitchLayoutId: data?.pitch?.pitch_layout,
          userDetails: data.userDetails[0],
          threads: data.threadsWithComments || [],
          pitchEngagements: data?.pitchEngagements.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          ),
        };

        // Set clarity ID if needed
        if (data?.orgDetails[0]?.org_level_microsoft_clarity !== 0) {
          updates.clarityProjectId =
            data?.orgDetails[0]?.microsoft_clarity_project_id;
        } else if (data?.userDetails[0]?.microsoft_clarity_project_id !== "") {
          updates.clarityProjectId =
            data?.userDetails[0]?.microsoft_clarity_project_id;
        }
        setOrgHex(`#${data?.dsr_primary_color}`);
        // Calculate total content
        let contentLengths = 0;
        data?.pitchSections.forEach((section) => {
          contentLengths += section.contents.length;
        });
        updates.totalContent = contentLengths;

        // Batch update all states
        setPitchData(updates.pitchData);
        setPitchLayoutId(updates.pitchLayoutId);
        setUserDetails(updates.userDetails);
        setThreads(updates.threads);
        setPitchEngagements(updates.pitchEngagements);

        if (updates.clarityProjectId) {
          setClarityProjectId(updates.clarityProjectId);
        }
        setTotalContent(updates.totalContent);
      }
    } catch (error) {
      console.error("Error fetching pitch data:", error);
      setCompanyLogoUrl(null);
    } finally {
      setIsContentLoading(false);
    }
  };

  useEffect(() => {
    if (pitchId) {
      fetchPitchData();
    }
  }, [pitchId]);

  useEffect(() => {
    document.title = pitchData?.pitch?.name || "Loading Pitch";
    setMetaTag("name", "description", pitchData?.pitch?.description);
    setMetaTag("name", "og:title", pitchData?.pitch?.name || "");
    setMetaTag("name", "og:description", pitchData?.pitch?.description || "");
    setMetaTag("name", "og:image", backgroundImageData || logo);
    setMetaTag("name", "og:url", window.location.href);
  }, [pitchData]);

  const setMetaTag = (attribute, key, content) => {
    if (content) {
      let element = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    }
  };

  useEffect(() => {
    if (fullscreenBlobUrl !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [fullscreenBlobUrl]);

  useEffect(() => {
    if (revspireClient === "1") {
      try {
        // Retrieve Measurement ID and Clarity Project ID
        const userDataCookie = getCookieValue("userData");
        if (userDataCookie) {
          const userData = JSON.parse(userDataCookie);
          const microsoftClarityProjectId =
            userData.user?.microsoft_clarity_project_id;
          const googleAnalyticsMeasurementId =
            userData.user?.google_analytics_measurement_id;

          // Inject Microsoft Clarity
          if (microsoftClarityProjectId) {
            (function (c, l, a, r, i, t, y) {
              c[a] =
                c[a] ||
                function () {
                  (c[a].q = c[a].q || []).push(arguments);
                };
              t = l.createElement(r);
              t.async = 1;
              t.src = "https://www.clarity.ms/tag/" + i;
              y = l.getElementsByTagName(r)[0];
              y.parentNode.insertBefore(t, y);
            })(
              window,
              document,
              "clarity",
              "script",
              microsoftClarityProjectId
            );
          }

          // Inject Google Analytics
          if (googleAnalyticsMeasurementId && !window.gtag) {
            const gaScript = document.createElement("script");
            gaScript.async = true;
            gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsMeasurementId}`;
            document.head.appendChild(gaScript);

            const inlineScript = document.createElement("script");
            inlineScript.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsMeasurementId}');
            `;
            document.head.appendChild(inlineScript);
          }
        }
      } catch (error) {
        console.error("Error parsing cookie:", error);
      }
    }
  }, [revspireClient]);

  const applyStylesToWidget = () => {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      video.pause();
    });
  };

  const toggleFullscreen = async (blobUrl, name, mimeType, content) => {
    applyStylesToWidget();
    if (blobUrl) {
      interactedContentRef.current += 1;
      const createData = {
        type: "create_dsr_content_engagement",
        payload: {
          pitch_engagement: pitchEngagementId,
          content: content.content,
          pitch_content: content.id,
          pdf_scroll_percent: 0,
          image_active_seconds: 0,
          video_watch_percent: 0,
        },
      };
      sendAnalyticsData(createData);

      // Open the popup immediately
      setFullscreenBlobUrl(blobUrl);
      setFullscreenBlobName(name);
      setFullscreenMimeType(mimeType);
      setSelectedContent(content);

      // For Canva and Microsoft Stream, we don't need to fetch anything extra
      if (
        content.content_source?.toLowerCase() === "canva link" ||
        content.content_source?.toLowerCase() === "microsoft stream"
      ) {
        return;
      }

      // Rest of your existing code for other content types...
      if (mimeType === "application/pdf") {
        setIsPdfLoading(true);
        try {
          const token = getCookieValue("revspireToken");
          const response = await axiosInstance.post(
            `/open-content`,
            {
              viewerId: viewer_id,
              contentId: content.content_id,
              manual_token: token,
            },
            {
              responseType: "blob",
              withCredentials: true,
            }
          );

          const pdfBlobUrl = URL.createObjectURL(response.data);
          setFullscreenBlobUrl(pdfBlobUrl);
        } catch (error) {
          toast.error("Error fetching PDF:", error);
          toast.error("Failed to load PDF. Please try again.");
        } finally {
          setIsPdfLoading(false);
        }
      } else if (content.content_source == "Public URL") {
        setPublicLinkLoading(true);
        const token = getCookieValue("revspireToken");
        const res = await axiosInstance.post(
          `/open-content`,
          {
            contentId: content.content_id,
            viewerId: viewer_id,
            manual_token: token,
          },
          {
            withCredentials: true,
          }
        );
        const publicURL = res.data.content;
        setPublicLink(publicURL);
        setPublicLinkLoading(false);
      }

      if (!timerModal) {
        const intervalId = setInterval(() => {
          imageActiveTimeRef.current = imageActiveTimeRef.current + 2;
          const updatedData = {
            type: "edit_dsr_content_engagement",
            payload: {
              pitch_content_engagement: pitchContentEngagementIdRef.current,
              pdf_scroll_percent: scrollPositionRef.current,
              image_active_seconds: imageActiveTimeRef.current,
              video_watch_percent: viewedPercentageRef.current,
            },
          };
          sendAnalyticsData(updatedData);
        }, 2000);
        setFullscreenIntervalId(intervalId);
      }
    } else {
      if (fullscreenIntervalId) {
        clearInterval(fullscreenIntervalId);
      }
      if (imageTrackingIntervalId) {
        clearInterval(imageTrackingIntervalId);
      }

      if (pitchContentEngagementIdRef.current && !timerModal) {
        const finalData = {
          type: "edit_dsr_content_engagement",
          payload: {
            pitch_content_engagement: pitchContentEngagementIdRef.current,
            pdf_scroll_percent: scrollPositionRef.current,
            image_active_seconds: imageActiveTimeRef.current,
            video_watch_percent: viewedPercentageRef.current,
          },
        };
        pitchContentEngagementIdRef.current = null;
        sendAnalyticsData(finalData);
      }

      setFullscreenBlobUrl(null);
      setFullscreenBlobName("");
      setFullscreenMimeType(null);
      imageActiveTimeRef.current = 0;
      scrollPositionRef.current = 0;
      viewedPercentageRef.current = 0;
      setSelectedContent(null);
      setIsPdfLoading(false);
    }
  };

  const handleAnalyticsContentClick = (content) => {
    if (analyticsMode && Cookies.get("revspireClient") !== "1") {
      const data = [];
      for (let i = 0; i < pitchData?.pitchEngagements.length; i++) {
        for (
          let j = 0;
          j < pitchData?.pitchEngagements[i]?.pitchContentEngagements.length;
          j++
        ) {
          if (
            pitchData?.pitchEngagements[i]?.pitchContentEngagements[j]
              ?.pitch_content === content.id
          ) {
            data.push(
              pitchData?.pitchEngagements[i]?.pitchContentEngagements[j]
            );
          }
        }
      }

      const sortedData = [...data].sort((a, b) => {
        const aValue = new Date(a.created_at);
        const bValue = new Date(b.created_at);
        return bValue - aValue;
      });
      setPitchContentEngagements(sortedData);
      setAnalyticsPopupVisible(true);
      setAnalyticsDetails(content);
    }
  };

  const fetchBackgroundImage = async () => {
    setIsBackgroundImageLoading(true);
    try {
      const response = await axiosInstance.post(
        `/pitch-preview-content`,
        { viewerId: viewer_id, content_name: `${pitchId}_background_image` },
        { responseType: "blob", withCredentials: true }
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      try {
        const fallbackResponse = await axiosInstance.post(
          `/pitch-preview-content`,
          {
            viewerId: viewer_id,
            content_name: `${pitchLayoutId}_background_image`,
          },
          { responseType: "blob", withCredentials: true }
        );
        return URL.createObjectURL(fallbackResponse.data);
      } catch (fallbackError) {
        console.error("Failed to fetch the background image", fallbackError);
      }
    } finally {
      setIsBackgroundImageLoading(false);
    }
  };

  const fetchClientLogo = async () => {
    setIsClientLogoLoading(true);
    try {
      const res = await axiosInstance.post(
        `/pitch-preview-content`,
        { viewerId: viewer_id, content_name: `${pitchId}_client_logo` },
        { responseType: "blob", withCredentials: true }
      );

      // Check if the response is successful
      if (res.status === 200) {
        const logoUrl = URL.createObjectURL(res.data);
        setClientLogoData(logoUrl);
      } else if (res.status === 404) {
        setClientLogoData(null); // Set to null if the logo is not found
      } else {
        throw new Error("Unexpected response status.");
      }
    } catch (error) {
      console.error("Error fetching client logo:", error.message);
      setClientLogoData(null);
    } finally {
      setIsClientLogoLoading(false);
    }
  };

  useEffect(() => {
    const loadBackgroundImage = async () => {
      const imageData = await fetchBackgroundImage();
      if (imageData) {
        setBackgroundImageData(imageData);
      }
    };

    loadBackgroundImage();
    fetchClientLogo();
  }, [pitchId, pitchLayoutId, viewer_id, pitchData]);

  const fetchHighlightVideo = async () => {
    try {
      const token = getCookieValue("revspireToken");

      const response = await axiosInstance.post(
        "/view-pitch-highlight-video",
        { viewer_id: viewer_id, pitch_id: pitchId, manual_token: token },
        { responseType: "json", withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching highlight video:", error);
      throw error;
    }
  };

  const fetchHighlightVideoSasUrls = async (highlightVideos) => {
    const sasUrls = await Promise.all(
      highlightVideos.map(async (video) => {
        try {
          const token = getCookieValue("revspireToken");

          const response = await axiosInstance.post(
            `/pitch-preview-content`,
            {
              viewerId: viewer_id,
              content_name: `${video.id}`,
              manual_token: token,
            },
            { responseType: "json", withCredentials: true }
          );
          return {
            ...video,
            sasUrl: response.data.sasUrl,
          };
        } catch (error) {
          console.error(`Error fetching SAS URL for video ${video.id}:`, error);
          return { ...video, sasUrl: null };
        }
      })
    );
    return sasUrls;
  };

  const openEmailModal = () => {
    setShowEmailModal(true);
    if (pitchId) {
      dispatch(fetchEmails({ pitchId, axiosInstance }));
    }
  };

  const {
    data: highlightVideoData,
    isSuccess: isHighlightVideoFetched,
    isLoading: isHighlightVideoLoading,
  } = useQuery(["highlightVideo", viewer_id, pitchId], fetchHighlightVideo, {
    enabled: !!viewer_id && !!pitchId,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const {
    data: highlightVideosWithSasUrls,
    isSuccess: isSasUrlsFetched,
    isLoading: isSasUrlsLoading,
  } = useQuery(
    ["highlightVideoSasUrls", highlightVideoData],
    () => fetchHighlightVideoSasUrls(highlightVideoData),
    {
      enabled: !!highlightVideoData,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const fetchHtmlCode = async () => {
    if (pitchLayoutId) {
      try {
        const res = await axiosInstance.post(
          `${baseURL}/pitch-preview-content`,
          {
            viewerId: viewer_id,
            content_name: `${pitchLayoutId}_html_code`,
          }
        );
        if (res) {
          setLayout(res.data);
        }
      } catch (error) {
        console.log("Error in fetching jsx code", error);
      }
    }
  };

  useEffect(() => {
    if (pitchLayoutId) {
      fetchHtmlCode();
    }
  }, [pitchLayoutId, pitchData]);

  const isPageLoading = isContentLoading;

  useEffect(() => {
    if (
      !isBackgroundImageLoading &&
      !isClientLogoLoading &&
      // !isBlobLoading &&
      !isHighlightVideoLoading &&
      !isSasUrlsLoading
    ) {
      setIsActive(true);
      setContentLoading(false);
      lastActivity.current = Date.now();
    }
  }, [
    isClientLogoLoading,
    isBackgroundImageLoading,
    // isBlobLoading,
    isHighlightVideoLoading,
    isSasUrlsLoading,
  ]);

  const handlePlayVideo = (id, content) => {
    const videos = document.querySelectorAll("video");
    const videoID = id;
    const videoElement = document.querySelector(videoID);
    videos.forEach((video) => {
      if (video.id !== id) {
        video.pause();
      } else {
        video.play();
      }
    });

    const handleTimeUpdate = () => {
      setIsActive(true);
      lastActivity.current = Date.now();
    };
    if (content.mimetype !== "video/webm") {
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
    }
  };

  const handlePauseVideo = (id, content) => {
    const videoID = id;
    const videos = document.querySelectorAll("video");
    const videoElement = document.querySelector(videoID);
    const currentTime = videoElement.currentTime;
    const duration = videoElement.duration;
    videos.forEach((video) => {
      if (video.id !== id) {
        video.pause();
      }
    });

    let videoViewPercentage;
    if (duration > 0) {
      videoViewPercentage = (currentTime / duration) * 100;
    }

    setIsActive(false);
    lastActivity.current = Date.now();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        clarityModalRef.current &&
        !clarityModalRef.current.contains(event.target)
      ) {
        setClarityEnabled(false);
      }
    };

    // Add event listener for clicks
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clarityModalRef]);

  const handleClarityAnalytics = (value) => {
    if (value === "heatmaps") {
      window.open(
        `https://clarity.microsoft.com/projects/view/${clarityProjectId}/heatmaps?date=Last%203%20days&URL=0%3B2%3B${pitchId}`,
        "_blank"
      );
    }
    if (value == "recordings") {
      window.open(
        `https://clarity.microsoft.com/projects/view/${clarityProjectId}/impressions?date=Last%203%20days&URL=0%3B2%3B${pitchId}`,
        "_blank"
      );
    }
    setClarityEnabled(false);
  };

  const handleOnClickContent = (content, blobUrl, mimeType, tagline) => {
    setSelectedContent(content);

    if (analyticsMode) {
      handleAnalyticsContentClick(content);
    } else {
      if (
        content.content_source?.toLowerCase() === "youtube" ||
        content.content_source?.toLowerCase() === "vimeo" ||
        content.content_source?.toLowerCase() === "canva link" ||
        content.content_source?.toLowerCase() === "microsoft stream"
      ) {
        // For YouTube, Vimeo, Canva, and Microsoft Stream, use content_link directly
        toggleFullscreen(
          content.content_link,
          tagline,
          "application/url",
          content
        );
      } else {
        toggleFullscreen(blobUrl, tagline, mimeType, content);
      }
    }
  };

  // Move handlers to component level
  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    // Initialize with first page viewed (100% for single page, proper % for multi-page)
    const initialProgress = (1 / numPages) * 100;
    setPdfProgress(initialProgress);
    scrollPositionRef.current = initialProgress;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Ensure we don't divide by zero and properly handle single-page docs
    const progress = numPages > 0 ? (pageNumber / numPages) * 100 : 100;
    setPdfProgress(progress);
    scrollPositionRef.current = progress;
  };

  const featureMap = {
    ProcessOverview: ProcessOverviewPreview,
    ActionPlan: ActionPlanPreview,
    ESign: ESignPreview,
    UserMessage: UserMessagePreview,
    HtmlBlock: HTMLBlockPreview,
    FileUploader: FileUploadPreview,
    // B: ComponentB,
  };

  // Funciton to activate a deactivated pitch
  const handleActivatePitch = async () => {
    try {
      const response = await axiosInstance.post("/activate-pitch", {
        pitchIds: [pitchId],
        updated_by: viewer_id,
      });

      // Dispatch action to update the active status in Redux store
      setIsPitchActive(true);
      toast.success("Pitch Activated Succesfully");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Error activating pitch:", error);
    }
  };

  // Modify popup function to receive handlers and state as parameters
  const popup = () => {
    const isVideo = fullscreenMimeType?.startsWith("video/");
    const isPDF = fullscreenMimeType === "application/pdf";
    const isPPT =
      fullscreenMimeType?.startsWith("application/vnd.ms-powerpoint") ||
      fullscreenMimeType?.startsWith(
        "application/vnd.openxmlformats-officedocument.presentationml"
      );
    const isImage = fullscreenMimeType?.startsWith("image");
    const isYoutubeOrVimeo =
      selectedContent?.content_source?.toLowerCase() === "youtube" ||
      selectedContent?.content_source?.toLowerCase() === "vimeo";
    const isPublicUrl =
      selectedContent?.content_source?.toLowerCase() === "public url";
    const isCanvaLink =
      selectedContent?.content_source?.toLowerCase() === "canva link";
    const isMicrosoftStream =
      selectedContent?.content_source?.toLowerCase() === "microsoft stream";

    return (
      <div className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center bg-black/50 backdrop-blur-sm py-6 dark:bg-gray-900/70 dsr-popup">
        <div className="relative flex h-[65vh] md:h-full w-[98vw] md:w-full max-w-5xl flex-col gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2 dark:border-gray-700 dark:bg-gray-700 ">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              {fullscreenBlobName}
              {isPDF && (
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {numPages}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setFullscreenBlobUrl(null);
                toggleFullscreen(null);
                // Reset PDF state when closing
                setCurrentPage(1);
                setNumPages(null);
                setPdfProgress(0);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              <FontAwesomeIcon className="text-lg" icon={faXmark} />
            </button>
          </div>

          {/* Content Area */}
          <div className="h-full overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800 relative">
            {isPPT && (
              <div
                className="absolute inset-0 bottom-[20%] z-10"
                style={{
                  touchAction: "pinch-zoom pan-x pan-y",
                  WebkitOverflowScrolling: "touch",
                }}
              />
            )}

            {isYoutubeOrVimeo ? (
              <div className="relative w-full h-full">
                <iframe
                  src={selectedContent.content_link}
                  className="absolute top-0 left-0 w-full h-full"
                  title={fullscreenBlobName}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : isPublicUrl ? (
              <div className="w-full h-full">
                {publicLinkLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <iframe
                    src={publicLink}
                    className="w-full h-full"
                    title={fullscreenBlobName}
                    frameBorder="0"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                )}
              </div>
            ) : isCanvaLink ? (
              <div className="w-full h-full relative">
                <iframe
                  src={selectedContent.content_link}
                  className="w-full h-full"
                  title="Canva Content"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  loading="eager"
                />
              </div>
            ) : isMicrosoftStream ? (
              <div className="w-full h-full relative">
                <iframe
                  src={selectedContent.content_link}
                  className="w-full h-full"
                  title="Microsoft Stream Content"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  loading="eager"
                />
              </div>
            ) : isVideo ? (
              <VideoComponent
                fullscreenBlobUrl={fullscreenBlobUrl}
                viewedPercentageRef={viewedPercentageRef}
                videoRef={videoRef}
                videoId={videoId}
                videoVewTimeRef={videoVewTimeRef}
                setIsActive={setIsActive}
                lastActivity={lastActivity}
                activeTime={activeTime}
              />
            ) : isImage ? (
              <ImageComponent
                fullscreenBlobUrl={fullscreenBlobUrl}
                imageRef={imageRef}
                imageId={imageId}
              />
            ) : isPDF ? (
              <div className="flex flex-col h-full">
                {isPdfLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-auto flex justify-center items-center md:items-start">
                      <Document
                        file={fullscreenBlobUrl}
                        onLoadSuccess={handleDocumentLoadSuccess}
                        loading={
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          </div>
                        }
                        error={
                          <div className="flex items-center justify-center h-full text-red-500">
                            Failed to load PDF
                          </div>
                        }
                        onLoadError={(error) => {
                          console.error("PDF loading error:", error);
                          // Initialize with 0% if there's an error
                          setPdfProgress(0);
                          scrollPositionRef.current = 0;
                        }}
                      >
                        <Page
                          pageNumber={currentPage}
                          width={Math.min(window.innerWidth * 0.8, 800)}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          onLoadSuccess={() => {
                            // This ensures we capture the first page view
                            if (currentPage === 1) {
                              const progress =
                                numPages > 0 ? (1 / numPages) * 100 : 100;
                              setPdfProgress(progress);
                              scrollPositionRef.current = progress;
                            }
                          }}
                        />
                      </Document>
                    </div>
                    {numPages > 1 && (
                      <div className="flex justify-center py-1 items-center gap-4 px-4 border-t bg-[#444444] text-white">
                        <button
                          onClick={() =>
                            handlePageChange(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage <= 1}
                          className="hover:bg-gray-500 disabled:opacity-50 "
                        >
                          <FaCaretLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm">
                          Page {currentPage} of {numPages}
                        </span>
                        <button
                          onClick={() =>
                            handlePageChange(
                              Math.min(numPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage >= numPages}
                          className="hover:bg-gray-500 disabled:opacity-50"
                        >
                          <FaCaretRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <MemoizedDocViewer
                blobUrl={fullscreenBlobUrl}
                handleScroll={handleScroll}
                scrollContainerRef={scrollContainerRef}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const toggleThreadsDropdown = () => {
    setIsThreadsDropdownOpen(!isThreadsDropdownOpen);
  };

  const toggleNewsDropdown = () => {
    setIsNewsDropdownOpen(!isNewsDropdownOpen);
  };

  const toggleAnalyticsDropdown = () => {
    setIsAnalyticsDropdownOpen(!isAnalyticsDropdownOpen);
  };

  const toggleTranslateDropdown = () => {
    setIsTranslateDropdownOpen(!isTranslateDropdownOpen);
  };

  const toggleVersionModal = () => {
    setShowVersionModal(!showVersionModal);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const selectedText = selection.toString().trim(); // Trim whitespace from selected text
      if (selectedText) {
        setSelectedText(selectedText);
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setButtonPosition({
          top: rect.bottom + window.scrollY, // Position below the selected text
          left: rect.left + window.scrollX,
        });
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    } else {
      setShowButton(false); // Hide button if no selection
    }
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, []);

  // lighten the primary color of the organisation
  const lightenColor = (hex, percent) => {
    percent = Math.min(100, Math.max(0, percent));
    const num = parseInt(hex.replace("#", ""), 16);
    const R = (num >> 16) + Math.round((255 - (num >> 16)) * (percent / 100));
    const G =
      ((num >> 8) & 0x00ff) +
      Math.round((255 - ((num >> 8) & 0x00ff)) * (percent / 100));
    const B =
      (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * (percent / 100));
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  };

  const hoverColor = lightenColor(orgHex, 90);

  // Add new state for lazy loading
  const [DSRconfig, setDSRconfig] = useState({
    visibleSectionsCount: 3,
    initialContentCounts: 4,
    addSectionCount: 3,
    addContentCount: 4,
    currentPopupStyle: "default",
    contentGrouping: false,
    processOverVeiw: false,
    actionPlan: false,
    eSigner: false,
    userMessage: false,
    htmlBlock: false,
    fileUploader: false,
  });

  // Add new state for lazy loading
  const [visibleContentCounts, setVisibleContentCounts] = useState({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initialize visible content counts when pitch data loads
  useEffect(() => {
    if (pitchData?.pitchSections) {
      const initCounts = {};
      pitchData.pitchSections.forEach((section) => {
        initCounts[section.id] = DSRconfig.initialContentCounts; // Show initial 4 contents per section
      });
      setVisibleContentCounts(initCounts);
    }
  }, [pitchData, DSRconfig.initialContentCounts]);

  // Create truncated sections data
  const truncatedSections = useMemo(() => {
    if (!pitchData?.pitchSections) return [];
    return pitchData.pitchSections
      .slice(0, DSRconfig.visibleSectionsCount)
      .map((section) => ({
        ...section,
        contents: section.contents.slice(
          0,
          visibleContentCounts[section.id] || DSRconfig.initialContentCounts
        ),
        hasMoreContents:
          section.contents.length > (visibleContentCounts[section.id] || 99),
      }));
  }, [pitchData, DSRconfig.visibleSectionsCount, visibleContentCounts]);

  // Handler for loading more sections
  const handleLoadMoreSections = () => {
    if (isLoadingMore) return; // Prevent double-loading

    setIsLoadingMore(true);
    const timer = setTimeout(() => {
      try {
        setDSRconfig((prev) => ({
          ...prev,
          visibleSectionsCount:
            prev.visibleSectionsCount + prev.addSectionCount,
        }));
      } catch (error) {
        console.error("Load more failed:", error);
      } finally {
        setIsLoadingMore(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  };

  // Handler for loading more contents in a section
  const handleLoadMoreContents = (sectionId) => {
    setVisibleContentCounts((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] || 4) + DSRconfig.addContentCount,
    }));
  };

  const handleDataFromChild = (data) => {
    setTitleFromLayout(data);
  };

  const handleSetTimerStart = (data) => {
    setBlobsLoading(data); // Update the state with the data sent from the child
  };
  const handleCustomButtons = (customButtons) => {
    setCustomButtons(customButtons);
  };

  useEffect(() => {
    // Check if either pitchAnalyticsOpen or analyticsPopupVisible is true
    if (pitchAnalyticsOpen || analyticsPopupVisible) {
      document.body.style.overflowY = "hidden"; // Disable vertical scrolling
      document.body.style.overflowX = "auto"; // Allow horizontal scrolling if needed
    } else {
      document.body.style.overflowY = "auto"; // Enable vertical scrolling
      document.body.style.overflowX = "auto"; // Allow horizontal scrolling
    }
  }, [pitchAnalyticsOpen, analyticsPopupVisible]);

  const sessionDetails =
    revspireClient === "1"
      ? JSON.parse(
          decodeURIComponent(Cookies.get("publicPitchContact") || null)
        )
      : null;

  const possibleName =
    revspireClient === "1" && sessionDetails
      ? sessionDetails.full_name ||
        sessionDetails.fullName ||
        (sessionDetails.first_name && sessionDetails.last_name
          ? `${sessionDetails.first_name} ${sessionDetails.last_name}`
          : null) ||
        sessionDetails.name ||
        sessionDetails.firstName ||
        sessionDetails.first_name ||
        sessionDetails.last_name ||
        "Guest"
      : "Guest";

  if (Cookies.get("revspireClient") === "1" && isPitchActive === 0)
    return (
      <DeactivatedPitch
        ownerDetails={{
          fullName: `${userDetails?.firstName} ${userDetails?.lastName}`,
          email: userDetails?.email,
          profilePhoto: userDetails?.profilePhoto,
          title: userDetails?.jobTitle,
          companyLogo: companyLogoUrl,
        }}
        orgHex={orgHex}
      />
    );

  return (
    <>
      {Cookies.get("revspireClient") === "1" && !isPageLoading && (
        <DSRPopover
          ownerDetails={{
            fullName: `${userDetails?.firstName} ${userDetails?.lastName}`,
            microsoft_teams_bot_installed:
              userDetails?.microsoft_teams_bot_installed,
            email: userDetails?.email,
            slack_bot_installed: userDetails?.slack_bot_installed,
            signature: userDetails?.emailSignature,
            profilePhoto: userDetails?.profilePhoto,
            instant_message_dsr: userDetails?.instant_message_dsr,
            agent_dsr: userDetails?.agent_dsr,
          }}
          viewerDetails={{
            viewer_id,
            email: sessionDetails?.email,
            fullName: possibleName,
          }}
          client={Cookies.get("revspireClient")}
          threads={threads}
          setThreads={setThreads}
          orgHex={orgHex}
          pitchId={pitchId}
          contentData={contentData}
          pitchData={pitchData}
          handleOnClickContent={handleOnClickContent}
          setFullscreenBlobUrl={setFullscreenBlobUrl}
          popup={popup}
        />
      )}
      {isPageLoading ? (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          {/* {isLogoLoaded && (
            <img
              src={companyLogoUrl || MainLogo}
              className="h-16 sm:h-24 animate-pulse"
              alt="Company Logo"
              onLoad={() => setIsLogoLoaded(true)}
              onError={() => {
                setCompanyLogoUrl(MainLogo);
                setIsLogoLoaded(true);
              }}
            />
          )} */}
        </div>
      ) : (
        <div className="w-full h-full">
          {fullscreenBlobUrl &&
            (DSRconfig.currentPopupStyle === "default" ? (
              popup()
            ) : (
              <FullScreenPopup
                fullscreenBlobUrl={fullscreenBlobUrl}
                fullscreenBlobName={fullscreenBlobName}
                fullscreenMimeType={fullscreenMimeType}
                selectedContent={selectedContent}
                onClose={() => {
                  setFullscreenBlobUrl(null);
                  toggleFullscreen(null);
                  setCurrentPage(1);
                  setNumPages(null);
                  setPdfProgress(0);
                }}
                currentPage={currentPage}
                numPages={numPages}
                onPageChange={setCurrentPage}
                pdfProgress={pdfProgress}
                publicLink={publicLink}
                publicLinkLoading={publicLinkLoading}
                isPdfLoading={isPdfLoading}
                viewedPercentageRef={viewedPercentageRef}
                videoRef={videoRef}
                videoId={videoId}
                videoVewTimeRef={videoVewTimeRef}
                setIsActive={setIsActive}
                lastActivity={lastActivity}
                activeTime={activeTime}
                scrollPositionRef={scrollPositionRef}
                scrollContainerRef={scrollContainerRef}
                handleScroll={handleScroll}
                handleDocumentLoadSuccess={handleDocumentLoadSuccess}
                handlePageChange={handlePageChange}
                setPdfProgress={setPdfProgress}
                orgHex={orgHex}
              />
            ))}
          {/* {fullscreenBlobUrl && popup()} */}
          {pitchAnalyticsOpen && !isContentLoading && (
            <PitchAnalytics
              pitchAnalyticsOpen={pitchAnalyticsOpen}
              pitchEngagements={pitchEngagements}
              setPitchAnalyticsOpen={setPitchAnalyticsOpen}
              orgHex={orgHex}
            />
          )}
          <Emails
            showEmailModal={showEmailModal}
            setShowEmailModal={setShowEmailModal}
          />
          <div className="flex justify-center items-center">
            <AnalyticsDropdown
              isAnalyticsDropdownOpen={isAnalyticsDropdownOpen}
              setIsAnalyticsDropdownOpen={setIsAnalyticsDropdownOpen}
              analyticsMode={analyticsMode}
              setAnalyticsMode={setAnalyticsMode}
              setPitchAnalyticsOpen={setPitchAnalyticsOpen}
              clarityProjectId={clarityProjectId}
              handleClarityAnalytics={handleClarityAnalytics}
              orgHex={orgHex}
            />
          </div>
          {analyticsMode && analyticsPopupVisible && (
            <ContentAnalyticsModal
              analyticsPopupVisible={analyticsPopupVisible}
              setAnalyticsPopupVisible={setAnalyticsPopupVisible}
              analyticsDetails={analyticsDetails}
              pitchEngagements={pitchEngagements}
              pitchContentEngagements={pitchContentEngagements}
              toggleFullscreen={toggleFullscreen}
              orgHex={orgHex}
            />
          )}
          {Cookies.get("revspireClient") === "1" && timerModal && (
            <TimerModal
              timerModal={timerModal}
              setTimerModal={setTimerModal}
              isActive={isActive}
              setIsActive={setIsActive}
              lastActivity={lastActivity}
              orgHex={orgHex}
            />
          )}
          <div className="w-full min-h-screen bg-gray-100">
            <nav className=" relative z-10 flex justify-between items-center h-16 bg-white bg-opacity-90 px-4 sm:px-10 ">
              <div className="flex items-center gap-3 text-3xl sm:text-4xl">
                <span
                  className={` pr-3 border-r-neutral-400  ${
                    clientLogoData !== null && "border-r"
                  }`}
                >
                  <img
                    src={companyLogoUrl || MainLogo}
                    className="mr-3 h-6 sm:h-9"
                    alt="Company Logo"
                    onClick={() => {
                      if (orgWebsiteLink && orgWebsiteLink.trim() !== "") {
                        window.open(orgWebsiteLink, "_blank");
                      }
                    }}
                    style={{
                      cursor:
                        orgWebsiteLink && orgWebsiteLink.trim() !== ""
                          ? "pointer"
                          : "default",
                    }}
                  />
                </span>
                {clientLogoData !== null && (
                  <img
                    src={clientLogoData}
                    className="mr-3 h-6 sm:h-9"
                    alt="Client Logo"
                  />
                )}
                {titleFromLayout && (
                  <>
                    <p className="hidden md:flex md:text-2xl md:font-semibold">
                      {titleFromLayout}
                    </p>
                  </>
                )}
              </div>
              {/* Add deactivation message before the right-side buttons */}
              {isPitchActive === 0 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                  <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
                    This Pitch Is Deactivated
                  </span>
                  <button
                    onClick={handleActivatePitch}
                    className="text-xs font-medium text-blue-700 hover:underline"
                  >
                    Activate
                  </button>
                </div>
              )}
              <div
                className={`justify-center items-center gap-8 px-2 rounded-2xl max-h-[70%] py-1 hidden lg:flex`}
                style={{
                  backgroundColor: "transparent",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = hoverColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div
                  className="flex flex-row"
                  style={{
                    display: customButtons?.length > 0 ? "flex" : "none",
                  }}
                >
                  {customButtons?.length > 0 &&
                    customButtons.map((button, index) => {
                      const IconComponent = button.logo;
                      return (
                        <div
                          className="flex justify-center items-center"
                          key={index}
                        >
                          <button
                            style={{ color: orgHex }}
                            onClick={() => {
                              if (button.href) {
                                window.open(
                                  button.href,
                                  button.target || "_blank"
                                );
                              }
                              if (button.onClick) {
                                button.onClick();
                              }
                            }}
                            className="group flex items-center justify-evenly gap-1 overflow-hidden transition-all duration-300 ease-in-out w-8 hover:w-36"
                          >
                            {IconComponent && <IconComponent />}
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out font-semibold">
                              {button.text}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                </div>

                {availableLanguages?.length > 0 && (
                  <div className="flex justify-center items-center">
                    <button
                      onClick={toggleTranslateDropdown}
                      style={{ color: orgHex }}
                      className="group flex items-center justify-evenly gap-1 overflow-hidden transition-all duration-300 ease-in-out w-8 hover:w-32"
                    >
                      <Languages className="h-6 w-6 flex-shrink-0" />

                      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out font-semibold">
                        Translate
                      </span>
                    </button>
                  </div>
                )}

                {Cookies.get("revspireClient") != "1" && (
                  <div className="flex justify-center items-center">
                    <button
                      onClick={toggleThreadsDropdown}
                      style={{ color: orgHex }}
                      className="group flex items-center justify-evenly gap-1 overflow-hidden transition-all duration-300 ease-in-out w-8 hover:w-32"
                    >
                      <MessageSquare className="h-6 w-6 flex-shrink-0" />

                      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out font-semibold">
                        Threads
                      </span>
                    </button>
                  </div>
                )}

                {Cookies.get("revspireClient") != "1" && (
                  <div className="flex justify-center items-center">
                    <button
                      onClick={toggleNewsDropdown}
                      style={{ color: orgHex }}
                      className="group flex items-center justify-evenly gap-1 overflow-hidden transition-all duration-300 ease-in-out w-8 hover:w-32"
                    >
                      <Newspaper className="h-6 w-6 flex-shrink-0" />

                      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out font-semibold">
                        News
                      </span>
                    </button>
                  </div>
                )}

                {Cookies.get("revspireClient") !== "1" && (
                  <div className="flex justify-center items-center">
                    <button
                      onClick={toggleAnalyticsDropdown}
                      style={{ color: orgHex }}
                      className="group flex items-center justify-evenly gap-1 overflow-hidden transition-all duration-300 ease-in-out w-8 hover:w-32"
                    >
                      <ChartNoAxesCombined className="h-6 w-6 flex-shrink-0" />

                      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out font-semibold">
                        Analytics
                      </span>
                    </button>
                  </div>
                )}

                {Cookies.get("revspireClient") !== "1" &&
                  checkUserLicense(
                    "Revenue Enablement Elevate;Revenue Enablement Spark;"
                  ) == "1" &&
                  hasEmailPermissions && (
                    <div className="flex justify-center items-center">
                      <button
                        onClick={openEmailModal}
                        style={{ color: orgHex }}
                        className="group flex items-center justify-evenly gap-1 overflow-hidden transition-all duration-300 ease-in-out w-6 hover:w-28"
                      >
                        <Mail className="h-6 w-6 flex-shrink-0" />
                        <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out font-semibold ">
                          Email
                        </span>
                      </button>
                    </div>
                  )}

                <div className="flex justify-center items-center">
                  <button
                    onClick={toggleVersionModal}
                    style={{ color: orgHex }}
                    className="group flex items-center justify-evenly gap-1 overflow-hidden transition-all duration-300 ease-in-out w-6 hover:w-32"
                  >
                    <History className="h-6 w-6 flex-shrink-0" />
                    <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out font-semibold ">
                      Version
                    </span>
                  </button>
                </div>

                <div className="flex justify-center items-center">
                  <ShareButton
                    orgHex={orgHex}
                    pitchURL={pitchData?.pitch?.pitch_custom_link}
                  />
                </div>
              </div>
            </nav>

            {analyticsMode && !analyticsPopupVisible && (
              <AnalyticsNotificationBar orgHex={orgHex} />
            )}
            
            {pitchData && (
              <>
                <DynamicLayout
                  pitchData={pitchData}
                  layout={layout}
                  data={{
                    backgroundImageData: backgroundImageData,
                    pitch: pitchData.pitch,
                    pitchSections: truncatedSections,
                    onClickContentHandler: handleOnClickContent,
                    highlightVideosData: highlightVideosWithSasUrls,
                    companyLogoUrl: companyLogoUrl,
                    userDetails: userDetails,
                    handlePauseVideo: handlePauseVideo,
                    handlePlayVideo: handlePlayVideo,
                    demoProfilePic: demoProfilePic,
                    hasMoreSections:
                      pitchData?.pitchSections?.length >
                      DSRconfig.visibleSectionsCount,
                    isLoadingMore,
                    onLoadMoreSections: handleLoadMoreSections,
                    onLoadMoreContents: handleLoadMoreContents,
                  }}
                  orgHex={orgHex}
                  languageCode={languageCode}
                  sendDataToParent={handleDataFromChild}
                  handleSetTimerStart={handleSetTimerStart}
                  handleCustomButtons={handleCustomButtons}
                  setDSRconfig={setDSRconfig}
                  featureMap={featureMap}
                  pitchEngagementId={pitchEngagementId}
                />

                <ThreadsDropdown
                  isOpen={isThreadsDropdownOpen}
                  onClose={toggleThreadsDropdown}
                  threads={threads}
                  setThreads={setThreads}
                  primaryColor={orgHex}
                  pitchId={pitchId}
                  contentData={contentData}
                  pitchData={pitchData}
                  handleOnClickContent={handleOnClickContent}
                  setFullscreenBlobUrl={setFullscreenBlobUrl}
                  popup={
                    DSRconfig.currentPopupStyle === "default" ? (
                      popup
                    ) : (
                      <FullScreenPopup
                        fullscreenBlobUrl={fullscreenBlobUrl}
                        fullscreenBlobName={fullscreenBlobName}
                        fullscreenMimeType={fullscreenMimeType}
                        selectedContent={selectedContent}
                        onClose={() => {
                          setFullscreenBlobUrl(null);
                          toggleFullscreen(null);
                          setCurrentPage(1);
                          setNumPages(null);
                          setPdfProgress(0);
                        }}
                        currentPage={currentPage}
                        numPages={numPages}
                        onPageChange={setCurrentPage}
                        pdfProgress={pdfProgress}
                        publicLink={publicLink}
                        publicLinkLoading={publicLinkLoading}
                        isPdfLoading={isPdfLoading}
                        viewedPercentageRef={viewedPercentageRef}
                        videoRef={videoRef}
                        videoId={videoId}
                        videoVewTimeRef={videoVewTimeRef}
                        setIsActive={setIsActive}
                        lastActivity={lastActivity}
                        activeTime={activeTime}
                        scrollPositionRef={scrollPositionRef}
                        scrollContainerRef={scrollContainerRef}
                        handleScroll={handleScroll}
                      />
                    )
                  }
                />

                <TranslateDropdown
                  isTranslateDropdownOpen={isTranslateDropdownOpen}
                  setIsTranslateDropdownOpen={setIsTranslateDropdownOpen}
                  orgHex={orgHex}
                  availableLanguages={availableLanguages}
                  languageOptions={languageOptions}
                  pitchId={pitchId}
                  fetchPitchData={fetchPitchData}
                  setLanguageCode={setLanguageCode}
                  languageCode={languageCode}
                />

                <NewsDropdown
                  isOpen={isNewsDropdownOpen}
                  onClose={() => toggleNewsDropdown(false)}
                  pitchData={pitchData}
                />

                <PitchVersionModal
                  pitchId={pitchId}
                  viewer_id={viewer_id}
                  showVersionModal={showVersionModal}
                  setShowVersionModal={setShowVersionModal}
                  orgHex={orgHex}
                />
              </>
            )}

            {/* Mobile Menu (shows only on smaller screens) */}
            <div className="lg:hidden">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="fixed top-4 right-4 z-40 p-2 rounded-lg bg-white shadow-lg"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>

              {/* Mobile Menu (shows only on smaller screens) */}
              <div className="lg:hidden">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="fixed top-4 right-4 z-40 p-2 rounded-lg bg-white shadow-lg"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>

                {/* Mobile Menu Panel */}
                <div
                  className={`fixed inset-0 z-40 transform ${
                    isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                  } transition-transform duration-300 ease-in-out`}
                >
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b">
                      <h2 className="font-semibold text-gray-600 text-lg">
                        Menu
                      </h2>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <FontAwesomeIcon
                          icon={faTimes}
                          className="h-5 w-5 text-gray-500"
                        />
                      </button>
                    </div>

                    {/* Menu Items Grid */}
                    <div className="grid grid-cols-2 gap-2 p-4">
                      {/* Custom Buttons */}
                      {customButtons?.length > 0 &&
                        customButtons.map((button, index) => {
                          const IconComponent = button.logo;
                          return (
                            <button
                              key={index}
                              style={{ color: orgHex }}
                              onClick={() => {
                                if (button.href) {
                                  window.open(
                                    button.href,
                                    button.target || "_blank"
                                  );
                                }
                                if (button.onClick) {
                                  button.onClick();
                                }
                              }}
                              className="flex flex-col whitespace-nowrap items-center justify-center p-4 hover:bg-gray-100 rounded-lg"
                            >
                              {IconComponent && (
                                <IconComponent className="h-6 w-6 mb-2" />
                              )}
                              <span className="text-sm text-gray-600 font-medium">
                                {button.text}
                              </span>
                            </button>
                          );
                        })}

                      {/* Language Dropdown */}
                      {availableLanguages?.length > 0 && (
                        <button
                          onClick={() => {
                            toggleTranslateDropdown();
                            setIsMobileMenuOpen(false);
                          }}
                          style={{ color: orgHex }}
                          className="flex flex-col whitespace-nowrap items-center justify-center p-4 hover:bg-gray-100 rounded-lg"
                        >
                          <Languages className="h-6 w-6 mb-2" />
                          <span className="text-sm text-gray-600 font-medium">
                            Translate
                          </span>
                        </button>
                      )}

                      {/* Threads Button */}
                      <button
                        onClick={() => {
                          toggleThreadsDropdown();
                          setIsMobileMenuOpen(false);
                        }}
                        style={{ color: orgHex }}
                        className="flex flex-col whitespace-nowrap items-center justify-center p-4 hover:bg-gray-100 rounded-lg"
                      >
                        <MessageSquare className="h-6 w-6 mb-2" />
                        <span className="text-sm text-gray-600 font-medium">
                          Threads
                        </span>
                      </button>

                      {/* News Button */}
                      {Cookies.get("revspireClient") !== "1" && (
                        <button
                          onClick={() => {
                            toggleNewsDropdown();
                            setIsMobileMenuOpen(false);
                          }}
                          style={{ color: orgHex }}
                          className="flex flex-col whitespace-nowrap items-center justify-center p-4 hover:bg-gray-100 rounded-lg"
                        >
                          <Newspaper className="h-6 w-6 mb-2" />
                          <span className="text-sm text-gray-600 font-medium">
                            News
                          </span>
                        </button>
                      )}

                      {/* Analytics */}
                      {Cookies.get("revspireClient") !== "1" && (
                        <button
                          onClick={() => {
                            toggleAnalyticsDropdown();
                            setIsMobileMenuOpen(false);
                          }}
                          style={{ color: orgHex }}
                          className="flex flex-col whitespace-nowrap items-center justify-center p-4 hover:bg-gray-100 rounded-lg"
                        >
                          <ChartNoAxesCombined className="h-6 w-6 mb-2" />
                          <span className="text-sm text-gray-600 font-medium">
                            Analytics
                          </span>
                        </button>
                      )}

                      {/* Email Button */}
                      {Cookies.get("revspireClient") !== "1" &&
                        checkUserLicense(
                          "Revenue Enablement Elevate;Revenue Enablement Spark;"
                        ) === 1 &&
                        hasEmailPermissions && (
                          <button
                            onClick={() => {
                              openEmailModal();
                              setIsMobileMenuOpen(false);
                            }}
                            style={{ color: orgHex }}
                            className="flex flex-col whitespace-nowrap items-center justify-center p-4 hover:bg-gray-100 rounded-lg"
                          >
                            <Mail className="h-6 w-6 mb-2" />
                            <span className="text-sm text-gray-600 font-medium">
                              Email
                            </span>
                          </button>
                        )}

                      {/* Version Modal */}
                      <button
                        onClick={() => {
                          toggleVersionModal();
                          setIsMobileMenuOpen(false);
                        }}
                        style={{ color: orgHex }}
                        className="flex flex-col whitespace-nowrap items-center justify-center p-4 hover:bg-gray-100 rounded-lg"
                      >
                        <History className="h-6 w-6 mb-2" />
                        <span className="text-sm text-gray-600 font-medium">
                          Version
                        </span>
                      </button>

                      {/* Share/Copy Button */}
                      <ShareButton
                        orgHex={orgHex}
                        pitchURL={pitchData?.pitch?.pitch_custom_link}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DSR;
