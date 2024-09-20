import React, { useEffect, useState } from "react";
import Header from "../components/header";
import { collection, onSnapshot, query } from "firebase/firestore";
import { auth, db } from "../utils/firebaseConfig";
import menImage from "../assets/download (2).jpg";
import womenImage from "../assets/download.png";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const messages = () => {
  const [userlist, setUserlist] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserUid, setCurrentUserUid] = useState("");
  const [chatUser, setchatUser] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUserEmail(user.email);
          setCurrentUserUid(user.uid);
        }
    });
    const usersUnsubscribe = getUsers();
    const chatsUnsubscribe = getChats();
    return () => {
      unsubscribe();
      usersUnsubscribe();
      chatsUnsubscribe();
    };
  }, []);

  const getChats = () => {
    const q = query(
      collection(db, "chat"),
    );

    const messageUnsubscribe = onSnapshot(q, (docSnap) => {
      const list = [];
      docSnap.forEach((doc) => {
        list.push(doc.data());
      });
      setchatUser(list);
    });
    return messageUnsubscribe;
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
      <div className="h-auto pb-20 w-full bg-gray-100">
        <div className="flex flex-col justify-center items-center gap-5 pt-32">
        {userlist.filter((user) => user.email !== currentUserEmail).filter((user) => chatUser.some((chat) => (chat.receiverUid === user.uid && chat.senderUid === currentUserUid) || (chat.senderUid === user.uid && chat.receiverUid === currentUserUid))).map((title, index) => (
            <div key={index} onClick={() => navigate('/chat', {state:title})} className="flex items-center justify-between px-8 border-2 border-blue-400 rounded-md py-2 bg-blue-100 w-[80%] cursor-pointer">
              <div className="flex items-center gap-3">
              <img
                src={title.profileImg ? title.profileImg : title.gender === 'Male' ? menImage : womenImage}
                alt="Profile"
                className="w-16 h-16 rounded-full border"
              />
              <h2 className="text-2xl font-semibold text-gray-800">{title.name}</h2>
              </div>
              <div>
                <h1 className="text-md font-semibold">Message</h1>
              </div>
            </div>
        ))}
        </div>
      </div>
    </>
  );
};

export default messages;