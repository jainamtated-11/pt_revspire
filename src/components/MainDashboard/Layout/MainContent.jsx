import React, { useContext, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import DashboardShimmer from "../../Shimmers/DashboardShimmer.jsx";
import ViewReport from "../AnalyticsSection/ViewReport.jsx";
const AnalyticsMain = lazy(()=> import("../AnalyticsSection/AnalyticsMain.jsx"));

const ContentDashboard = lazy(() =>
  import("../ContentManager/ContentTable/ContentDashboard.jsx")
);
const PitchContent = lazy(() => import("../PitchManager/PitchContent.jsx"));
const TagManagerDashboard = lazy(() =>
  import("../TagManager/TagManagerDashboard.jsx")
);
const ThreadTable = lazy(() => import("../ThreadManager/ThreadTable.jsx"));
const RecycleBin = lazy(() => import("../RecycleBin/RecycleBin.jsx"));
const UserProfileSettings = lazy(() =>
  import("../SettingsSection/UserProfileSettings.jsx")
);
const Connections = lazy(() =>
  import("../../MainDashboard/SettingsSection/Connection/Connections.jsx")
);
const AgentFlow = lazy(() =>
  import("../../MainDashboard/SettingsSection/AgentFlows/AgentFlowDashboard.jsx")
);
const PitchStreams = lazy(() => import("../PitchStreams/PitchStreams.jsx"));

const LoginRecords = lazy(() => import("../SettingsSection/LoginRecords.jsx"));
const SfRedirectionPage = lazy(() =>
  import("../SettingsSection/Connection/SfRedirectionPage.jsx")
);
const EmailConnections = lazy(() =>
  import("../SettingsSection/Email/AllMails.jsx")
);

const MainContent = () => {
  const { contents } = useContext(GlobalContext);

  return (
    <div className="mt-12">
      <Suspense fallback={<DashboardShimmer />}>
        <Routes>
          <Route
            path="/content/content-portal"
            element={<ContentDashboard contents={contents} />}
          />
          <Route
            path="/content/tag-manager"
            element={<TagManagerDashboard />}
          />
          <Route path="/content/pitch-manager" element={<PitchContent />} />
          <Route path="/content/pitch-streams" element={<PitchStreams />} />
          <Route
            path="/content/all-threads"
            element={<ThreadTable group={false} />}
          />
          <Route
            path="/content/group-threads"
            element={<ThreadTable group={true} />}
          />
          <Route path="/content/recycle-bin" element={<RecycleBin />} />
          <Route
            path="/content/settings/profiles"
            element={<UserProfileSettings />}
          />
          <Route
            path="/content/settings/connection"
            element={<Connections />}
          />
          <Route
            path="/content/settings/agent-flow"
            element={<AgentFlow />}
          />
          <Route
            path="/content/settings/login-history"
            element={<LoginRecords />}
          />
          <Route
            path="/content/sf-redirection"
            element={<SfRedirectionPage />}
          />
          <Route
            path="content/settings/mailbox"
            element={<EmailConnections />}
          />

          <Route
            path="content/analytics/reports"
            element={<AnalyticsMain />}
          />
          <Route
            path="/content/analytics/reports/view_report"
            element={<ViewReport />}
          />


        </Routes>
      </Suspense>
    </div>
  );
};

export default MainContent;
