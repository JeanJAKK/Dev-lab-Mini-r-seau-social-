// import { logout } from "../fakeAuth";
import React from "react";
// export default function Home({ setAuth }) {
  // const handleLogout = () => {
  //   logout();
  //   setAuth(false);
  // };
import NavBar from "./NavBar";
import { Route } from "react-router-dom";
export default function Home(){
  return (
    <>
    <NavBar />
    
    


      {/* <button
        onClick={handleLogout}
        className="bg-red-600 text-white p-2 rounded"
      >
        Se déconnecter
      </button> */}
    
    </>
  );
}

