import React, { useState, useRef, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import QuillResizeImage from "quill-resize-image";

Quill.register("modules/imageResize", QuillResizeImage);

// Add fieldsData constant at the top
const fieldsData = {
  pitch: ["headline", "title", "description", "name", "pitch_custom_link"],
  organisation: ["name", "description", "phone"],
  user: [
    "username",
    "last_name",
    "middle_name",
    "job_title",
    "calendar_link",
    "email",
    "first_name",
    "signature",
  ],
};

const RichTextEditor = ({ onChange, value = "" }) => {
  const quillRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [suggestionContext, setSuggestionContext] = useState(null);
  const [lastAtPos, setLastAtPos] = useState(-1);
  const dropdownRef = useRef(null);
  const lastSelectionRef = useRef(null);

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const handleTextChange = () => {
      const range = editor.getSelection();
      if (!range) {
        if (showSuggestions) setShowSuggestions(false);
        return;
      }

      lastSelectionRef.current = range;
      const text = editor.getText(0, range.index);

      // Handle @internal suggestions
      const atInternalPos = text.lastIndexOf("@internal");
      if (atInternalPos > -1) {
        setLastAtPos(atInternalPos);
        const afterAt = text.substring(atInternalPos + 9); // 9 is length of "@internal"

        if (afterAt.startsWith(".")) {
          const parts = afterAt.split(".");

          if (parts.length === 2 && parts[1] === "") {
            // First dot - show categories
            setSuggestionContext(null);
            setSuggestions(Object.keys(fieldsData));
            setShowSuggestions(true);
            setSelectedSuggestion(0);
          } else if (parts.length === 3 && parts[2] === "") {
            // Second dot - show fields
            if (suggestionContext) {
              setSuggestions(fieldsData[suggestionContext]);
              setShowSuggestions(true);
              setSelectedSuggestion(0);
            }
          }
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }

      // Handle @external formatting
      const atExternalPos = text.lastIndexOf("@external");
      if (atExternalPos > -1) {
        const afterAt = text.substring(atExternalPos + 9);

        if (afterAt.startsWith(".")) {
          const parts = afterAt.split(".");
          if (parts.length === 2 && parts[1].includes(" ")) {
            const word = parts[1].split(" ")[0];
            if (word) {
              // Only format the current @external reference
              const startPos = atExternalPos;
              const length = 9 + 1 + word.length; // "@external." + word

              // Format only the current external reference
              editor.formatText(
                startPos,
                length,
                {
                  background: "#e6f3ff",
                  color: "#2768a8",
                  "border-radius": "3px",
                  padding: "2px 4px",
                },
                "api"
              );

              // Don't reset formatting for the rest of the content
              editor.formatText(
                startPos + length,
                1, // Only format the next character (space)
                {
                  background: false,
                  color: false,
                },
                "api"
              );
            }
          }
        }
      }

      // Re-apply formatting to all @internal references
      const content = editor.getText();
      const internalMatches = [
        ...content.matchAll(/@internal\.[^.\s]+\.[^.\s]+/g),
      ];
      internalMatches.forEach((match) => {
        editor.formatText(
          match.index,
          match[0].length,
          {
            background: "#faf0f0",
            color: "#f58288",
            "border-radius": "3px",
            padding: "2px 4px",
          },
          "api"
        );
      });

      // Re-apply formatting to all @external references
      const externalMatches = [...content.matchAll(/@external\.[^.\s]+/g)];
      externalMatches.forEach((match) => {
        editor.formatText(
          match.index,
          match[0].length,
          {
            background: "#e6f3ff",
            color: "#2768a8",
            "border-radius": "3px",
            padding: "2px 4px",
          },
          "api"
        );
      });
    };

    editor.on("text-change", handleTextChange);
    return () => editor.off("text-change", handleTextChange);
  }, [suggestionContext, showSuggestions]);

  const handleSuggestionSelect = (suggestion) => {
    const editor = quillRef.current?.getEditor();
    if (!editor || lastAtPos === -1) return;

    // Get the current text from the editor
    const fullText = editor.getText();

    // Find the text after @internal that we need to replace
    const textAfterAt = fullText.substring(lastAtPos);
    const endOfCurrentText = textAfterAt.match(/[\s\n]/);
    const currentTextLength = endOfCurrentText
      ? endOfCurrentText.index
      : textAfterAt.length;

    try {
      // Calculate the exact range to replace
      const replaceStart = lastAtPos;
      const replaceEnd = lastAtPos + currentTextLength;

      if (suggestionContext) {
        // Handle field selection - replace with full annotation
        const replacement = `@internal.${suggestionContext}.${suggestion}`;

        // Replace the text and apply formatting
        editor.deleteText(replaceStart, replaceEnd - replaceStart, "user");
        editor.insertText(replaceStart, replacement, "user");

        // Apply formatting only to the new annotation
        editor.formatText(
          replaceStart,
          replacement.length,
          {
            background: "#faf0f0",
            color: "#f58288",
            "border-radius": "3px",
            padding: "2px 4px",
          },
          "api"
        );

        // Add space after if needed and remove formatting for the space
        if (
          replacement.length < currentTextLength ||
          fullText.length <= replaceStart + replacement.length ||
          fullText[replaceStart + replacement.length] !== " "
        ) {
          editor.insertText(replaceStart + replacement.length, " ", "user");
          // Remove formatting from the space
          editor.formatText(
            replaceStart + replacement.length,
            1,
            {
              background: false,
              color: false,
              "border-radius": false,
              padding: false,
            },
            "api"
          );
        }

        // Move cursor after the annotation and reset formatting
        const newCursorPos =
          replaceStart +
          replacement.length +
          (fullText[replaceStart + replacement.length] === " " ? 1 : 0);
        editor.setSelection(newCursorPos, 0, "api");

        // Reset formatting for future text
        editor.format("background", false);
        editor.format("color", false);
        editor.format("border-radius", false);
        editor.format("padding", false);

        setSuggestionContext(null);
      } else {
        // Handle category selection - just add the category
        const replacement = `@internal.${suggestion}`;

        // Replace the text (don't format yet as it's incomplete)
        editor.deleteText(replaceStart, replaceEnd - replaceStart, "user");
        editor.insertText(replaceStart, replacement, "user");

        // Move cursor to end of the inserted text
        editor.setSelection(replaceStart + replacement.length, 0, "api");

        setSuggestionContext(suggestion);
      }

      setShowSuggestions(false);
    } catch (error) {
      console.error("Error in handleSuggestionSelect:", error);
      // Attempt to restore the editor state
      editor.setContents(editor.getContents());
    }

    editor.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestion((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestion(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSuggestionSelect(suggestions[selectedSuggestion]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowSuggestions(false);
    }
  };

  const getDropdownPosition = () => {
    if (!quillRef.current || !showSuggestions) return {};

    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();
    if (!range) return {};

    const bounds = editor.getBounds(range.index);
    return {
      top: `${bounds.bottom + window.scrollY + 5}px`,
      left: `${bounds.left + window.scrollX}px`,
    };
  };

  return (
    <div className="w-[98%] h-[400px] relative " onKeyDown={handleKeyDown}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        style={{ height: "75%", color: "#212121"}}
      />

      {showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute bg-white border border-gray-200 rounded shadow-lg z-50 max-h-48 overflow-y-auto min-w-[200px]"
          style={getDropdownPosition()}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                index === selectedSuggestion ? "bg-gray-100" : ""
              }`}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ **Advanced Toolbar with ALL Features**
const modules = {
  toolbar: [
    // Headings & Fonts
    [{ font: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    // Text Styling
    ["bold", "italic", "underline", "strike"],

    // Lists & Indentation
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],

    // Script & Blockquote
    [{ script: "sub" }, { script: "super" }],
    ["blockquote", "code-block"],

    // Text Alignment
    [{ align: [] }],

    // Color Options
    [{ color: [] }, { background: [] }],

    ["formula"], // Insert formula

    // Links, Images & Videos
    ["link", "image", "video"],

    // Undo & Redo
    [{ undo: "undo" }, { redo: "redo" }],

    // Clean Formatting
    ["clean"],

    [{ list: "check" }], // Checkbox list
    [{ list: "bullet" }], // Unordered list
    [{ list: "ordered" }], // Ordered list
  ],
  imageResize: {
    modules: ["Resize", "DisplaySize", "Toolbar"],
  },
};

const formats = [
  "font",
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "indent",
  "script",
  "blockquote",
  "code-block",
  "align",
  "color",
  "background",
  "formula",
  "link",
  "image",
  "video",
];

export default RichTextEditor;
