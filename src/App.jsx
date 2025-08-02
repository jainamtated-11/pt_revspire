import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LogoAnimation from "./components/ui/LogoAnimation.jsx";
//import PitchLogin from "./components/MainDashboard/PitchManager/PitchLogin.jsx";
const Dashboard = lazy(() =>
  import("./components/MainDashboard/Layout/Dashboard.jsx")
);
const PitchLogin = lazy(() =>
  import("./components/MainDashboard/PitchManager/PitchLogin.jsx")
);
const DSR = lazy(() =>
  import("./components/MainDashboard/PitchManager/DSR.jsx")
);
const PitchVersion = lazy(() =>
  import("./components/MainDashboard/PitchManager/PitchVersion.jsx")
);
const SfRedirectionPage = lazy(() =>
  import(
    "./components/MainDashboard/SettingsSection/Connection/SfRedirectionPage.jsx"
  )
);
const GoogleDriveRedirection = lazy(() =>
  import(
    "./components/MainDashboard/ContentManager/Operations/GoogleDriveRedirection.jsx"
  )
);
const OneDriveRedirection = lazy(() =>
  import(
    "./components/MainDashboard/ContentManager/Operations/OneDriveRedirection.jsx"
  )
);
const CanvaRedirection = lazy(() =>
  import(
    "./components/MainDashboard/ContentManager/Operations/CanvaRedirection.jsx"
  )
);
const Login = lazy(() => import("./Authentication/Login.jsx"));
const ResetPassword = lazy(() => import("./Authentication/ResetPassword.jsx"));
const ProtectedRoute = lazy(() =>
  import("./Authentication/ProtectedRoute.jsx")
);
const ProtectedClientRoute = lazy(() =>
  import("./Authentication/ProtectedClientRoute.jsx")
);
const SsoCallback = lazy(() =>
  import("./components/MainDashboard/SsoCallback.jsx")
);
const EmailSent = lazy(() => import("./Authentication/EmailSent.jsx"));
const SsoAssert = lazy(() => import("./Authentication/SsoAssert.jsx"));
const SsoRedirection = lazy(() =>
  import(
    "./components/MainDashboard/ContentManager/Operations/ssoRedirection.jsx"
  )
);
import CanvaRedirections from "./components/MainDashboard/ContentManager/ContentTable/CanvaRedirections.jsx";
import Overlay from "./components/MainDashboard/ContentManager/AdobeExpress/Overlay.jsx";
import ClientError from "./Services/clientError.jsx";
function App() {
  return (
    <>
      <Suspense fallback={<LogoAnimation />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<EmailSent />} />
          <Route path="/sso-callback" element={<SsoCallback />} />
          <Route path="/assert" element={<SsoAssert />} />
          <Route path="/sso-redirection" element={<SsoRedirection />} />
          <Route path="/pitchlogin/:pitchId" element={<PitchLogin />} />
          <Route path="/revspire-client-error" element={<ClientError />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sf-redirection"
            element={
              <ProtectedRoute>
                <SfRedirectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onedrive-redirection"
            element={
              <ProtectedRoute>
                <OneDriveRedirection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/googledrive-redirection"
            element={
              <ProtectedRoute>
                <GoogleDriveRedirection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content/content-portal/canva-redirection"
            element={
              <ProtectedRoute>
                <CanvaRedirections />
              </ProtectedRoute>
            }
          />
          <Route
            path="/canva-callback"
            element={
              <ProtectedRoute>
                <CanvaRedirection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dsr/:pitchId/:crmContact?"
            element={
              <ProtectedClientRoute>
                <DSR />
              </ProtectedClientRoute>
            }
          />
          <Route
            path="/pitch-version/:pitchId/:versionId"
            element={
              <ProtectedClientRoute>
                <PitchVersion />
              </ProtectedClientRoute>
            }
          />
          <Route path="/adobe" element={<Overlay />} />
        </Routes>
      </Suspense>
      <div>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              marginTop: "60px",
            },
            // iconTheme: {
            //   primary: "#075985",
            //   secondary: "#FFFAEE",
            // },
            // duration: 5000, // Optional: set the duration for toasts
          }}
        />
      </div>
    </>
  );
}

export default App;
