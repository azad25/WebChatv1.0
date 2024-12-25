import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINT } from '../config/config';
import { WebSocketProvider, useWebSocket } from './WebSocketContext';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { socket } = useWebSocket() || {};
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [links, setLinks] = useState([]);
  const [images, setImages] = useState([]);
  const [cardData, setCardData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel] = useState("gemini-2.0");
  const [response, setResponse] = useState([]);
  const [ isAlive, setIsAlive ] = useState(true);

  const [state, setState] = useState({});

  useEffect(() => {
    let savedKeywords = [];
    let savedLinks = [];
    let savedImages = [];
    let savedDarkMode = false;

    try {
        const keywords = localStorage.getItem('keywords');
        savedKeywords = keywords ? JSON.parse(keywords) : [];
    } catch {
        savedKeywords = []; // Default to empty array on error
    }

    try {
        const links = localStorage.getItem('links');
        savedLinks = links ? JSON.parse(links) : [];
    } catch {
        savedLinks = []; // Default to empty array on error
    }

    try {
      const images = localStorage.getItem('images');
      savedImages = images ? JSON.parse(images) : [];
  } catch {
      savedImages = []; // Default to empty array on error
  }

    savedDarkMode = localStorage.getItem('darkMode') === 'true'; // Ensure it's a boolean

    if (savedKeywords && savedKeywords.length) setKeywords(savedKeywords);
    if (savedLinks && savedLinks.length) setLinks(savedLinks);
    if (savedImages && savedImages.length) setImages(savedImages);
    if (isDarkMode === savedDarkMode) setIsDarkMode(savedDarkMode)
  }, [setKeywords, setLinks, setImages, setIsDarkMode]);

  // Save keywords and links to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('links', JSON.stringify(links));
    localStorage.setItem('keywords', JSON.stringify(keywords));
    localStorage.setItem('images', JSON.stringify(images));
    localStorage.setItem('darkMode', isDarkMode);
  }, [keywords, links, images, isDarkMode]);


  const fetchConversationHistory = (messages) => {
    const formattedMessages = messages && messages.map((message) => {
      if (message && typeof message.content === "string") {
        return {
          text: message.content.trim(),
          sender: message.role,
        };
      } else {
        if (messages && messages.length > 0) {
          return {
            text: message.content ? message.content.response : message.response,
            sender: message.role,
            actions: message.content ? message.content.actions || [] : message.actions,
          };
        }
      }
    });
    setIsLoading(false)
    return formattedMessages;
  };

  useEffect(() => {
    if (socket) {
      // Listen for "ping" messages from the server
      socket.on('disconnect', () => {
        setIsAlive(false);
      });
      socket.on('ping', (data) => {
        setIsAlive(true);
        // Respond with a "pong"
        socket.emit('pong', { message: 'pong' });
      });
      socket.on('response', (data) => {
        setResponse(data);
      });
    }

    

    return () => {
      if (socket) {
        socket.off('response');
      }
    };
  }, [socket, isAlive]);

  useEffect(() => {
    if (response) {
      const formattedMessages = fetchConversationHistory(response);
      setMessages((prevMessages) => [...prevMessages, ...formattedMessages]);
    }
  }, [response]);



  const handleLinkClick = (e) => {
    let link = '';
    if (e.target.querySelector('a')) {
      link = e.target.querySelector('a').getAttribute('href').trim();
    }

    if (link && !isLoading) {
      setInput(link);
      sendMessage(link);
    }
  };

  const handleAction = (action) => {
    // Implement the logic for handling the action
    // You can add logic here to handle different action types
    // For example, you might want to send a message based on the action
    setCardData(null);
    sendMessage(`${action.data}`);
  };

  const fetchResponse = async (userMessage) => {
    try {
      // try {
      if (userMessage) {
        socket.emit('send_message', userMessage);
      }
      if (socket) {
        socket.on('response', (data) => {
          setResponse(data);
          setIsLoading(false);
          if (data) {
            setCardData(null);
            let res;
            if (data && data.length > 0) {
              res = data[0];
            } else {
              res = data;
            }
            if (res) {
              setCardData(res.actions);
              setKeywords((prevKeywords) => Array(res.actions).length > 0 ? res.actions : prevKeywords);
              setLinks((prevLinks) => Array(res.links).length > 0 ? res.links : prevLinks);
              setImages((prevImages) => Array(res.images).length > 0 ? res.images : prevImages);
              const assistantMessage = {
                text: res.response,
                sender: "assistant",
                actions: res.actions || [],
                isNew: true,
              };
              setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
              setResponse(null);
            }
            return data;
          } else {
            console.error(`Error: Received status code ${response.status}`);
            return {
              response: `Error: Received status code ${response.status}`,
              actions: [],
              images: [],
            };
          }
        });
      }
    } catch (error) {
      console.error("Error fetching conversation history:", error);
    } finally {
      setIsLoading(false);
    }

  };

  const sendMessage = async (message) => {
    if (!message || !message.trim()) return;

    const userMessage = { text: message, sender: "user", isNew: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const loadingMessage = { text: "Loading...", sender: "assistant", isLoading: true, isNew: false };
    setMessages((prev) => [...prev, loadingMessage]);

    await fetchResponse(message);
  };

  const newChat = async () => {
    // setKeywords(null);
    // setLinks(null);
    try {
      await axios.post(API_ENDPOINT + "/api/clear_context"); // Clear context in the backend
      setMessages([]); // Clear the messages in the frontend
      setInput(""); // Clear the input field
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  // useEffect(() => {
  //   if(response) {
  //     let res = fetchConversationHistory(response)
  //     setMessages((prev) => [...prev, ...res])
  //   }
  // }, [response])

  const setSelectedModel = (model) => {
    setState((prevState) => ({
      ...prevState,
      selectedModel: model,
    }));
  };

  return (
    <AppContext.Provider value={{ isAlive, setIsAlive , socket, state, isDarkMode, setIsDarkMode, keywords, setKeywords, links, setLinks, handleAction, sendMessage, messages, setMessages, cardData, setCardData, fetchResponse, input, setInput, isLoading, setIsLoading, selectedModel, setSelectedModel, handleLinkClick, handleAction, newChat, fetchConversationHistory, response, images, setImages }}>
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    </AppContext.Provider>
  );
};