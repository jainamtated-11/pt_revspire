import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAllSections } from "../../../../features/pitch/addPitchSlice";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { Sparkles } from "lucide-react";

function AIGenerateButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const axiosInstance = useAxiosInstance();
  const dispatch = useDispatch();
  const { viewer_id } = useSelector((state) => state.addPitchSlice);

  const generationSteps = [
    "Analyzing your prompt...",
    "Researching relevant pitch structures...",
    "Identifying key sections for your pitch...",
    "Organizing content flow...",
    "Finalizing your pitch structure...",
  ];

  const promptSuggestions = [
    {
      id: 1,
      text: "Product Benefits",
      description: "Highlight key benefits of your product",
    },
    {
      id: 2,
      text: "Target Audience",
      description: "Define who your pitch is aimed at",
    },
    {
      id: 3,
      text: "Competitive Advantage",
      description: "What makes your offering unique",
    },
    {
      id: 4,
      text: "Case Studies",
      description: "Include success stories and examples",
    },
    {
      id: 5,
      text: "ROI Analysis",
      description: "Show financial benefits and returns",
    },
    {
      id: 6,
      text: "Implementation Plan",
      description: "How your solution will be deployed",
    },
    {
      id: 7,
      text: "Technical Specifications",
      description: "Details about your product's capabilities",
    },
  ];

  useEffect(() => {
    let progressInterval;
    let stepInterval;

    if (isLoading) {
      // Reset progress and step when loading starts
      setProgress(0);
      setCurrentStep(0);

      // Simulate progress bar advancement
      progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          // Slow down progress as it approaches 90%
          const increment =
            prevProgress < 30
              ? 7
              : prevProgress < 60
              ? 3
              : prevProgress < 85
              ? 1
              : 0.5;
          const newProgress = Math.min(prevProgress + increment, 95);
          return newProgress;
        });
      }, 800);

      // Change the step message every few seconds
      stepInterval = setInterval(() => {
        setCurrentStep((prevStep) =>
          prevStep < generationSteps.length - 1 ? prevStep + 1 : prevStep
        );
      }, 10000);
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isLoading]);

  const handleGenerateClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPrompt("");
    setError(null);
    setSelectedSuggestions([]);
  };

  const handleSuggestionClick = (suggestion) => {
    let newSelectedSuggestions;
    if (selectedSuggestions.includes(suggestion.id)) {
      // Remove if already selected
      newSelectedSuggestions = selectedSuggestions.filter(
        (id) => id !== suggestion.id
      );
    } else {
      // Add if not selected
      newSelectedSuggestions = [...selectedSuggestions, suggestion.id];
    }

    setSelectedSuggestions(newSelectedSuggestions);

    // Update prompt with selected suggestions
    const selectedTexts = promptSuggestions
      .filter((s) => newSelectedSuggestions.includes(s.id))
      .map((s) => s.text)
      .join(", ");

    setPrompt(() => {
      if (selectedTexts.length === 0) return "";
      return `Create a pitch that focuses on ${selectedTexts}`;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter a prompt or select suggestions");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axiosInstance.post(
        "/pitch-structure-recommendation",
        {
          input: prompt,
          viewer_id: viewer_id,
        }
      );

      if (response.data && response.data.recommended_structure) {
        // Set progress to 100% when complete
        setProgress(100);

        // Wait a moment to show the completed progress
        setTimeout(() => {
          const { sections } = response.data.recommended_structure;

          // Transform the API response to match the format expected by the Redux store
          const formattedSections = sections.map((section, sectionIndex) => {
            // Fallback for section name
            const sectionName =
              section.title ||
              section.section_title ||
              `Section ${sectionIndex + 1}`;

            // Handle both 'items' and 'content' properties
            const items = Array.isArray(section.items)
              ? section.items
              : Array.isArray(section.content)
              ? section.content
              : [];

            return {
              name: sectionName,
              arrangement: sectionIndex + 1,
              contents: items.map((item, contentIndex) => ({
                content: item.ID || "",
                name: item.tagline || `Content ${contentIndex + 1}`,
                tagline: item.tagline || "",
                arrangement: contentIndex + 1,
                mimetype: item.mimetype,
                content_mimetype: item.mimetype,
              })),
            };
          });

          console.log("formattedSections", formattedSections);

          // Update the Redux store with the new sections
          dispatch(updateAllSections(formattedSections));

          // Close the modal
          setIsModalOpen(false);
          setPrompt("");
          setIsLoading(false);
          setSelectedSuggestions([]);
        }, 800); // Short delay to show 100% completion
      } else {
        setError("Failed to generate pitch structure. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error generating pitch structure:", err);
      setError(
        "An error occurred while generating the pitch structure. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleGenerateClick}
        className="flex items-center justify-center w-10 h-10 text-primary transition-all duration-300"
        title="AI Generate"
      >
        <Sparkles size={22} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleCloseModal}
          ></div>
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
            <h3 className="text-xl font-semibold mb-4">
              Create Your Interactive Digital Salesroom
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your pitch or select focus areas below
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014d83] transition-all duration-200"
                  rows="4"
                  placeholder="I am trying to create a pitch on medical product and serums for a hospital to use our products..."
                  disabled={isLoading}
                ></textarea>

                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Select focus points for your pitch:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        onClick={() =>
                          !isLoading && handleSuggestionClick(suggestion)
                        }
                        className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all duration-200 ${
                          selectedSuggestions.includes(suggestion.id)
                            ? "bg-[#014d83] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        title={suggestion.description}
                      >
                        {suggestion.text}
                      </div>
                    ))}
                  </div>
                </div>

                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>

              {isLoading && (
                <div className="mb-6 mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {generationSteps[currentStep]}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#014d83] h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    AI is crafting your pitch structure based on your
                    description...
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#014d83] text-white rounded-md hover:bg-[#013d63] transition-colors disabled:bg-[#014d83]/50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Generating..." : "Generate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AIGenerateButton;
