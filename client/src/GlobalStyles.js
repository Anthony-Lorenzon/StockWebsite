import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f0f0f0; 
    color: #333; 
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  
  button {
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  
  h1 {
    color: #333;
  }
`;

export default GlobalStyles;
