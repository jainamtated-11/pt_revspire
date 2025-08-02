import { useState, useEffect } from "react";
import {
  FaTrash,
  FaPlus,
  FaUserPlus,
  FaAt,
  FaEnvelope,
  FaUser,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  setAllContacts,
  addContact,
  deleteContact,
  toggleContactSelection,
} from "../../../../features/pitch/addPitchSlice";

const ContactManager = ({ setContacts, crmContacts }) => {
  const dispatch = useDispatch();
  const pitchState = useSelector((state) => state.addPitchSlice);

  // State for new contact input fields
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    domain: "",
  });

  // Tab state
  const [activeTab, setActiveTab] = useState("individual");

  // On mount, combine CRM contacts with existing contacts
  useEffect(() => {
    if (crmContacts) {
      const formattedCrmContacts = crmContacts?.map((contact) => {
        const [firstName, ...lastNameParts] = contact.Name.split(" ");
        return {
          id: `${Date.now()}-${contact.id}`, // Unique ID for the table
          contactId: contact.id, // Store the CRM contact ID as contactId
          firstName,
          lastName: lastNameParts.join(" "),
          email: contact.Email || "",
        };
      });

      // Combine CRM contacts with existing contacts
      const updatedContacts = [
        ...formattedCrmContacts,
        ...pitchState.allContacts.filter(
          (contact) =>
            !formattedCrmContacts.some(
              (crm) => crm.contactId === contact.contactId
            )
        ),
      ];

      dispatch(setAllContacts(updatedContacts));
    }
  }, [crmContacts]);

  // Handle Input Change
  const handleInputChange = (field, value) => {
    setNewContact((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // New Row with Validation
  const handleAddRow = () => {
    const { firstName, lastName, email, domain } = newContact;

    if ((firstName || lastName || email) && domain) {
      toast.error(
        "You can only fill domain OR first name, last name, and email!"
      );
      return;
    }

    if ((!firstName || !lastName || !email) && !domain) {
      toast.error(
        "Please fill either domain OR first name, last name, and email!"
      );
      return;
    }

    // Check if domain is filled and doesn't start with @
    if (domain && !domain.startsWith("@")) {
      toast.error("Domain should start with @");
      return;
    }

    const newRow = {
      id: `${Date.now()}`, // Unique ID for the table
      contactId: null, // Manually added contacts don't have a CRM contactId
      firstName,
      lastName,
      email,
      domain,
    };

    // Add the new contact via Redux
    dispatch(addContact(newRow));

    // Select the new contact via Redux
    dispatch(toggleContactSelection(newRow.id));

    // Update the parent component's contacts with the new selected contacts
    setContacts([...pitchState.selectedContacts, newRow]);

    // Clear the input fields
    setNewContact({ firstName: "", lastName: "", email: "", domain: "" });

    toast.success("Contact added successfully");
  };

  // Handle Row Selection
  const handleSelectContact = (id) => {
    // Use Redux action to toggle selection
    dispatch(toggleContactSelection(id));

    // Update parent component with updated selected contacts
    const isSelected = pitchState.selectedContacts.some(
      (contact) => contact.id === id
    );
    if (isSelected) {
      setContacts(
        pitchState.selectedContacts.filter((contact) => contact.id !== id)
      );
    } else {
      const contact = pitchState.allContacts.find(
        (contact) => contact.id === id
      );
      if (contact) {
        setContacts([...pitchState.selectedContacts, contact]);
      }
    }
  };

  // Delete Row
  const handleDeleteRow = (id) => {
    // Use Redux action to delete
    dispatch(deleteContact(id));

    // Update parent component
    setContacts(
      pitchState.selectedContacts.filter((contact) => contact.id !== id)
    );

    toast.success("Contact removed");
  };

  // Disable Inputs Based on Conditions
  const isDomainFilled = newContact.domain !== "";
  const isOtherFieldsFilled =
    newContact.firstName || newContact.lastName || newContact.email;

  return (
    <div className="bg-white rounded-lg shadow-sm border-2">
      <div className="p-2 pl-4 border-b bg-gray-100 shadow-md">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FaUserPlus className="h-4 w-4" />
          Manage Contacts
          <span className="ml-2 text-xs bg-secondary/40 text-white  px-2 py-0 rounded-full">
            {pitchState.selectedContacts.length} Selected
          </span>
        </h3>
      </div>

      <div className="py-4 px-2 bg-gray-50">
        {/* Tabs */}

        <div className="mb-2">
          <div className="flex flex-row gap-2">
            <button
              className={`flex items-center gap-1 px-2 pb-1.5  border-b-2 rounded-t-lg font-semibold ${
                activeTab === "individual"
                  ? "border-sky-800 text-sky-800"
                  : "border-gray-400 text-gray-500"
              }`}
              id="individual"
              data-tabs-target="#individual"
              type="button"
              role="tab"
              aria-controls="individual"
              aria-selected={activeTab === "individual"}
              onClick={() => setActiveTab("individual")}
            >
              <FaUser className="w-4 h-4" />
              Individual Contact
            </button>

            <button
              className={`flex items-center gap-1 px-2 pb-1.5 border-b-2 rounded-t-lg font-semibold ${
                activeTab === "domain"
                  ? "border-sky-800 text-sky-800"
                  : "border-gray-400 text-gray-500"
              }`}
              id="domain"
              data-tabs-target="#domain"
              type="button"
              role="tab"
              aria-controls="domain"
              aria-selected={activeTab === "domain"}
              onClick={() => setActiveTab("domain")}
            >
              <FaAt className="h-4 w-4" />
              Domain Access
            </button>
          </div>

          {/* Individual Contact Form */}
          {activeTab === "individual" && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="First Name"
                  value={newContact.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  disabled={isDomainFilled}
                  className={`text-sm w-full pl-2 pr-3 py-2 border-2 rounded-md ${
                    isDomainFilled ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newContact.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  disabled={isDomainFilled}
                  className={`text-sm w-full px-3 py-2 border-2 rounded-md ${
                    isDomainFilled ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    placeholder="Email"
                    value={newContact.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={isDomainFilled}
                    className={`text-sm w-full pl-2 pr-3 py-2 border-2 rounded-md ${
                      isDomainFilled ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
                <button
                  onClick={handleAddRow}
                  className="whitespace-nowrap bg-secondary hover:bg-secondary/95 text-white my-1 px-2  rounded-full flex items-center"
                >
                  <FaPlus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Domain Form */}
          {activeTab === "domain" && (
            <div className="mt-4 flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="@example.com"
                  value={newContact.domain}
                  onChange={(e) => handleInputChange("domain", e.target.value)}
                  disabled={isOtherFieldsFilled}
                  className={`text-sm w-full pl-2 pr-3 py-2 border-2 rounded-md ${
                    isOtherFieldsFilled ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>
              <button
                onClick={handleAddRow}
                className="whitespace-nowrap bg-secondary hover:bg-secondary/95 text-white my-1 px-2  rounded-full flex items-center"
              >
                <FaPlus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Contacts Table */}
        <div className="border-2 rounded-md overflow-hidden mt-2">
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b text-sm">
                  <th className="p-2 text-left font-medium text-gray-600 w-12">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="p-2 text-left font-medium text-gray-600">
                    First Name
                  </th>
                  <th className="p-2 text-left font-medium text-gray-600">
                    Last Name
                  </th>
                  <th className="p-2 text-left font-medium text-gray-600">
                    Email
                  </th>
                  <th className="p-2 text-left font-medium text-gray-600">
                    Domain
                  </th>
                  <th className="p-2 text-left font-medium text-gray-600 w-12">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pitchState.allContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500 ">
                      No contacts added. Add contacts above.
                    </td>
                  </tr>
                ) : (
                  pitchState.allContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className={` border-b hover:bg-gray-50 transition-colors ${
                        pitchState.selectedContacts.some(
                          (selected) => selected.id === contact.id
                        )
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={pitchState.selectedContacts.some(
                            (selected) => selected.id === contact.id
                          )}
                          onChange={() => handleSelectContact(contact.id)}
                          className="w-4 h-4 rounded-md border-2 border-gray-300 checked:bg-secondary checked:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                        />
                      </td>
                      <td className="p-2 text-sm">
                        {contact.firstName || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-2 text-sm">
                        {contact.lastName || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-2 text-sm">
                        {contact.email || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-2 text-sm">
                        {contact.domain || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleDeleteRow(contact.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full flex items-center justify-center"
                        >
                          <FaTrash className="h-3 w-3" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManager;
