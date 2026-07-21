import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function Messages() {
    const [ conversation, setConversation ] = useState(null);
    const [textMessage, setTextMessage] = useState("");
    const { conversationId } = useParams();

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
  useEffect(() => {
    getMessage();
}, [conversationId]);

    console.log(conversationId);
    if (!conversation) {
    return <h1>Loading...</h1>;
}
    async function sendMessage(e) {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/auth/conversations/${conversationId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }, 
            body: JSON.stringify({
            text: textMessage
            })
        })
        if (response.ok) {
       setTextMessage("");
       await getMessage();
    }
        const data = await response.json();
        console.log(data);
        await getMessage();
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
    <form onSubmit={sendMessage}>
    <input type="text" name="message" placeholder="send something" value={textMessage} onChange={(e) => setTextMessage(e.target.value)}/>
    <button type="submit">Send</button>
    </form>
    </>
    )
}

export default Messages;