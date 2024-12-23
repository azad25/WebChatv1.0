// frontend/src/context/AppContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [links, setLinks] = useState([]);
  const [cardData, setCardData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel] = useState("gemini-2.0");

  const [state, setState] = useState({
    isDarkMode: false,
    selectedModel: 'gemini-2.0',
    // Add other global states here
  });

  useEffect(() => {
    const savedKeywords = localStorage.getItem('keywords');
    const savedLinks = localStorage.getItem('links');
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedKeywords) setKeywords(JSON.parse(savedKeywords));
    if (savedLinks) setLinks(JSON.parse(savedLinks));
    if (savedDarkMode) setIsDarkMode(savedDarkMode);
  }, [setKeywords, setLinks, setIsDarkMode]);

  // Save keywords and links to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('links', JSON.stringify(links));
    localStorage.setItem('keywords', JSON.stringify(keywords));
    localStorage.setItem('darkMode', isDarkMode);
  }, [keywords, links, isDarkMode]);

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
      const response = await axios.post(API_ENDPOINT + "/api/process", {
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

  const sendMessage = async (message) => {
    if (!message || !message.trim()) return;

    const userMessage = { text: message, sender: "user", isNew: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const loadingMessage = { text: "Loading...", sender: "assistant", isLoading: true, isNew: false };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const response = await fetchResponse(message);
      let res;
      //response can be array or object

      //clear card data
      setCardData(null);
      if (response.length > 0) {
        if (Array.isArray(response)) {
          res = response[0];
        } else {
          res = response.text;
        }
        setCardData(res.actions);
        setKeywords(Array(res.actions).length > 0 ? res.actions : keywords);
        setLinks(Array(res.links).length > 0 ? res.links : links);
        const assistantMessage = {
          text: res.response,
          sender: "assistant",
          actions: res.actions || [],
          images: res.images || [],
          isNew: true,
        };

        setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
      }


    } catch (error) {
      console.error("Error occurred:", error);
      const errorMessage = {
        text: "Oops, something went wrong. Please try again later.",
        sender: "assistant",
        isNew: false,
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const newChat = async () => {
    setKeywords(null);
    setLinks(null);
    try {
      await axios.post(API_ENDPOINT + "/api/clear_context"); // Clear context in the backend
      setMessages([]); // Clear the messages in the frontend
      setInput(""); // Clear the input field
      cardData = [];
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setSelectedModel = (model) => {
    setState((prevState) => ({
      ...prevState,
      selectedModel: model,
    }));
  };

  return (
    <AppContext.Provider value={{ state, isDarkMode, setIsDarkMode ,toggleDarkMode, keywords, setKeywords, links, setLinks, handleAction, sendMessage, messages, setMessages, cardData, setCardData, fetchResponse, input, setInput, isLoading, setIsLoading, selectedModel, setSelectedModel, handleLinkClick, handleAction, newChat }}>
      {children}
    </AppContext.Provider>
  );
};