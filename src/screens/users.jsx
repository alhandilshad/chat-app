import React, { useEffect, useState } from "react";
import Header from "../components/header";
import {
  collection,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import menImage from "../assets/download (2).jpg";
import womenImage from "../assets/download.png";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [userlist, setUserlist] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserData, setCurrentUserData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
        getCurrentUserData(user.uid);
      }
    });
    const usersUnsubscribe = getUsers();
    return () => {
      unsubscribe();
      usersUnsubscribe();
    };
  }, []);

  const getCurrentUserData = async (uid) => {
    const currentUserDocRef = doc(db, "users", uid);
    const currentUserSnap = await getDoc(currentUserDocRef);
    if (currentUserSnap.exists()) {
      setCurrentUserData(currentUserSnap.data());
    }
  };

  const getUsers = () => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push(doc.data());
      });
      setUserlist(list);
    });
    return unsubscribe;
  };

  const handleFollow = async (followedUserName) => {
    if (!currentUserEmail) {
      console.log("No authenticated user found.");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No authenticated user found.");
        return;
      }

      const currentUserDocRef = doc(db, "users", currentUser.uid);
      const currentUserSnap = await getDoc(currentUserDocRef);
      if (!currentUserSnap.exists()) {
        console.error(`No document found for user: ${currentUser.uid}`);
        return;
      }

      const currentUserData = currentUserSnap.data();

      const followedUser = userlist.find(
        (user) => user.name === followedUserName
      );
      if (!followedUser) {
        console.error(`No user found with the name: ${followedUserName}`);
        return;
      }

      if (currentUserData.following.includes(followedUserName)) {
        console.log(`Already following ${followedUserName}`);
        return;
      }

      await updateDoc(currentUserDocRef, {
        following: arrayUnion(followedUserName),
      });

      const followedUserDocRef = doc(db, "users", followedUser.uid);
      await updateDoc(followedUserDocRef, {
        followers: arrayUnion(currentUserData.name),
      });

      console.log(`${currentUserData.name} followed ${followedUserName}`);

      getCurrentUserData(currentUser.uid);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="pt-32 pb-20 bg-blue-400 h-auto flex flex-wrap gap-5 justify-center items-center">
        {userlist
          .filter((user) => user.email !== currentUserEmail)
          .map((user, index) => (
            <>
              <div
                key={index}
                className="bg-white w-[17%] h-[37vh] shadow-md rounded-lg p-5 cursor-pointer"
                onClick={() => navigate('/otherProfile', {state: user})}
              >
                <img
                  className="w-20 h-20 rounded-full mx-auto mb-2"
                  src={user.profileImg ? user.profileImg : user.gender === "Male" ? menImage : womenImage}
                  alt="Profile"
                />
                <h2 className="text-xl font-semibold text-center">
                  {user.name}
                </h2>
                <h2 className="font-semibold text-gray-600 text-center">
                  {user.userName !== '' ? user.userName : user.name}
                </h2>
                {currentUserData &&
                currentUserData.following.includes(user.name) ? (
                  <button
                    className="block w-full bg-gray-500 text-white font-semibold py-2 px-4 rounded mt-5"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate('/chat', {state:user})
                    }}
                  >
                    Message
                  </button>
                ) : (
                  <button
                    className="block w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded mt-5 hover:bg-blue-600"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleFollow(user.name)
                    }}
                  >
                    Follow
                  </button>
                )}
              </div>
            </>
          ))}
      </div>
    </>
  );
};

export default Users;
