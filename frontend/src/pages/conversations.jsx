import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ConversationList from "../components/ConversationList.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import { getSocket } from "../utils/socket";
import styles from "./conversation.module.css";
import { api } from "../utils/api";
import logo from "../assets/Wink.png";

async function loadConversations() {
  const data = await api("/connect/conversations");
  return Array.isArray(data) ? data : [];
}

function GetConversations() {
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [pickedId, setPickedId] = useState(null);
  const [unread, setUnread] = useState({});

  const conversationsRef = useRef([]);
  const currentUserId = Number(localStorage.getItem("userId"));

  
  const activeId = pickedId ?? (conversationId ? Number(conversationId) : null);
  const selectedConversation =
    conversations.find((c) => c.conversation.id === activeId) ?? null;

  function handleSelect(item) {
    const id = item.conversation.id;
    setPickedId(id);
    setUnread((prev) => (prev[id] ? { ...prev, [id]: 0 } : prev));
  }

  
  useEffect(() => {
    let cancelled = false;

    loadConversations()
      .then((data) => {
        if (!cancelled) setConversations(data);
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
    };
  }, []);

  
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function onNewMessage(msg) {
      const exists = conversationsRef.current.some(
        (c) => c.conversation.id === msg.conversationId
      );

      if (!exists) {
        loadConversations()
          .then(setConversations)
          .catch((err) => console.error(err));
        return;
      }

      setConversations((prev) => {
        const current = prev.find((c) => c.conversation.id === msg.conversationId);
        if (!current) return prev;

        const messages = current.conversation.messages ?? [];
        if (messages.some((m) => m.id === msg.id)) return prev;

        const updated = {
          ...current,
          conversation: {
            ...current.conversation,
            messages: [...messages, msg],
          },
        };
        return [updated, ...prev.filter((c) => c !== current)];
      });

      if (msg.conversationId !== activeId && msg.author.id !== currentUserId) {
        setUnread((prev) => ({
          ...prev,
          [msg.conversationId]: (prev[msg.conversationId] || 0) + 1,
        }));
      }
    }

    socket.on("message:new", onNewMessage);
    return () => socket.off("message:new", onNewMessage);
  }, [activeId, currentUserId]);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <ConversationList
          conversations={conversations}
          onSelect={handleSelect}
          unread={unread}
        />
      </div>

      <div className={styles.chat}>
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <p className={styles.Image}><img src={logo} alt="Select a conversation to start chatting" /></p>
        )}
      </div>
    </div>
  );
}

export default GetConversations;