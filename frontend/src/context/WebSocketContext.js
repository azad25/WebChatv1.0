import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_ENDPOINT } from '../config/config';
import { AppContext } from './AppContext';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    const socket = useRef(null);
    const { fetchConversationHistory, setIsLoading } = useContext(AppContext); // Use context
    useEffect(() => {
        // Connect to the WebSocket server
        socket.current = io(API_ENDPOINT);

        // Listen for messages from the server
        socket.current.on('response', (data) => {
            setIsLoading(false)
        });

        socket.current.on('connect', () => {
            fetchConversationHistory()
            setIsLoading(false)
        });

        socket.current.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
        });

        // Cleanup on unmount
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []);

    // const sendMessage = (message) => {
    //     if (socket.current) {
    //         socket.current.send(message);
    //     }
    // };

    return (
        <WebSocketContext.Provider value={{ socket }}>
            {children}
        </WebSocketContext.Provider>
    );
};

// Custom hook for accessing the WebSocket context
export const useWebSocket = () => {
    const socket = useRef(null);

      useEffect(() => {
        socket.current = io(API_ENDPOINT);

        return () => {
          if (socket.current) {
            socket.current.disconnect();
          }
        };
      }, []);

      return { socket: socket.current };
};