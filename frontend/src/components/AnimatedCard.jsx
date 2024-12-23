// frontend/src/components/AnimatedCard.jsx
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { Backspace, NotificationsActiveIcon } from "@mui/icons-material";
import { AppContext } from "../context/AppContext"; // Import the context

const AnimatedCard = ({ title, content, type }) => {
  const { state } = useContext(AppContext); // Use context
  
  const backgroundColor = type === "search" ? "#3498db" : type === "help" ? "#2ecc71" : type === "tools" ? "#e74c3c" : type === "card" ? "#fdcb6e" : "#3498db";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <Box sx={{
        borderRadius: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        backgroundColor: backgroundColor,
        color: backgroundColor === "#fdcb6e" ? 'black' : 'white',
        padding: '5px 15px',
        cursor: 'pointer',
        fontSize: "10px",
        textTransform: "capitalize",
        ":hover": {
          boxShadow: '0 4px 8px rgba(41, 128, 185, 0.3)',
          transition: 'all 0.3s ease',
          transform: 'scale(1.05)'
        }
      }}>
        <Typography variant="body2" sx={{display: "flex", alignItems: "center", gap: "5px"}}>
          <Typography variant="p">
            {title}
          </Typography>
          {type === "tools" && <Backspace/>} 
        </Typography>
        
        <Typography variant="body2">
          {content}
        </Typography>
      </Box>
    </motion.div>
  );
};

export default AnimatedCard;