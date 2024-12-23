import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';

const menuVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { duration: 0.3 } },
};

const PopupMenu = ({ isOpen, onClose }) => {
  return (
    <motion.div
      initial="hidden"
      animate={isOpen ? "visible" : "hidden"}
      variants={menuVariants}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '200px',
        height: 'auto',
        backgroundColor: '#fff',
        boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
        zIndex: 1000,
      }}
    >
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6">Menu</Typography>
        <List>
          <ListItem button onClick={onClose}>
            <ListItemText primary="Option 1" />
          </ListItem>
          <ListItem button onClick={onClose}>
            <ListItemText primary="Option 2" />
          </ListItem>
          <ListItem button onClick={onClose}>
            <ListItemText primary="Option 3" />
          </ListItem>
        </List>
      </Box>
    </motion.div>
  );
};

export default PopupMenu;
