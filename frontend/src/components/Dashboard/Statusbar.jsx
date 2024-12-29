import React, { useState, useEffect } from 'react';
import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps';
import { Typography, Box } from '@mui/material'
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { motion } from 'framer-motion';
import TypewriterText from './TypeWriter';
import LoadingDots from '../LoadingDots';

const StatusBar = () => {
  const position = { lat: 23.8103, lng: 90.4125 };
  const [welcomeMessage, setWelcomeMessage] = useState("Hello, there, aim your AI assistant...");
  const [aiStatus, setAiStatus] = useState("Working on it...");
  const [eventLogs, setEventLogs] = useState([]);
  const [randomText, setRandomText] = useState("Some AI response");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [quotesIndex, setQuotesIndex] = useState(0);
  const { state, logs, weather, isAlive, isLoading } = useContext(AppContext);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);  // Track current log being typed
  const [logIndex, setLogIndex] = useState(0);  // Track current log being typed

  // Function to handle completion of typing animation for logs
  const handleQuotesTypingComplete = () => {
    setQuotesIndex((prev) => (prev + 1) % quotesIndex.length); // Move to the next log, loop back to start
  };

  // Handle completion of each log typing
  const handleLogComplete = () => {
    setTimeout(() => {
      setCurrentLogIndex((prev) => {
        if (logs && logs.length > 0) {
          return (prev + 1) % logs.length;
        }
        return prev;
      });
    }, typingConfig.pauseDuration);
  };

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

  const logVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      x: -20
    }
  };

  // Standardized typing configuration
  const typingConfig = {
    typingSpeed: 20,    // Consistent speed across all sections
    pauseDuration: 120 // Reduced pause duration between logs
  };

  useEffect(() => {
    let timeout;
    if (isTypingComplete) {
      timeout = setTimeout(() => {
      }, 10); // 1 second transition between messages
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

    };
  }, [isTypingComplete, messages.length]);

  useEffect(() => {
    setWelcomeMessage(messages[messageIndex]);
  }, [messageIndex, messages]);

  const handleTypingComplete = () => {
    setIsTypingComplete(true);
  };

  // Ensure quotesIndex stays within bounds
  useEffect(() => {
    if (isTypingComplete) {
      setQuotesIndex((prev) => (prev + 1) % randomQuotes.length);
    }
    console.log(isLoading)
  }, [isTypingComplete, randomQuotes.length, isLoading]);

  return (
    <div style={{}}>
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
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, marginRight: '10px', overflow: 'hidden' }}>
          
          <div style={{
            position: 'relative',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            width: '80%',
            maxWidth: '80%',
            backgroundColor: 'transparent',
            borderRadius: '5px',
            height: '120px', 
            fontWeight: 'bold',
            marginTop: "10px"
          }}>
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {logs && logs.map((log, index) => (
                <motion.div
                  key={log.id}
                  variants={logVariants}
                  style={{
                    marginBottom: '5px',
                    opacity: log.status === 'error' ? 0.7 : 1,
                    // color: log.status === 'error' ? '#e74c3c' : '#2ecc71',
                    color: isAlive ? "#27ae60" : "#e74c3c",
                    fontSize: "8px"
                  }}
                >
                  {index === currentLogIndex ? (
                    <TypewriterText
                      text={`${new Date(log.timestamp).toLocaleTimeString()} [${log.event_type}] ${log.message}`}
                      onComplete={handleLogComplete}
                      typingSpeed={typingConfig.typingSpeed}
                      pauseDuration={typingConfig.pauseDuration}
                    />
                  ) : index < currentLogIndex ? (
                    <span>
                      {`${new Date(log.timestamp).toLocaleTimeString()} [${log.event_type}] ${log.message}`}
                    </span>
                  ) : null}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
        <Box>
            <p>{aiStatus}</p>
            <p>
              {messages[0]}
              {isLoading && <LoadingDots />}
            </p>
          </Box>
        </div>
      </div>

      <Box sx={{ marginTop: '5%', display: 'flex', flexDirection: 'row', alignItems: 'left', justifyContent: 'space-between' }}>
        <div style={{ width: '200px', height: '150px', marginTop: '20px', borderRadius: '15px' }}>
          {weather ? (
            <div>
              <p>{weather.city}, {weather.country}</p>
              <p>{weather.temperature}°C</p>
              <p>Feels like: {weather.feels_like}°C</p>
              <p>Humidity: {weather.humidity}%</p>
              <p>Wind Speed: {weather.wind_speed} m/s</p>
              <p>{weather.description}</p>
            </div>
          ) : (
            <LoadingDots />
          )}
        </div>
        <div style={{ width: '50%', maxHeight: '120px', marginTop: '10px', borderRadius: '15px' }}>
          <APIProvider apiKey={'AIzaSyBnVkT9wiLnMv_RQmVIEkb-meUgPL2qXKs'}>
            <Map defaultCenter={position} defaultZoom={10} mapId="61a3b3b1647fb009">
              <AdvancedMarker position={position} />
            </Map>
          </APIProvider>
        </div>
      </Box>

    </div>
  );
};

export default StatusBar;