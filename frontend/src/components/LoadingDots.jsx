import React from "react";
import { Box } from "@mui/material";
import { styled, keyframes } from "@mui/system";

const loadingAnimation = keyframes`
  0% { opacity: 0.1; }
  50% { opacity: 1; }
  100% { opacity: 0.1; }
`;

const StyledLoadingDots = styled(Box)({
  display: "flex",
  justifyContent: "left",
  alignItems: "left",
  '& div': {
    width: '8px',
    height: '8px',
    margin: '0 4px',
    borderRadius: '50%',
    backgroundColor: '#007aff',
    animation: `${loadingAnimation} 1s infinite`,
  },
  '& div:nth-child(2)': {
    animationDelay: '0.2s',
  },
  '& div:nth-child(3)': {
    animationDelay: '0.4s',
  }
});

const LoadingDots = () => {
  return (
    <StyledLoadingDots>
      <div></div>
      <div></div>
      <div></div>
    </StyledLoadingDots>
  );
};

export default LoadingDots; 