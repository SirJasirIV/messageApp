import { useState } from "react";
import { useNavigate } from "react-router-dom";

;
function NewChat() {
    const [ searchedUser, setSearchedUser ] = useState("");
    const [users, setUsers] = useState([]);
    const [isGroup, setIsGroup] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState("");
    const navigate = useNavigate();
    async function addUser(e) {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/connect/users?search=${searchedUser}`, {
        method: "GET", 
        headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
        setUsers(data);
    }
    async function createConversation(participantId) {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/connect/conversations/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                memberId: participantId,
                isGroup: isGroup
            })
        });
        const data = await response.json();
        navigate(`/conversations/${data.id}`);
    } 
function toggleUser(user) {
    const alreadySelected = selectedUsers.some(
        selectedUser => selectedUser.id === user.id
    );

    if (alreadySelected) {
        setSelectedUsers(
            selectedUsers.filter(
                selectedUser => selectedUser.id !== user.id
            )
        );
    } else {
        setSelectedUsers([
            ...selectedUsers,
            user
        ]);
    }
};

    async function createGroup() {
        const token = localStorage.getItem("token");
        const memberIds = selectedUsers.map(user => user.id);
        const response = await fetch (`http://localhost:3000/connect/conversations/create`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                groupName: groupName,
                memberIds: memberIds,
                isGroup: isGroup
            })
        }); 
        const data = await response.json();
        navigate(`/conversations/${data.id}`);
    }
    return (
        <>
        <h1>New chaaat</h1>
        <hr />
        
        <form onSubmit={addUser}>
            <label htmlFor="conver">Choose the type of the conversation</label>
            <label htmlFor="direct"></label>
            <input type="radio" name="conver" id="direct" value="direct" onChange={() => setIsGroup(false)}/>
            <label htmlFor="group"></label>
            <input type="radio" name="conver" value="group" id="group" onChange={() => setIsGroup(true)}/>
            <label htmlFor="username">Enter the user of the participants</label>
            <input type="text" id="username" onChange={(e) => setSearchedUser(e.target.value)}/>
            <button type="submit">Submit</button>
        </form>
        <h2>Selected Users</h2>

{selectedUsers.map(user => (
    <button
        key={user.id}
        onClick={() => toggleUser(user)}
    >
        {user.name} ✕
    </button>
))}
  {isGroup && selectedUsers.length > 0 && (
    <>
        <label>Group Name</label>
        <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
        />

        <button onClick={createGroup}
        disabled={!groupName.trim()}>
            Create Group
        </button>
    </>
)}
       {users.map((user) => (
  <div
    key={user.id}
    onClick={() => {
      if (isGroup) {
        toggleUser(user);
      } else {
        createConversation(user.id);
      };
    }}
  >
    <h3>{user.name}</h3>
    <p>@{user.username}</p>
  </div>
))}
        </>
    )

}
export default NewChat;