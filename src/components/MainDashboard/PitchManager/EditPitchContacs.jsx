import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const ContactManager = ({ setContacts, crmContacts, existingContacts }) => {
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    domain: "",
  });
  const [editingContact, setEditingContact] = useState(null);
  const isFirstRender = useRef(true);

  // Modified useEffect to handle both CRM contacts and existing contacts
  useEffect(() => {
    const formattedExistingContacts = existingContacts?.map((contact) => ({
      id: contact.id,
      contactId: contact.contact_sfdc_id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      domain: contact.domain,
      source: "existing",
    }));

    const formattedCrmContacts = crmContacts?.map((contact) => {
      const [firstName, ...lastNameParts] = contact.Name.split(" ");
      return {
        id: contact.id,
        contactId: contact.id,
        firstName,
        lastName: lastNameParts.join(" "),
        email: contact.Email || "",
        domain: null,
      };
    });

    const manualContacts = allContacts.filter((contact) => {
      const isExisting = formattedExistingContacts?.some(
        (existing) => existing.id === contact.id
      );
      const isCrm = formattedCrmContacts?.some(
        (crm) => crm.contactId === contact.contactId
      );
      return !isExisting && !isCrm && !contact.isEditing;
    });

    const combinedContacts = [
      ...manualContacts,
      ...(formattedExistingContacts || []),
      ...(formattedCrmContacts || []).filter(
        (crm) =>
          !formattedExistingContacts?.some(
            (existing) => existing.contactId === crm.contactId
          )
      ),
    ];

    setAllContacts(combinedContacts);

    if (isFirstRender.current) {
      setSelectedContacts(formattedExistingContacts || []);
      setContacts(formattedExistingContacts || []);
      isFirstRender.current = false;
    } else {
      setSelectedContacts((prev) => {
        const manualContactIds = manualContacts.map((contact) => contact.id);
        const existingSelections = prev.filter((selected) =>
          combinedContacts.some((contact) => contact.id === selected.id)
        );
        const manualToAdd = manualContacts.filter(
          (manual) =>
            !existingSelections.some((selected) => selected.id === manual.id)
        );
        return [...existingSelections, ...manualToAdd];
      });
    }
  }, [crmContacts, existingContacts]);

  const handleInputChange = (field, value) => {
    if (editingContact) {
      setEditingContact((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setNewContact((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const validateContact = (contact) => {
    const { firstName, lastName, email, domain } = contact;

    if ((firstName || lastName || email) && domain) {
      toast.error(
        "You can only fill domain OR first name, last name, and email!"
      );
      return false;
    }

    if ((!firstName || !lastName || !email) && !domain) {
      toast.error(
        "Please fill either domain OR first name, last name, and email!"
      );
      return false;
    }

    if (domain && !domain.startsWith("@")) {
      toast.error("Domain should start with @");
      return false;
    }

    return true;
  };

  const handleAddRow = () => {
    if (!validateContact(newContact)) return;

    const newRow = {
      id: `${Date.now()}${Math.random().toString().slice(2, 8)}`,
      contactId: null,
      firstName: newContact.firstName,
      lastName: newContact.lastName,
      email: newContact.email,
      domain: newContact.domain,
    };

    setAllContacts((prev) => [newRow, ...prev]);
    setSelectedContacts((prev) => [...prev, newRow]);
    setContacts([...selectedContacts, newRow]);
    setNewContact({ firstName: "", lastName: "", email: "", domain: "" });
  };

  const handleSaveEdit = () => {
    if (!validateContact(editingContact)) return;

    setAllContacts((prev) =>
      prev.map((contact) =>
        contact.id === editingContact.id
          ? { ...editingContact, isEditing: false }
          : contact
      )
    );

    setSelectedContacts((prev) =>
      prev.map((contact) =>
        contact.id === editingContact.id
          ? { ...editingContact, isEditing: false }
          : contact
      )
    );

    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === editingContact.id
          ? { ...editingContact, isEditing: false }
          : contact
      )
    );

    setEditingContact(null);
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
  };

  const handleSelectContact = (id) => {
    const contact = allContacts.find((contact) => contact.id === id);
    let updatedSelectedContacts;

    if (selectedContacts.some((selected) => selected.id === id)) {
      updatedSelectedContacts = selectedContacts.filter(
        (selected) => selected.id !== id
      );
    } else {
      updatedSelectedContacts = [...selectedContacts, contact];
    }

    setSelectedContacts(updatedSelectedContacts);
    setContacts(updatedSelectedContacts);
  };

  const handleDeleteRow = (id) => {
    setAllContacts((prev) => prev.filter((contact) => contact.id !== id));
    const updatedSelectedContacts = selectedContacts.filter(
      (selected) => selected.id !== id
    );
    setSelectedContacts(updatedSelectedContacts);
    setContacts(updatedSelectedContacts);
  };

  const isDomainFilled = editingContact
    ? editingContact.domain !== ""
    : newContact.domain !== "";
  const isOtherFieldsFilled = editingContact
    ? editingContact.firstName ||
      editingContact.lastName ||
      editingContact.email
    : newContact.firstName || newContact.lastName || newContact.email;

  return (
    <div className="px-2 py-1 bg-gray-100 rounded-lg">
      {/* Input Fields */}
      <div className="flex gap-2 mb-1">
        {editingContact ? (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={editingContact.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              disabled={isDomainFilled}
              className={`p-1 border rounded-md w-1/4 font-medium text-sm ${
                isDomainFilled ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={editingContact.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              disabled={isDomainFilled}
              className={`p-1 border rounded-md w-1/4 font-medium text-sm ${
                isDomainFilled ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            />
            <input
              type="email"
              placeholder="Email"
              value={editingContact.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isDomainFilled}
              className={`p-1 border rounded-md w-1/4 font-medium text-sm ${
                isDomainFilled ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            />
            <input
              type="text"
              placeholder="@example.com"
              value={editingContact.domain}
              onChange={(e) => handleInputChange("domain", e.target.value)}
              disabled={isOtherFieldsFilled}
              className={`p-1 border rounded-md w-1/4 font-medium text-sm ${
                isOtherFieldsFilled ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            />
            <button
              onClick={handleSaveEdit}
              className="border-2 rounded-md px-4 py-1 btn-secondary mx-2 mt-2"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="border-2 rounded-md px-4 py-1 btn-secondary mx-2 mt-2"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={newContact.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              disabled={isDomainFilled}
              className={`p-1 border rounded-md w-1/4 font-medium text-sm ${
                isDomainFilled ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newContact.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              disabled={isDomainFilled}
              className={`p-1 border rounded-md w-1/4 font-medium text-sm ${
                isDomainFilled ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            />
            <input
              type="email"
              placeholder="Email"
              value={newContact.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isDomainFilled}
              className={`p-1 border rounded-md w-1/4 font-medium text-sm ${
                isDomainFilled ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            />
            <input
              type="text"
              placeholder="Domain (e.g. @example.com)"
              value={newContact.domain}
              onChange={(e) => handleInputChange("domain", e.target.value)}
              disabled={isOtherFieldsFilled}
              className={`p-1 border rounded-md w-1/4 font-medium text-sm ${
                isOtherFieldsFilled ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            />
            <button
              onClick={handleAddRow}
              className="border-2 rounded-md px-4 py-1 btn-secondary mx-2 mt-2"
            >
              Add
            </button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="min-h-[186px] max-h-[186px] overflow-y-auto border rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border-b">Select</th>
              <th className="p-2 border-b">First Name</th>
              <th className="p-2 border-b">Last Name</th>
              <th className="p-2 border-b">Email</th>
              <th className="p-2 border-b">Domain</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="p-2 border-b">
                  <input
                    type="checkbox"
                    checked={selectedContacts.some(
                      (selected) => selected.id === contact.id
                    )}
                    className="w-4 h-4 rounded-md border-2 border-gray-300 checked:bg-[#d0acad] checked:border-[#d0acad] focus:outline-none focus:ring-2 focus:ring-[#d0acad] focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                    onChange={() => handleSelectContact(contact.id)}
                  />
                </td>
                <td className="p-2 border-b">
                  {contact.firstName || (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="p-2 border-b">
                  {contact.lastName || <span className="text-gray-400">—</span>}
                </td>
                <td className="p-2 border-b">
                  {contact.email || <span className="text-gray-400">—</span>}
                </td>
                <td className="p-2 border-b">
                  {contact.domain || <span className="text-gray-400">—</span>}
                </td>
                <td className="p-2 border-b flex gap-2">
                  <button
                    onClick={() => handleDeleteRow(contact.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
            {allContacts.length === 0 && (
              <tr>
                <td colSpan="6" className="p-2 text-center text-gray-400">
                  No contacts added. Add above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactManager;
