import React, { useContext, useState, useEffect } from "react";
import { MultiSelect } from "react-multi-select-component";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import { useCookies } from "react-cookie";
import { AuthContext } from "../../../Authentication/AuthContext.jsx";
import toast from "react-hot-toast";
import { LuLoaderCircle } from "react-icons/lu";
import Select from "react-select";
import WarningDialog from "../../../utility/WarningDialog";

function AddUserDialog({ open, onClose }) {
  const {
    setAddUserClicked,
    viewer_id,
    setUsers,
    users,
    selectedOrganisationId,
  } = useContext(GlobalContext);
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData.organisation.id;
  const { baseURL, frontendBaseURL } = useContext(AuthContext);
  const [timezones, setTimezones] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [organisationProducts, setOrganisationProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [mainLoading, setMainLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [genericSelectError, setGenericSelectError] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [currencyError, setCurrenceyError] = useState("");
  const [selectedOrganisation, setSelectedOrganisation] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");
  const [profileError, setProfileError] = useState("");
  const [organisationError, setOrganisationError] = useState("");
  const [selectedOrganisationProducts, setSelectedOrganisationProducts] =
    useState([]);
  const [hasCopiedEmail, setHasCopiedEmail] = useState(false);
  const [productError, setProductError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [timezoneError, setTimezoneError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [generateResetEmail, setGenerateResetEmail] = useState(true);
  const axiosInstance = useAxiosInstance();
  const [userError, setUserError] = useState(false);
  const [filterUser, setFilterUser] = useState([]);
  const [userFound, setUserFound] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showLicenseWarning, setShowLicenseWarning] = useState(false);
  const modalRef = React.useRef(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    if (organisations && organisations.length > 0) {
      setSelectedOrganisation(organisations[0].id);
      handleOrganisationChange(organisations[0].id);
    }
  }, [organisations]);

  useEffect(() => {
    if (open) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setUsername("");
      setSelectedTimezone("");
      setSelectedCurrency("");
      setSelectedOrganisation(organisations && organisations.length > 0 ? organisations[0].id : "");
      setSelectedProfile("");
      setSelectedOrganisationProducts([]);
      setSelectedRole("");
      setHasCopiedEmail(false);
      setUsernameError("");
      setEmailError("");
      setFirstNameError("");
      setLastNameError("");
      setOrganisationError("");
      setProductError("");
      setProfileError("");
      setGenericSelectError("");
      setCurrenceyError("");
      setRoleError("");
      setGenerateResetEmail(true);
      setUserError(false);
      setIsButtonDisabled(true);
    }
  }, [open, organisations]);

  let domain;
  // console.log("timezones",timezones)
  if (!frontendBaseURL) {
    const rawCookie = cookies.userData;
    if (rawCookie) {
      const fdomain = rawCookie.organisation?.domain || "";
      const tenantName = rawCookie.organisation?.tenant_name || "";
      const frontendBaseURL = `https://${tenantName}.${fdomain}`;
      domain = new URL(frontendBaseURL).host;
    }
  } else {
    domain = new URL(frontendBaseURL).host;
  }

  const handleSendEmail = async () => {
    // Prevent default form submission behavior
    if (!username) {
      setErrorMessage("User Name is required");
      return;
    }
    try {
      const response = await fetch(`${baseURL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are included in the request
        body: JSON.stringify({ username, frontendURL: domain }),
      });

      const result = await response.json();

      if (response.ok) {
        // toast.success(result.message);
        // Set a timer to redirect after 5 seconds
        setSuccessMessage(result.message);
        // setTimeout(() => {
        //   navigate("/login");
        // }, 7000);
      } else {
        // toast.error(result.message || "An error occurred. Please try again.");
        setErrorMessage(
          result.message || "An error occurred. Please try again."
        );
      }
    } catch (error) {
      //toast.error("An error occurred. Please try again.");
      console.error("Error:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Roles
        if (selectedOrganisation) {
          const responseRoles = await axiosInstance.post(`/user-role/view-active-roles`,
            {
              viewer_id: viewer_id,
              organisation_id: organisation_id,
            }
          );

          const dataRoles = await responseRoles.data;
          if (responseRoles.status >= 200 && responseRoles.status < 300) {
            setRoles(dataRoles.data);
          } else {
            console.error("Failed to fetch roles:", dataRoles.message);
          }
        }

        // Fetch Organisations
        const responseOrganisations = await axiosInstance.post(`/view-all-organisations`,
          {
            viewer_id: viewer_id,
          }
        );

        const dataOrganisations = await responseOrganisations.data;
        if (
          responseOrganisations.status >= 200 &&
          responseOrganisations.status < 300
        ) {
          setOrganisations(dataOrganisations.organisations);
        } else {
          console.error(
            "Failed to fetch organisations:",
            dataOrganisations.message
          );
        }
        // Fetch Timezones
        const responseTimezones = await axiosInstance.post(
          `/view-all-timezone`,
          {
            viewer_id: viewer_id,
          }
        );

        const dataTimezones = await responseTimezones.data;
        if (responseTimezones.status >= 200 && responseTimezones.status < 300) {
          setTimezones(dataTimezones.timezones);
        } else {
          console.error(
            "Failed to fetch timezones:",
            dataTimezones.message || "No error message provided" // Fallback message
          );
        }

        // Fetch Currency
        const responseCurrency = await axiosInstance.post(
          `/view-all-currency`,
          {
            viewer_id: viewer_id,
          }
        );
        const dataCurrency = await responseCurrency.data;
        if (responseCurrency.status >= 200 && responseCurrency.status < 300) {
          setCurrencies(dataCurrency.currencies);
        } else {
          console.error("Failed to fetch currencies:", dataCurrency.message);
        }

        // Fetch Profiles
        const responseProfiles = await axiosInstance.post(
          `/view-all-profiles`,
          {
            viewer_id: viewer_id,
          }
        );
        const dataProfiles = await responseProfiles.data;
        if (responseProfiles.status >= 200 && responseProfiles.status < 300) {
          setProfiles(dataProfiles.profiles);
        } else {
          console.error("Failed to fetch profiles:", dataProfiles.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setCreateUserLoading(false); // Set loading to false when data fetching is completed
      }
    };

    // Only fetch data when the modal is open
    if (open) {
      fetchData();
    }
  }, [open, viewer_id, selectedOrganisation, organisation_id]); 

  const refreshUsers = () => {
    setLoading(true);
    axiosInstance
      .post("/view-all-users", {
        viewer_id: viewer_id,
      })
      .then((response) => {
        if (response.data.success) {
          console.log("viewer-id", viewer_id);

          console.log(response);
          setUsers(response.data.users);
        } else {
          console.error("Error fetching users:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
      })
      .finally(() => {
        // This will be executed after both success and error handling
        setLoading(false);
      });
  };

  const handleClose = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      setFirstName("");
      setLastName("");
      setEmail("");
      setUsername("");
      setSelectedTimezone("");
      setSelectedCurrency("");
      setSelectedOrganisation("");
      setSelectedProfile("");
      setSelectedOrganisationProducts([]);
      setSelectedRole("");

      setUsernameError("");
      setEmailError("");
      setFirstNameError("");
      setLastNameError("");
      setOrganisationError("");
      setProductError("");
      setProfileError("");
      setGenericSelectError("");
      setCurrenceyError("");
      setRoleError("");

      setUserError(false);
      setIsButtonDisabled(true);
      setGenerateResetEmail(true);
      onClose();
    }
    onClose();
  };

  const handleCancelClick = () => {
    setAddUserClicked(false);
  };

  const validateForm = () => {
    let isValid = true;

    // Role Validation
    if (!selectedRole) {
      setRoleError("Role is required");
      isValid = false;
    } else {
      setRoleError("");
    }

    // First Name Validation
    if (!firstName) {
      setFirstNameError("First Name is required"); // Corrected error message for missing first name
      isValid = false;
    } else {
      setFirstNameError(""); // Clear the error if valid
    }

    // Last Name Validation
    if (!lastName) {
      setLastNameError("Last Name is required");
      isValid = false;
    } else {
      setLastNameError(""); // Clear the error if valid
    }

    // Email Validation
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email address");
      isValid = false;
    } else {
      setEmailError(""); // Clear the error if valid
    }

    // Username Validation
    if (!username) {
      setUsernameError("Username is required");
      isValid = false;
    } else if (!validateUsername(username)) {
      setUsernameError(
        "Invalid username. Must not start with a number or special character and must not contain spaces. Must be in email form"
      );
      isValid = false;
    } else if (userError) {
      setUsernameError("Username is already taken.");
      isValid = false;
    } else {
      setUsernameError(""); // Clear the error if valid
    }

    // Timezone Validation
    if (!selectedTimezone) {
      setGenericSelectError("Timezone is required");
      isValid = false;
    } else {
      setGenericSelectError(""); // Clear the error if valid
    }

    // Currency Validation
    if (!selectedCurrency) {
      setCurrenceyError("Currency is required");
      isValid = false;
    } else {
      setCurrenceyError(""); // Clear the error if valid
    }

    // Profile Validation
    if (!selectedProfile) {
      setProfileError("Profile is required");
      isValid = false;
    } else {
      setProfileError(""); // Clear the error if valid
    }

    // Organisation Validation
    if (!selectedOrganisation) {
      setOrganisationError("Organisation is required");
      isValid = false;
    } else {
      setOrganisationError(""); // Clear the error if valid
    }

    return isValid;
  };

  // Helper function for email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Helper function for username validation
  const validateUsername = (username) => {
    // Allow alphanumeric characters, periods, underscores, and hyphens before @, and validate the email format
    const usernameRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return usernameRegex.test(username);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };
  
  // Add this new handler for email blur
  const handleEmailBlur = () => {
    if (!hasCopiedEmail && email && !username) {
      setUsername(email);
      setHasCopiedEmail(true); // Mark that we've copied the email
    }
  };

  const handleUsernameChange = (value) => {
    setUsername(value);
    
    if (value && !validateUsername(value)) {
      setUsernameError("Invalid username format");
      setIsButtonDisabled(true);
    } else {
      setUsernameError("");
      debouncedValidateUsername(value);
    }
  };

  const handleUsernameBlur = async () => {
    let loadingToast;
    try {
      setUsernameCheckLoading(true);
      loadingToast = toast.loading("Checking username availability...");
      
      // Create the payload for checking the username
      const checkUsernamePayload = {
        username: username,
      };

      // Make the API call to check if the username exists
      const checkUsernameResponse = await axiosInstance.post(
        `${UserDataLoginAPI}/check-username`,
        checkUsernamePayload
      );

      // Handle the response from the username check
      if (checkUsernameResponse.status === 409 || 
          (checkUsernameResponse.data && checkUsernameResponse.data.error === "Username already exists")) {
        console.log("username already exists");
        setUserFound(true);
        setUserError(true);
        setUsernameError("Username already exists!");
        setIsButtonDisabled(true); // Explicitly disable the button
        toast.dismiss(loadingToast);
        toast.error("Username already exists!");
        return true; // Error
      } else {
        // console.log("--in else--");
        setUserFound(false);
        setUserError(false);
        setUsernameError("");
        setIsButtonDisabled(false); // Enable the button if no error
        toast.dismiss(loadingToast);
        // toast.success("Username is available!");
        return false; // No error
      }
    } catch (error) {
      setUserFound(true);
      setUserError(true);
      setUsernameError("Username already exists!"); // Fallback error
      setIsButtonDisabled(false); // Disable the button
      toast.dismiss(loadingToast);
      toast.error("Username already exists!");
      console.error("User with the same username already exists!", error);
      return true; // Error
    } finally {
      setUsernameCheckLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleSubmit = async () => {



    if (!validateForm()) {
      // If form validation fails, return early
      console.log("Not valid form");
      setLoading(false);
      setIsButtonDisabled(false);
      return;
    }

    // Additional validation before submission
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      setEmailError("Invalid email format");
      setLoading(false);
      setIsButtonDisabled(false);
      return;
    }

    if (!validateUsername(username)) {
      toast.error("Username must be in email format");
      setUsernameError("Invalid username format");
      setLoading(false);
      setIsButtonDisabled(false);
      return;
    }

    // Set main loading state first
    setMainLoading(true);
     const usernameExists = await handleUsernameBlur();


    const mainLoadingToast = toast.loading("Creating user...");

    try {
      // Step 1: Check username
     
      
      // If username exists, stop the submission process
      if (usernameExists) {
        toast.dismiss(mainLoadingToast);
        setMainLoading(false);
        return;
      }
      
      // Step 2: Create user
      setCreateUserLoading(true);
      const createUserPayload = {
        first_name: firstName,
        last_name: lastName,
        created_by: viewer_id,
        organisation: selectedOrganisation,
        profile: selectedProfile,
        username: username,
        email: email,
        timezone: selectedTimezone,
        currency: selectedCurrency,
        products: selectedOrganisationProducts,
        role_id: selectedRole,
      };

      const filteredProductIds = organisationProducts
        .filter((product) =>
          selectedOrganisationProducts.includes(product.name)
        )
        .map((product) => product.id);

      console.log("filteredProductIds", filteredProductIds);

      console.log("createUserPayload", createUserPayload);
      const createUserResponse = await axiosInstance.post(`/create-user`, {
        first_name: createUserPayload.first_name,
        last_name: createUserPayload.last_name,
        created_by: viewer_id,
        organisation: createUserPayload.organisation,
        profile: createUserPayload.profile,
        username: createUserPayload.username,
        email: createUserPayload.email,
        timezone: createUserPayload.timezone,
        currency: createUserPayload.currency,
        products: filteredProductIds,
        role_id: createUserPayload.role_id,
      });

      const createUserData = await createUserResponse.data;
      console.log(createUserData);
      if (createUserResponse.status >= 200 && createUserResponse.status < 300) {
        console.log("User created successfully:", createUserData);
        toast.dismiss(mainLoadingToast);
        toast.success("User created successfully!");
        setAddUserClicked(false);
        refreshUsers();
        
        // Step 3: Send reset password email if checkbox is checked
        if (generateResetEmail) {
          setResetPasswordLoading(true);
          try {
            await handleSendEmail();
            // toast.success("Reset password email sent successfully!");
          } catch (error) {
            console.error("Error sending reset password email:", error);
            toast.error("An error occured ");
            // Don't close the modal on reset password email error
            setMainLoading(false);
            setResetPasswordLoading(false);
            return;
          } finally {
            setResetPasswordLoading(false);
          }
        }
        
        // Only close the modal if everything was successful
        onClose();
      } else {
        toast.dismiss(mainLoadingToast);
        toast.error(`Failed to create user`);
        // Don't close the modal on create user error
        setMainLoading(false);
        setCreateUserLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.dismiss(mainLoadingToast);
      toast.error("An error occurred while creating the user.");
      // Don't close the modal on error
      setMainLoading(false);
      setCreateUserLoading(false);
      setUsernameCheckLoading(false);
      setResetPasswordLoading(false);
      setLoading(false);
      setIsButtonDisabled(false);
      return;
    } finally {
      // Only reset loading states, don't close the modal
      setMainLoading(false);
      setCreateUserLoading(false);
      setUsernameCheckLoading(false);
      setResetPasswordLoading(false);
      setLoading(false);
      setIsButtonDisabled(false);
      setUserError(false);
      setUsernameError("");
      setEmailError("");
      setFirstNameError("");
      setLastNameError("");
      setOrganisationError("");
      setProductError("");
      setProfileError("");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!organisations || organisations.length === 0) {
          return;
        }
        const organisationId = selectedOrganisation || organisations[0].id;

        const response = await axiosInstance.post(
          `/view-organisation-products`,
          {
            viewer_id: viewer_id,
            organisationId: organisationId,
          }
        );

        const data = await response.data;

        if (data.success === false && data.message === "All products have reached their license limit." && open) {
          setShowLicenseWarning(true);
          setOrganisationProducts([]);
        } else {
          setOrganisationProducts(data.products || []);
          console.log("ORGANISATON DATA in modal / productss", data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setOrganisationProducts([]);
      }
    };

    fetchProducts();
  }, [selectedOrganisation, viewer_id, open]);

  const handleChangeProducts = (selectedOptions) => {
    const selectedProductIds = selectedOptions.map((option) => option.value);

    setSelectedOrganisationProducts([...selectedProductIds]);
    console.log("prods are : ", selectedOrganisationProducts);
  };

  const UserDataLoginAPI = "https://login.api.revspire.io";

  const validateButtonState = () => {
    const isFormValid =
      firstName &&
      lastName &&
      email &&
      username &&
      selectedTimezone &&
      selectedCurrency &&
      selectedOrganisation &&
      selectedProfile &&
      selectedRole &&
      !firstNameError &&
      !lastNameError &&
      !emailError &&
      !usernameError &&
      !timezoneError &&
      !currencyError &&
      !organisationError &&
      !productError &&
      !profileError &&
      !roleError;
    setIsButtonDisabled(!isFormValid);
  };

  useEffect(() => {
    validateButtonState();
  }, [
    firstName,
    lastName,
    email,
    username,
    selectedTimezone,
    selectedCurrency,
    selectedOrganisation,
    selectedProfile,
    selectedRole,
    firstNameError,
    lastNameError,
    emailError,
    usernameError,
    timezoneError,
    currencyError,
    organisationError,
    productError,
    profileError,
    roleError,
  ]);

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedValidateUsername = debounce(validateUsername, 500);

  const handleOrganisationChange = async (orgId) => {
    try {
      setLoadingProducts(true);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setLoadingProducts(false);
    } catch (error) {
      console.error("Error during organization change:", error);
      setLoadingProducts(false);
    }
  };

  return (
    <div>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-2/3 max-w-3xl">
            {/* Dialog Header */}
            <div className="flex justify-between items-center bg-gray-100 px-4 py-1.5 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Add New User
              </h2>
              <button
                onClick={handleClose}
                aria-label="close"
                className="p-1 hover:bg-gray-200 rounded-full"
                disabled={mainLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Dialog Content */}
            <div className="space-y-3 p-4">
              {createUserLoading ? (
                <div className="flex justify-center items-center min-h-[500px]">
                  <div className="animate-spin border-t-2 border-blue-500 rounded-full h-8 w-8"></div>
                </div>
              ) : (
                <form className="w-full space-y-3">
                  {/* First and Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`block w-full px-3 py-1.5 border ${
                          firstNameError ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        disabled={mainLoading}
                      />
                      <div className="h-1.5">
                        {firstNameError && (
                          <p className="text-red-500 text-xs mt-1">
                            {firstNameError}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`block w-full px-3 py-1.5 border ${
                          lastNameError ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        disabled={mainLoading}
                      />
                      <div className="h-1.5">
                        {lastNameError && (
                          <p className="text-red-500 text-xs mt-1">
                            {lastNameError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Email and Role */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={handleEmailBlur}
                        className={`block w-full px-3 py-1.5 border ${
                          emailError ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        disabled={mainLoading}
                      />
                     <div className="h-1.5"> {emailError && (
                        <p className="text-red-500 text-xs">{emailError}</p>
                      )}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className={`block w-full px-3 py-1.5 border ${
                          roleError ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        disabled={mainLoading}
                      >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <div className="h-1.5">
                        {roleError && (
                          <p className="text-red-500 text-xs mt-1">{roleError}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                          handleUsernameChange(e.target.value);
                        }}
                        className={`block w-full px-3 py-1.5 border ${
                          usernameError ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        disabled={mainLoading}
                      />
                      {usernameCheckLoading && (
                        <div className="absolute right-2 top-2 mt-0.5">
                          <LuLoaderCircle className="animate-spin text-gray-500 w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="h-4">
                      {usernameError && (
                        <p className="text-red-500 text-xs">
                          {usernameError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Organisation & Products*/}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Organisation
                      </label>
                      <select
                        value={selectedOrganisation}
                        onChange={(e) => {
                          const selectedOrgId = e.target.value;
                          setSelectedOrganisation(selectedOrgId);
                          handleOrganisationChange(selectedOrgId);
                        }}
                        className={`block w-full px-3 py-1.5 border ${
                          organisationError
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        disabled={mainLoading}
                      >
                        {organisations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                      <div className="h-1.5">
                        {organisationError && (
                          <p className="text-red-500 text-xs mt-1">
                            {organisationError}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Products
                      </label>
                      <div
                        className={`relative ${
                          loadingProducts
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        {/* {console.log(
                          "Organisation products above map",
                          organisationProducts
                        )} */}
                        <Select
                          isMulti
                          options={organisationProducts.map((product) => ({
                            label: product.name, // Display ID in the options
                            value: product.name, // Value is also the ID
                          }))}
                          value={selectedOrganisationProducts.map((id) => ({
                            label: id, // Display ID in the selected values
                            value: id, // Value is the ID
                          }))}
                          onChange={handleChangeProducts}
                          placeholder="Select Products"
                          isDisabled={mainLoading}
                        />
                        {loadingProducts && (
                          <div className="absolute inset-0 flex items-center justify-end bg-white/50">
                            <LuLoaderCircle className="animate-spin text-gray-500 w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="h-1.5">
                        {productError && (
                          <p className="text-red-500 text-xs mt-1">
                            {productError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* next line */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Timezone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Timezone
                      </label>
                      <select
                        value={selectedTimezone}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        className={`block w-full px-3 py-1.5 border ${
                          genericSelectError
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        disabled={mainLoading}
                      >
                        <option value="">Select</option>
                        {timezones.map((timezone) => (
                          <option key={timezone.id} value={timezone.id}>
                            {timezone.name}
                          </option>
                        ))}
                      </select>
                      <div className="h-1.5">
                        {genericSelectError && (
                          <p className="text-red-500 text-xs mt-1">
                            {genericSelectError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Currency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Currency
                      </label>
                      <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className={`block w-full px-3 py-1.5 border ${
                          currencyError ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        disabled={mainLoading}
                      >
                        <option value="">Select</option>
                        {currencies.map((currency) => (
                          <option key={currency.id} value={currency.id}>
                            {currency.name}
                          </option>
                        ))}
                      </select>
                      <div className="h-1.5">
                        {currencyError && (
                          <p className="text-red-500 text-xs mt-1">
                            {currencyError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Profile
                    </label>
                    <select
                      value={selectedProfile}
                      onChange={(e) => setSelectedProfile(e.target.value)}
                      className={`block w-full px-3 py-1.5 border ${
                        profileError ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      disabled={mainLoading}
                    >
                      <option value="" className="text-black">
                        Select
                      </option>
                      {profiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name}
                        </option>
                      ))}
                    </select>
                    <div className="h-1.5">
                      {profileError && (
                        <p className="text-red-500 text-xs mt-1">
                          {profileError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="generate-reset-email"
                      checked={generateResetEmail}
                      onChange={() =>
                        setGenerateResetEmail(!generateResetEmail)
                      }
                      className="form-checkbox h-4 w-4 text-primary"
                      disabled={mainLoading}
                    />
                    <label
                      htmlFor="generate-reset-email"
                      className="text-sm text-gray-700"
                    >
                      Generate Reset Email
                    </label>
                  </div>
                </form>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="p-3 bg-gray-100 flex justify-end space-x-2">
              <button
                onClick={() => {
                  handleClose();
                  setLoading(false);
                }}
                className="text-gray-600 w-[100px] border border-gray-300 hover:bg-gray-100 rounded-md px-4 py-2"
                disabled={mainLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isButtonDisabled || mainLoading}
                className={`px-4 py-2 rounded-md  text-white w-[100px]  flex items-center justify-center ${
                  isButtonDisabled || mainLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "btn-secondary"
                }`}
              >
                {mainLoading ? (
                  <div className="w-full flex items-center justify-center">
                    <LuLoaderCircle className="animate-spin" />
                  </div>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {open && showLicenseWarning && (
        <WarningDialog
          title="License Limit Reached"
          content="All products have reached their license limit. Please contact your administrator to increase the license limits."
          onConfirm={() => {
            setShowLicenseWarning(false);
            handleClose();
          }}
          onCancel={() => {
            setShowLicenseWarning(false);
            handleClose();
          }}
          modalRef={modalRef}
          isLoading={false}
        />
      )}
    </div>
  );
}

export default AddUserDialog;
