import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="loading-screen">
            <div className="loading-container">
                <img src="/logo.jpeg" alt="CityTrail Logo" className="loading-logo" />
                <div className="loading-spinner"></div>
                <h2 className="loading-text">Welcome to CityTrail</h2>
                <p className="loading-subtext">Setting up your ride...</p>
            </div>
            <div className="loading-footer">
                &copy; {new Date().getFullYear()} CityTrail. All rights reserved by <a href="https://eaglebyte.in" target="_blank" rel="noopener noreferrer">EagleByte.in</a>
            </div>
        </div>
    );
};

export default LoadingScreen;

