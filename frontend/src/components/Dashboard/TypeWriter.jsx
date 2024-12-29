import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square } from '@mui/icons-material';

const TypewriterText = ({ text, onComplete, typingSpeed = 100, pauseDuration = 2000 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText(''); // Reset text when input changes

    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Add a delay before calling onComplete
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, pauseDuration); // Pause after typing completes
      }
    }, typingSpeed);

    return () => {
      clearInterval(typingInterval);
    };
  }, [text, onComplete, typingSpeed, pauseDuration]);

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
          style={{ marginLeft: '2px' }}
        >
          <Square sx={{ height: '12px', position: "relative", top: "2px", right: "5px" }} />
        </motion.span>
      </motion.span>
    </AnimatePresence>
  );
};
export default TypewriterText;