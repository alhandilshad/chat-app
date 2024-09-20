import React, { useEffect, useState } from "react";
import Header from "../components/header";
import { collection, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { FaPlusCircle } from "react-icons/fa";
import menImage from "../assets/download (2).jpg";
import womenImage from "../assets/download.png";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Profile = () => {
  const [userlist, setUserlist] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalList, setModalList] = useState([]);
  const [postModal, setPostModal] = useState(false);
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [imageURL, setImageURL] = useState();
  const [profileImg, setprofileImg] = useState(menImage);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
        setCurrentUserId(user.uid);
      }
    });
    getUsers();
    return () => unsubscribe();
  }, []);

  const getUsers = async () => {
    const list = [];
    const dbSnap = await getDocs(collection(db, "users"));
    dbSnap.forEach((doc) => {
      list.push(doc.data());
    });
    setUserlist(list);
  };

  const createPost = () => {
    if (!title ||!description ||!imageURL) {
      alert("Please fill all the fields.");
      return;
    }

    addDoc(collection(db, "Posts"), {
      title,
      description,
      imageURL,
      posterName:  userlist.filter((user) => user.email === currentUserEmail)[0].name,
      posterGender:  userlist.filter((user) => user.email === currentUserEmail)[0].gender,
      posterProfile: userlist.filter((user) => user.email === currentUserEmail)[0].profileImg,
      userId: currentUserId,
      likes: [],
      timestamp: Date.now(),
    })

    setPostModal(false);
    setTitle("");
    setDescription("");
    setImageURL("");
  }

  const handleImageUpload = async (e) => {
    let url = URL.createObjectURL(e.target.files[0]);
    setprofileImg(url);
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
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-24">
        {userlist
          .filter((user) => user.email === currentUserEmail)
          .map((user, index) => (
            <>
              <div key={index} className="flex items-center space-x-4">
                <label htmlFor="imgUpload">
                  <img
                    src={profileImg}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border"
                  />
                  <input type="file" id="imgUpload" className="hidden" onChange={handleImageUpload} />
                </label>
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium">Bio</h3>
                <p>{user.gender === "Male" ? "I am a boy" : "I am a girl"}</p>
              </div>

              <div className="mt-4 flex space-x-6">
                <div className="flex flex-col justify-center items-center">
                  <button
                    type="button"
                    className="text-lg font-medium"
                    onClick={() => {
                      setModalType("followers");
                      const followersList = user.followers.map((followerName) =>
                        userlist.find((u) => u.name === followerName)
                      );
                      setModalList(followersList);
                      setShowModal(true);
                    }}
                  >
                    Followers
                  </button>
                  <p>{user.followers.length}</p>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <button
                    type="button"
                    className="text-lg font-medium"
                    onClick={() => {
                      setModalType("following");
                      const followingList = user.following.map(
                        (followingName) =>
                          userlist.find((u) => u.name === followingName)
                      );
                      setModalList(followingList);
                      setShowModal(true);
                    }}
                  >
                    Following
                  </button>
                  <p>{user.following.length}</p>
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
                            {modalType === "followers"
                              ? "Followers"
                              : "Following"}
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
            </>
          ))}

        {/* Additional profile info */}
        <div className="mt-6">
          <button className="flex items-center gap-1 text-2xl font-semibold" onClick={() => setPostModal(true)}>
            Create Post <FaPlusCircle />
          </button>
          {postModal ? (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative w-[50%] my-6 mx-auto max-w-sm">
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex items-start justify-between gap-10 p-5 border-b border-solid border-blueGray-200 rounded-t">
                      <h3 className="text-3xl font-semibold">Create Post</h3>
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
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
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
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
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
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageURL">
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
    </>
  );
};

export default Profile;