import React, { useEffect, useRef, useState } from "react";
import Header from "../components/header";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { FaPlusCircle } from "react-icons/fa";
import menImage from "../assets/download (2).jpg";
import womenImage from "../assets/download.png";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import moment from "moment";
import { IoMdSettings } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userlist, setUserlist] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalList, setModalList] = useState([]);
  const [postModal, setPostModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [profileImg, setprofileImg] = useState(null);
  const [localProfileImg, setlocalProfileImg] = useState(null);
  const [currentUser, setcurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editModal, seteditModal] = useState(false);
  const [model, setmodel] = useState(false);
  const [modelBody, setmodelBody] = useState();

  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);

        const userRef = doc(db, "users", user.uid);
        const unsub = onSnapshot(userRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setcurrentUser(userData);
            setprofileImg(userData.profileImg);
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
      where("userId", "==", currentUserId)
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

  const createPost = () => {
    if (!title || !description || !imageURL) {
      alert("Please fill all the fields.");
      return;
    }

    addDoc(collection(db, "Posts"), {
      title,
      description,
      imageURL,
      posterName: currentUser.name,
      posterUserName: currentUser.userName,
      posterGender: currentUser.gender,
      posterProfile: currentUser.profileImg ? currentUser.profileImg : "",
      userId: currentUserId,
      likes: [],
      timestamp: Date.now(),
    });

    setPostModal(false);
    setTitle("");
    setDescription("");
    setImageURL("");
  };

  const handleImageUpload = async (e) => {
    let url = URL.createObjectURL(e.target.files[0]);
    setlocalProfileImg(url);
    const storageRef = ref(storage, `profileImages/${currentUserId}/dp`);

    try {
      await uploadBytes(storageRef, e.target.files[0]);
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Image uploaded! URL:", downloadURL);

      setprofileImg(downloadURL);

      const userRef = doc(db, "users", currentUserId);
      await updateDoc(userRef, { profileImg: downloadURL });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };
  

  return (
    <>
      <Header />
      <div className="pt-24 pb-20 flex flex-col justify-center items-center">
        <div className="flex justify-center items-center gap-14">
          <img
            src={
              localProfileImg ? localProfileImg : profileImg ? profileImg : currentUser?.gender === "Male"? menImage : womenImage
            }
            alt="Profile"
            className="w-44 h-44 rounded-full border"
          />
          <div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-5">
                <h2 className="text-[28px] font-semibold">
                  {currentUser?.name}
                </h2>
                <p className="text-gray-600">{currentUser?.email}</p>
                <button
                  onClick={() => seteditModal(true)}
                  className="px-4 py-1 bg-gray-300 rounded-md hover:bg-gray-500 hover:text-white duration-300"
                >
                  Edit Profile
                </button>
                <button
                  className="px-4 py-1 bg-gray-300 rounded-lg hover:bg-gray-500 hover:text-white duration-300"
                  onClick={() => {
                    auth.signOut();
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
                {editModal ? (
                  <>
                    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                      <div className="relative w-[50%] my-6 mx-auto max-w-sm">
                        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                          {/*header*/}
                          <div className="flex items-start justify-between gap-10 p-5 border-b border-solid border-blueGray-200 rounded-t">
                            <h3 className="text-3xl font-semibold">
                              Edit Profile
                            </h3>
                            <button
                              className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                              onClick={() => seteditModal(false)}
                            >
                              x
                            </button>
                          </div>
                          {/*body*/}
                          <div className="relative p-6 flex-auto">
                            <label
                              htmlFor="imgUpload"
                              className="flex items-center justify-between gap-4 mb-6"
                            >
                              <img
                                src={
                                  localProfileImg
                                    ? localProfileImg
                                    : profileImg
                                    ? profileImg
                                    : currentUser?.gender === "Male"
                                    ? menImage
                                    : womenImage
                                }
                                alt="Profile"
                                className="w-20 h-20 rounded-full border border-gray-300 object-cover"
                              />
                              <button
                                type="button"
                                onClick={handleButtonClick}
                                className="bg-blue-500 text-white px-3 py-1 rounded-lg shadow-md hover:bg-blue-600 transition"
                              >
                                Change Photo
                              </button>
                              <input
                                type="file"
                                id="imgUpload"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                            <div className="flex flex-col gap-5">
                              <div>
                                <label className="text-gray-700 font-semibold">
                                  Change Username
                                </label>
                                <input
                                  type="text"
                                  placeholder="Name"
                                  value={currentUser?.userName}
                                  onChange={(e) =>
                                    setcurrentUser({
                                      ...currentUser,
                                      userName: e.target.value,
                                    })
                                  }
                                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none mt-2"
                                />
                              </div>
                              <div>
                                <label className="text-gray-700 font-semibold">
                                  Add Bio
                                </label>
                                <textarea
                                  placeholder="Bio"
                                  value={currentUser?.bio}
                                  onChange={(e) =>
                                    setcurrentUser({
                                      ...currentUser,
                                      bio: e.target.value,
                                    })
                                  }
                                  className="w-full border border-gray-300 rounded-md p-2 mt-2 h-24 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex gap-4 items-center justify-end">
                              <button
                                type="button"
                                className="px-4 py-1 mt-4 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-700 transition"
                                onClick={() => {
                                  updateDoc(doc(db, "users", currentUserId), {
                                    ...currentUser,
                                  });
                                  seteditModal(false);
                                }}
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                  </>
                ) : null}
              </div>
              <div className="flex items-center gap-6">
                <h1 className="text-lg font-medium">{posts.length} Posts</h1>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-medium">
                    {currentUser?.followers?.length}
                  </p>
                  <button
                    type="button"
                    className="text-lg font-medium"
                    onClick={() => {
                      setModalType("followers");
                      const followersList = currentUser?.followers?.map(
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
                    {currentUser?.following?.length}
                  </p>
                  <button
                    type="button"
                    className="text-lg font-medium"
                    onClick={() => {
                      setModalType("following");
                      const followingList = currentUser?.following?.map(
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
                  {currentUser?.userName !== ""
                    ? currentUser?.userName
                    : currentUser?.name}
                </h1>
                <h1 className="w-72 tracking-tighter leading-[21px]">
                  {currentUser?.bio !== "" ? currentUser?.bio : currentUser?.gender === 'Male' ? 'I am a boy' : 'I am a girl'}
                </h1>
              </div>
            </div>
            {/* Additional profile info */}
            <div className="mt-6">
              <button
                className="flex items-center gap-1 text-2xl font-semibold"
                onClick={() => setPostModal(true)}
              >
                Create Post <FaPlusCircle />
              </button>
              {postModal ? (
                <>
                  <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                    <div className="relative w-[50%] my-6 mx-auto max-w-sm">
                      <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                        {/*header*/}
                        <div className="flex items-start justify-between gap-10 p-5 border-b border-solid border-blueGray-200 rounded-t">
                          <h3 className="text-3xl font-semibold">
                            Create Post
                          </h3>
                          <button
                            className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                            onClick={() => setPostModal(false)}
                          >
                            x
                          </button>
                        </div>
                        {/*body*/}
                        <div className="relative p-6 flex-auto">
                          <div className="mb-4">
                            <label
                              className="block text-gray-700 text-sm font-bold mb-2"
                              htmlFor="title"
                            >
                              Title
                            </label>
                            <input
                              type="text"
                              id="title"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                              placeholder="Enter post title"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                            />
                          </div>
                          <div className="mb-4">
                            <label
                              className="block text-gray-700 text-sm font-bold mb-2"
                              htmlFor="description"
                            >
                              Description
                            </label>
                            <textarea
                              id="description"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                              placeholder="Enter post description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </div>
                          <div className="mb-4">
                            <label
                              className="block text-gray-700 text-sm font-bold mb-2"
                              htmlFor="imageURL"
                            >
                              Image URL
                            </label>
                            <input
                              type="text"
                              id="imageURL"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                              placeholder="Enter image URL"
                              value={imageURL}
                              onChange={(e) => setImageURL(e.target.value)}
                            />
                          </div>
                        </div>
                        {/*footer*/}
                        <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                          <button
                            className="bg-blue-500 text-white font-bold px-6 py-2 rounded shadow hover:shadow-lg"
                            onClick={createPost}
                          >
                            Create Post
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
              ) : null}
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
                              <h1 className="pt-2">
                                {modelBody.likes.length} likes
                              </h1>
                              <input
                                type="text"
                                className="w-full text-xl font-bold border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none mt-2"
                                value={modelBody.title}
                                onChange={(e) => {
                                  setmodelBody({
                                    ...modelBody,
                                    title: e.target.value,
                                  });
                                }}
                              ></input>
                              <textarea
                                type="text"
                                value={modelBody.description}
                                className="w-full border border-gray-300 rounded-md p-2 mt-2 h-auto focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                onChange={(e) => {
                                  setmodelBody({
                                    ...modelBody,
                                    description: e.target.value,
                                  });
                                }}
                              ></textarea>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <button
                                className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 duration-300"
                                onClick={() => {
                                  deleteDoc(doc(db, "Posts", modelBody.id));
                                  setmodel(false);
                                }}
                              >
                                Delete Post
                              </button>
                              <button
                                onClick={() => {
                                  updateDoc(doc(db, "Posts", modelBody.id), {
                                    title: modelBody.title,
                                    description: modelBody.description,
                                  });
                                  console.log("post updated successfully");

                                  setmodel(false);
                                }}
                                className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 duration-300"
                              >
                                Edit Post
                              </button>
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

export default Profile;
