import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
import { LuLoaderCircle } from "react-icons/lu";
import { X, GripVertical } from 'lucide-react';
import GlobalAddButton from '../../../utility/CustomComponents/GlobalAddButton';
import WarningDialog from '../../../utility/WarningDialog';
import Select from 'react-select';

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

const DraggableField = ({ field, index, moveField, onDelete, onClick }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'FIELD',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'FIELD',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveField(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });



  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`${field.field_type_share_width === 1 ? 'w-1/2' : 'w-full'} p-2`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div
        className={`flex items-center gap-2 p-3 rounded-lg border ${
          field.isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-neutral-200 bg-white'
        }`}
        onClick={() => {
          if (!isDragging) {
            onClick(field);
          }
        }}
      >
        <div ref={drag} className="cursor-move text-gray-400 hover:text-gray-600">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium truncate">
              {field.name}
              {field.mandatory === 1 && <span className="text-gray-500 font-bold w-4 h-4 ml-0.5">*</span>}
            </div>
            {field.field_type_name === 'email' && field.otp_field === 1 && (
              <span className="text-xs text-cyan-600 whitespace-nowrap">(OTP)</span>
            )}
          </div>
          <div className="text-xs text-gray-500 truncate">{field.field_type_name}</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
          className="text-gray-400 hover:text-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const NewFieldForm = ({ fieldTypes, onSave, onCancel, initialData, isEditing }) => {
  const [fieldType, setFieldType] = useState(initialData?.field_type || '');
  const [fieldName, setFieldName] = useState(initialData?.name || '');
  const [picklistValues, setPicklistValues] = useState(initialData?.picklist_value || '');
  const [error, setError] = useState('');
  const [isOtpField, setIsOtpField] = useState(initialData?.otp_field === 1);
  const [isMandatory, setIsMandatory] = useState(initialData?.mandatory === 1);

  useEffect(() => {
    if (initialData) {
      setFieldType(initialData.field_type || '');
      setFieldName(initialData.name || '');
      setPicklistValues(initialData.picklist_value || '');
      setIsOtpField(initialData.otp_field === 1);
      setIsMandatory(initialData.mandatory === 1);
      setError('');
    }
  }, [initialData]);

  const isFormValid = () => {
    if (!fieldType || !fieldName) {
      return false;
    }
    if (fieldTypes.find(t => t.id === fieldType)?.name === 'picklist' && !picklistValues.trim()) {
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!isFormValid()) {
      setError('Please fill all required fields');
      return;
    }
    setError('');
    onSave({ fieldType, fieldName, picklistValues, isOtpField, isMandatory });
  };

  // Convert fieldTypes to options format for React Select
const fieldTypeOptions = fieldTypes.map(type => ({
  value: type.id,
  label: `${type.name} - ${type.description}`
}));

  return (
    <div className="p-4 bg-white rounded-lg border border-neutral-200 mb-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={isMandatory}
            onChange={(e) => setIsMandatory(e.target.checked)}
            className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
          />
          <label className="text-sm text-gray-700">Mandatory Field</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={fieldTypeOptions.find(option => option.value === fieldType)}
            onChange={(selected) => {
              setFieldType(selected.value);
              setError('');
            }}
            options={fieldTypes.map(type => ({
              value: type.id,
              label: `${type.name} - ${type.description}`
            }))}
            placeholder="Select type"
            styles={customStyles}
            className="w-full"
            isSearchable={true}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fieldName}
            onChange={(e) => {
              setFieldName(e.target.value);
              setError('');
            }}
            className="w-full p-2 border border-neutral-300 rounded-lg"
            placeholder="Enter field name"
          />
        </div>
        {fieldTypes.find(t => t.id === fieldType)?.name === 'picklist' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Picklist Values <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={picklistValues}
              onChange={(e) => {
                setPicklistValues(e.target.value);
                setError('');
              }}
              className="w-full p-2 border border-neutral-300 rounded-lg"
              placeholder="Enter values separated by semicolon"
            />
          </div>
        )}
        {fieldType === 'email' && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isOtpField}
              onChange={(e) => setIsOtpField(e.target.checked)}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <label className="text-sm text-gray-700">Use for OTP</label>
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid()}
          >
            {isEditing ? 'Save' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginFieldPreview = ({ fields, onOtpChange }) => {
  const [formData, setFormData] = useState({});

  const handleInputChange = (fieldId, value, type) => {
    let processedValue = value;
    
    switch(type) {
      case 'number':
        processedValue = value === '' ? '' : Number(value);
        break;
      case 'datetime':
      case 'date':
        processedValue = value || '';
        break;
      default:
        processedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [fieldId]: processedValue
    }));
  };

  const formatDateTimeForInput = (value) => {
    if (!value) return '';
    try {
      const date = new Date(value);
      return date.toISOString().slice(0, 16);
    } catch (e) {
      return '';
    }
  };

  const formatDateForInput = (value) => {
    if (!value) return '';
    try {
      const date = new Date(value);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-neutral-200">
      <h3 className="text-lg font-semibold mb-4">Login Page Preview</h3>
      <div className="flex flex-wrap gap-4">
        {fields.map((field) => (
          <div
            key={field.id}
            className={`${
              field.field_type_share_width === 1 ? 'w-[calc(50%-8px)]' : 'w-full'
            }`}
          >
            {field.field_type_name === 'text' && (
              <input
                type="text"
                placeholder={field.name}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value, 'text')}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            )}
            {field.field_type_name === 'email' && (
              <div className="relative">
                <input
                  type="email"
                  placeholder={field.name}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value, 'email')}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={field.otp_field === 1}
                    onChange={(e) => onOtpChange(field.id, e.target.checked)}
                    className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <span className="text-xs text-gray-500">OTP</span>
                </div>
              </div>
            )}
            {field.field_type_name === 'number' && (
              <input
                type="number"
                placeholder={field.name}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value, 'number')}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            )}
            {field.field_type_name === 'datetime' && (
              <input
                type="datetime-local"
                placeholder={field.name}
                value={formatDateTimeForInput(formData[field.id])}
                onChange={(e) => handleInputChange(field.id, e.target.value, 'datetime')}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            )}
            {field.field_type_name === 'date' && (
              <input
                type="date"
                placeholder={field.name}
                value={formatDateForInput(formData[field.id])}
                onChange={(e) => handleInputChange(field.id, e.target.value, 'date')}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            )}
           {field.field_type_name === 'picklist' && (
  <Select
    value={formData[field.id] ? { value: formData[field.id], label: formData[field.id] } : null}
    onChange={(selected) => handleInputChange(field.id, selected?.value || '', 'picklist')}
    options={field.picklist_value?.split(';')
      .filter(value => value.trim())
      .map(value => ({ value: value.trim(), label: value.trim() }))}
    placeholder={`Select ${field.name}`}
    styles={customStyles}
    className="w-full"
    isClearable
    menuPortalTarget={document.body}
    menuPosition="fixed"
  />
)}
            {field.field_type_name === 'checkbox' && (
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData[field.id] || false}
                  onChange={(e) => handleInputChange(field.id, e.target.checked, 'checkbox')}
                  className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <label className="text-sm text-gray-700">{field.name}</label>
              </div>
            )}
            {field.field_type_name === 'longtext' && (
              <textarea
                placeholder={field.name}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value, 'longtext')}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                rows={3}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

function LoginFieldModal({
  isOpen,
  onClose,
  fields,
  fieldTypes,
  isLoading,
  onSave,
}) {
  const [localFields, setLocalFields] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [targetOtpField, setTargetOtpField] = useState(null);
  const [showSaveWarning, setShowSaveWarning] = useState(false);

  useEffect(() => {
    if (fields) {
      const sortedFields = [...fields].sort((a, b) => a.order - b.order);
      setLocalFields(sortedFields);
    }
  }, [fields]);

  const moveField = (fromIndex, toIndex) => {
    const updatedFields = [...localFields];
    const [movedField] = updatedFields.splice(fromIndex, 1);
    updatedFields.splice(toIndex, 0, movedField);
    
    updatedFields.forEach((field, index) => {
      field.order = index + 1;
    });
    
    setLocalFields(updatedFields);
  };

  const handleDeleteField = (index) => {
    const updatedFields = [...localFields];
    updatedFields.splice(index, 1);
    setLocalFields(updatedFields);
  };

  const handleAddField = (fieldData) => {
    const fieldTypeInfo = fieldTypes.find(t => t.id === fieldData.fieldType);
    const newField = {
      id: Date.now().toString(),
      field_type: fieldData.fieldType,
      name: fieldData.fieldName,
      picklist_value: fieldData.picklistValues,
      field_type_name: fieldTypeInfo?.name || '',
      field_type_share_width: fieldTypeInfo?.share_width || 2,
      otp_field: fieldData.isOtpField ? 1 : 0,
      mandatory: fieldData.isMandatory ? 1 : 0
    };
    setLocalFields([...localFields, newField]);
    setIsAddingNew(false);
  };

  const handleOtpChange = (fieldId, checked) => {
    const currentField = localFields.find(f => f.id === fieldId);
    const currentOtpField = localFields.find(f => f.otp_field === 1);

    if (checked && currentOtpField && currentOtpField.id !== fieldId) {
      setTargetOtpField(fieldId);
      setShowWarning(true);
    } else {
      updateOtpValue(fieldId, checked);
    }
  };

  const updateOtpValue = (fieldId, checked) => {
    const updatedFields = localFields.map(field => ({
      ...field,
      otp_field: field.id === fieldId ? (checked ? 1 : 0) : 0
    }));
    setLocalFields(updatedFields);
  };

  const handleEditField = (field) => {
    setLocalFields(prevFields => 
      prevFields.map(f => ({
        ...f,
        isSelected: f.id === field.id
      }))
    );
    setSelectedField(field);
  };

  const handleFieldUpdate = (updatedField) => {
    const updatedFields = localFields.map(field => {
      if (field.id === selectedField.id) {
        const fieldTypeInfo = fieldTypes.find(t => t.id === updatedField.fieldType);
        return {
          ...field,
          id: field.id,
          field_type: updatedField.fieldType,
          name: updatedField.fieldName,
          picklist_value: updatedField.picklistValues,
          field_type_name: fieldTypeInfo?.name || field.field_type_name,
          field_type_share_width: fieldTypeInfo?.share_width || field.field_type_share_width,
          otp_field: field.otp_field,
          mandatory: updatedField.isMandatory ? 1 : 0
        };
      }
      return field;
    });
    setLocalFields(updatedFields);
    setSelectedField(null);
  };

  const handleSaveLoginFields = () => {
    // Check if there's at least one email field with OTP enabled
    const hasOtpField = localFields.some(
      field => field.field_type_name === 'email' && field.otp_field === 1
    );

    if (!hasOtpField) {
      setShowSaveWarning(true);
      return;
    }

    onSave(localFields);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-100 rounded-lg w-[68vw] h-[90vh] flex flex-col">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Configure Login Fields</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LuLoaderCircle className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <DndProvider backend={HTML5Backend}>
              <div className="w-[45%] p-4 border-r border-neutral-200 overflow-y-auto">
                <div className="flex justify-start items-center mb-4">
                  <GlobalAddButton onClick={() => setIsAddingNew(true)} />
                </div>

                {isAddingNew && (
                  <NewFieldForm
                    fieldTypes={fieldTypes}
                    onSave={handleAddField}
                    onCancel={() => setIsAddingNew(false)}
                  />
                )}

                {selectedField && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Editing: {selectedField.name}</div>
                    <NewFieldForm
                      fieldTypes={fieldTypes}
                      initialData={selectedField}
                      onSave={handleFieldUpdate}
                      onCancel={() => setSelectedField(null)}
                      isEditing={true}
                    />
                  </div>
                )}

                <div className="flex flex-wrap">
                  {localFields.map((field, index) => (
                    <DraggableField
                      key={field.id}
                      field={field}
                      index={index}
                      moveField={moveField}
                      onDelete={handleDeleteField}
                      onClick={handleEditField}
                    />
                  ))}
                </div>
              </div>

              <div className="w-[55%] p-4 overflow-y-auto">
                <LoginFieldPreview
                  fields={localFields}
                  onOtpChange={handleOtpChange}
                />
              </div>
            </DndProvider>
          </div>
        )}

        <div className="p-4 border-t border-neutral-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 w-[100px] py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveLoginFields}
            className="px-4 py-2 w-[100px] text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isAddingNew}
          >
            Save
          </button>
        </div>
      </div>

      {showWarning && (
        <WarningDialog
          title="Change OTP Field"
          content={`Are you sure you want to change the OTP field to "${localFields.find(f => f.id === targetOtpField)?.name}"?`}
          onConfirm={() => {
            updateOtpValue(targetOtpField, true);
            setShowWarning(false);
          }}
          onCancel={() => setShowWarning(false)}
          confrimMessage="Change"
        />
      )}

      {showSaveWarning && (
        <WarningDialog
          title="Missing OTP Field"
          content="At least one email field must be set as OTP field before saving. Please configure an OTP field to continue."
          onConfirm={() => setShowSaveWarning(false)}
          onCancel={() => setShowSaveWarning(false)}
          confrimMessage="OK"
        />
      )}
    </div>
  );
}

export default LoginFieldModal; 
