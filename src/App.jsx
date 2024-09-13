import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SignUp from './screens/signUp';
import Login from './screens/login';
import Home from './screens/home';
import Users from './screens/users';
import Profile from './screens/profile';
import Messages from './screens/messages';
import Chat from './screens/chat';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<SignUp />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/home' element={<Home />}></Route>
        <Route path='/users' element={<Users />}></Route>
        <Route path='/profile' element={<Profile />}></Route>
        <Route path='/messages' element={<Messages />}></Route>
        <Route path='/chat' element={<Chat />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;