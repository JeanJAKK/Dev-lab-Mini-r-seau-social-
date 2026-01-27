import React, { useState } from "react";
import AuthPage from "./pages/AuthPage";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./fakeAuth";
import Posts from "./pages/Posts";
import Feed from "./pages/Feed";





function App() {
  const [auth, setAuth] = useState(isAuthenticated());

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/authPage" />} />
        <Route path="/authPage" element={<AuthPage setAuth={setAuth} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/feed" element={<Feed />} />

        {auth ? (
          <>
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/home" element={<Home />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/authPage" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
