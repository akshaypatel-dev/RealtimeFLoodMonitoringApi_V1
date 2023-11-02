import React from 'react';
import notificationIcon from './images/Notification Bell Badge Logo.png'
import './App.css';

function App() {
  return (
    <div className="App">
      <div className='headerContainer'>
      <img className='imgStyle' src={notificationIcon} alt="" />
        <h1 className='header'> Welcome to Realtime Flood Monitoring APP </h1>

      </div>
     
    </div>
  );
}

export default App;
