import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./allUsers.module.css"; 

function FollowRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    async function fetchRequests() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3000/connect/follow-requests", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRequests();
    }, []);

    async function acceptRequest(followerId) {
        try {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:3000/connect/follow-requests/${followerId}/accept`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchRequests();
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    }

    async function rejectRequest(followerId) {
        try {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:3000/connect/users/${followerId}/follow`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchRequests();
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    }

    if (loading) return <p>Loading...</p>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Follow Requests</h1>
                <button onClick={() => navigate("/feed")}>Back to Feed</button>
            </div>

            <div className={styles.usersList}>
                {requests.length === 0 ? (
                    <p>No pending requests.</p>
                ) : (
                    requests.map((req) => (
                        <div key={req.followerId} className={styles.userRow}>
                            <Link to={`/users/${req.follower.id}`} className={styles.userLink}>
                                <h3>{req.follower.name}</h3>
                                <p>@{req.follower.username}</p>
                            </Link>
                            <div>
                                <button className={styles.followButton} onClick={() => acceptRequest(req.follower.id)}>
                                    Accept
                                </button>
                                <button className={styles.followingButton} onClick={() => rejectRequest(req.follower.id)}>
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default FollowRequests;