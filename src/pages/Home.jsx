import React from "react";
import NavBar from "./NavBar";
import { Outlet } from "react-router-dom";
export default function Home() {

  return (
    <>
      <NavBar />
      
      <Outlet />
      
    </>
  );
}
