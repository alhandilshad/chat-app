import React, { useEffect, useState } from 'react';
import Header from '../components/header';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../utils/firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';

const profile = () => {
    const [userlist, setUserlist] = useState([]);
    const [followers, setfollowers] = useState(0);
    const [following, setFollowing] = useState(0);
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
      <div className="container mx-auto p-4 pt-24">
        {userlist.filter(user => user.email === currentUserEmail).map((user, index) => (
            <>
            <div key={index} className="flex items-center space-x-4">
            <img
              src=''
              alt="Profile"
              className="w-24 h-24 rounded-full border"
            />
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
  
          <div className="mt-6">
            <h3 className="text-lg font-medium">Bio</h3>
            <p>I am a web developer</p>
          </div>
  
          <div className="mt-4 flex space-x-6">
            <div>
              <h4 className="text-lg font-medium">Followers</h4>
              <p>{user.followers.length}</p>
            </div>
            <div>
              <h4 className="text-lg font-medium">Following</h4>
              <p>{user.following.length}</p>
            </div>
          </div>
            </>
        ))}

        {/* Additional profile info */}
        <div className="mt-6">
          <h3 className="text-lg font-medium">Additional Info</h3>
          <p>Here you can add more details relevant to your chat app, like recent activity, status, etc.</p>
        </div>
      </div>
    </>
  );
};

export default profile;