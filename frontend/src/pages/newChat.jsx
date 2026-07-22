import { useState } from "react";
import { useNavigate } from "react-router-dom";

;
function NewChat() {
    const [ searchedUser, setSearchedUser ] = useState("");
    const [users, setUsers] = useState([]);
    const navigate = useNavigate()
    async function addUser(e) {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/auth/users?search=${searchedUser}`, {
        method: "GET", 
        headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log(data);
        setUsers(data);
    }
    async function createConversation(participantId) {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/auth/conversations/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                memberId: participantId
            })
        })
        const data = await response.json();
        console.log(data)
        navigate(`/conversations/${data.id}`)
    }
    return (
        <>
        <h1>New chaaat</h1>
        <form onSubmit={addUser}>
            <label htmlFor="username">Enter the user of the participants</label>
            <input type="text" id="username" onChange={(e) => setSearchedUser(e.target.value)}/>
            <button type="submit">Submit</button>
        </form>
        {users.map((user) => (
         <div key={user.id} onClick={() => createConversation(user.id)}>
         <h3>{user.name}</h3>
         <p>@{user.username}</p>
         </div>
        ))}
        </>
    )
}

export default NewChat;