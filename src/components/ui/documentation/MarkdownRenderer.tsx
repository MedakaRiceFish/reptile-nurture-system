
import React, { useEffect, useState } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const [html, setHtml] = useState("");
  
  useEffect(() => {
    // Convert markdown to HTML
    const htmlContent = marked(content);
    setHtml(htmlContent);
  }, [content]);
  
  return (
    <div 
      className={`prose prose-stone dark:prose-invert max-w-none ${className}`} 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}
