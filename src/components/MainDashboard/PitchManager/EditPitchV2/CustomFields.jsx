import React, { useEffect } from "react";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import {
  setAvailableFieldTypes,
  setCustomFields,
  setFieldValues,
  updateFieldValue,
} from "../../../../features/pitch/editPitchSlice";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";


const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? '#0EA5E9' : '#D1D5DB',
    boxShadow: state.isFocused ? '0 0 0 1px #0EA5E9' : 'none',
    '&:hover': {
      borderColor: '#0EA5E9'
    },
    borderRadius: '0.5rem',
    padding: '2px'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#0EA5E9' : state.isFocused ? '#E5E7EB' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:hover': {
      backgroundColor: state.isSelected ? '#0EA5E9' : '#E5E7EB'
    }
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9CA3AF'
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999
  })
};

function CustomFields() {
  const axiosInstance = useAxiosInstance();
  const dispatch = useDispatch();

  const pitchState = useSelector((state) => state.editPitchSlice);

  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        const response = await axiosInstance.post(
          "/custom-field/get-custom-field-values",
          {
            record_id: pitchState.pitchId,
            table_name: "pitch",
          }
        );

        if (response.status === 200) {
          const { availableFieldTypes, custom_fields, custom_field_values } =
            response.data;

          dispatch(setAvailableFieldTypes(availableFieldTypes));
          dispatch(setCustomFields(custom_fields));

          if (pitchState.fieldValues.length === 0) {
            const initialValues = custom_fields.map((field) => {
              const matchingValue = custom_field_values.find(
                (val) => val.custom_field === field.id
              );

              return {
                id: field.id,
                field_name: field.name,
                value: matchingValue?.value || "",
                mandatory: field.mandatory,
              };
            });

            dispatch(setFieldValues(initialValues));
          }
        }
      } catch (error) {
        console.error("Error fetching fields:", error);
      }
    };

    fetchCustomFields();
  }, []);

  const handleChange = (id, fieldName, value) => {
    dispatch(updateFieldValue({ id, fieldName, value }));
  };

  const renderField = (field) => {
    const type = pitchState.availableFieldTypes.find(
      (t) => t.id === field.field_type
    );
    const currentField = pitchState.fieldValues.find(
      (f) => f.field_name === field.name
    );
    if (!type || !currentField) return null;

    const isRequired = currentField.mandatory === 1;

    switch (type.name) {
      case "text":
        return (
          <input
            type="text"
            placeholder={field.name}
            required={isRequired}
            value={currentField.value}
            onChange={(e) => handleChange(field.id, field.name, e.target.value)}
            className="border border-gray-400 p-2 rounded w-full"
          />
        );

      case "email":
        return (
          <input
            type="email"
            placeholder={field.name}
            required={isRequired}
            value={currentField.value}
            onChange={(e) => handleChange(field.id, field.name, e.target.value)}
            className="border border-gray-400 p-2 rounded w-full"
          />
        );

      case "number":
        return (
          <input
            type="number"
            placeholder={field.name}
            required={isRequired}
            value={currentField.value}
            onChange={(e) => handleChange(field.id, field.name, e.target.value)}
            className="border border-gray-400 p-2 rounded w-full"
          />
        );

      case "date":
        return (
          <input
            type="date"
            placeholder={field.name}
            required={isRequired}
            value={currentField.value}
            onChange={(e) => handleChange(field.id, field.name, e.target.value)}
            className="border border-gray-400 p-2 rounded w-full"
          />
        );

      case "datetime":
        return (
          <input
            type="datetime-local"
            placeholder={field.name}
            required={isRequired}
            value={currentField.value}
            onChange={(e) => handleChange(field.id, field.name, e.target.value)}
            className="border border-gray-400 p-2 rounded w-full"
          />
        );

      case "checkbox":
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={
                currentField.value === true || currentField.value === "true"
              }
              onChange={(e) =>
                handleChange(field.id, field.name, e.target.checked)
              }
              className="accent-blue-500"
            />
            <span>{field.name}</span>
          </label>
        );

      case "longtext":
        return (
          <textarea
            placeholder={field.name}
            required={isRequired}
            rows={4}
            value={currentField.value}
            onChange={(e) => handleChange(field.id, field.name, e.target.value)}
            className="border p-2 rounded w-full border-gray-400"
          />
        );

      case "picklist": {
        const options =
          field.picklist_value?.split(";").map((val) => ({
            label: val.trim(),
            value: val.trim(),
          })) || [];

        const selectedOption = options.find(
          (option) => option.value === currentField.value
        );

        return (
          <Select
          options={options}
          value={selectedOption || null}
          onChange={(selected) =>
            handleChange(field.id, field.name, selected?.value || "")
          }
          placeholder={`Select ${field.name}`}
          isClearable={!isRequired}
          className="react-select-container"
          classNamePrefix="react-select"
          styles={customStyles}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-4">
      {/* Sort the custom fields by field_order */}

       {[...pitchState.customFields]
        .sort((a, b) => a.field_order - b.field_order)
        .map((field) => (
          <div key={field.id} className="flex flex-col">
            <label className="mb-1 font-semibold">
              {field.name}
              {field.mandatory === 1 && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            {renderField(field)}
          </div>
        ))}
    </div>
  );
}

export default CustomFields;
