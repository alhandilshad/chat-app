import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed h-16 w-full px-20 flex justify-between items-center rounded-bl-3xl rounded-br-3xl transition-all bg-white duration-300 shadow shadow-blue-300`}
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
            isActive('/home' || '/Home') ? 'bg-custom-gradient text-white' : 'hover:bg-custom-gradient hover:text-white'
          }`}
        >
          HOME
        </Link>
        <Link 
          to='/messages' 
          className={`text-gray-800 px-5 py-[6px] rounded-3xl transition-all duration-500 ${
            isActive('/messages') ? 'bg-custom-gradient text-white' : 'hover:bg-custom-gradient hover:text-white'
          }`}
        >
          MESSAGES
        </Link>
        <Link 
          to='/users' 
          className={`text-gray-800 px-5 py-[6px] rounded-3xl transition-all duration-500 ${
            isActive('/users') ? 'text-white bg-custom-gradient' : 'hover:text-white hover:bg-custom-gradient'
          }`}
        >
          USERS
        </Link>
      </nav>
      <div>
        <Link 
          className={`text-gray-800 px-5 py-[6px] rounded-3xl transition-all duration-500 ${
            isActive('/profile') ? 'bg-custom-gradient text-white' : 'hover:bg-custom-gradient hover:text-white'
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
