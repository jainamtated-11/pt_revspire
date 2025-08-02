import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { X, GripVertical } from 'lucide-react';
import GlobalAddButton from '../../../utility/CustomComponents/GlobalAddButton';
import { toast } from 'react-hot-toast';
import Select from 'react-select';

// Custom styles for React Select
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
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#E5E7EB'
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#374151'
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    '&:hover': {
      backgroundColor: '#DC2626',
      color: 'white'
    }
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

const DraggableField = ({ field, index, moveField, onDelete, onClick, isEditing, fieldTypes }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'FIELD',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => isEditing,
  });

  const [, drop] = useDrop({
    accept: 'FIELD',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveField(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
    canDrop: () => isEditing,
  });

  const fieldType = fieldTypes.find(t => t.id === field.field_type);
  const shareWidth = fieldType?.share_width === 1;
  const fieldWidth = shareWidth ? 'w-1/2' : 'w-full';

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={fieldWidth}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div
        className={`flex items-center gap-2 p-3 rounded-lg border ${field.isSelected
            ? 'border-blue-500 bg-blue-50'
            : 'border-neutral-200 bg-white'
          }`}
        onClick={() => {
          if (!isDragging && isEditing) {
            onClick(field);
          }
        }}
      >
        {isEditing && (
          <div ref={drag} className="cursor-move text-gray-400 hover:text-gray-600">
            <GripVertical className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium truncate">
              {field.name}
              {field.mandatory === 1 && <span className="text-gray-500 font-bold w-4 h-4 ml-0.5">*</span>}
            </div>
          </div>
          <div className="text-xs text-gray-500 truncate">{fieldType?.name || field.field_type_name}</div>
        </div>
        {isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            className="text-gray-400 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const NewFieldForm = ({ fieldTypes, onSave, onCancel, initialData, isEditing }) => {
  const [fieldType, setFieldType] = useState(initialData?.field_type || '');
  const [fieldName, setFieldName] = useState(initialData?.name || '');
  const [picklistValues, setPicklistValues] = useState(initialData?.picklist_value || '');
  const [error, setError] = useState('');
  const [isMandatory, setIsMandatory] = useState(initialData?.mandatory === 1);

  useEffect(() => {
    if (initialData) {
      setFieldType(initialData.field_type || '');
      setFieldName(initialData.name || '');
      setPicklistValues(initialData.picklist_value || '');
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
      toast.error('Please fill all required fields');
      return;
    }
    setError('');
    onSave({ fieldType, fieldName, picklistValues, isMandatory });
    toast.success(`${isEditing ? 'Field updated' : 'Field added'} successfully!`);
  };

  const selectedFieldType = fieldTypes.find(t => t.id === fieldType)?.name;

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
            options={fieldTypeOptions}
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
        {selectedFieldType === 'picklist' && (
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
              placeholder="Enter values separated by semicolon (;)"
            />
            <div className="mt-1 text-xs text-gray-500">
              Enter values separated by semicolons (;)
            </div>
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

const groupFieldsIntoRows = (fields, fieldTypes) => {
  const rows = [];
  let currentRow = [];

  fields.forEach((field) => {
    const fieldType = fieldTypes.find(t => t.id === field.field_type);
    const shareWidth = fieldType?.share_width === 1;

    if (shareWidth) {
      currentRow.push(field);
      if (currentRow.length === 2) {
        rows.push(currentRow);
        currentRow = [];
      }
    } else {
      if (currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [];
      }
      rows.push([field]);
    }
  });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
};

const LoginFieldPreview = ({ fields, fieldTypes }) => {
  const [formData, setFormData] = useState({});

  // Update formData when fields change
  useEffect(() => {
    const initialData = {};
    fields.forEach(field => {
      const fieldType = fieldTypes.find(t => t.id === field.field_type);
      const fieldTypeName = fieldType?.name || field.field_type_name;

      switch (fieldTypeName) {
        case 'checkbox':
          initialData[field.id] = field.default_value === '1' || false;
          break;
        case 'number':
          initialData[field.id] = field.default_value ? Number(field.default_value) : '';
          break;
        case 'datetime':
        case 'date':
          initialData[field.id] = field.default_value || '';
          break;
        default:
          initialData[field.id] = field.default_value || '';
      }
    });
    setFormData(initialData);
  }, [fields, fieldTypes]);

  const handleInputChange = (fieldId, value, type) => {
    let processedValue = value;

    switch (type) {
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

  const renderField = (field) => {
    const fieldType = fieldTypes.find(t => t.id === field.field_type);
    const fieldTypeName = fieldType?.name || field.field_type_name;
    const shareWidth = fieldType?.share_width === 1;
    const fieldWidth = shareWidth ? 'w-full' : 'w-full';

    return (
      <div key={field.id} className={fieldWidth}>
        {fieldTypeName === 'text' && (
          <input
            type="text"
            placeholder={field.name}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value, 'text')}
            className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        )}
        {fieldTypeName === 'email' && (
          <input
            type="email"
            placeholder={field.name}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value, 'email')}
            className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        )}
        {fieldTypeName === 'number' && (
          <input
            type="number"
            placeholder={field.name}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value, 'number')}
            className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        )}
        {fieldTypeName === 'datetime' && (
          <input
            type="datetime-local"
            placeholder={field.name}
            value={formatDateTimeForInput(formData[field.id])}
            onChange={(e) => handleInputChange(field.id, e.target.value, 'datetime')}
            className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        )}
        {fieldTypeName === 'date' && (
          <input
            type="date"
            placeholder={field.name}
            value={formatDateForInput(formData[field.id])}
            onChange={(e) => handleInputChange(field.id, e.target.value, 'date')}
            className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        )}
        {fieldTypeName === 'picklist' && (
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
        {fieldTypeName === 'checkbox' && (
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
        {fieldTypeName === 'longtext' && (
          <textarea
            placeholder={field.name}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value, 'longtext')}
            className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            rows={3}
          />
        )}
      </div>
    );
  };

  const rows = groupFieldsIntoRows(fields, fieldTypes);

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex flex-col gap-4">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {row.map((field) => (
              <div key={field.id} className={row.length === 2 ? 'w-1/2' : (fieldTypes.find(t => t.id === field.field_type)?.share_width === 1 ? 'w-1/2' : 'w-full')}>
                {renderField(field)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const LoginFieldCustomModal = ({
  onSave,
  fields = [],
  fieldTypes = [],
  // onEditingChange,
  viewer_id,
  organisation_id,
  isLoading = false
}) => {
  const [localFields, setLocalFields] = useState([]);
  const [fieldOrder, setFieldOrder] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize localFields with the fields prop when it changes
  useEffect(() => {
    if (fields && fields.length > 0) {
      const fieldsWithTypeNames = fields.map(field => {
        const fieldType = fieldTypes.find(t => t.id === field.field_type);
        return {
          ...field,
          field_type_name: fieldType ? fieldType.name : field.field_type_name || '',
          order: field.field_order || field.order || 0
        };
      });
      setLocalFields(fieldsWithTypeNames);

      if (fieldOrder.length === 0) {
        const initialOrder = fieldsWithTypeNames
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(field => field.id);
        setFieldOrder(initialOrder);
      }
    } else {
      setLocalFields([]);
      setFieldOrder([]);
    }
  }, [fields, fieldTypes]);

  // Sort localFields based on fieldOrder
  const sortedFields = React.useMemo(() => {
    if (fieldOrder.length === 0) return localFields;

    const fieldMap = new Map(localFields.map(field => [field.id, field]));

    return fieldOrder
      .filter(id => fieldMap.has(id))
      .map(id => fieldMap.get(id))
      .concat(localFields.filter(field => !fieldOrder.includes(field.id)));
  }, [localFields, fieldOrder]);

  const moveField = (fromIndex, toIndex) => {
    const updatedOrder = [...fieldOrder];
    const [movedId] = updatedOrder.splice(fromIndex, 1);
    updatedOrder.splice(toIndex, 0, movedId);
    setFieldOrder(updatedOrder);
    setHasChanges(true);
  };

  const handleDeleteField = (index) => {
    const fieldToDelete = sortedFields[index];
    const updatedFields = localFields.filter(field => field.id !== fieldToDelete.id);
    setLocalFields(updatedFields);
    setFieldOrder(fieldOrder.filter(id => id !== fieldToDelete.id));
    setHasChanges(true);
    toast.success(`Field "${fieldToDelete.name}" deleted successfully`);
  };

  const handleAddField = (fieldData) => {
    const fieldTypeInfo = fieldTypes.find(t => t.id === fieldData.fieldType);
    const newField = {
      id: Date.now().toString(),
      field_type: fieldData.fieldType,
      name: fieldData.fieldName,
      picklist_value: fieldData.picklistValues,
      field_type_name: fieldTypeInfo?.name || '',
      mandatory: fieldData.isMandatory ? 1 : 0,
      tableidentifier: "ITV",
      created_by: viewer_id,
      updated_by: viewer_id,
      organisation: organisation_id
    };
    setLocalFields([...localFields, newField]);
    setFieldOrder([...fieldOrder, newField.id]);
    setIsAddingNew(false);
    setHasChanges(true);
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
          field_type: updatedField.fieldType,
          name: updatedField.fieldName,
          picklist_value: updatedField.picklistValues,
          field_type_name: fieldTypeInfo?.name || field.field_type_name,
          mandatory: updatedField.isMandatory ? 1 : 0,
          updated_by: viewer_id
        };
      }
      return field;
    });
    setLocalFields(updatedFields);
    setSelectedField(null);
    setHasChanges(true);
  };

  const handleSaveFields = () => {
    if (localFields.length === 0) {
      toast.error('Please add at least one field before saving');
      return;
    }

    const fieldsWithOrder = sortedFields.map((field, index) => {
      const fieldToSave = { ...field };
      delete fieldToSave.field_order;

      return {
        ...fieldToSave,
        order: index + 1
      };
    });

    onSave(fieldsWithOrder);
    setHasChanges(false);
  };

  const handleCancel = () => {
    // Reset to original fields
    const fieldsWithTypeNames = fields.map(field => {
      const fieldType = fieldTypes.find(t => t.id === field.field_type);
      return {
        ...field,
        field_type_name: fieldType ? fieldType.name : field.field_type_name || '',
        order: field.field_order || field.order || 0
      };
    });
    setLocalFields(fieldsWithTypeNames);

    const initialOrder = fieldsWithTypeNames
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(field => field.id);
    setFieldOrder(initialOrder);

    setIsAddingNew(false);
    setSelectedField(null);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 animate-spin text-gray-400">Loading...</div>
      </div>
    );
  }

  const rows = groupFieldsIntoRows(sortedFields, fieldTypes);

  return (
    <div className="bg-white rounded-lg flex flex-col h-full w-full">
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[45%] p-4 border-r border-neutral-200 overflow-y-auto">
          <div className="flex justify-start items-center mb-4">
            <GlobalAddButton
              onClick={() => {
                setIsAddingNew(true);
                setHasChanges(true);
              }}
              text="Add"
            />
          </div>

          {isAddingNew && (
            <NewFieldForm
              fieldTypes={fieldTypes}
              onSave={handleAddField}
              onCancel={() => {
                setIsAddingNew(false);
                if (!hasChanges) setHasChanges(false);
              }}
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

          <div className="flex flex-wrap gap-4">
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex w-full gap-4">
                  {row.map((field) => (
                    <DraggableField
                      key={field.id}
                      field={field}
                      index={sortedFields.indexOf(field)}
                      moveField={moveField}
                      onDelete={handleDeleteField}
                      onClick={handleEditField}
                      isEditing={true}
                      fieldTypes={fieldTypes}
                    />
                  ))}
                </div>
              ))
            ) : (
              <div className="w-full p-4 text-center text-gray-500">
                No custom fields available
              </div>
            )}
          </div>
        </div>

        <div className="w-[55%] p-4 overflow-y-auto">
          <LoginFieldPreview
            fields={sortedFields}
            fieldTypes={fieldTypes}
          />
        </div>
      </div>

      {hasChanges && (
        <div className="p-4 border-t border-neutral-200 flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-4 w-[100px] py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveFields}
            className="px-4 py-2 w-[100px] text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isAddingNew}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginFieldCustomModal; 