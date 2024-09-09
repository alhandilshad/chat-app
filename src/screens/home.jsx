// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import Header from '../components/header';
import { auth, db } from '../utils/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Home = () => {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchUserName = async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserName(userData.name || user.email);
                    } else {
                        setUserName(user.email);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUserName(user.email);
                }
            } else {
                setUserName('Guest');
            }
        };
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            fetchUserName(user);
        });

        return () => unsubscribe();
    }, []);

    return (
        <>
            <Header />
            <div className="flex justify-center items-center h-screen w-full bg-gray-50">
                <h1 className="text-4xl font-bold text-gray-800">Welcome, {userName}</h1>
            </div>
        </>
    );
};

export default Home;