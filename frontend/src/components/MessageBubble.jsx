import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/system";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";


const StyledMessageBubble = styled(Box)(({ isUser }) => ({
  maxWidth: "70%",
  padding: "15px 30px",
  borderRadius: "20px",
  backgroundColor: isUser ? "#007aff" : "#b2bec3",
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
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!text) return;

    let index = 0;

    const displayTextAsync = async () => {
      while (index < text.length) {
        await new Promise((resolve) => setTimeout(resolve, 0.001));
        setDisplayedText((prev) => prev + text[index]);
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        index++;
      }
    };

    displayTextAsync();

    return () => setDisplayedText('');
  }, [text]);

  return (
    <StyledMessageBubble isUser={isUser}>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{isUser ? text : displayedText}</ReactMarkdown>
      <div ref={messageEndRef} />
    </StyledMessageBubble>
  );
};

export default MessageBubble; 