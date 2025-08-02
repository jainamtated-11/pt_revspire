import { useState, useEffect } from "react";
import { X, Check, Palette } from "lucide-react";
import { LuLoaderCircle } from "react-icons/lu";
import toast from "react-hot-toast";

const CrmStageMappingModal = ({
  isOpen,
  onClose,
  stages,
  isLoading,
  onSave,
  initialColors = {},
  initialWonStages = [],
  initialLostStages = []
}) => {
  const [stageColors, setStageColors] = useState({});
  const [wonStages, setWonStages] = useState([]);
  const [lostStages, setLostStages] = useState([]);
  const [activePicker, setActivePicker] = useState(null);

  // Modern color palette
  const colorPalette = [
    "#2563EB", // Blue 600 – Planning
    "#4B5563", // Gray 700 – Qualification
    "#10B981", // Emerald 500 – Proposal
    "#EAB308", // Amber 500 – Negotiation
    "#DC2626", // Red 600 – Stalled/Lost
    "#22D3EE", // Cyan 400 – Discovery
    "#6366F1", // Indigo 500 – Demo
    "#F59E0B", // Yellow 500 – Pricing
    "#6B7280", // Gray 600 – Awaiting Response
    "#14B8A6", // Teal 500 – Legal Review
    "#0F766E", // Teal 700 – Procurement
    "#D97706", // Orange 600 – Follow-up
    "#84CC16", // Lime 500 – Approval
    "#3F3F46", // Zinc 800 – Archived
  ];

  // Initialize with current colors when modal opens or stages change
  useEffect(() => {
    if (isOpen && stages.length > 0) {
      const colors = {};
      stages.forEach(stage => {
        // Use the initialColors if available, otherwise fall back to white
        colors[stage.stage_id] = initialColors[stage.stage_id] || "#FFFFFF";
      });
      setStageColors(colors);
      
      // Initialize won and lost stages from props
      setWonStages(initialWonStages || []);
      setLostStages(initialLostStages || []);
    }
  }, [isOpen, stages, initialColors, initialWonStages, initialLostStages]);

  const handleColorSelect = (stageId, color) => {
    setStageColors(prev => ({
      ...prev,
      [stageId]: color
    }));
    setActivePicker(null);
  };

  const handleWonToggle = (stageId) => {
    setWonStages(prev => {
      // If stage is already won, remove it
      if (prev.includes(stageId)) {
        return prev.filter(id => id !== stageId);
      }
      // Otherwise add it and remove from lost stages if it was there
      setLostStages(prevLost => prevLost.filter(id => id !== stageId));
      return [...prev, stageId];
    });
  };

  const handleLostToggle = (stageId) => {
    setLostStages(prev => {
      // If stage is already lost, remove it
      if (prev.includes(stageId)) {
        return prev.filter(id => id !== stageId);
      }
      // Otherwise add it and remove from won stages if it was there
      setWonStages(prevWon => prevWon.filter(id => id !== stageId));
      return [...prev, stageId];
    });
  };

  const handleSave = async () => {
    const colorsToSave = {};
    let isValid = true;
    
    stages.forEach(stage => {
      const color = stageColors[stage.stage_id] || "#FFFFFF";
      if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
        toast.error(`Invalid color for ${stage.stage_name || 'Default Stage'}`);
        isValid = false;
      }
      colorsToSave[stage.stage_id] = color;
    });

    if (isValid) {
      try {
        await onSave({
          colors: colorsToSave,
          wonStages,
          lostStages
        });
        // Close modal after successful save
        onClose();
      } catch (error) {
        toast.error("Failed to save stage mappings");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">CRM Stage Mapping</h2>
            <p className="text-sm text-gray-500">Attribute your sales pipeline stages to colors and conversions so we can determine revenue influence</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 150px)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LuLoaderCircle className="animate-spin text-blue-500 text-2xl" />
            </div>
          ) : stages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No CRM stages available for mapping
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {stages.map((stage) => (
                <div 
                  key={stage.stage_id ?? 'null-stage'} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {stage.stage_name || 'Default Stage'}
                    </h3>
                    {stage.stage_id && (
                      <p className="text-xs text-gray-500 truncate">ID: {stage.stage_id}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Won/Lost checkboxes */}
                    <div className="flex gap-2">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={wonStages.includes(stage.stage_id)}
                          onChange={() => handleWonToggle(stage.stage_id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Won</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={lostStages.includes(stage.stage_id)}
                          onChange={() => handleLostToggle(stage.stage_id)}
                          className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Lost</span>
                      </label>
                    </div>
                    
                    {/* Color picker */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setActivePicker(activePicker === stage.stage_id ? null : stage.stage_id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
                      >
                        <div 
                          className="w-5 h-5 rounded-full border-2"
                          style={{ 
                            backgroundColor: stageColors[stage.stage_id] || '#FFFFFF',
                            borderColor: stageColors[stage.stage_id] ? '#d1d5db' : '#9ca3af'
                          }}
                        />
                        <Palette className="w-4 h-4 text-gray-600" />
                      </button>

                      {/* Color Picker Dropdown */}
                      {activePicker === stage.stage_id && (
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg p-4 z-20 w-64 border border-gray-200 animate-fade-in">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Select color</h4>
                          
                          {/* Color Grid */}
                          <div className="grid grid-cols-5 gap-3 mb-4">
                            {colorPalette.map((color) => (
                              <button
                                key={color}
                                onClick={() => handleColorSelect(stage.stage_id, color)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                                  stageColors[stage.stage_id] === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                                }`}
                                style={{ backgroundColor: color }}
                                aria-label={`Select ${color}`}
                              >
                                {stageColors[stage.stage_id] === color && (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                              </button>
                            ))}
                          </div>

                          {/* Custom Color Input */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Custom color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={stageColors[stage.stage_id] || "#FFFFFF"}
                                onChange={(e) => {
                                  setStageColors(prev => ({
                                    ...prev,
                                    [stage.stage_id]: e.target.value
                                  }));
                                }}
                                className="w-10 h-10 cursor-pointer rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                              />
                              <input
                                type="text"
                                value={stageColors[stage.stage_id] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || /^#[0-9A-Fa-f]{0,6}$/i.test(value)) {
                                    setStageColors(prev => ({
                                      ...prev,
                                      [stage.stage_id]: value || "#FFFFFF"
                                    }));
                                  }
                                }}
                                placeholder="#HEX"
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrmStageMappingModal;