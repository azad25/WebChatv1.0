import React, { useState, useEffect } from 'react';
import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps';
import { Typography, Box } from '@mui/material'
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { motion } from 'framer-motion';
import TypewriterText from './TypeWriter';

const StatusBar = () => {
  const position = { lat: 53.54992, lng: 10.00678 };
  const [welcomeMessage, setWelcomeMessage] = useState("Hello, there, aim your AI assistant...");
  const [weather, setWeather] = useState(null);
  const [aiStatus, setAiStatus] = useState("Working on it...");
  const [eventLogs, setEventLogs] = useState([]);
  const [randomText, setRandomText] = useState("Some AI response");
  const { isAlive } = useContext(AppContext);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [quotesIndex, setQuotesIndex] = useState(0);

  // Define animation variants for the circle
  const circleVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const messages = [
    "Hello, there, I am your AI assistant...",
    "Welcome to the AI Dashboard",
    "WebChat is here to help...",
  ];

  const randomQuotes = [
    "Keep pushing forward!",
    "AI is the future.",
    "Embrace the possibilities.",
  ];

  useEffect(() => {
    let timeout;
    if (isTypingComplete) {
      timeout = setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
        setQuotesIndex((prev) => (prev + 1) % randomQuotes.length);
        setIsTypingComplete(false);
      }, 1000); // 1 second transition between messages
    }


    setWelcomeMessage((prev) => messages[(messages.indexOf(prev) + 1) % messages.length]);
    setRandomText(randomQuotes[Math.floor(Math.random() * randomQuotes.length)]);


    // const quoteInterval = setInterval(() => {
    //   setRandomText(randomQuotes[Math.floor(Math.random() * randomQuotes.length)]);
    // }, 5000);

    // Fetch weather data
    // axios.get('/api/weather').then((response) => {
    //   setWeather(response.data);
    // });

    // // Fetch event logs
    // axios.get('/api/event-logs').then((response) => {
    //   setEventLogs(response.data);
    // });

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isTypingComplete, messages.length]);

  useEffect(() => {
    setWelcomeMessage(messages[messageIndex]);
  }, [messageIndex, messages]);

  const handleTypingComplete = () => {
    setIsTypingComplete(true);
  };

  return (
    <div style={{}}>
      <Typography variant="p">
        <TypewriterText
          text={messages[messageIndex]}
          onComplete={handleTypingComplete}
          delay={3000}
        />
      </Typography>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, marginRight: '10px' }}>
          <h3>
          <motion.div
          style={{
            width: '10px',
            height: '10px',
            marginRight: '10px',
            borderRadius: '50%',
            backgroundColor: isAlive ? '#2ecc71' : "#e74c3c",
            position: "relative",
            display: "inline-block",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
          }}
          variants={circleVariants}
          initial="hidden"
          animate="visible"
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 0.8,
          }}
        />
            {isAlive ? "Online" : "Offline"}
          </h3>
          <p>{aiStatus}</p>
          <p>
          <TypewriterText
          text={randomQuotes[quotesIndex]}
          onComplete={handleTypingComplete}
          delay={3000}
        />
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: '100%', overflow: 'hidden', backgroundColor: '#2a2a2a', padding: '10px', borderRadius: '5px', color: "#2ecc71", fontSize: "12px" }}>
            {eventLogs.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
            <p>POST req to /api/process</p>
            <p>processing...</p>
            <p>Gathering data....</p>
            <p>Searching for data....</p>
            <p>POST req to /api/process</p>
          </div>
        </div>
      </div>
  
        <Box sx={{marginTop: '15%', display: 'flex', flexDirection: 'row', alignItems: 'left', justifyContent: 'space-between'}}>
        <div>
          <Typography variant="h6">Weather</Typography>
          {weather ? (
            <div>
              <p>{weather.location}</p>
              <p>{weather.temperature}°C</p>
              <p>{weather.condition}</p>
            </div>
          ) : (
            <p>Loading weather...</p>
          )}
        </div>
          <div style={{ width: '200px', height: '150px', marginTop: '10px', borderRadius: '15px' }}>
          <APIProvider apiKey={'AIzaSyBnVkT9wiLnMv_RQmVIEkb-meUgPL2qXKs'}>
            <Map defaultCenter={position} defaultZoom={10} mapId="4f9e5a305631374e">
              <AdvancedMarker position={position} />
            </Map>
          </APIProvider>
        </div>
        </Box>
      
    </div>
  );
};

export default StatusBar;