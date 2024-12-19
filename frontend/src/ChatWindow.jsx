import React, { useState, useRef, useEffect } from "react";
import { Box, TextField, Typography, IconButton, Button, Select, MenuItem, Paper } from "@mui/material";
import { Settings, Send, AttachFile, Search, OpenInNew, Language, DarkMode, LightMode, Add } from "@mui/icons-material";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import ChatAvatar from "./ChatAvatar";
import LoadingDots from "./LoadingDots";

export default function ChatWindow() {
  const [showSelect, setShowSelect] = useState(false);
  const [showList, setShowList] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode
  const [selectedModel, setSelectedModel] = useState("gemini-2.0"); // Default model

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


  const fetchResponse = async (userMessage) => {
    try {
      const response = await axios.post("http://192.168.0.107:5002/api/process", {
        query: userMessage,
      });
      if (response.status === 200) {
        return response.data;
      } else {
        console.error(`Error: Received status code ${response.status}`);
        return {
          response: `Error: Received status code ${response.status}`,
          actions: [],
          images: [],
        };
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      return {
        response: "An error occurred. Please try again later.",
        actions: [],
        images: [],
      };
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const sendMessage = async (message) => {
    if (!message || !message.trim()) return;

    const userMessage = { text: message, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const loadingMessage = { text: "Loading...", sender: "assistant", isLoading: true };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const response = await fetchResponse(message);
      console.log("Response from server:", response);

      const assistantMessage = {
        text: response.response,
        sender: "assistant",
        actions: response.actions || [],
        images: response.images || [],
      };

      setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
    } catch (error) {
      console.error("Error occurred:", error);
      const errorMessage = {
        text: "Oops, something went wrong. Please try again later.",
        sender: "assistant",
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const newChat = async () => {
    try {
      await axios.post("http://192.168.0.107:5002/api/clear_context"); // Clear context in the backend
      setMessages([]); // Clear the messages in the frontend
      setInput(""); // Clear the input field
      console.log("New chat started");
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  const handleAction = (action) => {
    // Implement the logic for handling the action
    // You can add logic here to handle different action types
    // For example, you might want to send a message based on the action
    if (action.type === "search") {
      sendMessage(`${action.data}`);
    } else if (action.type === "ask") {
      sendMessage(`${action.data}`);
    }
    // Add more action handling as needed
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
      height: "100vh",
      overflow: "hidden",
      backgroundColor: isDarkMode ? "#121212" : "#f5f5f7",
      color: isDarkMode ? "#007bff" : "#000000",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <Button onClick={toggleDarkMode} variant="outlined" color="primary" sx={{ marginBottom: "20px" }}>
          {isDarkMode ? <LightMode /> : <DarkMode />}
        </Button>
        <Typography variant="h5" sx={{ color: isDarkMode ? "#007bff" : "#000000" }}>
          <ChatAvatar src="/ai-avatar.png" />
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", width: "100%", padding: "10px", marginBottom: "10px", backgroundColor: isDarkMode ? "#121212" : "#f5f5f7", color: isDarkMode ? "#007bff" : "#000000", borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", flexDirection: "column" }}>
        {messages.map((message, index) => (
          <Box key={index} sx={{ display: "flex", flexDirection: "column", alignItems: message.sender === "user" ? "flex-end" : "flex-start", marginBottom: "10px" }}>
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: message.sender === "user" ? "flex-end" : "flex-start", backgroundColor: isDarkMode ? "#121212" : "#f5f5f7",
              color: isDarkMode ? "#007bff" : "#000000"
            }}>
              {message.sender != "user" ? (
                <>
                  <ChatAvatar src="/ai-avatar.png" />
                  {message.isLoading ? <LoadingDots /> : <MessageBubble isUser={false} text={message.text} />}
                </>

              ) : (
                <>
                  <MessageBubble isUser={true} text={message.text} />
                  <ChatAvatar src="/user-avatar.png" />
                </>
              )}
            </Box>
            {Array.isArray(message.actions) && message.actions.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", flexDirection: "row", marginTop: "10px", gap: "4px" }}>
                {message.actions.map((action, index) => (
                  <Button
                    disabled={isLoading}
                    key={index}
                    onClick={() => handleAction(action)}  // Handle action click
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: "10px", padding: "2px 5px", fontSize: "10px" }}  // Smaller button styles
                  >
                    {action.label.trim()}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        ))}
        <div ref={messageEndRef} />
      </Box>

      <Box sx={{
        display: "flex", width: "100%", alignItems: "center", backgroundColor: isDarkMode ? "#121212" : "#f5f5f7",
        color: isDarkMode ? "#007bff" : "#000000"
      }}>
        <IconButton 
        sx={{
          '&.Mui-disabled': { // Background color when disabled
            color: '#007bff', // Text color when disabled
          },
        }} onClick={newChat} variant="outlined" color="primary" disabled={isLoading}>
          <Add/>
        </IconButton>
        <TextField
          placeholder="Type your message..."
          variant="outlined"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ borderRadius: "5px", color: isDarkMode ? "#007bff" : "#000000", backgroundColor: "#fff" }}
        />
        <IconButton onClick={toggleList} color="primary" variant="outlined" disabled={isLoading}>
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
        </IconButton>
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