import React, { useState, useRef, useEffect, useContext } from "react";
import { Box, TextField, Typography, IconButton, Button, Select, MenuItem, Paper } from "@mui/material";
import { Settings, Send, AttachFile, Search, OpenInNew, Language, DarkMode, LightMode, Add } from "@mui/icons-material";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import ChatAvatar from "./ChatAvatar";
import LoadingDots from "./LoadingDots";
import AnimatedCard from './AnimatedCard';
import { motion } from 'framer-motion';
import { API_ENDPOINT } from "../config/config";
import { AppContext } from "../context/AppContext"; // Import the context

export default function ChatWindow() {
  const { 
    state, 
    isDarkMode, 
    keywords, 
    setKeywords, 
    links, 
    setLink,
    cardData,
    setCardData,
    sendMessage,
    handleAction,
    fetchResponse,
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    setIsLoading,
    selectedModel,
    setSelectedModel,
    handleLinkClick,
    newChat
   } = useContext(AppContext); // Use context
  const [showSelect, setShowSelect] = useState(false);
  const [showList, setShowList] = useState(false);

  const inputRef = useRef(null);
  const messageEndRef = useRef(null);

  const toggleSelect = () => {
    setShowSelect((prev) => !prev);
  };

  const toggleList = () => {
    setShowList((prev) => !prev);
  };

  const handleSelect = (model) => {
    setSelectedModel(model);
    setShowList(false); // Hide the list after selection
  };

  // const handleSelectChange = (event) => {
  //   setSelectedModel(event.target.value);
  //   setShowSelect(false); // Hide the select box after selection
  // };

  const models = [
    { value: "gemini-2.0", label: "Gemini 2.0" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "llama3.1", label: "LLama 3.1" },
  ];

  useEffect(() => {
    const fetchConversationHistory = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(API_ENDPOINT + "/api/get_conversation_history");
        if (response.status === 200) {
          const formattedMessages = response.data.map((message) => {
            if (typeof message.content === "string") {
              return {
                text: message.content.trim(),
                sender: message.role,
              };
            } else {
              return {
                text: message.content.response,
                sender: message.role,
                actions: message.content.actions || [],
              };
            }
          });
          setMessages(formattedMessages);
        } else {
          console.error(`Error: Received status code ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching conversation history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversationHistory();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage(input);
    }
  };


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload logic here (e.g., send to backend)
      console.log("File uploaded:", file);
      // You can also send the file to your backend if needed
    }
  };

  const handleSearchWeb = (input) => {
    // Implement web search logic here
    const searchQuery = input.trim();
    if (searchQuery) {
      sendMessage(searchQuery);
    } else {
      console.log("No search query provided.");
    }
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      height: "88vh",
      overflow: "hidden",
      borderRadius: "10px",
      backgroundColor: isDarkMode ? "#232323" : '#e0e0e0',
      color: isDarkMode ? "#007bff" : "#000000",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      {/* <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <Button onClick={toggleDarkMode} color="primary" sx={{ marginBottom: "20px" }}>
          {isDarkMode ? <LightMode /> : <DarkMode />}
        </Button>
        <Typography variant="h5" sx={{ color: isDarkMode ? "#007bff" : "#000000" }}>
          <ChatAvatar src="/ai-avatar.png" />
        </Typography>
      </Box> */}


      <Box sx={{
        flex: 1, overflowY: "auto", width: "100%", height: "100vh", padding: "10px", marginBottom: "10px", backgroundColor: isDarkMode ? "#232323" : '#e0e0e0', color: isDarkMode ? "#007bff" : "#000000", borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", flexDirection: "column",
        scrollbarWidth: "none", // For Firefox
        "&::-webkit-scrollbar": {
          display: "none", // For Chrome, Safari, and Opera
        }
      }}>
        {messages.map((message, index) => (
          <Box key={index} sx={{ display: "flex", flexDirection: "column", alignItems: message.sender === "user" ? "flex-end" : "flex-start", marginBottom: "20px" }}>
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: message.sender === "user" ? "flex-end" : "flex-start", backgroundColor: isDarkMode ? "#232323" : '#e0e0e0',
              color: isDarkMode ? "#007bff" : "#000000"
            }} onClick={handleLinkClick}
            >
              {message.sender != "user" ? (
                <>
                  <ChatAvatar src="/ai-avatar.png" />
                  {message.isLoading ? <LoadingDots /> : <MessageBubble key={index} isUser={false} text={message.text} isNew={message.isNew} />}

                </>

              ) : (
                <>
                  <MessageBubble isUser={true} text={message.text} />
                  <ChatAvatar src="/user-avatar.png" />
                </>
              )}
            </Box>
            {/* {Array.isArray(message.actions) && message.actions.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", flexDirection: "row", marginTop: "10px", gap: "4px" }}>
                {message.actions.map((action, index) => (
                  
                  action.type === "card" ? (
                    <Button
                    disabled={isLoading}
                    key={index}
                    onClick={() => handleAction(action)}  // Handle action click
                    variant="contained"
                    sx={{ borderRadius: "20px", padding: "2px 5px", fontSize: "10px", backgroundColor: "#e74c3c", color: "white" }}  // Smaller button styles
                  >
                    {action.label.trim()}
                  </Button>
                  ) : 
                  action.type === "help" ? (
                  <Button
                    disabled={isLoading}
                    key={index}
                    onClick={() => handleAction(action)}  // Handle action click
                    variant="contained"
                    sx={{ borderRadius: "20px", padding: "2px 5px", fontSize: "10px", backgroundColor: "#2ecc71", color: "white" }}  // Smaller button styles
                  >
                    {action.label.trim()}
                  </Button>) :
                  action.type === "tools" && (
                    <Button
                    disabled={isLoading}
                    key={index}
                    onClick={() => handleAction(action)}  // Handle action click
                    variant="contained"
                    sx={{ borderRadius: "10px", padding: "2px 5px", fontSize: "10px", backgroundColor: "#f1c40f", color: "black" }}  // Smaller button styles
                  >
                    {action.label.trim()}
                  </Button>
                  )
                  // <Button
                  //   disabled={isLoading}
                  //   key={index}
                  //   onClick={() => handleAction(action)}  // Handle action click
                  //   variant="contained"
                  //   color="primary"
                  //   sx={{ borderRadius: "10px", padding: "2px 5px", fontSize: "10px" }}  // Smaller button styles
                  // >
                  //   {action.label.trim()}
                  // </Button>
                ))}
              </Box>
            )} */}
          </Box>
        ))}
        <div ref={messageEndRef} />
      </Box>
      <Box
        sx={{
          flexDirection: "row",
          width: "100%",
          marginBottom: "10px",
          overflow: "hidden",
          overflowX: "auto", // Allow horizontal scrolling
          scrollbarWidth: "none", // For Firefox
          "&::-webkit-scrollbar": {
            display: "none", // For Chrome, Safari, and Opera
          },
        }}
      >
        {/* {links && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: "flex", alignItems: 'left', justifyContent: "left", flexWrap: 'wrap', height: "auto", listStyleType: "none", gap: "10px", marginBottom: "10px", width: "100vw" }}
          >
            {links.map((item, index) => (

              <motion.div
                key={index} variants={cardVariants} sx={{}}>
                <li className="reflink" onClick={handleLinkClick}>
                  <a sx={{
                    backgroundColor: isDarkMode ? "#232323" : "#f5f5f7",
                    color: isDarkMode ? "#007bff" : "#000000",

                  }} href={item}>{item}</a>
                </li>
              </motion.div>

            ))}
          </motion.div>
        )
        } */}
        {/* {cardData && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'right', width: "100vw" }}
          >
            {cardData.map((item, index) => (
              (item.type != "tools") ? (
                <motion.div
                  key={index} variants={cardVariants}>
                  <Button className="button" onClick={() => handleAction(item)} sx={{ fontSize: "10px" }}>
                    <AnimatedCard key={index} title={item.label} content={''} type={item.type} />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key={index} variants={cardVariants}>
                  <Button onClick={() => newChat()}>
                    <AnimatedCard key={index} title={item.label} content={''} type={item.type} />
                  </Button>
                </motion.div>
              )
            ))}
          </motion.div>
        )
        } */}

      </Box>

      <Box sx={{
        display: "flex", width: "100%", alignItems: "center", backgroundColor: isDarkMode ? "#232323" : "#f5f5f7",
        color: isDarkMode ? "#007bff" : "#000000", borderRadius: "50px", padding: "10px", boxSizing: "border-box"
      }}>
        <IconButton
          sx={{
            '&.Mui-disabled': { // Background color when disabled
              color: '#007bff', // Text color when disabled
            },
          }} onClick={newChat} variant="outlined" color="primary" disabled={isLoading}>
          <Add />
        </IconButton>
        <TextField
          placeholder="Type your message..."
          variant="outlined"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ borderRadius: "20px", color: isDarkMode ? "#007bff" : "#000000", backgroundColor: "#fff" }}
          disabled={isLoading}
        />

        {/* <IconButton onClick={toggleList} color="primary" variant="outlined" disabled={isLoading}>
                <Settings />
            </IconButton>
          {showList && (
                <Paper elevation={3} sx={{ position: 'relative', zIndex: 1, marginTop: '0.5rem' }}>
                    {models.map((model) => (
                        <MenuItem key={model.value} onClick={() => handleSelect(model.value)}
                        sx={{
                          backgroundColor: selectedModel === model.value ? '#007bff' : 'inherit', // Primary color for selected item
                          color: selectedModel === model.value ? '#fff' : 'inherit', // White text for selected item
                          '&:hover': {
                              backgroundColor: selectedModel === model.value ? '#0056b3' : '#f0f0f0', // Darker shade on hover for selected item
                          },
                      }}>
                            {model.label}
                        </MenuItem>
                    ))}
                </Paper>
            )}
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <IconButton component="span" color="primary" variant="outlined" disabled={isLoading}>
            <AttachFile />
          </IconButton>
        </label>
        
        <IconButton 
        sx={{
          '&.Mui-disabled': { // Background color when disabled
            color: '#007bff', // Text color when disabled
          },
        }} onClick={() => handleSearchWeb(input)} color="primary" disabled={isLoading}>
          <Language />
        </IconButton> */}
        <IconButton onClick={() => sendMessage(input)} color="primary" disabled={isLoading}
          sx={{
            '&.Mui-disabled': { // Background color when disabled
              color: '#007bff', // Text color when disabled
            },
          }}>
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
}