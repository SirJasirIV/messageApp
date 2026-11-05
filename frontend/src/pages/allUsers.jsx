import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./allUsers.module.css";
import { api } from "../utils/api";

async function loadUsers() {
    const data = await api("/connect/all-users");
    return Array.isArray(data) ? data : [];
}

function getInitial(name) {
    return name?.trim()?.[0]?.toUpperCase() ?? "?";
}

function UsersIndex() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        loadUsers()
            .then(data => {
                if (!cancelled) setUsers(data);
            })
            .catch(err => console.error("Error fetching users:", err))
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    async function followUser(userId) {
        try {
            await api(`/connect/users/${userId}/follow`, { method: "POST" });
            setUsers(await loadUsers());
        } catch (error) {
            console.error("Error following user:", error);
        }
    }

    async function unfollowUser(userId) {
        try {
            await api(`/connect/users/${userId}/follow`, { method: "DELETE" });
            setUsers(await loadUsers());
        } catch (error) {
            console.error("Error unfollowing user:", error);
        }
    }

    function renderButton(user) {
        if (user.followStatus === "ACCEPTED") {
            return (
                <button className={styles.followingButton} onClick={() => unfollowUser(user.id)}>
                    Following
                </button>
            );
        }
        if (user.followStatus === "PENDING") {
            return (
                <button className={styles.pendingButton} onClick={() => unfollowUser(user.id)}>
                    Requested
                </button>
            );
        }
        return (
            <button className={styles.followButton} onClick={() => followUser(user.id)}>
                Follow
            </button>
        );
    }

    if (loading) {
        return (
            <div className={styles.loader}>
                <div className={styles.spinner} />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.titleRow}>
                <h1 className={styles.title}>Find people</h1>
            </div>
            <p className={styles.subtitle}>Follow people to see their posts in your feed.</p>

            <div className={styles.usersList}>
                {users.length === 0 ? (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>🔍</span>
                        <p>No users found.</p>
                    </div>
                ) : (
                    users.map((user, index) => (
                        <div key={user.id} className={styles.userRow} style={{ "--i": index }}>
                            <Link to={`/users/${user.id}`} className={styles.userLink}>
                                <div className={styles.avatar}>{getInitial(user.name)}</div>
                                <div className={styles.userText}>
                                    <h3>{user.name}</h3>
                                    <p>@{user.username}</p>
                                </div>
                            </Link>
                            {renderButton(user)}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default UsersIndex;