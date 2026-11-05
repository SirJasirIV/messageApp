import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./newChat.module.css";
import { api } from "../utils/api";

function getInitial(name) {
    return name?.trim()?.[0]?.toUpperCase() ?? "?";
}

function NewChat() {
    const [searchedUser, setSearchedUser] = useState("");
    const [users, setUsers] = useState([]);
    const [searchedFor, setSearchedFor] = useState(null);
    const [searching, setSearching] = useState(false);
    const [isGroup, setIsGroup] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState("");
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();

    function changeType(group) {
        setIsGroup(group);
        if (!group) {
            setSelectedUsers([]);
            setGroupName("");
        }
    }

    async function searchUsers(e) {
        e.preventDefault();
        const query = searchedUser.trim();
        setSearching(true);
        try {
            const data = await api(`/connect/users?search=${encodeURIComponent(query)}`);
            setUsers(Array.isArray(data) ? data : []);
            setSearchedFor(query);
        } catch (error) {
            console.error("Error searching users:", error);
        } finally {
            setSearching(false);
        }
    }

    async function createConversation(participantId) {
        if (creating) return;
        setCreating(true);
        try {
            const data = await api("/connect/conversations/create", {
                method: "POST",
                body: JSON.stringify({ memberId: participantId, isGroup })
            });
            navigate(`/conversations/${data.id}`);
        } catch (error) {
            console.error("Error creating conversation:", error);
            setCreating(false);
        }
    }

    function isSelected(user) {
        return selectedUsers.some(u => u.id === user.id);
    }

    function toggleUser(user) {
        setSelectedUsers(prev =>
            prev.some(u => u.id === user.id)
                ? prev.filter(u => u.id !== user.id)
                : [...prev, user]
        );
    }

    async function createGroup() {
        if (creating) return;
        setCreating(true);
        try {
            const data = await api("/connect/conversations/create", {
                method: "POST",
                body: JSON.stringify({
                    groupName,
                    memberIds: selectedUsers.map(user => user.id),
                    isGroup
                })
            });
            navigate(`/conversations/${data.id}`);
        } catch (error) {
            console.error("Error creating group:", error);
            setCreating(false);
        }
    }

    function handleRowClick(user) {
        if (isGroup) {
            toggleUser(user);
        } else {
            createConversation(user.id);
        }
    }

    return (
        <div className={styles.page}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
                ← Back
            </button>

            <h1 className={styles.header}>Create a new chat</h1>
            <p className={styles.subtitle}>
                {isGroup
                    ? "Search for people, tap to add them, then name your group."
                    : "Search for someone and tap them to start chatting."}
            </p>

            <div className={styles.card}>
                <div className={styles.toggle} role="radiogroup" aria-label="Conversation type">
                    <span
                        className={styles.thumb}
                        style={{ transform: isGroup ? "translateX(100%)" : "translateX(0)" }}
                    />
                    <button
                        type="button"
                        role="radio"
                        aria-checked={!isGroup}
                        className={!isGroup ? `${styles.toggleBtn} ${styles.toggleActive}` : styles.toggleBtn}
                        onClick={() => changeType(false)}
                    >
                        💬 Direct message
                    </button>
                    <button
                        type="button"
                        role="radio"
                        aria-checked={isGroup}
                        className={isGroup ? `${styles.toggleBtn} ${styles.toggleActive}` : styles.toggleBtn}
                        onClick={() => changeType(true)}
                    >
                        👥 Group
                    </button>
                </div>

                <form className={styles.searchForm} onSubmit={searchUsers}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Search by name or username"
                        value={searchedUser}
                        onChange={(e) => setSearchedUser(e.target.value)}
                    />
                    <button type="submit" className={styles.primaryButton} disabled={searching}>
                        {searching ? "Searching..." : "Search"}
                    </button>
                </form>
            </div>

            {isGroup && selectedUsers.length > 0 && (
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>Selected ({selectedUsers.length})</h2>
                    <div className={styles.chips}>
                        {selectedUsers.map(user => (
                            <button
                                type="button"
                                key={user.id}
                                onClick={() => toggleUser(user)}
                                className={styles.selectedChip}
                            >
                                {user.name} ✕
                            </button>
                        ))}
                    </div>

                    <div className={styles.groupRow}>
                        <input
                            className={styles.input}
                            placeholder="Group name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={createGroup}
                            disabled={!groupName.trim() || creating}
                        >
                            {creating ? "Creating..." : "Create group"}
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.results}>
                {searchedFor !== null && users.length === 0 && (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>🔍</span>
                        <p>No users found.</p>
                    </div>
                )}

                {users.map((user, index) => {
                    const selected = isGroup && isSelected(user);
                    return (
                        <div
                            key={user.id}
                            role="button"
                            tabIndex={0}
                            className={selected ? `${styles.userRow} ${styles.selected}` : styles.userRow}
                            style={{ "--i": index }}
                            onClick={() => handleRowClick(user)}
                            onKeyDown={(e) => e.key === "Enter" && handleRowClick(user)}
                        >
                            <div className={styles.avatar}>{getInitial(user.name)}</div>
                            <div className={styles.userText}>
                                <h3>{user.name}</h3>
                                <p>@{user.username}</p>
                            </div>
                            {isGroup && <span className={styles.check}>{selected ? "✓" : "+"}</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default NewChat;