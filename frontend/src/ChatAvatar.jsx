import React from "react";
import { Avatar } from "@mui/material";

const ChatAvatar = ({ src }) => {
  return <Avatar sx={{ marginLeft: "10px", marginRight: "10px" }} src={src} />;
};

export default ChatAvatar; 