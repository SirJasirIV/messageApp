import { useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";

function GetConversations(){
  const [ conversations, setConversations ] = useState([]);
  useEffect(() => {
    async function fetchConversations() {
      
    
   const token = localStorage.getItem("token");
   const response = await fetch("http://localhost:3000/auth/conversations", {
    headers: {
          Authorization: `Bearer ${token}`
    }
   })
   const data = await response.json();
   console.log(data);
   setConversations(data)
  } 

  fetchConversations();
}, []);
   const navigate = useNavigate();
  return (
    <>
    {conversations.map((member) => {
      return (
      <div key={member.conversation.id}
      onClick={() => navigate(`/conversations/${member.conversation.id}`)}>
        <h2>Conversation #{member.conversation.id}</h2>
        <p>Messages: {member.conversation.messages.length}</p>
      </div>
    )
    })}
    </>
  )
}

export default GetConversations;