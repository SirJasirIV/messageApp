import { Link } from "react-router-dom";
import classes from "./sign.module.css";
import logo from "../assets/Wink.png";
import { useState } from "react";
function Signup() {
        const [loading, setLoading] = useState(false);
        const [message, setMessage] = useState("");
        async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true)
        const formData = new FormData(e.target);
        const response = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        name: formData.get("name"),
        user: formData.get("user"),
        password: formData.get("password"),
    }),
});
        console.log(response.status);

        const data = await response.json();
        console.log(data);
        setMessage(data.message)
        setLoading(false)
    }
  return (
    <>
      <h1 className={classes.signUp}>Sign up for <img src={logo} alt="Wink" /></h1>
      <form onSubmit={handleSubmit} className={classes.form}>
        <div className={classes.inputCont}>
        <input type="text" name="name" className={classes.input} required/>
        <label htmlFor="name" className={classes.label}>Enter your name</label>
        </div>
        <div className={classes.inputCont}>
        <input type="text" name="user" className={classes.input} required/>
        <label htmlFor="user" className={classes.label}>Enter your user</label>
        </div>
        <div className={classes.inputCont}>
        <input type="password" name="password" className={classes.input} required/>
        <label htmlFor="password" className={classes.label}>Enter your password</label>
         </div>
         <div className={classes.btnCont}>
          {message && <p className={classes.message}>{message}</p>}
        <button type="submit" className={classes.button}>
          {loading ? <div className={classes.spinner}></div> : "Sign Up"}
        </button>
        </div>
         <Link to="/" className={classes.link}>
        Already have an account? Login
      </Link>
      </form>

     
    </>
  );
}

export default Signup;