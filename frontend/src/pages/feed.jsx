import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./feed.module.css";
import uploadFile from "../utils/fileUpl";
import { api } from "../utils/api";

async function loadFeed() {
    const data = await api("/connect/feed");
    return Array.isArray(data) ? data : [];
}

function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postText, setPostText] = useState("");
    const [posting, setPosting] = useState(false);
    const [commentText, setCommentText] = useState({});
    const [postImage, setPostImage] = useState(null);
    const [uploadingPostImage, setUploadingPostImage] = useState(false);
    const currentUserId = Number(localStorage.getItem("userId"));

    useEffect(() => {
        let cancelled = false;

        loadFeed()
            .then(data => {
                if (!cancelled) setPosts(data);
            })
            .catch(err => console.error(err))
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

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
        try {
            await api("/connect/posts", {
                method: "POST",
                body: JSON.stringify({ text: postText, imageUrl: postImage })
            });
            setPostText("");
            setPostImage(null);
            setPosts(await loadFeed());
        } catch (err) {
            console.error(err);
        } finally {
            setPosting(false);
        }
    }

    function isLikedByMe(post) {
        return post.likes.some(like => like.userId === currentUserId);
    }

    async function toggleLike(post) {
        const alreadyLiked = isLikedByMe(post);
        const previousPosts = posts;

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

        try {
            await api(`/connect/posts/${post.id}/like`, {
                method: alreadyLiked ? "DELETE" : "POST"
            });
        } catch (err) {
            console.error(err);
            setPosts(previousPosts); 
        }
    }

    async function handleAddComment(e, postId) {
        e.preventDefault();
        const text = commentText[postId];
        if (!text?.trim()) return;

        try {
            const newComment = await api(`/connect/posts/${postId}/comments`, {
                method: "POST",
                body: JSON.stringify({ text })
            });
            setPosts(prevPosts =>
                prevPosts.map(p =>
                    p.id === postId
                        ? { ...p, comments: [...p.comments, newComment] }
                        : p
                )
            );
            setCommentText(prev => ({ ...prev, [postId]: "" }));
        } catch (err) {
            console.error(err);
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className={styles.page}>
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
                    {uploadingPostImage ? "Uploading..." : "Add image"}
                    <input type="file" accept="image/*" onChange={handlePostImageChange} hidden />
                </label>
                <button
                    className={styles.postButton}
                    type="submit"
                    disabled={posting || uploadingPostImage || (!postText.trim() && !postImage)}
                >
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