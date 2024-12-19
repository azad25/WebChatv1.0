import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/system";
import ReactMarkdown from 'react-markdown';

const StyledMessageBubble = styled(Box)(({ isUser }) => ({
  maxWidth: "70%",
  padding: "0 10px",
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
        clearInterval(interval);
      }
    }, 1);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [fullText]);
  return (
    <StyledMessageBubble isUser={isUser}>
      <ReactMarkdown>{isUser ? text : displayedText}</ReactMarkdown>
    </StyledMessageBubble>
  );
};

export default MessageBubble; 