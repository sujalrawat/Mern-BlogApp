import { useState } from "react";
import "../App.css";

export default function RegisterPage() {

  const [username,setUsername] =useState('');
  const [password,setPassword] =useState('');

  async function register(ev){
    ev.preventDefault();
   
      const response = await fetch('http://localhost:3000/register',{
        method:"POST",
        body:JSON.stringify({username,password}),
        headers:{'Content-Type':"application/json"}
      })
      if(response.status!==200){
        alert("Registration failed. Try again later")
      }else{
        alert("Registration successful")
      }
    
    
  }

  return (
    <div>
      <form onSubmit={register} className="register">
        <h1>Register</h1>
        <input type="text" placeholder="username" value={username} onChange={ev => setUsername(ev.target.value)}></input>
        <input type="password" placeholder="password" value = {password} onChange={ev => setPassword(ev.target.value)}></input>
        <button >Register</button>
      </form>
    </div>
  );
}
