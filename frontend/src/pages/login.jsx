import { Link, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import styles from "./login.module.css";
import logo from "../assets/Wink.png";
import { API_URL } from "../utils/api";
import { isTokenValid } from "../utils/auth.js";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const verified = isTokenValid();

   if (verified) {
    return <Navigate to="/feed" replace />;
  }
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true)
        const formData = new FormData(e.target);
        const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        user: formData.get("user"),
        password: formData.get("password"),
    }),
});
      console.log(response.status);

      const data = await response.json();
      setMessage(data.message)
      if (!response.ok) {
       setLoading(false);
       return;
      }
      localStorage.setItem("token", data.token);
      const token = localStorage.getItem("token");

      const meResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
               Authorization: `Bearer ${token}`
          }
       });
      const me = await meResponse.json();
      localStorage.setItem("userId", me.id);
      setLoading(false)
      navigate("/feed")
};
    async function handleGuestLogin() {
    setLoading(true);
    const response = await fetch(`${API_URL}/auth/guest`, {
        method: "POST"
    });
    const data = await response.json();

    if (!response.ok) {
        setMessage(data.message || "Something went wrong");
        setLoading(false);
        return;
    }

    localStorage.setItem("token", data.token);
    const token = localStorage.getItem("token");

    const meResponse = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const me = await meResponse.json();
    localStorage.setItem("userId", me.id);

    setLoading(false);
    navigate("/feed");
}
    return (
 
<div className={styles.page}>
   <header className={styles.header}>
     <h1 className={styles.welcome}>
        Welcome to <img src={logo} alt="Wink" className={styles.logo} />
     </h1>
     <p className={styles.login}>Login to your account</p>
  </header>
  <div>
    <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.name}>
        <input type="text" name="user" className={styles.input} required/>
        <label htmlFor="user" className={styles.label}>Enter your user *</label>
        </div>
        <div className={styles.pass}>
        <input type="password" name="password"  className={styles.input} required/>
        <label htmlFor="password" className={styles.label}>Enter your password *</label>
        </div>
        <div className={styles.btnCont}>
        {message && <p className={styles.message}>{message}</p>}
        <button className={styles.button} disabled={loading} type="submit">
    {loading ? <div className={styles.spinner}></div> : "Login"}
     </button>
     <button type="button" className={styles.guestButton} onClick={handleGuestLogin} disabled={loading}>
    Continue as guest
</button>
     </div>
      <Link to="/signup" className={styles.link}>
        Don't have an account? Sign up
      </Link>
      </form>
      

   
      </div>
      </div>
    
  );
}

export default Login;