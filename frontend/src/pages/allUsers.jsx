import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./allUsers.module.css";

function UsersIndex() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    async function fetchUsers() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3000/connect/all-users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    async function followUser(userId) {
        try {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:3000/connect/users/${userId}/follow`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchUsers();
        } catch (error) {
            console.error("Error following user:", error);
        }
    }

    async function unfollowUser(userId) {
        try {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:3000/connect/users/${userId}/follow`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchUsers();
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

    if (loading) return <p>Loading...</p>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Users</h1>
                <button onClick={() => navigate("/feed")}>Back to Feed</button>
            </div>

            <div className={styles.usersList}>
                {users.map((user) => (
                    <div key={user.id} className={styles.userRow}>
                        <Link to={`/users/${user.id}`} className={styles.userLink}>
                            <h3>{user.name}</h3>
                            <p>@{user.username}</p>
                        </Link>
                        {renderButton(user)}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UsersIndex;