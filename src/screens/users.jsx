import React, { useEffect, useState } from 'react';
import Header from '../components/header';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../utils/firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';

const Users = () => {
    const [userlist, setUserlist] = useState([]);
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUserEmail(user.email);
            }
        });
        getUsers();
        return () => unsubscribe();
    }, []);

    const getUsers = async () => {
        const list = [];
        const dbSnap = await getDocs(collection(db, 'users'));
        dbSnap.forEach((doc) => {
            list.push(doc.data());
        });
        setUserlist(list);
    };

    return (
        <>
            <Header />
            <h1 className="pt-24">Users Page</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userlist
                    .filter(user => user.email !== currentUserEmail)
                    .map((user, index) => (
                        <div key={index} className="bg-white shadow-md rounded-lg p-6">
                            <img
                                className="w-24 h-24 rounded-full mx-auto mb-4"
                                src="https://via.placeholder.com/150"
                                alt="Profile"
                            />
                            <h2 className="text-xl font-semibold text-center mb-2">{user.name}</h2>
                            <p className="text-gray-600 text-center mb-4">{user.email}</p>
                            <button className="block w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600">
                                Follow
                            </button>
                        </div>
                    ))}
            </div>
        </>
    );
};

export default Users;