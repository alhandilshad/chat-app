import React, { useEffect, useState } from 'react'
import Header from '../components/header'
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import moment from 'moment';
import menImage from "../assets/download (2).jpg";
import womenImage from "../assets/download.png";

const home = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
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
      messageUnsubscribe();
    };
  }, []);

  console.log(posts);
  
  return (
    <>
    <Header />
    <div className='pt-20 pb-20 flex flex-col justify-center items-center gap-14 bg-gray-100'>
      {posts.map((post, index) => (
        <div key={index} className='flex flex-col gap-3 w-[35%]'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
            <img src={post.posterGender === 'Male' ? menImage : womenImage} className='h-12 w-12 rounded-full' />
            <h1 className='text-xl font-semibold'>{post.posterName}</h1>
            </div>
            <p className='text-gray-500 text-[14px]'>{moment(post.timestamp).startOf("seconds").fromNow()}</p>
          </div>
          <div>
            <img src={post.imageURL} className='w-full' />
          </div>
          <div>
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