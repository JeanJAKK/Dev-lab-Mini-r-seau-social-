import React from "react";
import AuthPage from "./pages/AuthPage";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./fakeAuth"
import { useState } from "react"
function App() {const [auth, setAuth] = useState(isAuthenticated());
  return (
    


    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/authPage" />} />
        <Route path="/authPage" element={<AuthPage />} />
        <Route path="/register" element={<Register />} />
        
      </Routes>
      {auth ? (
        <Home setAuth={setAuth} />
      ) : (
        <AuthPage setAuth={setAuth} />
      )}
    </BrowserRouter>
     

  );
}

export default App;
