/**
 * Index.js - React Application Entry Point
 * 
 * This file renders the main App component into the DOM.
 * It's the starting point for the React frontend application.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
