import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import 'antd/dist/antd.css';
import Ocr from './Ocr';
import TextFormatter from './text_processor';
import POC_OCR from './POC_OCR';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import 'filepond/dist/filepond.min.css';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Ocr />} />
      <Route path="/text-processor" element={<TextFormatter />} /> 
      {/* Add more routes here if needed */}
    </Routes>
  </Router>
);

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
