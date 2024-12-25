import React, { useState, useEffect, useRef } from 'react';
import { IconButton, Box, Paper, Typography } from '@mui/material';
import { ArrowBack, ArrowForward, PauseCircle, PlayCircle } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ImageSlider = ({ images, isDarkMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const imageRefs = useRef(null)
  
  // Auto-slide effect
  useEffect(() => {
    let interval;
    if (isPlaying && images.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000); // Change slide every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isPlaying, images.length]);

  if (!images || images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const previousImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const selectImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      height: '20rem',
      width: '100%'
    }}>
      {/* Thumbnails */}
      <Paper
        elevation={3}
        sx={{
          width: '100px',
          height: '100%',
          overflowY: 'auto',
          backgroundColor: isDarkMode ? '#232323' : '#e0e0e0',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: isDarkMode ? '#666' : '#999',
            borderRadius: '3px',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
          {images.map((image, index) => (
            <motion.img
              key={index}
              src={image.url && image.url}
              alt={image.alt || `Thumbnail ${index + 1}`}
              onClick={() => selectImage(index)}
              whileHover={{ scale: 1.05 }}
              style={{
                width: '100%',
                height: '60px',
                objectFit: 'cover',
                cursor: 'pointer',
                border: currentIndex === index ? 
                  `2px solid ${isDarkMode ? '#fff' : '#000'}` : 
                  '2px solid transparent',
                borderRadius: '4px',
                opacity: currentIndex === index ? 1 : 0.7,
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Main Slider */}
      <Paper
        elevation={3}
        sx={{
          position: 'relative',
          flex: 1,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: isDarkMode ? '#232323' : '#e0e0e0',
        }}
      >
        <IconButton
          onClick={previousImage}
          sx={{
            position: 'absolute',
            left: 0,
            zIndex: 2,
            color: isDarkMode ? '#fff' : '#000',
          }}
        >
          <ArrowBack />
        </IconButton>

        <AnimatePresence mode='wait'>
          <motion.img
            key={currentIndex}
            src={images[currentIndex].url}
            alt={images[currentIndex].alt || 'Slider image'}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            style={{
              maxWidth: '90%',
              maxHeight: '180px',
              objectFit: 'contain',
            }}
          />
        </AnimatePresence>

        <IconButton
          onClick={nextImage}
          sx={{
            position: 'absolute',
            right: 0,
            zIndex: 2,
            color: isDarkMode ? '#fff' : '#000',
          }}
        >
          <ArrowForward />
        </IconButton>

        {/* Play/Pause Button */}
        <IconButton
          onClick={() => setIsPlaying(!isPlaying)}
          sx={{
            position: 'absolute',
            bottom: 10,
            zIndex: 2,
            color: isDarkMode ? '#fff' : '#000',
          }}
        >
          {isPlaying ? <PauseCircle /> : <PlayCircle />}
        </IconButton>

        {/* Progress Dots */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            display: 'flex',
            gap: 1,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {images.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: currentIndex === index 
                  ? (isDarkMode ? '#fff' : '#000')
                  : (isDarkMode ? '#666' : '#ccc'),
                cursor: 'pointer',
              }}
              onClick={() => selectImage(index)}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default ImageSlider;