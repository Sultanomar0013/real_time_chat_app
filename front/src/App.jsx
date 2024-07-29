// App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './Home'; 
import Messages from './pages/messages'; 
import Home from './pages/home';

function App() {
    return (
        <Router>
            

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/messages" element={<Messages />} />
                </Routes>
            
        </Router>
    );
}

export default App;
