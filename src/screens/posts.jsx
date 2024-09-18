import React, { useEffect, useState } from "react";
import Header from "../components/header";
import { collection, deleteDoc, onSnapshot, query, where, doc } from "firebase/firestore";
import { db, auth } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import moment from "moment";

const posts = () => {
  const [currentUserId, setCurrentUserId] = useState("");
  const [model, setmodel] = useState(false);
  const [modelBody, setmodelBody] = useState();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "Posts"),
      where("userId", "==", currentUserId)
    );

    const messageUnsubscribe = onSnapshot(q, (docSnap) => {
      const list = [];
      docSnap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setPosts(list);
    });

    return () => {
      messageUnsubscribe();
    };
  }, [currentUserId]);

  const deletePost = async (body) => {
    try {
      const postsRef = doc(db, "Posts", body.id);
      await deleteDoc(postsRef);
      console.log("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting Post: ", error);
    }
    setmodel(false);
  }

  return (
    <>
      <Header />
      <h1 className="pt-24 text-center text-3xl font-bold uppercase">
        My posts
      </h1>
      <div className="p-8 flex flex-wrap gap-6 items-center justify-center">
        {posts.map((post, index) => (
          <>
            <div
              key={index}
              className="shadow-md shadow-gray-500 w-[23%] border border-gray-300 p-6 cursor-pointer hover:shadow-lg hover:shadow-gray-500 duration-300"
              onClick={() => {
                setmodel(true);
                setmodelBody(post);
              }}
            >
              <p className="text-[14px] text-gray-500">
                {moment(post.timestamp).startOf("seconds").fromNow()}
              </p>
              <h1 className="text-2xl font-semibold pb-3">{post.title}</h1>
              <img src={post.imageURL} className="w-full h-[140px]"></img>
            </div>
            {model ? (
              <>
                <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                  <div className="relative w-auto my-6 mx-auto max-w-sm">
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                      {/*header*/}
                      <div className="flex items-center justify-between gap-10 p-5 border-b border-solid border-blueGray-200 rounded-t">
                        <h1 className="text-3xl font-bold">Post</h1>
                        <button
                          className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                          onClick={() => setmodel(false)}
                        >
                          x
                        </button>
                      </div>
                      {/*body*/}
                      <div className="relative p-6 flex-auto">
                        <div>
                          <p className="text-[14px] pb-3 text-gray-500">{moment(modelBody.timestamp).startOf("seconds").fromNow()}</p>
                          <img src={modelBody.imageURL} className="w-full" />
                          <h1 className="pt-2 text-xl font-bold">{modelBody.title}</h1>
                          <p className="pt-2">{modelBody.description}</p>
                        </div>
                        <button className="bg-red-500 mt-3 text-white px-6 py-2 rounded-md hover:bg-red-600 duration-300" onClick={() => deletePost(modelBody)}>Delete Post</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
              </>
            ) : null}
          </>
        ))}
      </div>
    </>
  );
};

export default posts;
