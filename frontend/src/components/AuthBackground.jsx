import React, { useState, useEffect } from 'react';

const images = [
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1476275466078-4007374efbee?auto=format&fit=crop&w=1920&q=80'
];

export default function AuthBackground() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="auth-page-wrapper" 
      style={{ backgroundImage: `url(${images[index]})` }}
    />
  );
}
