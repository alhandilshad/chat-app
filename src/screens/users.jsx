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

  return (
    <>
      <Header />
      <div className="pt-32 pb-20 flex flex-wrap gap-5 justify-center items-center">
        {userlist
          .filter((user) => user.email !== currentUserEmail)
          .map((user, index) => (
            <>
              <div
                key={index}
                className="bg-white w-[17%] h-auto shadow-md border border-blue-300 shadow-blue-400 hover:shadow-blue-600 duration-300 rounded-lg p-5 cursor-pointer"
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
              </div>
            </>
          ))}
      </div>
    </>
  );
};

export default Users;
