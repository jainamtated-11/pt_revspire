import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MiniLogoLoader from "../../../assets/LoadingAnimation/MiniLogoLoader.jsx";
import { LuLoaderCircle } from "react-icons/lu";
import CustomFieldsMain from "../CustomFields/CustomFieldsMain.jsx";
import DataEnrichmentMain from "../DataEnrichment/DataEnrichmentMain.jsx";
const RolesMain = React.lazy(()=>import("../Roles/RolesMain.jsx"));

const AllUsers = React.lazy(() => import("../AllUsers/AllUsers.jsx"));
const BulkUsers = React.lazy(() => import("../BulkUser/BulkUsers.jsx"));
const General = React.lazy(() => import("../Organisation/Organisation.jsx"));
const ProfileManagement = React.lazy(() =>
  import("../Profile/ProfileManagement.jsx")
);
const UserGroups = React.lazy(() => import("../UserGroups/UserGroups.jsx"));
const LayoutManagemant = React.lazy(() =>
  import("../Layouts/LayoutManagement.jsx")
);

const MainContentUser = ({ activeMenuItem }) => {
  return (
    <div className="container mx-auto p-4 ml-auto mt-16">
      <Suspense fallback={<div className="w-full h-screen flex items-center justify-center animate-spin text-neutral-600 size-24"><LuLoaderCircle/></div>}>
        <Routes>
          <Route
            path="/user/user-management/all-users"
            element={<AllUsers />}
          />
          <Route
            path="/user/group-management/user-groups"
            element={<UserGroups />}
          />
          <Route
            path="/user/user-management/bulk-user-uploads"
            element={<BulkUsers />}
          />
          <Route
            path="/user/profile-management"
            element={<ProfileManagement />}
          />
          <Route
            path="/user/layout-management"
            element={<LayoutManagemant />}
          />
          <Route path="user/organisation" element={<General />} />

          <Route path="/user/user-management/roles" element={<RolesMain/>}/>

          <Route path="/user/custom-fields" element={<CustomFieldsMain/>}/>

          <Route path="/user/data-enrichment" element={<DataEnrichmentMain/>}/>
        </Routes>
      </Suspense>
    </div>
  );
};

export default MainContentUser;
