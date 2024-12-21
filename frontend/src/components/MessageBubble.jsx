import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/system";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";


const StyledMessageBubble = styled(Box)(({ isUser }) => ({
  maxWidth: "70%",
  padding: "15px 30px",
  borderRadius: "20px",
  backgroundColor: isUser ? "#007aff" : "#ecf0f1",
  color: isUser ? "#ffffff" : "#000000",
  fontSize: "15px",
  fontFamily: "San Francisco, Helvetica, Arial, sans-serif",
  textAlign: "left",
  overflow: "hidden",  
  wordWrap: 'break-word',
  whiteSpace: 'normal'
}));

const MessageBubble = ({ isUser, text, handleLinkClick }) => {
  const [displayedText, setDisplayedText] = useState('');
  const messageEndRef = useRef(null);
  let fullText = text;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + fullText[index]);
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
      index++;
      if (index >= fullText.length) {
        setDisplayedText((fullText));
        
        clearInterval(interval);
      }
    }, 0.001);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [fullText]);
  return (
    <StyledMessageBubble isUser={isUser}>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{isUser ? text : displayedText}</ReactMarkdown>
      <div ref={messageEndRef} />
    </StyledMessageBubble>
  );
};

export default MessageBubble; 