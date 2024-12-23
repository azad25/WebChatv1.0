import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/system";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";

const StyledMessageBubble = styled(Box)(({ isUser }) => ({
  maxWidth: "70vw",
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

const MessageBubble = ({ isUser, text, isNew }) => {
  const [displayedText, setDisplayedText] = useState(isNew ? '' : text);
  const [index, setIndex] = useState(null)
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!text || !isNew) return;

    
    const displayTextAsync = async () => {
      let key = 0;
      while (key < text.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 0.001));
        
        index < text.length && setDisplayedText((prev) => prev + text[key]);

        if (messageEndRef.current) {
          messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }

        setIndex(key)
        key++;
      }
    };
    
    displayTextAsync();
    return () => setDisplayedText('');
  }, [text, isNew]);

  return (
    <StyledMessageBubble isUser={isUser}>
      <ReactMarkdown rehypePlugins={[rehypeRaw]} >{ isUser ? text : displayedText }</ReactMarkdown>
      <div ref={messageEndRef} />
    </StyledMessageBubble>
  );
};

export default MessageBubble; 