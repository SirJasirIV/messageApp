import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./profile.module.css";
import uploadFile from "../utils/fileUpl";
import { API_URL } from "../utils/api";

function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
   

const [uploadingPic, setUploadingPic] = useState(false);

async function handleProfilePicChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  setUploadingPic(true);
  try {
    const token = localStorage.getItem("token");
    const url = await uploadFile(file);

    const response = await fetch(`${API_URL}/connect/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ profilePic: url }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Failed to update profile picture");
    }

    await fetchProfile();
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    alert(error.message);
  } finally {
    setUploadingPic(false);
    e.target.value = "";
  }
}
    async function fetchProfile() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/connect/users/${userId}`,
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
        async function startFetching() {
            try{
                setLoading(true);
                fetchProfile();
            } catch (error) {
                console.log(error);
            }
        }
        startFetching();
    }, [userId]);

    async function toggleFollow() {
        setFollowLoading(true);

        try {
            const token = localStorage.getItem("token");

            await fetch(
                `${API_URL}/connect/users/${userId}/follow`,
                {
                    method: profile.followStatus ? "DELETE" : "POST",
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
    const avatarImg = (
    <img
        src={profile.profilePic || "/default-avatar.png"}
        alt={profile.name}
        className={styles.avatar}
        onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
    />)
    return (
        <div className={styles.page}>
            <button
                className={styles.backButton}
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <div className={styles.card}>
                

<label className={styles.avatarWrap}>


{profile.isOwnProfile ? (
    <label className={styles.avatarWrap}>
        {avatarImg}
        <span className={styles.avatarOverlay}>
            {uploadingPic ? "…" : ""}
        </span>
        <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleProfilePicChange}
            hidden
        />
    </label>
) : (
    <div className={`${styles.avatarWrap} ${styles.avatarStatic}`}>
        {avatarImg}
    </div>
)}
</label>

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
                        {profile.followStatus === "ACCEPTED" ? "Unfollow" : profile.followStatus === "PENDING" ? "Requested" : "Follow"}
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