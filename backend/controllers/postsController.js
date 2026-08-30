
import prisma from "../prisma/client.js";


async function getFeed(req, res) {
    const following = await prisma.follow.findMany({
        where: { followerId: req.user.id },
        select: { followingId: true }
    });
    const followingIds = following.map(f => f.followingId);

    const posts = await prisma.post.findMany({
        where: {
            authorId: { in: [req.user.id, ...followingIds] }
        },
        include: {
            author: { select: { id: true, name: true, username: true, profilePic: true } },
            comments: {
                include: {
                    author: { select: { id: true, name: true, username: true } }
                },
                orderBy: { createdAt: "asc" }
            },
            likes: true
        },
        orderBy: { createdAt: "desc" }
    });

    return res.json(posts);
}


async function getPost(req, res) {
    const postId = Number(req.params.postId);
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            author: { select: { id: true, name: true, username: true, profilePic: true } },
            comments: {
                include: {
                    author: { select: { id: true, name: true, username: true } }
                },
                orderBy: { createdAt: "asc" }
            },
            likes: true
        }
    });

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    return res.json(post);
}


async function createPost(req, res) {
    if (!req.body.text?.trim()) {
        return res.status(400).json({ message: "Post cannot be empty" });
    }

    const newPost = await prisma.post.create({
        data: {
            text: req.body.text,
            imageUrl: req.body.imageUrl || null,
            authorId: req.user.id
        },
        include: {
            author: { select: { id: true, name: true, username: true, profilePic: true } }
        }
    });

    return res.status(201).json(newPost);
}


async function deletePost(req, res) {
    const postId = Number(req.params.postId);
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }
    if (post.authorId !== req.user.id) {
        return res.status(401).json({ message: "You can only delete your own posts" });
    }

    await prisma.comment.deleteMany({ where: { postId } });
    await prisma.like.deleteMany({ where: { postId } });
    await prisma.post.delete({ where: { id: postId } });

    return res.status(204).send();
}


async function likePost(req, res) {
    const postId = Number(req.params.postId);
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    const existingLike = await prisma.like.findUnique({
        where: { userId_postId: { userId: req.user.id, postId } }
    });
    if (existingLike) {
        return res.status(409).json({ message: "Already liked" });
    }

    await prisma.like.create({
        data: { userId: req.user.id, postId }
    });

    return res.status(201).json({ message: "Liked" });
}

async function unlikePost(req, res) {
    const postId = Number(req.params.postId);

    const existingLike = await prisma.like.findUnique({
        where: { userId_postId: { userId: req.user.id, postId } }
    });
    if (!existingLike) {
        return res.status(404).json({ message: "Like not found" });
    }

    await prisma.like.delete({
        where: { userId_postId: { userId: req.user.id, postId } }
    });

    return res.status(204).send();
}

async function commentOnPost(req, res) {
    const postId = Number(req.params.postId);

    if (!req.body.text?.trim()) {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    const newComment = await prisma.comment.create({
        data: {
            text: req.body.text,
            authorId: req.user.id,
            postId
        },
        include: {
            author: { select: { id: true, name: true, username: true } }
        }
    });

    return res.status(201).json(newComment);
}

export {
    getFeed,
    getPost,
    createPost,
    deletePost,
    likePost,
    unlikePost,
    commentOnPost
};