import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function Messages() {
    const [ conversation, setConversation ] = useState(null);
    const { conversationId } = useParams();
    useEffect(() => {
        async function getMessage() {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3000/auth/conversations/${conversationId}`, {
            headers: {
            Authorization: `Bearer ${token}`
        }
   })
   const data = await response.json();
   console.log(data);
   setConversation(data);
    }
    getMessage();
    }, []);
  
    console.log(conversationId);
    if (!conversation) {
    return <h1>Loading...</h1>;
}
    return (
    <>
    <h1>Conversation {conversationId}</h1>
    {conversation.messages.map((message) => (
    <div key={message.id}>
     <h3>{message.author.name}</h3>
     <p>{message.text}</p>
    </div>
    ))}
    
    </>
    )
}

export default Messages;