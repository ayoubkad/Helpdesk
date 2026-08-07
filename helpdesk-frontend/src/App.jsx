import React from 'react';
import Login from './pages/Register';
// import Register from './pages/Register';
import './App.css';
import Register from './pages/Register';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Register />
      {/* Pour tester Register, remplace <Login /> par <Register /> */}
      {/* <Register /> */}
    </div>
  );
}

export default App;