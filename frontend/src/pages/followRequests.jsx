import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./allUsers.module.css";
import { api } from "../utils/api";

async function loadRequests() {
    const data = await api("/connect/follow-requests");
    return Array.isArray(data) ? data : [];
}

function getInitial(name) {
    return name?.trim()?.[0]?.toUpperCase() ?? "?";
}

function FollowRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leaving, setLeaving] = useState({}); // { [followerId]: "accept" | "reject" }

    useEffect(() => {
        let cancelled = false;

        loadRequests()
            .then(data => {
                if (!cancelled) setRequests(data);
            })
            .catch(err => console.error("Error fetching requests:", err))
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    async function handleRequest(followerId, action) {
        try {
            if (action === "accept") {
                await api(`/connect/follow-requests/${followerId}/accept`, { method: "POST" });
            } else {
                await api(`/connect/users/${followerId}/follow`, { method: "DELETE" });
            }
            // Start the exit animation; the row is removed when it finishes.
            setLeaving(prev => ({ ...prev, [followerId]: action }));
        } catch (error) {
            console.error(`Error trying to ${action} request:`, error);
        }
    }

    function removeRequest(followerId) {
        setRequests(prev => prev.filter(r => r.follower.id !== followerId));
        setLeaving(prev => {
            const next = { ...prev };
            delete next[followerId];
            return next;
        });
    }

    function rowClass(followerId) {
        if (leaving[followerId] === "accept") return `${styles.userRow} ${styles.leavingAccept}`;
        if (leaving[followerId] === "reject") return `${styles.userRow} ${styles.leavingReject}`;
        return styles.userRow;
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
                <h1 className={styles.title}>Follow requests</h1>
                {requests.length > 0 && (
                    <span key={requests.length} className={styles.count}>
                        {requests.length}
                    </span>
                )}
            </div>
            <p className={styles.subtitle}>People who want to follow you.</p>

            <div className={styles.usersList}>
                {requests.length === 0 ? (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>📭</span>
                        <p>No pending requests.</p>
                    </div>
                ) : (
                    requests.map((req, index) => {
                        const id = req.follower.id;
                        return (
                            <div
                                key={id}
                                className={rowClass(id)}
                                style={{ "--i": index }}
                                onAnimationEnd={() => leaving[id] && removeRequest(id)}
                            >
                                <Link to={`/users/${id}`} className={styles.userLink}>
                                    <div className={styles.avatar}>{getInitial(req.follower.name)}</div>
                                    <div className={styles.userText}>
                                        <h3>{req.follower.name}</h3>
                                        <p>@{req.follower.username}</p>
                                    </div>
                                </Link>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.acceptButton}
                                        disabled={!!leaving[id]}
                                        onClick={() => handleRequest(id, "accept")}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className={styles.rejectButton}
                                        disabled={!!leaving[id]}
                                        onClick={() => handleRequest(id, "reject")}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default FollowRequests;