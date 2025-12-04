import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/main';
import About from './pages/about';
import Contact from './pages/contact';
import FAQ from './pages/faq';
import FullData from './pages/fullData';
import './style.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/fulldata" element={<FullData />} />
      </Routes>
    </Router>
  );
}

export default App;