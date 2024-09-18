import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import menImage from "../assets/download (2).jpg";
import womenImage from "../assets/download.png";
import { IoArrowBackSharp, IoSend } from "react-icons/io5";
import { IoMdCall } from "react-icons/io";
import { FaVideo } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import { RiCheckDoubleLine } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import { addDoc, collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import moment from "moment";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

const Chat = () => {
  const { state } = useLocation();
  const [message, setMessage] = useState("");
  const [chatList, setChatList] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const chatContainerRef = useRef(null);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        console.log(user.uid);
      }
    });

    return () => {
      unsubscribe(); // Unsubscribe from onAuthStateChanged when the component unmounts
    };
  }, []);

  useEffect(() => {
    // Check if both state.uid and currentUserId are available
    if (currentUserId && state?.uid) {
      const q = query(
        collection(db, "chat"),
        where(state.uid,"==", true),
        where(currentUserId,"==", true),
      );

      const messageUnsubscribe = onSnapshot(q, (docSnap) => {
        const list = [];
        docSnap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        const sortList = list.sort((a, b) => a.timestamp - b.timestamp);
        setChatList(sortList);

        scrollToBottom();
      });

      return () => {
        messageUnsubscribe(); // Unsubscribe from the snapshot listener when the component unmounts
      };
    }
  }, [currentUserId, state?.uid]);

  const sendMessages = () => {
    if (!message.trim()) return;

    addDoc(collection(db, "chat"), {
      message,
      [state.uid]: true,
      [currentUserId]: true,
      senderUid: currentUserId,
      receiverUid: state.uid,
      timestamp: Date.now(),
    });
    setMessage("");

    scrollToBottom();
  };

  const deleteMessage = async (item) => {
    try {
      const messageRef = doc(db, "chat", item.id);
      await deleteDoc(messageRef);
      console.log("Message deleted successfully");
    } catch (error) {
      console.error("Error deleting message: ", error);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.native);
  };

  return (
    <>
      <div className="fixed w-full flex gap-3 items-center justify-between px-6 h-20 bg-blue-300">
        <Link to={"/messages"}>
          <IoArrowBackSharp className="text-4xl" />
        </Link>
        <div className="flex items-center gap-5">
          <img
            src={state?.gender === "Male" ? menImage : womenImage}
            className="h-16 w-16 rounded-full"
          />
          <h1 className="text-2xl font-semibold">{state?.name}</h1>
        </div>
        <div className="flex items-center text-2xl gap-5">
          <IoMdCall />
          <FaVideo />
        </div>
      </div>

      <div className={`pt-24 pb-20 px-10 h-[calc(100vh-100px)] bg-blue-50 overflow-y-auto`} ref={chatContainerRef}>
        {chatList.map((item, index) => (
          <div key={index} className={`flex items-center gap-2 w-full ${item.senderUid == currentUserId ? 'justify-end' : 'justify-start'}`}>
            <button type="button" onClick={() => deleteMessage(item)} className={`${item.senderUid == currentUserId ? 'block text-gray-500 text-xl' : 'hidden'}`}><MdDelete /></button>
            <div className={`${item.senderUid == currentUserId ? 'shadow-md shadow-gray-400 bg-blue-400 text-white mt-4 py-4 px-7' : 'shadow-md shadow-gray-400 bg-white mt-4 py-4 px-7'}`}>
              <h1>{item.message}</h1>
              <div className="flex justify-between items-center gap-1">
                <p className="text-[12px]">{moment(item.timestamp).startOf('seconds').fromNow()}</p>
                <RiCheckDoubleLine className={`${item.receiverUid == currentUserId && item.senderUid == state.uid ? 'text-blue-500' : 'text-black'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full px-6 py-4 bg-white flex items-center">
        <input
          type="text"
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <BsEmojiSmile 
          className="text-2xl cursor-pointer ml-3" 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
        />
        {showEmojiPicker && (
          <div className="absolute bottom-16 right-16">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} />
          </div>
        )}
        <button
          className="ml-3 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={sendMessages}
        >
          <IoSend className="text-2xl" />
        </button>
      </div>
    </>
  );
};

export default Chat;