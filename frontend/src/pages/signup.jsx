import { Link } from "react-router-dom";
function Signup() {
        async function handleSubmit(e) {
        e.preventDefault();
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
    }
  return (
    <>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Enter your name</label>
        <input type="text" name="name"/>
        <label htmlFor="user">Enter your user</label>
        <input type="text" name="user"/>
        <label htmlFor="password">Enter your password</label>
        <input type="password" name="password"/>
        <button type="submit">Submit</button>
      </form>

      <Link to="/">
        Already have an account? Login
      </Link>
    </>
  );
}

export default Signup;