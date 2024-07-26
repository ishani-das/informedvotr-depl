import React from 'react';
import DOMPurify from 'dompurify';

const HtmlContent = ({ html }) => {
  // Sanitize the HTML content
  const sanitizedHtml = DOMPurify.sanitize(html);

  return (
    <div
      className="html-content"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default HtmlContent;
