import { useEffect, useRef, useState } from "react";
import styles from "../pages/conversation.module.css"

function ChatWindow({ conversation }){
    const [ conversationData, setConversationData ] = useState(null);
    const [textMessage, setTextMessage] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const bottomRef = useRef(null);

    async function getMessage(conversationId) {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/connect/conversations/${conversationId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await response.json();
        setConversationData(data);
    }

    const conversationId = conversation?.conversation.id;
    useEffect(() => {
        if (!conversationId) return;
        async function loadConversation() {
            await getMessage(conversationId);
        }
        loadConversation();
    }, [conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversationData]);

    if (!conversationData) {
        return <p>Loading...</p>;
    }

    async function sendMessage(e) {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/connect/conversations/${conversation.conversation.id}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }, 
            body: JSON.stringify({
                text: textMessage
            })
        });

        const data = await response.json();

        if (!response.ok) {
            setInfoMessage(data.message || "An error happened!");
            return;
        }

        setInfoMessage("");
        setTextMessage("");
        await getMessage(conversation.conversation.id);
    };
    const token = localStorage.getItem("token")
    function getUserIdFromToken(token) {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.id ?? payload.userId ?? payload.sub; // depends on what your backend put in the token
    } catch {
        return null;
    }
}
const currentUserId = getUserIdFromToken(token);
    return (
        <>
            <h3>
                {conversation.conversation.isGroup
                    ? conversation.conversation.name
                    : `Conversation #${conversation.conversation.id}`}
            </h3>
            <div className={styles.messages}>
            {conversationData.messages.map((message) => (
                <div key={message.id} className={message.author.id === currentUserId ? styles.urMessage : styles.theirMessage}>
                    <h3>{message.author.name}</h3>
                    <p>{message.text}</p>
                </div>
            ))}
            <div ref={bottomRef} />
            </div>
            <form className={styles.send} onSubmit={sendMessage}>
                <input type="text" name="message" placeholder="send something" value={textMessage} onChange={(e) => setTextMessage(e.target.value)}/>
                <button type="submit"><svg t="1569683742680" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14019" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40"><path d="M931.4 498.9L94.9 79.5c-3.4-1.7-7.3-2.1-11-1.2-8.5 2.1-13.8 10.7-11.7 19.3l86.2 352.2c1.3 5.3 5.2 9.6 10.4 11.3l147.7 50.7-147.6 50.7c-5.2 1.8-9.1 6-10.3 11.3L72.2 926.5c-0.9 3.7-0.5 7.6 1.2 10.9 3.9 7.9 13.5 11.1 21.5 7.2l836.5-417c3.1-1.5 5.6-4.1 7.2-7.1 3.9-8 0.7-17.6-7.2-21.6zM170.8 826.3l50.3-205.6 295.2-101.3c2.3-0.8 4.2-2.6 5-5 1.4-4.2-0.8-8.7-5-10.2L221.1 403 171 198.2l628 314.9-628.2 313.2z" p-id="14020"></path></svg></button>
            </form>
            <p>{infoMessage}</p>
        </>
    )
}

export default ChatWindow;