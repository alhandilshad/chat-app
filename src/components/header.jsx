import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [shadow, setShadow] = useState(false);
  const location = useLocation(); // Get current path

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShadow(true);
      } else {
        setShadow(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Function to check if the current path matches the link path
  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed h-16 w-full px-20 flex justify-between items-center rounded-bl-3xl rounded-br-3xl transition-all bg-white duration-300 shadow-md`}
    >
      <h1
        className="text-[26px] font-bold cursor-pointer hover:scale-105 transition-transform"
        style={{
          backgroundImage: 'linear-gradient(to right, #3b82f6, #9333ea)',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        Beep-One
      </h1>
      <nav className='flex justify-center items-center font-medium'>
        <Link 
          to='/home' 
          className={`text-gray-800 px-5 py-[6px] rounded-3xl transition-all duration-500 ${
            isActive('/home' || '/Home') ? 'bg-blue-400 text-white' : 'hover:bg-blue-400 hover:text-white'
          }`}
        >
          HOME
        </Link>
        <Link 
          to='/messages' 
          className={`text-gray-800 px-5 py-[6px] rounded-3xl transition-all duration-500 ${
            isActive('/messages') ? 'bg-blue-400 text-white' : 'hover:bg-blue-400 hover:text-white'
          }`}
        >
          MESSAGES
        </Link>
        <Link 
          to='/users' 
          className={`text-gray-800 px-5 py-[6px] rounded-3xl transition-all duration-500 ${
            isActive('/users') ? 'bg-blue-400 text-white' : 'hover:bg-blue-400 hover:text-white'
          }`}
        >
          USERS
        </Link>
      </nav>
      <div>
        <Link 
          className={`text-gray-800 px-5 py-[6px] rounded-3xl transition-all duration-500 ${
            isActive('/profile') ? 'bg-blue-400 text-white' : 'hover:bg-blue-400 hover:text-white'
          }`}
          to='/profile'
        >
          Profile
        </Link>
      </div>
    </header>
  );
};

export default Header;
