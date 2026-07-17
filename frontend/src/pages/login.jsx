import { Link } from "react-router-dom";

function Login() {
  return (
    <>
      <h1>Login to your account</h1>
      <form method="post">
        <label htmlFor="user">Enter your user *</label>
        <input type="text" name="user" placeholder="username"/>
        <label htmlFor="password">Enter your password *</label>
        <input type="password" name="password"/>
        <button type="submit"></button>
      </form>

      <Link to="/signup">
        Don't have an account? Sign up
      </Link>
    </>
  );
}

export default Login;