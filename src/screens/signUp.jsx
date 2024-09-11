import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../utils/firebaseConfig";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";

const signUp = () => {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [gender, setGender] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    const dbSnap = await getDocs(collection(db, "users"));
    const userList = [];
    dbSnap.forEach((doc) => {
      userList.push(doc.data());
    });

    // Check if the username already exists
    const userExists = userList.some((user) => user.name === name);

    if (userExists) {
      alert("Username already exists! Please choose another one.");
      return;
    }

    if(name === '' || email === '' || gender === '' || password === '') {
      alert("Please fill all fields");
      return;
    } 
    
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (response) => {
        const uid = response.user.uid;
        const userData = { name, email, uid, gender, followers: [], following: [] };
        await setDoc(doc(db, "users", uid), userData);
        navigate("/home");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
        // ..
      });
  };
  return (
    <>
      <div className="h-[100vh] w-full bg-gray-50 flex justify-center items-center">
        <div className="w-[50%] h-[80vh] bg-white border border-gray-300 rounded-3xl shadow-lg flex flex-col justify-center items-center gap-8">
          <h1 className="text-3xl font-bold text-gray-800">Sign Up</h1>
          <form className="flex flex-col gap-5 w-[80%]">
            <div>
              <label
                for="name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Your name
              </label>
              <input
                value={name}
                type="text"
                name="name"
                id="name"
                placeholder="John"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required=""
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label
                for="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Your email
              </label>
              <input
                value={email}
                type="email"
                name="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="name@company.com"
                required=""
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                for="password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input
                value={password}
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required=""
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="mr-4">Gender:</label>
              <input
                type="radio"
                id="male"
                value="Male"
                checked={gender === "Male"}
                onChange={(e) => setGender(e.target.value)}
              />
              <label htmlFor="male" className="mr-4">
                Male
              </label>

              <input
                type="radio"
                id="female"
                value="Female"
                checked={gender === "Female"}
                onChange={(e) => setGender(e.target.value)}
              />
              <label htmlFor="female">Female</label>
            </div>
            <button
              type="button"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              onClick={handleSignup}
            >
              Create an account
            </button>
            <p className="text-md font-light text-gray-500 flex justify-between">
              Already have an account?{" "}
              <Link
                to={"/login"}
                className="font-medium text-blue-600 hover:underline"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default signUp;
