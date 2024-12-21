// frontend/src/components/AnimatedCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';

const AnimatedCard = ({ title, content, type }) => {
  const backgroundColor = type === "search" ? "#3498db" : type === "help" ? "#2ecc71" : type === "tools" ? "#e74c3c" : type === "card" ? "#ecf0f1" : "#3498db";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <Box sx={{
        minWidth: '100px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        backgroundColor: backgroundColor,
        color: backgroundColor === "#ecf0f1" ? 'black' : 'white',
        padding: '5px 15px',
        cursor: 'pointer',
        fontSize: "0.9rem",
        textTransform: "capitalize",
        ":hover": {
          boxShadow: '0 4px 8px rgba(41, 128, 185, 0.3)',
          transition: 'all 0.3s ease',
          transform: 'scale(1.05)'
        }
      }}>
        <Typography variant="p">
          {title}
        </Typography>
        <Typography variant="body2">
          {content}
        </Typography>
      </Box>
    </motion.div>
  );
};

export default AnimatedCard;