import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/home');
      }
    });
    return () => unsubscribe();
  }, []);

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
        const userData = { name, email, uid, gender, followers: [], following: [], bio: '', userName: '' };
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
      <div className="h-[100vh] w-full flex flex-col justify-center items-center gap-8">
      <h1
        className="text-3xl font-bold cursor-pointer hover:scale-105 transition-transform"
        style={{
          backgroundImage: 'linear-gradient(to right, #3b82f6, #9333ea)',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        Beep-One
      </h1>
        <div className="w-[50%] h-[76vh] bg-white border border-blue-200 rounded-3xl shadow-md shadow-blue-400 flex flex-col justify-center items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Sign Up</h1>
          <form className="flex flex-col gap-4 w-[80%]">
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
                className="border border-blue-500 text-gray-900 text-sm rounded-lg w-full p-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
                className="border border-blue-500 text-gray-900 text-sm rounded-lg w-full p-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="name@company.com"
                required=""
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                for="password"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <input
                value={password}
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="border border-blue-500 text-gray-900 text-sm rounded-lg w-full p-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
              className="w-full text-white bg-custom-gradient hover:bg-whitish hover:text-[#9333ea] border hover:border-blue-500 transition-all duration-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
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
