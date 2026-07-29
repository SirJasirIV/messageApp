import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./login.module.css";
import logo from "../assets/Wink.png"

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [verified, setVerified] = useState(false);
   if (verified) {
    navigate("/conversations")
  }
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true)
        const formData = new FormData(e.target);
        const response = await fetch("http://localhost:3000/auth/login", {
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
        console.log(data);
        setMessage(data.message)
       if (!response.ok) {
       setLoading(false);
       return;
      }
        localStorage.setItem("token", data.token);
        const token = localStorage.getItem("token");

        console.log(token);
       const meResponse = await fetch("http://localhost:3000/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const me = await meResponse.json();
        console.log(me);
        setLoading(false)
        if (me.verified) {
          setVerified(true)
          navigate("/conversations")
        };
        if (!me.verified) {
          setVerified(false)
        }
    };
    return (
    <>
      <h1 className={styles.welcome}>Welcome to <img src={logo} alt="Wink" className={styles.logo}/></h1>
      <h1 className={styles.login}>Login to your account</h1>
      <div >
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
     </div>
           <Link to="/signup" className={styles.link}>
        Don't have an account? Sign up
      </Link>
      </form>
      

   
      </div>
    </>
  );
}

export default Login;