import React, { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import toast from "react-hot-toast";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import useOutsideClick from "../../../hooks/useOutsideClick.js";
import { Grid } from "react-loader-spinner";
import Select from "react-select";
import { LuLoaderCircle } from "react-icons/lu";

function EditUserDialog({ open, onClose }) {
  const {
    selectedUsers,
    setSelectedUsers,
    viewer_id,
    setEditUserClicked,
    setUsers,
  } = useContext(GlobalContext);

  const [userData, setUserData] = useState({});
  const [timezones, setTimezones] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [organisationProducts, setOrganisationProducts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const axiosInstance = useAxiosInstance();

  const handleCancel = () => {
    resetState();
    onClose?.();
  };

  const modalRef = useOutsideClick([handleCancel]);

  useEffect(() => {
    if (selectedUsers?.length > 0 && open) {
      setIsDataLoading(true); // Start loading indicator for shimmer
      fetchUserData();
      fetchData();
    }
  }, [selectedUsers, open, viewer_id]);

  const fetchData = async () => {
    try {
      const [orgRes, tzRes, currencyRes, profileRes] = await Promise.all([
        axiosInstance.post("/view-all-organisations", { viewer_id }),
        axiosInstance.post("/view-all-timezone", { viewer_id }),
        axiosInstance.post("/view-all-currency", { viewer_id }),
        axiosInstance.post("/view-all-profiles", { viewer_id }),
      ]);

      setOrganisations(orgRes.data.organisations || []);
      setTimezones(tzRes.data.timezones || []);
      setCurrencies(currencyRes.data.currencies || []);
      setProfiles(profileRes.data.profiles || []);
    } catch (err) {
      console.error("Error fetching dropdown data", err);
      toast.error("Failed to load necessary data!");
    } finally {
      setIsDataLoading(false); // Stop loading indicator
    }
  };

  useEffect(() => {
    if (userData.organisation) {
      fetchRoles();
    }
  }, [userData.organisation]);

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.post(`/user-role/view-active-roles`, {
        viewer_id: viewer_id,
        organisation_id: userData.organisation,
      });

      if (response.status >= 200 && response.status < 300) {
        setRoles(response.data.data || []);
      } else {
        console.error("Failed to fetch roles:", response.data.message);
        toast.error("Failed to fetch roles");
      }
    } catch (error) {
      console.error("Error fetching roles", error);
      toast.error("Failed to load roles!");
    }
  };

  useEffect(() => {
    if (userData.organisation) {
      fetchOrganisationProducts();
    }
  }, [userData.organisation]);

  const fetchOrganisationProducts = async () => {
    setProductLoading(true);
    try {
      const response = await axiosInstance.post("/view-organisation-products", {
        viewer_id,
        organisationId: userData.organisation,
      });
      if (response.status >= 200 && response.status < 300) {
        setOrganisationProducts(response.data?.products || []);
      } else {
        console.error("Failed to fetch products:", response.data.message);
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching organisation products", error);
      toast.error("Failed to load products!");
    } finally {
      setProductLoading(false);
    }
  };

  const resetState = () => {
    setSelectedUsers([]);
    setUserData({});
    setEditUserClicked(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = {
      currency: 'Currency',
      profile: 'Profile',
      role: 'Role',
      timezone: 'Timezone'
    };

    // Check if assigned products is empty
    if (!userData.assigned_products || userData.assigned_products.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    // Check other required fields
    const emptyFields = Object.entries(requiredFields)
      .filter(([key]) => !userData[key])
      .map(([, label]) => label);

    if (emptyFields.length > 0) {
      toast.error(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.put(
        `/edit-user/${selectedUsers[0].id}`,
        {
          first_name: userData.first_name,
          last_name: userData.last_name,
          updated_by: viewer_id,
          organisation: userData.organisation,
          profile: userData.profile,
          username: userData.username,
          email: userData.email,
          timezone: userData.timezone,
          currency: userData.currency,
          assigned_products: userData.assigned_products,
          role: userData.role,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        console.log("User Edited Successfully!");
        toast.success("User updated successfully");
        refreshUsers();
        handleCancel();
      } else {
        throw new Error("Failed to submit data");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.post(
        `/view-user/${selectedUsers[0].id}`,
        { viewer_id: viewer_id }
      );

      if (response.status >= 200 && response.status < 300) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data");
    }
  };

  const refreshUsers = () => {
    axiosInstance
      .post(`/view-all-users`, { viewer_id: viewer_id })
      .then((response) => {
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          console.error("Error fetching users:", response.data.message);
          toast.error("Failed to refresh user list");
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
        toast.error("Network error occurred");
      });
  };

  const handleChangeProducts = (selectedOptions) => {
    const updatedProducts = selectedOptions.map((option) => ({
      product_id: option.value,
      name: option.label,
    }));
    setUserData({ ...userData, assigned_products: updatedProducts });
  };

  const fieldsLoader = (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <Grid
        visible={true}
        height={40}
        width={40}
        color="#075985"
        ariaLabel="grid-loading"
        radius={12.5}
      />
    </div>
  );

  return (
    <>
      {isDataLoading && open ? (
        fieldsLoader
      ) : open ? (
        <div>
          {open && (
            <div className="dialog fixed inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
              <div
                ref={modalRef}
                className="bg-white p-6 rounded-md z-50 w-auto shadow-lg"
              >
                <>
                  <h2 className="font-bold text-lg mb-4">Edit User</h2>
                  <form
                    className="w-full max-w-3xl grid grid-cols-2 gap-x-8"
                    onSubmit={handleSubmit}
                  >
                    {/* Left Col */}
                    <div className="space-y-4">
                      {/* First Name */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={userData.first_name || ""}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              first_name: e.target.value,
                            })
                          }
                          className="w-full h-10 border-2 rounded px-3 py-2 text-gray-500 bg-gray-100 cursor-not-allowed"
                          readOnly
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={userData.last_name || ""}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              last_name: e.target.value,
                            })
                          }
                          className="w-full h-10 border-2 rounded px-3 py-2 text-gray-500 bg-gray-100 cursor-not-allowed"
                          readOnly
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={userData.email || ""}
                          onChange={(e) =>
                            setUserData({ ...userData, email: e.target.value })
                          }
                          className="w-full h-10 border-2 rounded px-3 py-2 text-gray-500 bg-gray-100 cursor-not-allowed"
                          readOnly
                        />
                      </div>

                      {/* Username */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={userData.username || ""}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              username: e.target.value,
                            })
                          }
                          className="w-full h-10 border-2 rounded px-3 py-2 text-gray-500 bg-gray-100 cursor-not-allowed"
                          readOnly
                        />
                      </div>

                      {/* Organisation */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Organisation
                        </label>
                        <input
                          type="text"
                          value={
                            organisations.length
                              ? organisations.find(
                                  (org) =>
                                    String(org.id) ===
                                    String(userData.organisation)
                                )?.name || ""
                              : "Loading..."
                          }
                          className="w-full h-10 border-2 rounded px-3 py-2 text-gray-500 bg-gray-100 cursor-not-allowed"
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Currency */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Currency <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={userData.currency || ""}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              currency: e.target.value,
                            })
                          }
                          className="w-full h-10 border-2 rounded px-3 py-2 text-gray-500"
                        >
                          <option value="">Select Currency</option>
                          {currencies.map((currency) => (
                            <option key={currency.id} value={currency.id}>
                              {currency.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Profile */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Profile <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={userData.profile || ""}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              profile: e.target.value,
                            })
                          }
                          className="w-full h-10 border-2 rounded px-3 py-2 text-gray-500"
                        >
                          <option value="">Select Profile</option>
                          {profiles.map((profile) => (
                            <option key={profile.id} value={profile.id}>
                              {profile.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Role <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={userData.role || ""}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              role: e.target.value,
                            })
                          }
                          className="w-full h-10 border-2 rounded px-3 py-2 text-gray-500"
                        >
                          <option value="">Select Role</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Products */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Assigned Products <span className="text-red-500">*</span>
                        </label>
                        <Select
                          isMulti
                          options={
                            organisationProducts?.map((product) => ({
                              label: product.name,
                              value: product.id,
                            })) || []
                          }
                          value={
                            userData.assigned_products?.map((product) => ({
                              label: product.name,
                              value: product.product_id,
                            })) || []
                          }
                          onChange={handleChangeProducts}
                          placeholder="Select Products"
                          classNamePrefix="select"
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: '40px',
                              height: '40px'
                            }),
                            valueContainer: (base) => ({
                              ...base,
                              height: '40px',
                              padding: '0 6px'
                            }),
                            input: (base) => ({
                              ...base,
                              margin: '0px'
                            })
                          }}
                        />
                      </div>

                      {/* Timezone */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Timezone <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={userData.timezone || ""}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              timezone: e.target.value,
                            })
                          }
                          className="w-full h-10 border-2 rounded px-3 py-2 text-gray-500"
                        >
                          <option value="">Select Timezone</option>
                          {timezones.map((timezone) => (
                            <option key={timezone.id} value={timezone.id}>
                              {timezone.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end mt-8 gap-2">
                      <button
                        type="button"
                        className="text-gray-600 w-[100px] border border-gray-300 hover:bg-gray-100 rounded-md px-4 py-2"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 rounded w-[100px] flex items-center justify-center ${
                          loading ? "bg-gray-400" : "btn-secondary text-white"
                        }`}
                        disabled={loading}
                      >
                        {loading ? 
                        <div className="flex w-full items-center justify-center">
                          <LuLoaderCircle className="animate-spin" />
                        </div> : "Save"}
                      </button>
                    </div>
                  </form>
                </>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}

export default EditUserDialog;
