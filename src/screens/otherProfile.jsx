import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import menImage from "../assets/download (2).jpg";
import womenImage from "../assets/download.png";
import moment from "moment";
import { useLocation } from 'react-router-dom';
import Header from '../components/header'

const otherProfile = () => {
    const { state } = useLocation();
    console.log(state);

  const [userlist, setUserlist] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalList, setModalList] = useState([]);
  const [currentUser, setcurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [model, setmodel] = useState(false);
  const [modelBody, setmodelBody] = useState();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);

        const userRef = doc(db, "users", user.uid);
        const unsub = onSnapshot(userRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setcurrentUser(userData);
          }
        });

        return () => unsub();
      }
    });
    getUsers();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "Posts"),
      where("userId", "==", state.uid)
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
  }, [currentUserId]);

  const getUsers = async () => {
    const list = [];
    const dbSnap = await getDocs(collection(db, "users"));
    dbSnap.forEach((doc) => {
      list.push(doc.data());
    });
    setUserlist(list);
  };
    
  return (
    <>
    <Header />
    <div className="pt-24 flex flex-col justify-center items-center">
        <div className="flex justify-center items-center gap-14">
          <img
            src={
              state.profileImg
                ? state.profileImg
                : state?.gender === "Male"
                ? menImage
                : womenImage
            }
            alt="Profile"
            className="w-40 h-40 rounded-full border"
          />
          <div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-5">
                <h2 className="text-[28px] font-semibold">
                  {state?.name}
                </h2>
                <p className="text-gray-600">{state?.email}</p>
              </div>
              <div className="flex items-center gap-6">
                <h1 className="text-lg font-medium">{posts.length} Posts</h1>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-medium">
                    {state?.followers?.length}
                  </p>
                  <button
                    type="button"
                    className="text-lg font-medium"
                    onClick={() => {
                      setModalType("followers");
                      const followersList = state?.followers?.map(
                        (followerName) =>
                          userlist.find((u) => u.name === followerName)
                      );
                      setModalList(followersList);
                      setShowModal(true);
                    }}
                  >
                    Followers
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-medium">
                    {state?.following?.length}
                  </p>
                  <button
                    type="button"
                    className="text-lg font-medium"
                    onClick={() => {
                      setModalType("following");
                      const followingList = state?.following?.map(
                        (followingName) =>
                          userlist.find((u) => u.name === followingName)
                      );
                      setModalList(followingList);
                      setShowModal(true);
                    }}
                  >
                    Following
                  </button>
                </div>
              </div>
              <div>
                <h1 className="font-semibold text-[18px]">
                  {state?.userName !== ""
                    ? state?.userName
                    : state?.name}
                </h1>
                <h1 className="w-72 tracking-tighter leading-[21px]">
                  {state?.bio !== "" ? state?.bio : ""}
                </h1>
              </div>
            </div>
          </div>
        </div>
        {showModal ? (
          <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
              <div className="relative w-auto my-6 mx-auto max-w-sm">
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  {/*header*/}
                  <div className="flex items-start justify-between gap-10 p-5 border-b border-solid border-blueGray-200 rounded-t">
                    <h3 className="text-3xl font-semibold">
                      {modalType === "followers" ? "Followers" : "Following"}
                    </h3>
                    <button
                      className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                      onClick={() => setShowModal(false)}
                    >
                      x
                    </button>
                  </div>
                  {/*body*/}
                  <div className="relative p-6 flex-auto">
                    {modalList.length > 0 ? (
                      <ul className="list-none">
                        {modalList.map((user, index) => (
                          <div
                            key={index}
                            className="mb-2 flex items-center justify-between"
                          >
                            <li className="text-blue-500 text-xl">
                              {user.name}
                            </li>
                            <p>{user.gender}</p>
                          </div>
                        ))}
                      </ul>
                    ) : (
                      <p>No {modalType} yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
          </>
        ) : null}

        {/* User posts */}
        <h1 className="pt-10 pb-3 text-3xl font-bold uppercase">Posts</h1>
        <div className="flex flex-wrap items-center justify-center w-[38%]">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <>
                <div
                  key={index}
                  className="shadow-md shadow-gray-500 w-[33.3%] border border-gray-300 cursor-pointer hover:shadow-lg hover:shadow-gray-500 duration-300"
                  onClick={() => {
                    setmodel(true);
                    setmodelBody(post);
                  }}
                >
                  <img src={post.imageURL} className="w-full h-[140px]"></img>
                </div>
                {model ? (
                  <>
                    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                      <div className="relative w-[50%] my-6 mx-auto max-w-sm">
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
                              <p className="text-[14px] pb-2 text-gray-500">
                                {moment(modelBody.timestamp)
                                  .startOf("seconds")
                                  .fromNow()}
                              </p>
                              <img
                                src={modelBody.imageURL}
                                className="w-full h-52"
                              />
                              <h1 className="pt-2">{modelBody.likes.length} likes</h1>
                              <h1
                                className="text-xl font-bold pt-2"
                              >{modelBody.title}</h1>
                              <h1
                                className=""
                              >{modelBody.description}</h1>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                  </>
                ) : null}
              </>
            ))
          ) : (
            <div className="flex justify-center items-center text-xl font-semibold text-gray-600">
              No posts yet.
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default otherProfile;