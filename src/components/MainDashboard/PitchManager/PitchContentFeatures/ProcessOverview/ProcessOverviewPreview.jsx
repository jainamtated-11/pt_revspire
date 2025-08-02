import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, MapPin, Check, ChevronRight, Clock } from "lucide-react";

const ProcessOverviewPreview = ({ description, data, hexColor }) => {
  const scrollContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const processData = typeof data === "string" ? JSON.parse(data) : data;
  const currentStepIndex = processData.Steps.findIndex(step => step.CurrentStep);
  const [activeStep, setActiveStep] = useState(currentStepIndex);
  const [isScrolling, setIsScrolling] = useState(false);

  // Format date if exists
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle step click to expand/collapse
  const handleStepClick = useCallback((index) => {
    setActiveStep(activeStep === index ? null : index);
  }, [activeStep]);

  // Improved scroll function with debounce
  const scroll = useCallback((direction) => {
    if (scrollContainerRef.current && !isScrolling) {
      setIsScrolling(true);
      const scrollAmount = window.innerHeight * 0.6; // 60% of viewport height
      scrollContainerRef.current.scrollBy({
        top: direction === "up" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      
      // Prevent rapid scrolling
      setTimeout(() => setIsScrolling(false), 500);
    }
  }, [isScrolling]);

  // Auto-scroll to current step on mount
  useEffect(() => {
    if (scrollContainerRef.current && currentStepIndex >= 0) {
      const stepElement = scrollContainerRef.current.querySelector(`[data-step-index="${currentStepIndex}"]`);
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStepIndex]);

  const hexToRgb = (hex) => {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    return { r, g, b };
  };

  const createColorVariations = (hexColor) => {
    const baseColor = hexToRgb(hexColor || "28747d");
    const { r, g, b } = baseColor;

    return {
      base: `rgb(${r}, ${g}, ${b})`,
      light: `rgb(${Math.min(255, r + 40)}, ${Math.min(
        255,
        g + 40
      )}, ${Math.min(255, b + 40)})`,
      dark: `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(
        0,
        b - 30
      )})`,
      gradient: `linear-gradient(90deg, rgb(${r}, ${g}, ${b}), rgb(${Math.min(
        255,
        r + 20
      )}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 20)}))`,
      gradientBr: `linear-gradient(135deg, rgb(${r}, ${g}, ${b}), rgb(${Math.min(
        255,
        r + 30
      )}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)}))`,
      shadow: `rgba(${r}, ${g}, ${b}, 0.3)`,
      lightShadow: `rgba(${r}, ${g}, ${b}, 0.1)`,
    };
  };

  const colors = createColorVariations(hexColor);

  return (
    <div
      className="relative max-w-4xl h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden mx-auto shadow-sm"
      style={{ cursor: "default" }}
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-3">
        {description && (
          <p className="text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>

      {/* Timeline Container */}
      <div className="relative h-[calc(100%-64px)] overflow-y-auto custom-scrollbar">
        <div 
          className="h-full overflow-y-auto custom-scrollbar px-4 sm:px-8 py-6"
          onClick={(e) => e.stopPropagation()}
          ref={scrollContainerRef}
          style={{
            scrollbarWidth: "thin",
            cursor: "default",
          }}
        >
          <div className="relative flex flex-col h-full">
            {/* Vertical Timeline */}
            <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-1 z-0">
              <div className="absolute inset-0 bg-gray-200/70 rounded-full" />
              <div
                className="absolute left-0 top-0 w-full rounded-full shadow-sm transition-all duration-700 ease-out"
                style={{
                  height: `${((currentStepIndex + 1) / processData.Steps.length) * 100}%`,
                  background: `linear-gradient(to bottom, ${colors.base}, ${colors.light})`,
                  boxShadow: `0 0 15px ${colors.shadow}`,
                }}
              />
            </div>

            {/* Steps */}
            <div className="flex flex-col space-y-6 relative z-10">
              {processData.Steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isExpanded = activeStep === index;
                const hasDetails = step.Details || step.Deadline || step.Resources;

                return (
                  <div
                    key={index}
                    data-step-index={index}
                    className={`relative group transition-all duration-300 ${
                      isCurrent ? 'scale-[1.01]' : 'hover:scale-[1.005]'
                    }`}
                    onClick={() => handleStepClick(index)}
                  >
                    <div className="flex items-start">
                      {/* Timeline Dot */}
                      <div className="flex-shrink-0 relative">
                        <div className="relative z-10">
                          {isCurrent && (
                            <>
                              <div
                                className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 -m-3 sm:-m-4 rounded-full opacity-15 animate-pulse"
                                style={{ backgroundColor: colors.base }}
                              />
                              <div
                                className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 -m-2 sm:-m-3 rounded-full opacity-10 animate-pulse"
                                style={{ backgroundColor: colors.base }}
                              />
                            </>
                          )}
                          <div
                            className={`relative rounded-full flex items-center justify-center transition-all duration-300 ${
                              isCurrent 
                                ? 'w-10 h-10 sm:w-12 sm:h-12' 
                                : isCompleted 
                                  ? 'w-8 h-8 sm:w-10 sm:h-10' 
                                  : 'w-8 h-8 sm:w-10 sm:h-10 bg-white border-2 border-gray-300'
                            }`}
                            style={{
                              ...(isCurrent || isCompleted ? {
                                background: colors.gradientBr,
                                boxShadow: `0 4px 20px ${colors.shadow}`,
                              } : {}),
                              borderColor: isCompleted ? colors.light : '#e5e7eb',
                              zIndex: 10
                            }}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            ) : isCurrent ? (
                              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            ) : (
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="ml-4 sm:ml-6 flex-1 min-w-0">
                        <div 
                          className={`p-4 sm:p-5 rounded-xl transition-all duration-300 cursor-pointer ${
                            isCurrent 
                              ? 'bg-white shadow-md' 
                              : 'bg-white/80 hover:bg-white/90 hover:shadow-sm'
                          } ${isExpanded && hasDetails ? 'rounded-b-none' : ''}`}
                          style={{
                            borderLeft: `4px solid ${isCurrent ? colors.base : isCompleted ? colors.light : '#e5e7eb'}`,
                            borderTopLeftRadius: '0.5rem',
                            borderBottomLeftRadius: isExpanded && hasDetails ? '0' : '0.5rem'
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3
                                  className={`text-sm sm:text-base font-semibold truncate ${
                                    isCurrent ? 'text-gray-900' : 'text-gray-800'
                                  }`}
                                >
                                  {step.StepName}
                                </h3>
                                {step.Status && (
                                  <span 
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: isCurrent 
                                        ? `${colors.light}40` 
                                        : isCompleted 
                                          ? '#e5f9e0' 
                                          : '#f0f0f0',
                                      color: isCurrent 
                                        ? colors.dark 
                                        : isCompleted 
                                          ? '#2e7d32' 
                                          : '#666',
                                      fontWeight: 500
                                    }}
                                  >
                                    {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : 'Upcoming'}
                                  </span>
                                )}
                              </div>
                              
                              {step.Description && (
                                <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                  {step.Description}
                                </p>
                              )}
                              
                              {(step.Deadline || step.Resources) && (
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                                  {step.Deadline && (
                                    <div className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      <span>{formatDate(step.Deadline)}</span>
                                    </div>
                                  )}
                                  {step.Resources > 0 && (
                                    <div className="flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <span>{step.Resources} resources</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {hasDetails && (
                              <ChevronRight 
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'transform rotate-90' : ''}`} 
                              />
                            )}
                          </div>
                        </div>

                        {/* Expandable Details */}
                        {isExpanded && hasDetails && (
                          <div className="bg-gray-50/80 rounded-b-xl p-4 border-t border-gray-100">
                            {step.Details && (
                              <div className="text-sm text-gray-600 mb-3">
                                <h4 className="font-medium text-gray-800 mb-1">Details</h4>
                                <p className="whitespace-pre-line">{step.Details}</p>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                              {step.Resources > 0 && (
                                <button 
                                  className="text-xs px-3 py-1.5 bg-white rounded-md border border-gray-200 hover:bg-gray-50 flex items-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle view resources
                                  }}
                                >
                                  <svg className="w-3.5 h-3.5 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  View Resources ({step.Resources})
                                </button>
                              )}
                              
                              <button 
                                className="text-xs px-3 py-1.5 bg-white rounded-md border border-gray-200 hover:bg-gray-50 flex items-center"
                                style={{ color: colors.base }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle view more
                                }}
                              >
                                <span>View Full Details</span>
                                <ChevronRight className="w-3.5 h-3.5 ml-1" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Removed scroll buttons */}
      </div>
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${colors.base} #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${colors.base};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${colors.dark};
        }
        
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProcessOverviewPreview;