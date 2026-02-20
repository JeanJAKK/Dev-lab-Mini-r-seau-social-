import React, { useState } from "react";
import AuthPage from "./pages/AuthPage";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "./fakeAuth";
import Posts from "./pages/Posts";
import Feed from "./pages/Feed";
import Acceuil from "./pages/Acceuil";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Search from "./pages/Search";
import Profil from "./pages/Profil";
import Plus from "./pages/Plus";


function App() {
  const [auth, setAuth] = useState(isAuthenticated());

  return (
    <BrowserRouter>
  <Routes>

    <Route path="/" element={<Navigate to="/authPage" />} />

    <Route path="/authPage" element={<AuthPage setAuth={setAuth} />} />
    <Route path="/register" element={<Register />} />

    {auth ? (
      <Route path="/home" element={<Home />}>

        
        <Route index element={<Acceuil />} />

        
        <Route path="profil" element={<Profil />} />
        <Route path="acceuil" element={<Acceuil />} />
        <Route path="feed" element={<Feed />} />
        <Route path="posts" element={<Posts />} />
        <Route path="search" element={<Search />} />
        <Route path="messages" element={<Messages />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="create-post" element={<CreatePost />} />
        <Route path="plus" element={<Plus />} />

      </Route>
    ) : (
      <Route path="*" element={<Navigate to="/authPage" />} />
    )}

  </Routes>
</BrowserRouter>

  );
}

export default App;
