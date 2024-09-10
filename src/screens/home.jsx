// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import Header from '../components/header';
import { auth, db } from '../utils/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Home = () => {
    return (
        <>
            <Header />
            <div className="flex justify-center items-center h-screen w-full bg-gray-50">
                <h1 className="text-4xl font-bold text-gray-800">Welcome</h1>
            </div>
        </>
    );
};

export default Home;