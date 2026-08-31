import { useEffect, useRef, useState } from "react";
import styles from "../pages/conversation.module.css";
import uploadFile from "../utils/fileUpl";

function ChatWindow({ conversation }) {
    const [conversationData, setConversationData] = useState(null);
    const [textMessage, setTextMessage] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [chatImage, setChatImage] = useState(null);
    const [uploadingChatImage, setUploadingChatImage] = useState(false);

    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);

    const conversationId = conversation?.conversation?.id;

    async function getMessage(conversationId) {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `http://localhost:3000/connect/conversations/${conversationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setInfoMessage(
                    data.message || "Failed to load conversation."
                );
                return;
            }

            setConversationData(data);
            setInfoMessage("");
        } catch (error) {
            console.error("Error loading conversation:", error);
            setInfoMessage("Failed to load conversation.");
        }
    }

    useEffect(() => {
        if (!conversationId) return;

        async function loadConversation() {
            await getMessage(conversationId);
        }

        loadConversation();
    }, [conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [conversationData]);

    function getUserIdFromToken(token) {
        if (!token) return null;

        try {
            const payload = JSON.parse(
                atob(token.split(".")[1])
            );

            return payload.id ?? payload.userId ?? payload.sub;
        } catch {
            return null;
        }
    }

    const token = localStorage.getItem("token");
    const currentUserId = getUserIdFromToken(token);

    async function handleChatImageChange(e) {
        const file = e.target.files[0];

        if (!file) return;

        setUploadingChatImage(true);

        try {
            const url = await uploadFile(file);
            setChatImage(url);
        } catch (error) {
            console.error("Error uploading image:", error);
            setInfoMessage("Failed to upload image.");
        } finally {
            setUploadingChatImage(false);
        }
    }

    async function sendMessage(e) {
        e.preventDefault();

        if (!textMessage.trim() && !chatImage) return;

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `http://localhost:3000/connect/conversations/${conversationId}/messages`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        text: textMessage.trim(),
                        imageUrl: chatImage
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setInfoMessage(
                    data.message || "An error happened!"
                );
                return;
            }

            setInfoMessage("");
            setTextMessage("");
            setChatImage(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            await getMessage(conversationId);
        } catch (error) {
            console.error("Error sending message:", error);
            setInfoMessage("Failed to send message.");
        }
    }

    if (!conversationData) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <h3>
                {conversation.conversation.isGroup
                    ? conversation.conversation.name
                    : conversation.conversation.participants
                        ?.filter(
                            (user) => user.id !== currentUserId
                        )
                        .map((user) => user.name)
                        .join(", ")}
            </h3>

            <div className={styles.messages}>
                {conversationData.messages.map((message) => (
                    <div
                        key={message.id}
                        className={
                            message.author.id === currentUserId
                                ? styles.myMessage
                                : styles.theirMessage
                        }
                    >
                        <h3>{message.author.name}</h3>

                        {message.text && (
                            <p>{message.text}</p>
                        )}

                        {message.imageUrl && (
                            <img
                                src={message.imageUrl}
                                alt="attachment"
                                className={styles.chatImage}
                            />
                        )}
                    </div>
                ))}

                <div ref={bottomRef} />
            </div>

            <form
                className={styles.send}
                onSubmit={sendMessage}
            >
                {chatImage && (
                    <img
                        src={chatImage}
                        alt="preview"
                        className={styles.chatImagePreview}
                    />
                )}

                <label className={styles.imageUploadLabel}>
                    📷

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleChatImageChange}
                        hidden
                    />
                </label>

                <input
                    type="text"
                    name="message"
                    placeholder="Send something"
                    value={textMessage}
                    onChange={(e) =>
                        setTextMessage(e.target.value)
                    }
                />

                <button
                    type="submit"
                    disabled={uploadingChatImage}
                >
                    Send
                </button>
            </form>

            {uploadingChatImage && (
                <p>Uploading image...</p>
            )}

            {infoMessage && (
                <p>{infoMessage}</p>
            )}
        </>
    );
}

export default ChatWindow;