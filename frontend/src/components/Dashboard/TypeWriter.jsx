import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography } from '@mui/material';
import {Circle} from '@mui/icons-material';

const TypewriterText = ({ text, onComplete, delay }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText(''); // Reset text when input changes

    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Add a delay before calling onComplete
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, delay); // 2 second pause after typing completes
      }
    }, 50);

    return () => {
      clearInterval(typingInterval);
    };
  }, [text, onComplete, delay]);

  return (
    <AnimatePresence mode='wait'>
      <motion.span
        key={text}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {displayedText}
        <motion.span
          animate={{ opacity: [0, 1] }}
          transition={{ repeat: Infinity, duration: 0.7 }}
          style={{ marginLeft: '2px' }}
        >
          <Circle color="primary" sx={{height: '10px'}}/>
        </motion.span>
      </motion.span>
    </AnimatePresence>
  );
};
export default TypewriterText;