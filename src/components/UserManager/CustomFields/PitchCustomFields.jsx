import React, { useState, useEffect, useContext } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import LoginFieldCustomModal from "./LoginFieldCustomModal";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../context/GlobalState";
import { useCookies } from "react-cookie";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "react-hot-toast";

const PitchCustomFields = () => {
  const { viewer_id } = useContext(GlobalContext);
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;
  const [customFields, setCustomFields] = useState([]);
  const [fieldTypes, setFieldTypes] = useState([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const axiosInstance = useAxiosInstance();

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    setIsLoadingFields(true);
    try {
      const response = await axiosInstance.post(
        "/custom-field/get-custom-field-values",
        {
          viewer_id,
          organisation_id,
          table_name: "pitch",
        }
      );

      // Set field types from the API response
      if (response.data && response.data.availableFieldTypes) {
        setFieldTypes(response.data.availableFieldTypes);
      }

      // Transform the fields to include field_type_name
      const transformedFields = response.data.custom_fields.map((field) => {
        const fieldType = response.data.availableFieldTypes.find(
          (t) => t.id === field.field_type
        );
        return {
          ...field,
          field_type_name: fieldType ? fieldType.name : "",
        };
      });

      setCustomFields(transformedFields);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      toast.error("Failed to fetch custom fields");
    } finally {
      setIsLoadingFields(false);
    }
  };

  // Update fields when field types change
  useEffect(() => {
    if (fieldTypes.length > 0 && customFields.length > 0) {
      const updatedFields = customFields.map((field) => {
        const fieldType = fieldTypes.find((t) => t.id === field.field_type);
        return {
          ...field,
          field_type_name: fieldType
            ? fieldType.name
            : field.field_type_name || "",
        };
      });
      setCustomFields(updatedFields);
    }
  }, [fieldTypes]);

  const handleSaveFields = async (updatedFields) => {
    // Check for duplicate names
    const nameSet = new Set();
    const duplicate = updatedFields.find((field) => {
      if (nameSet.has(field.name)) return true;
      nameSet.add(field.name);
      return false;
    });

    if (duplicate) {
      toast.error(
        `Field name "${duplicate.name}" is duplicated. Field names must be unique.`
      );
      return;
    }
    const loadingToast = toast.loading("Saving custom fields...");
    try {
      await axiosInstance.post("/custom-field/update-custom-field", {
        viewer_id,
        organisation_id,
        table_name: "pitch",
        fields: updatedFields,
      });
      setIsEditing(false);
      fetchCustomFields();
      toast.success("Custom fields saved successfully!", { id: loadingToast });
    } catch (error) {
      console.error("Error updating custom fields:", error);
      toast.error("Failed to save custom fields. Please try again.", {
        id: loadingToast,
      });
    }
  };

  if (isLoadingFields) {
    return (
      <div className="flex items-center justify-center h-[calc(58vh-8rem)]">
        <LuLoaderCircle className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-center p-4 border-b border-neutral-200">
        <h2 className="text-xl font-semibold">Pitch Fields</h2>
        {/* <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Edit Fields
        </button> */}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <DndProvider backend={HTML5Backend}>
          <LoginFieldCustomModal
            fields={customFields}
            fieldTypes={fieldTypes}
            isLoading={isLoadingFields}
            onSave={handleSaveFields}
            isEditing={isEditing}
            onEditingChange={setIsEditing}
            viewer_id={viewer_id}
            organisation_id={organisation_id}
          />
        </DndProvider>
      </div>
    </div>
  );
};

export default PitchCustomFields;
