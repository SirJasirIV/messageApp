import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./profile.module.css";

function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    async function fetchProfile() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:3000/connect/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                setProfile(null);
                return;
            }

            const data = await response.json();
            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        fetchProfile();
    }, [userId]);

    async function toggleFollow() {
        setFollowLoading(true);

        try {
            const token = localStorage.getItem("token");

            await fetch(
                `http://localhost:3000/connect/users/${userId}/follow`,
                {
                    method: profile.isFollowing ? "DELETE" : "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchProfile();
        } catch (error) {
            console.error("Error toggling follow:", error);
        } finally {
            setFollowLoading(false);
        }
    }

    if (loading) return <p>Loading...</p>;

    if (!profile) return <p>User not found</p>;

    return (
        <div className={styles.page}>
            <button
                className={styles.backButton}
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <div className={styles.card}>
                <h1 className={styles.name}>{profile.name}</h1>

                <p className={styles.username}>
                    @{profile.username}
                </p>

                {profile.bio && (
                    <p className={styles.bio}>
                        {profile.bio}
                    </p>
                )}

                <div className={styles.counts}>
                    <span>
                        <strong>{profile.followerCount}</strong> Followers
                    </span>

                    <span>
                        <strong>{profile.followingCount}</strong> Following
                    </span>

                    <span>
                        <strong>{profile.posts.length}</strong> Posts
                    </span>
                </div>

                {!profile.isOwnProfile && (
                    <button
                        className={styles.followButton}
                        onClick={toggleFollow}
                        disabled={followLoading}
                    >
                        {profile.isFollowing ? "Unfollow" : "Follow"}
                    </button>
                )}
            </div>

            <div className={styles.postsList}>
                {profile.posts.map((post) => (
                    <div
                        key={post.id}
                        className={styles.post}
                    >
                        <p className={styles.postText}>
                            {post.text}
                        </p>

                        <div className={styles.postMeta}>
                            <span>
                                {post.likes.length} likes
                            </span>

                            <span>
                                {post.comments.length} comments
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Profile;