import React, { useState, useContext, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box, Paper, Button } from '@mui/material';
import Grid from '@mui/material/Grid/Grid';
import { Menu as MenuIcon, DarkMode, LightMode } from '@mui/icons-material';
import ChatWindow from '../ChatWindow';
import { AppContext } from "../../context/AppContext"; // Import the context
import PopupMenu from '../PopupMenu';
import { motion } from 'framer-motion';
import AnimatedCard from '../AnimatedCard';
import LoadingDots from '../LoadingDots';
import ImageSlider from './imageSlider';
import StatusBar from './Statusbar';

function Dashboard() {
  const { state, isDarkMode, isLoading, handleLinkClick, handleAction, setIsDarkMode, images, isAlive } = useContext(AppContext);

  const [menuOpen, setMenuOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 1, // Delay between each card animation
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const toggleDarkMode = () => {
    localStorage.setItem('darkMode', isDarkMode)
    setIsDarkMode((prev) => !prev);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    menuOpen && setMenuOpen(false);
  };

  const { keywords, setKeywords, links, setLinks } = useContext(AppContext);

  // Load keywords and links from localStorage on component mount


  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: isDarkMode ? '#353535' : '#dcdde1',
        height: '100vh',
        boxShadow: isDarkMode ? '0px 4px 6px rgba(255, 255, 255, 0.2)' : 'none',
      }}
      onClick={closeMenu}
    >
      <AppBar
        position="static"
        sx={{
          backgroundColor: isDarkMode ? '#232323' : '#e0e0e0',
          color: isDarkMode ? '#e0e0e0' : '#232323',
          zIndex: 1000,
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {/* //add logo here */}
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleMenu}>
              <img src="/app.png" alt="logo" style={{ width: '4rem' }} />
            </IconButton>
            WebChat AI v2.0
          </Typography>

          <IconButton onClick={toggleDarkMode} color="primary" variant="outlined">
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
          <Avatar alt="User" src="/user-avatar.png" />
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleMenu} sx={{ ml: 1 }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Grid container spacing={2} sx={{ padding: 2, height: '90vh' }}>
        <Grid item xs={12} md={3} >
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              height: '45%',
              marginBottom: '20px',
              backgroundColor: isDarkMode ? '#232323' : '#e0e0e0',
              color: isDarkMode ? '#e0e0e0' : '#232323',
              boxShadow: isDarkMode ? '0px 0px 10px rgba(255, 255, 255, 0.2)' : '0px 0px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box>
              <StatusBar/>
            </Box>


          </Paper>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              height: "45%",
              backgroundColor: isDarkMode ? '#232323' : '#e0e0e0',
              color: isDarkMode ? '#e0e0e0' : '#232323',
              boxShadow: isDarkMode ? '0px 0px 10px rgba(255, 255, 255, 0.2)' : '0px 0px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h6"></Typography>
            {images && images.length > 0 && (
              <ImageSlider images={images} isDarkMode={isDarkMode} />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChatWindow style={{height: '90%'}} />
          {/* <Paper elevation={3} sx={{ padding: 2, height: '98%' }}>
          </Paper> */}
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            elevation={3}
            sx={{
              height: '45%',
              mb: "20px",
              backgroundColor: isDarkMode ? '#232323' : '#e0e0e0',
              color: isDarkMode ? '#e0e0e0' : '#232323',
              boxShadow: isDarkMode ? '0px 0px 10px rgba(255, 255, 255, 0.2)' : '0px 0px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            {isLoading && <LoadingDots />}
            {keywords && (
              <motion.div
                variants={containerVariants}
                style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', alignItems: 'right', padding: 20 }}
              >
                {keywords.map((item, index) => (
                  (item.type != "tools") ? (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      key={index} variants={cardVariants} >
                      <Button className="button" onClick={() => handleAction(item)} >
                        <AnimatedCard key={index} title={item.label} content={''} type={item.type} />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={index} variants={cardVariants} initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.3, ease: "easeInOut" }}>
                      <Button onClick={() => newChat()}>
                        <AnimatedCard key={index} title={item.label} content={''} type={item.type} />
                      </Button>
                    </motion.div>
                  )
                ))}
              </motion.div>
            )
            }
            {/* {images && (
              <motion.div
                variants={containerVariants}
                style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'left' }}
              >
                {images.map((item, index) => (
                    <motion.div
                      key={index} variants={cardVariants} initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.3, ease: "easeIn" }}>
                      <img src={item.url} alt="img" style={{ maxWidth: '100px', height: 'auto', margin: '10px' }} />
                    </motion.div>
                ))}
              </motion.div>
            )
            } */}

          </Paper>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              height: '45%',
              overflow: "hidden",
              overflowY: "auto",
              backgroundColor: isDarkMode ? '#232323' : '#e0e0e0',
              color: isDarkMode ? '#e0e0e0' : '#232323',
              boxShadow: isDarkMode ? '0px 0px 10px rgba(255, 255, 255, 0.2)' : '0px 0px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            {isLoading && <LoadingDots />}
            {links && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"

                style={{ display: "flex", flexDirection: "column", alignItems: 'left', justifyContent: "left", flexWrap: 'wrap', height: "auto", listStyleType: "none", gap: "10px", marginBottom: "10px" }}
              >
                <Typography variant="h6">Related links</Typography>
                {links.map((item, index) => (

                  <motion.div
                    key={index} variants={cardVariants} initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.3, ease: "easeInOut" }}>
                    <li className="reflink" onClick={handleLinkClick}>
                      <a sx={{
                        backgroundColor: isDarkMode ? "#2f3640" : "#f5f5f7",
                        color: isDarkMode ? "#007bff" : "#000000",

                      }} href={item}>{item}</a>
                    </li>
                  </motion.div>

                ))}
              </motion.div>
            )
            }
          </Paper>
        </Grid>
      </Grid>
      <PopupMenu isOpen={menuOpen} onClose={toggleMenu} />
    </Box>
  );
}

export default Dashboard;