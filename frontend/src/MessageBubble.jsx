import React from "react";
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
  return (
    <StyledMessageBubble isUser={isUser}>
      <ReactMarkdown>{text}</ReactMarkdown>
    </StyledMessageBubble>
  );
};

export default MessageBubble; 