import React, { useEffect, useState } from 'react'
import Header from '../components/header'
import { collection, onSnapshot, query, where, doc, updateDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../utils/firebaseConfig';
import moment from 'moment';
import menImage from "../assets/download (2).jpg";
import womenImage from "../assets/download.png";
import Heart from "react-heart"
import { onAuthStateChanged } from 'firebase/auth';

const home = () => {
  const [userlist, setUserlist] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentUserEmail, setcurrentUserEmail] = useState(null);
  const [showModal, setshowModal] = useState(false);
  const [likeUsers, setlikeUsers] = useState([]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setcurrentUserEmail(user.email);
      }
    });

    const q = query(
      collection(db, "Posts"),
    );

    const messageUnsubscribe = onSnapshot(q, (docSnap) => {
      const list = [];
      docSnap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      const sortList = list.sort((a, b) => b.timestamp - a.timestamp);
      setPosts(sortList);
    });

    return () => {
      unsubscribe();
      getUsers();
      messageUnsubscribe();
    };
  }, []);

  const getUsers = async () => {
    const list = [];
    const dbSnap = await getDocs(collection(db, "users"));
    dbSnap.forEach((doc) => {
      list.push(doc.data());
    });
    setUserlist(list);
  };

  const toggleLike = async (postId, currentLikes) => {
    if (!currentUserEmail) return;

    const postRef = doc(db, "Posts", postId);
    const isLiked = currentLikes.includes(userlist.filter((user) => user.email === currentUserEmail)[0].name);

    const updatedLikes = isLiked
      ? currentLikes.filter((name) => name !== userlist.filter((user) => user.email === currentUserEmail)[0].name)
      : [...currentLikes, userlist.filter((user) => user.email === currentUserEmail)[0].name];

    try {
      await updateDoc(postRef, { likes: updatedLikes });
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };
  
  return (
    <>
    <Header />
    <div className='pt-20 pb-20 flex flex-col justify-center items-center gap-14 bg-gray-100'>
      {posts.map((post, index) => (
        <div key={index} className='flex flex-col gap-3 w-[35%]'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
            <img src={post.posterProfile !== '' ? post.posterProfile : post.posterGender === 'Male' ? menImage : womenImage} className='h-12 w-12 rounded-full' />
            <div>
            <h1 className='text-xl font-semibold'>{post.posterUserName !== '' ? post.posterUserName : post.posterName}</h1>
            <h1 className='font-semibold text-gray-600'>{post.posterName}</h1>
            </div>
            </div>
            <p className='text-gray-500 text-[14px]'>{moment(post.timestamp).startOf("seconds").fromNow()}</p>
          </div>
          <div>
            <img src={post.imageURL} className='w-full h-72' onDoubleClick={() => toggleLike(post.id, post.likes)} />
          </div>
          <div>
          <div style={{ width: "25px" }}>
			      <Heart
              isActive={post.likes.includes(userlist.filter((user) => user.email === currentUserEmail)[0].name)}
              onClick={() => toggleLike(post.id, post.likes)} 
            />
		      </div>
            <button onClick={() => {
              setshowModal(true);
              setlikeUsers(post.likes);
            }}>{post.likes.length} likes</button>
            {showModal ? (
                <>
                  <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                    <div className="relative w-auto my-6 mx-auto max-w-sm">
                      <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                        {/*header*/}
                        <div className="flex items-start justify-between gap-10 p-5 border-b border-solid border-blueGray-200 rounded-t">
                          <h3 className="text-3xl font-semibold">
                            Likes
                          </h3>
                          <button
                            className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                            onClick={() => setshowModal(false)}
                          >
                            x
                          </button>
                        </div>
                        {/*body*/}
                        <div className="relative p-6 flex-auto">
                          {likeUsers.length > 0 ? likeUsers.map((likeUser, index) => (
                            <div key={index}>
                              <h1 className='text-blue-500 text-xl pb-1'>{likeUser}</h1>
                            </div>
                          )) : (
                            <h1 className='text-xl font-semibold'>No likes yet</h1>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
              ) : null}
            <h1 className='text-xl font-semibold'>{post.title}</h1>
            <p><span className='text-xl font-semibold pr-2'>{post.posterName}</span> {post.description}</p>
          </div>
        </div>
      ))}
    </div>
    </>
  )
}

export default home;