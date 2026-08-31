import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./feed.module.css";
import uploadFile from "../utils/fileUpl";
import { logout } from "../utils/auth";

function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postText, setPostText] = useState("");
    const [posting, setPosting] = useState(false);
    const [commentText, setCommentText] = useState({}); 
    const navigate = useNavigate();
    const currentUserId = Number(localStorage.getItem("userId"));

    async function fetchFeed() {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/connect/feed", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
        setPosts(data);
        setLoading(false);
    }

    useEffect(() => {
        fetchFeed();
    }, []);




const [postImage, setPostImage] = useState(null);
const [uploadingPostImage, setUploadingPostImage] = useState(false);

async function handlePostImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPostImage(true);
    try {
        const url = await uploadFile(file);
        setPostImage(url);
    } catch (error) {
        console.error("Error uploading image:", error);
    } finally {
        setUploadingPostImage(false);
    }
}

async function handleCreatePost(e) {
    e.preventDefault();
    if (!postText.trim() && !postImage) return;

    setPosting(true);
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3000/connect/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: postText, imageUrl: postImage })
    });

    if (response.ok) {
        setPostText("");
        setPostImage(null);
        await fetchFeed();
    }
    setPosting(false);
}

    function isLikedByMe(post) {
        return post.likes.some(like => like.userId === currentUserId);
    }

    async function toggleLike(post) {
        const token = localStorage.getItem("token");
        const alreadyLiked = isLikedByMe(post);

    
        setPosts(prevPosts =>
            prevPosts.map(p => {
                if (p.id !== post.id) return p;
                return {
                    ...p,
                    likes: alreadyLiked
                        ? p.likes.filter(like => like.userId !== currentUserId)
                        : [...p.likes, { userId: currentUserId, postId: post.id }]
                };
            })
        );

        await fetch(`http://localhost:3000/connect/posts/${post.id}/like`, {
            method: alreadyLiked ? "DELETE" : "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    async function handleAddComment(e, postId) {
        e.preventDefault();
        const text = commentText[postId];
        if (!text?.trim()) return;

        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/connect/posts/${postId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        });

        if (response.ok) {
            const newComment = await response.json();
            setPosts(prevPosts =>
                prevPosts.map(p =>
                    p.id === postId
                        ? { ...p, comments: [...p.comments, newComment] }
                        : p
                )
            );
            setCommentText(prev => ({ ...prev, [postId]: "" }));
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Feed</h1>
                <button onClick={() => navigate("/conversations")}>Messages</button>
                <button onClick={() => navigate("/all-users")}>Find users</button>
                <button onClick={() => navigate("/follow-requests")}>Requests</button>
                <button onClick={() => logout(navigate)}>Sign Out</button>
            </div>

            <form className={styles.postForm} onSubmit={handleCreatePost}>
                <textarea
                    className={styles.postInput}
                    placeholder="What's on your mind?"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                />
                {postImage && (
    <img src={postImage} alt="preview" className={styles.imagePreview} />
)}
<label className={styles.imageUploadLabel}>
    {uploadingPostImage ? "Uploading..." : "📷 Add image"}
    <input type="file" accept="image/*" onChange={handlePostImageChange} hidden />
</label>
                <button className={styles.postButton} type="submit" disabled={posting || !postText.trim()}>
                    {posting ? "Posting..." : "Post"}
                </button>
            </form>

            <div className={styles.postsList}>
                {posts.length === 0 ? (
                    <p>No posts yet. Follow people or create your first post!</p>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className={styles.post}>
                            <h3 className={styles.postAuthor}>
                                <Link to={`/users/${post.author.id}`} className={styles.authorLink}>
                                    {post.author.name}
                                </Link>
                            </h3>
                            <p className={styles.postText}>{post.text}</p>
                           {post.imageUrl && (
                           <img src={post.imageUrl} alt="post" className={styles.postImage} />
                          )}

                            <div className={styles.postActions}>
                                <button
                                    className={isLikedByMe(post) ? styles.likedButton : styles.likeButton}
                                    onClick={() => toggleLike(post)}
                                >
                                    {isLikedByMe(post) ? "♥" : "♡"} {post.likes.length}
                                </button>
                                <span className={styles.commentCount}>{post.comments.length} comments</span>
                            </div>

                            <div className={styles.commentsList}>
                                {post.comments.map((comment) => (
                                    <div key={comment.id} className={styles.comment}>
                                        <Link to={`/users/${comment.author.id}`} className={styles.authorLink}>
                                            <strong>{comment.author.name}</strong>
                                        </Link>{" "}
                                        {comment.text}
                                    </div>
                                ))}
                            </div>

                            <form
                                className={styles.commentForm}
                                onSubmit={(e) => handleAddComment(e, post.id)}
                            >
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={commentText[post.id] || ""}
                                    onChange={(e) =>
                                        setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))
                                    }
                                />
                                <button type="submit">Send</button>
                            </form>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Feed;