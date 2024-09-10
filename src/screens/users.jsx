import React, { useEffect, useState } from "react";
import Header from "../components/header";
import { collection, getDocs,getDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const Users = () => {
  const [userlist, setUserlist] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      }
    });
    getUsers();
    return () => unsubscribe();
  }, []);

  console.log(userlist);
  

  const getUsers = async () => {
    const list = [];
    const dbSnap = await getDocs(collection(db, "users"));
    dbSnap.forEach((doc) => {
      list.push(doc.data());
    });
    setUserlist(list);
  };

  const handleFollow = async (followedUserName) => {
    if (!currentUserEmail) {
      console.log("No authenticated user found.");
      return;
    }
  
    try {
      const currentUserDocRef = doc(db, "users", currentUserEmail);
      const currentUserSnap = await getDoc(currentUserDocRef);
      if (!currentUserSnap.exists()) {
        console.error(`No document found for user: ${currentUserEmail}`);
        return;
      }
      const currentUserData = currentUserSnap.data();
  
      const userListSnap = await getDocs(collection(db, "users"));
      const userList = userListSnap.docs.map(doc => doc.data());
      const followedUser = userList.find(user => user.name === followedUserName);
  
      if (!followedUser) {
        console.error(`No user found with the name: ${followedUserName}`);
        return;
      }
  
      await updateDoc(currentUserDocRef, {
        following: arrayUnion(followedUserName),
      });
  
      const followedUserDocRef = doc(db, "users", followedUser.email);
      await updateDoc(followedUserDocRef, {
        followers: arrayUnion(currentUserData.name),
      });
  
      console.log(`${currentUserData.name} followed ${followedUserName}`);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };
  

  return (
    <>
      <Header />
      <h1 className="pt-24">Users Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {userlist
          .filter((user) => user.email !== currentUserEmail)
          .map((user, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-6">
              <img
                className="w-24 h-24 rounded-full mx-auto mb-4"
                src="https://via.placeholder.com/150"
                alt="Profile"
              />
              <h2 className="text-xl font-semibold text-center mb-2">
                {user.name}
              </h2>
              <p className="text-gray-600 text-center mb-4">{user.email}</p>
              <div className="mt-4 mb-4 flex justify-between px-10 w-full">
                <div className="flex flex-col justify-center items-center">
                  <h4 className="text-lg font-medium">Followers</h4>
                  <p>{user.followers.length}</p>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <h4 className="text-lg font-medium">Following</h4>
                  <p>{user.following.length}</p>
                </div>
              </div>
              <button className="block w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600" onClick={() => handleFollow(user.name)}>
                Follow
              </button>
            </div>
          ))}
      </div>
    </>
  );
};

export default Users;
