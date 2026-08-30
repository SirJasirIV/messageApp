import prisma from "../prisma/client.js";

async function getUserProfile(req, res) {
    const userId = Number(req.params.userId);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            username: true,
            bio: true,
            profilePic: true,
            posts: {
                orderBy: { createdAt: "desc" },
                include: {
                    likes: true,
                    comments: true
                }
            }
        }
    });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const followerCount = await prisma.follow.count({
        where: { followingId: userId }
    });
    const followingCount = await prisma.follow.count({
        where: { followerId: userId }
    });
    const isFollowing = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: req.user.id,
                followingId: userId
            }
        }
    });

    return res.json({
        ...user,
        followerCount,
        followingCount,
        isFollowing: Boolean(isFollowing),
        isOwnProfile: req.user.id === userId
    });
}


async function followUser(req, res) {
    const followingId = Number(req.params.userId);

    if (followingId === req.user.id) {
        return res.status(400).json({ message: "You can't follow yourself" });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: followingId } });
    if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const existing = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: req.user.id,
                followingId
            }
        }
    });
    if (existing) {
        return res.status(409).json({ message: "Already following" });
    }

    await prisma.follow.create({
        data: {
            followerId: req.user.id,
            followingId
        }
    });

    return res.status(201).json({ message: "Followed" });
}


async function unfollowUser(req, res) {
    const followingId = Number(req.params.userId);

    const existing = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: req.user.id,
                followingId
            }
        }
    });
    if (!existing) {
        return res.status(404).json({ message: "Not following" });
    }

    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId: req.user.id,
                followingId
            }
        }
    });

    return res.status(204).send();
}

export { getUserProfile, followUser, unfollowUser };