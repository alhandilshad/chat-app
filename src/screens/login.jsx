import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebaseConfig';

const login = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then((response) => {
        navigate('/home');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
        if(errorCode === 'auth/invalid-credential'){
          alert("Invalid email or password. Please try again.");
        }
        // ..
      });
  }

  return (
    <div className="h-[100vh] w-full bg-white flex flex-col justify-center items-center gap-8">
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
        <div className="w-[50%] h-[70vh] bg-white border border-blue-200 rounded-3xl shadow-md shadow-blue-400 flex flex-col justify-center items-center gap-8">
          <h1 className="text-2xl font-bold text-gray-800">Login</h1>
          <form className="flex flex-col gap-8 w-[80%]">
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
                className="border border-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
                className="border border-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required=""
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleLogin}
              className="w-full text-white bg-custom-gradient hover:bg-whitish hover:text-[#9333ea] border hover:border-blue-600 duration-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Login
            </button>
            <p className="text-md font-light text-gray-500 flex justify-between">
              Don't have an account?{" "}
              <Link
                to={"/"}
                className="font-medium text-blue-600 hover:underline"
              >
                Signup here
              </Link>
            </p>
          </form>
        </div>
      </div>
  )
}

export default login;