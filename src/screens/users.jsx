import React, { useEffect, useState } from "react";
import Header from "../components/header";
import {
  collection,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import menImage from "../assets/download (2).jpg";
import womenImage from "../assets/download.png";

const Users = () => {
  const [userlist, setUserlist] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserData, setCurrentUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalList, setModalList] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
        getCurrentUserData(user.uid);
      }
    });
    const usersUnsubscribe = getUsers();
    return () => {
      unsubscribe();
      usersUnsubscribe();
    };
  }, []);

  const getCurrentUserData = async (uid) => {
    const currentUserDocRef = doc(db, "users", uid);
    const currentUserSnap = await getDoc(currentUserDocRef);
    if (currentUserSnap.exists()) {
      setCurrentUserData(currentUserSnap.data());
    }
  };

  const getUsers = () => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push(doc.data());
      });
      setUserlist(list);
    });
    return unsubscribe; // Return unsubscribe to clean up the listener
  };

  const handleFollow = async (followedUserName) => {
    if (!currentUserEmail) {
      console.log("No authenticated user found.");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No authenticated user found.");
        return;
      }

      const currentUserDocRef = doc(db, "users", currentUser.uid);
      const currentUserSnap = await getDoc(currentUserDocRef);
      if (!currentUserSnap.exists()) {
        console.error(`No document found for user: ${currentUser.uid}`);
        return;
      }

      const currentUserData = currentUserSnap.data();

      const followedUser = userlist.find(
        (user) => user.name === followedUserName
      );
      if (!followedUser) {
        console.error(`No user found with the name: ${followedUserName}`);
        return;
      }

      // Check if already following
      if (currentUserData.following.includes(followedUserName)) {
        console.log(`Already following ${followedUserName}`);
        return;
      }

      // Update following for current user
      await updateDoc(currentUserDocRef, {
        following: arrayUnion(followedUserName),
      });

      // Update followers for the followed user
      const followedUserDocRef = doc(db, "users", followedUser.uid);
      await updateDoc(followedUserDocRef, {
        followers: arrayUnion(currentUserData.name),
      });

      console.log(`${currentUserData.name} followed ${followedUserName}`);

      // Fetch the updated current user data
      getCurrentUserData(currentUser.uid);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="pt-32 pb-20 bg-blue-400 h-auto flex flex-wrap gap-5 justify-center items-center">
        {userlist
          .filter((user) => user.email !== currentUserEmail)
          .map((user, index) => (
            <>
              <div
                key={index}
                className="bg-white w-[22%] shadow-md rounded-lg p-6"
              >
                <img
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                  src={user.gender === "Male" ? menImage : womenImage}
                  alt="Profile"
                />
                <h2 className="text-xl font-semibold text-center mb-2">
                  {user.name}
                </h2>
                <div className="mt-4 mb-4 flex justify-between px-7 w-full">
                  <div className="flex flex-col justify-center items-center">
                    <button
                      type="button"
                      className="text-lg font-medium"
                      onClick={() => {
                        setModalType("followers");
                        const followersList = user.followers.map(
                          (followerName) =>
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
                {currentUserData &&
                currentUserData.following.includes(user.name) ? (
                  <button
                    className="block w-full bg-gray-500 text-white font-semibold py-2 px-4 rounded"
                    disabled
                  >
                    Following
                  </button>
                ) : (
                  <button
                    className="block w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600"
                    onClick={() => handleFollow(user.name)}
                  >
                    Follow
                  </button>
                )}
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
      </div>
    </>
  );
};

export default Users;
