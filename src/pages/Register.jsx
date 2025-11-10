import React from "react";
import { Link } from "react-router-dom";
import AuthPage from "./AuthPage."; 

function Register(){
    return (<div>
        <p>hello register</p>
        <p>retour <Link to="/Authpage" className="text-blue-700 hover:text-blue-400">retour</Link> </p>
    </div>);
}
export default Register;