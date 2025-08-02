import React from "react";

const HighlightText = ({ text = "", searchTerm = "" }) => {
  // Ensure text and searchTerm are strings
  const textStr = String(text);
  const searchTermStr = String(searchTerm);

  // If there's no search term, return the text as is
  if (!searchTermStr) {
    return <span>{textStr}</span>;
  }

  // Split the text into parts based on the search term
  const parts = textStr.split(new RegExp(`(${searchTermStr})`, "gi"));

  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTermStr.toLowerCase() ? (
          <span key={index} className="bg-yellow-200">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default HighlightText;
