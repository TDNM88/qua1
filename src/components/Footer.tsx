// src/components/Footer.tsx
import React from 'react';
import '../styles.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <p>© {currentYear} CaslaQuartz. All rights reserved.</p>
      <p>Ứng dụng được phát triển bởi <a href="https://tdn-m.com" target="_blank" rel="noopener noreferrer">TDNM</a></p>
    </footer>
  );
};

export default Footer;
