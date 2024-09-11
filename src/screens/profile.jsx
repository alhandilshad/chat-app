import React, { useEffect, useState } from "react";
import Header from "../components/header";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { FaPlusCircle } from "react-icons/fa";
import menImage from "../assets/download (2).jpg";
import womenImage from "../assets/download.png";

const profile = () => {
  const [userlist, setUserlist] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalList, setModalList] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
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

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-24">
        {userlist
          .filter((user) => user.email === currentUserEmail)
          .map((user, index) => (
            <>
              <div key={index} className="flex items-center space-x-4">
                <img
                  src={user.gender === "Male" ? menImage : womenImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border"
                />
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
          <button className="flex items-center gap-1 text-2xl font-semibold">Create Post <FaPlusCircle /></button>
        </div>
      </div>
    </>
  );
};

export default profile;
