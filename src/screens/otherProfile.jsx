import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import menImage from "../assets/download (2).jpg";
import womenImage from "../assets/download.png";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/header";
import Heart from "react-heart";

const OtherProfile = () => {
  const { state } = useLocation();

  const [userlist, setUserlist] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalList, setModalList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [model, setModel] = useState(false);
  const [modelBody, setModelBody] = useState();
  const [isFollowing, setIsFollowing] = useState(false);
  const [otherProfileUser, setOtherProfileUser] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        const userRef = doc(db, "users", user.uid);
        onSnapshot(userRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setCurrentUser(userData);
            setIsFollowing(state?.followers?.includes(userData.name));
          }
        });
      }
    });

    getUsers();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "Posts"), where("userId", "==", state.uid));
    const unsubscribe = onSnapshot(q, (docSnap) => {
      const sortedPosts = docSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.timestamp - a.timestamp);
      setPosts(sortedPosts);
    });

    return () => unsubscribe();
  }, [state.uid]);

  useEffect(() => {
    const q = query(collection(db, "users"), where("uid", "==", state.uid));
    const unsubscribe = onSnapshot(q, (docSnap) => {
      const user = docSnap.docs[0]?.data();
      setOtherProfileUser(user);
    });

    return () => unsubscribe();
  }, [state.uid]);

  const getUsers = async () => {
    const dbSnap = await getDocs(collection(db, "users"));
    setUserlist(dbSnap.docs.map((doc) => doc.data()));
  };

  const toggleLike = async (postId, currentLikes) => {
    if (!currentUser) return;
    const postRef = doc(db, "Posts", postId);
    const isLiked = currentLikes.includes(currentUser?.name);
    const updatedLikes = isLiked
      ? currentLikes.filter((name) => name !== currentUser?.name)
      : [...currentLikes, currentUser?.name];

    try {
      await updateDoc(postRef, { likes: updatedLikes });
      setModelBody((prev) => ({ ...prev, likes: updatedLikes }));
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !otherProfileUser) return;
  
    try {
      const otherUserRef = doc(db, "users", state.uid); // Alhan's user document
      const currentUserRef = doc(db, "users", currentUserId); // Farhan's user document
  
      // Ensure the followers array exists before updating for Alhan
      const updatedFollowers = otherProfileUser?.followers
        ? [...otherProfileUser.followers, currentUser.name]
        : [currentUser.name];
  
      // Ensure the following array exists before updating for Farhan
      const updatedFollowing = currentUser?.following
        ? [...currentUser.following, otherProfileUser.name]
        : [otherProfileUser.name];
  
      // Update both users in Firebase
      await updateDoc(otherUserRef, { followers: updatedFollowers }); // Update Alhan's followers
      await updateDoc(currentUserRef, { following: updatedFollowing }); // Update Farhan's following
  
      // Update the local state for both users
      setOtherProfileUser((prev) => ({ ...prev, followers: updatedFollowers }));
      setCurrentUser((prev) => ({ ...prev, following: updatedFollowing }));
      setIsFollowing(true);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };
  
  const handleUnfollow = async () => {
    if (!currentUser || !otherProfileUser?.followers) return;
  
    try {
      const otherUserRef = doc(db, "users", state.uid); // Alhan's user document
      const currentUserRef = doc(db, "users", currentUserId); // Farhan's user document
  
      // Remove the current user (Farhan) from Alhan's followers
      const updatedFollowers = otherProfileUser.followers.filter(
        (follower) => follower !== currentUser.name
      );
  
      // Remove Alhan from Farhan's following list
      const updatedFollowing = currentUser?.following?.filter(
        (following) => following !== otherProfileUser.name
      );
  
      // Update both users in Firebase
      await updateDoc(otherUserRef, { followers: updatedFollowers }); // Update Alhan's followers
      await updateDoc(currentUserRef, { following: updatedFollowing }); // Update Farhan's following
  
      // Update the local state for both users
      setOtherProfileUser((prev) => ({ ...prev, followers: updatedFollowers }));
      setCurrentUser((prev) => ({ ...prev, following: updatedFollowing }));
      setIsFollowing(false);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
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
                <h2 className="text-[28px] font-semibold">{state?.name}</h2>
                <p className="text-gray-600">{state?.email}</p>
              </div>
              <div className="flex items-center gap-6">
                <h1 className="text-lg font-medium">{posts.length} Posts</h1>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-medium">
                    {otherProfileUser?.followers?.length}
                  </p>
                  <button
                    type="button"
                    className="text-lg font-medium"
                    onClick={() => {
                      setModalType("followers");
                      const followersList = otherProfileUser?.followers?.map(
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
                    {otherProfileUser?.following?.length}
                  </p>
                  <button
                    type="button"
                    className="text-lg font-medium"
                    onClick={() => {
                      setModalType("following");
                      const followingList = otherProfileUser?.following?.map(
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
              {/* Follow/Unfollow Buttons */}
              <div>
                {!isFollowing ? (
                  <button
                    className="py-1 px-4 bg-blue-500 text-white"
                    onClick={handleFollow}
                  >
                    Follow
                  </button>
                ) : (
                  <>
                    <button
                      className="py-1 px-4 bg-red-400 hover:bg-red-500 duration-300 text-white"
                      onClick={handleUnfollow}
                    >
                      Unfollow
                    </button>
                    <button className="py-1 px-4 bg-gray-400 hover:bg-gray-500 duration-300 ml-2 text-white" onClick={() => navigate('/chat', {state:otherProfileUser})}>
                      Message
                    </button>
                  </>
                )}
              </div>
              <div>
                <h1 className="font-semibold text-[18px]">
                  {otherProfileUser?.userName !== "" ? otherProfileUser?.userName : state?.name}
                </h1>
                <h1 className="w-72 tracking-tighter leading-[21px]">
                  {otherProfileUser?.bio !== "" ? otherProfileUser?.bio : otherProfileUser?.gender === 'Male' ? 'I am a boy' : 'I am a girl'}
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
                    setModel(true);
                    setModelBody(post);
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
                              onClick={() => setModel(false)}
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
                              <div style={{ width: "25px" }} className='mt-2'>
                                <Heart
                                  isActive={modelBody.likes.includes(
                                    currentUser?.name
                                  )}
                                  onClick={() =>
                                    toggleLike(modelBody.id, modelBody.likes)
                                  }
                                />
                              </div>
                              <h1>
                                {modelBody.likes.length} likes
                              </h1>
                              <h1 className="text-xl font-bold pt-2">
                                {modelBody.title}
                              </h1>
                              <h1 className="">{modelBody.description}</h1>
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
  );
};

export default OtherProfile;