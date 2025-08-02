import { useState, useEffect, useRef } from "react";
import { FiX, FiSave, FiEdit2, FiTrash2, FiCode, FiStopCircle } from "react-icons/fi";
import useAxiosInstance from "../../../../../Services/useAxiosInstance";
import Editor from "@monaco-editor/react";

const HTMLBlock = ({
  onClose,
  onClickHandler,
  onActionEdit,
  contentWhileEditing,
}) => {
  const [title, setTitle] = useState("HTML Snippet");
  const [htmlCode, setHtmlCode] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const axiosInstance = useAxiosInstance();
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [originalCode, setOriginalCode] = useState("");
  const [isCodeReplacing, setIsCodeReplacing] = useState(false);
  const streamIntervalRef = useRef(null);
  const [pausePreview, setPausePreview] = useState(false);

  useEffect(() => {
    if (contentWhileEditing) {
      try {
        if (contentWhileEditing.content_link) {
          const parsed = JSON.parse(contentWhileEditing.content_link);
          if (parsed.Type === "HtmlBlock") {
            setHtmlCode(parsed.html || "");
            setTitle(contentWhileEditing.tagline || "HTML Snippet");
            return;
          }
        }
        if (contentWhileEditing.content) {
          const parsed =
            typeof contentWhileEditing.content === "string"
              ? JSON.parse(contentWhileEditing.content)
              : contentWhileEditing.content;
          if (parsed.html) setHtmlCode(parsed.html);
          if (contentWhileEditing.tagline)
            setTitle(contentWhileEditing.tagline);
        }
      } catch (err) {
        console.error("Error parsing contentWhileEditing:", err);
        setHtmlCode("");
      }
    }
  }, [contentWhileEditing]);

  useEffect(() => {
    if (pausePreview) return; // Skip preview updates when paused

    if (previewRef.current && htmlCode) {
      // Create an isolated iframe for the preview
      const iframe = document.createElement("iframe");
      iframe.srcdoc = htmlCode;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.style.borderRadius = "8px";

      // Clear previous content
      previewRef.current.innerHTML = "";
      previewRef.current.appendChild(iframe);
    }
  }, [htmlCode, pausePreview]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    const payload = {
      name: title,
      description: "HTML Snippet",
      parameters: {
        Type: "HtmlBlock",
        html: htmlCode,
      },
    };

    try {
      if (contentWhileEditing?.content_id) {
        // Edit flow
        await axiosInstance.post("/pitch-content-feature/edit-feature", {
          ...payload,
          content_id: contentWhileEditing.content_id,
        });

        onActionEdit?.({
          editedContentId: contentWhileEditing.content_id,
          editedData: { html: htmlCode, title },
        });
      } else {
        // Create flow
        const res = await axiosInstance.post(
          "/pitch-content-feature/create-feature",
          payload
        );
        onClickHandler?.([
          {
            ...res.data.content,
            tagline: res.data.content.name,
          },
        ]);
      }

      onClose?.();
    } catch (err) {
      console.error("Error saving HTML preview:", err);
      setSaveError(err?.response?.data?.message || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const generateHTMLFromPrompt = async () => {
    if (!prompt.trim()) {
      setGenerationError("Please enter a description");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setOriginalCode(htmlCode);

    try {
      const response = await axiosInstance.post('/generate-html-from-prompt', {
        prompt: htmlCode.trim().length > 10 
          ? `Current HTML: ${htmlCode}\n\nRequested Changes: ${prompt}`
          : prompt
      });

      setShowPromptModal(false);
      replaceCodeWithAnimation(response.data.htmlCode || "");
      setIsGenerating(false);

    } catch (err) {
      console.error('Error generating HTML:', err);
      setGenerationError(err.response?.data?.error || 'Error generating HTML');
      setIsGenerating(false);
    }
  };

  const replaceCodeWithAnimation = (newCode) => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }

    setIsCodeReplacing(true);
    setPausePreview(true); // Pause preview updates
    
    const originalLines = htmlCode.split('\n');
    const newLines = newCode.split('\n');
    let currentLine = 0;

    setHtmlCode(originalLines.map(line => `<!-- ${line} -->`).join('\n'));

    streamIntervalRef.current = setInterval(() => {
      if (currentLine >= newLines.length) {
        clearInterval(streamIntervalRef.current);
        setIsCodeReplacing(false);
        
        setHtmlCode(prev => {
          const cleanedCode = prev.replace(/<!-- .*? -->/g, '').trim();
          setPausePreview(false); // Resume preview after final update
          return cleanedCode;
        });
        return;
      }

      setHtmlCode(prev => {
        const lines = prev.split('\n');
        if (currentLine < lines.length) {
          lines[currentLine] = newLines[currentLine];
        } else {
          lines.push(newLines[currentLine]);
        }
        return lines.join('\n');
      });

      currentLine++;
    }, 100);
  };

  const stopGeneration = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }
    setIsGenerating(false);
    setIsCodeReplacing(false);
    
    // Restore original code if generation was stopped
    if (isCodeReplacing) {
      setHtmlCode(originalCode);
    }
  };

  // Add this cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full ${
          isFullscreen ? "h-[95vh]" : "h-[75vh]"
        } max-w-6xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col transition-all duration-200`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            {editingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                className="text-base font-medium bg-white border border-gray-300 rounded px-3 py-1 outline-none focus:ring-2 focus:ring-blue-500 w-64"
                autoFocus
              />
            ) : (
              <h1
                className="text-base font-medium cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setEditingTitle(true)}
              >
                {title}
              </h1>
            )}
            <button
              onClick={() => setEditingTitle(true)}
              className="text-gray-500 hover:text-blue-600 p-1 rounded transition-colors"
              aria-label="Edit title"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setPrompt("");
                setShowPromptModal(true);
              }}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              <FiCode className="w-4 h-4" />
              {/* Change this line to check for meaningful content */}
              {htmlCode.trim().length > 10 ? "Improve with AI" : "Generate with AI"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-gray-500 hover:bg-gray-200 p-2 rounded transition-colors"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden h-full">
          {/* Left - Code Editor (40%) */}
          <div className="w-[40%] border-r border-gray-200 flex flex-col">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">HTML Editor</h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="html"
                value={htmlCode}
                onChange={(value) => !isCodeReplacing && setHtmlCode(value || "")} // Disable edits during replacement
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  renderWhitespace: "none",
                  lineNumbers: "on",
                  folding: true,
                  lineDecorationsWidth: 10,
                  readOnly: isCodeReplacing, // Make editor read-only during replacement
                }}
                theme="vs-light"
              />
            </div>
          </div>

          {/* Right - Preview (60%) */}
          <div className="w-[60%] flex flex-col">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
              {pausePreview && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating preview...</span>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto p-4 bg-white relative">
              {pausePreview && (
                <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
                </div>
              )}
              <div
                ref={previewRef}
                className="w-full h-full rounded-lg bg-white"
              >
                {!htmlCode && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300 text-gray-500">
                    <p>HTML preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-3 border-t border-gray-200 bg-gray-50">
          <div />
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !htmlCode.trim()}
              className="px-4 flex flex-row py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 mr-2" /> Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60 p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium">
                {htmlCode.trim() ? "Improve Existing HTML" : "Generate HTML with AI"}
              </h2>
              <button
                onClick={() => {
                  stopGeneration();
                  setShowPromptModal(false);
                }}
                className="text-gray-500 hover:bg-gray-200 p-1 rounded transition-colors"
                disabled={isGenerating}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                  {htmlCode.trim() 
                    ? "Describe what needs to be corrected or improved" 
                    : "Describe what HTML you want to generate"}
                </label>
                <textarea
                  id="prompt"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    htmlCode.trim()
                      ? "e.g., 'Make the form fields wider and add validation', or 'Change the color scheme to blue and white'"
                      : "e.g., 'A responsive contact form with name, email, and message fields, styled with a modern design'"
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
              
              {generationError && (
                <div className="text-red-500 text-sm">{generationError}</div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    stopGeneration();
                    setShowPromptModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  disabled={isGenerating}
                >
                  Cancel
                </button>
                <button
                  onClick={generateHTMLFromPrompt}
                  disabled={!prompt.trim() || isGenerating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {htmlCode.trim() ? "Improving..." : "Generating..."}
                    </>
                  ) : (
                    htmlCode.trim() ? "Improve Code" : "Generate Code"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HTMLBlock;
