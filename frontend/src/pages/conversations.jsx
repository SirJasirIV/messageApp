import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConversationList from "../components/ConversationList.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import styles from "./conversation.module.css"

function GetConversations(){
  const [ conversations, setConversations ] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  useEffect(() => {
    async function fetchConversations() {
      
    
   const token = localStorage.getItem("token");
   const response = await fetch("http://localhost:3000/connect/conversations", {
    headers: {
          Authorization: `Bearer ${token}`
    }
   })
   const data = await response.json();
   console.log(data)
   setConversations(data);
  } 

  fetchConversations();
}, []);

  const navigate = useNavigate();

  return (
    <>
<div className={styles.container}>
  <div className={styles.sidebar}>
    <ConversationList
      conversations={conversations}
      onSelect={setSelectedConversation}
    />
    <button className={styles.button} onClick={() => navigate("/newChat")}>Create a new chat</button>
  </div>

  <div className={styles.chat}>
    {selectedConversation ? (
      <ChatWindow conversation={selectedConversation} />
    ) : (
      <p>Select a conversation</p>
    )}
  </div>
</div>
    
    </>
  )
};

export default GetConversations;