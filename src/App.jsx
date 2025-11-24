import React from "react";
import AuthPage from "./pages/AuthPage";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./fakeAuth"
import { useState } from "react"
import CreatePost from "./pages/CreatePost";
function App() {
  const [auth, setAuth] = useState(false);
  return (
    


    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/authPage" />} />
        <Route path="/authPage" element={<AuthPage setAuth={setAuth} />} />
        
        <Route path="/register" element={<Register />} />
        
         {auth ? (
          <>
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/home" element={<Home />} />
          </>
        ) : (
          // si non connecté, redirige vers la connexion
          <Route path="*" element={<Navigate to="/authPage" />} />
        )}
      </Routes>
      
    </BrowserRouter>
     

  );
}

export default App;

