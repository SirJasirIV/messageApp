import { Link, useNavigate } from "react-router-dom";
function Login() {
  const navigate = useNavigate();
    async function handleSubmit(e) {
        e.preventDefault();
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
        if (me.verified) {
          navigate("/conversations")
        }
    };
    return (
    <>
      <h1>Login to your account</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="user">Enter your user *</label>
        <input type="text" name="user" placeholder="username"/>
        <label htmlFor="password">Enter your password *</label>
        <input type="password" name="password"/>
        <button type="submit">Submit</button>
      </form>

      <Link to="/signup">
        Don't have an account? Sign up
      </Link>
    </>
  );
}

export default Login;