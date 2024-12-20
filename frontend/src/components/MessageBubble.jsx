import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/system";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";

const StyledMessageBubble = styled(Box)(({ isUser }) => ({
  maxWidth: "70%",
  padding: "15px 30px",
  borderRadius: "20px",
  backgroundColor: isUser ? "#007aff" : "#e5e5ea",
  color: isUser ? "#ffffff" : "#000000",
  fontSize: "15px",
  fontFamily: "San Francisco, Helvetica, Arial, sans-serif",
  textAlign: "left",
  overflow: "hidden",  
  wordWrap: 'break-word',
  whiteSpace: 'normal'
}));

const MessageBubble = ({ isUser, text }) => {
  const [displayedText, setDisplayedText] = useState('');

  let fullText = text;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + fullText[index]);
      index++;
      if (index >= fullText.length) {
        setDisplayedText((fullText));
        clearInterval(interval);
      }
    }, 0.01);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [fullText]);
  return (
    <StyledMessageBubble isUser={isUser}>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{isUser ? text : displayedText}</ReactMarkdown>
    </StyledMessageBubble>
  );
};

export default MessageBubble; 