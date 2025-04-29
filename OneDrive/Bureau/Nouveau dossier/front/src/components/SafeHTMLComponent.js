// src/components/SafeHTMLComponent.js
import React from "react";
import DOMPurify from "dompurify";

function SafeHTMLComponent({ userInput }) {
  // Sanitize the input before inserting it into the DOM
  const sanitizedHTML = DOMPurify.sanitize(userInput);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
}

export default SafeHTMLComponent;
