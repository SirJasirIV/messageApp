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
                    comments: { include: { author: true } }
                }
            }
        }
    });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const followerCount = await prisma.follow.count({
        where: { followingId: userId, status: "ACCEPTED" }
    });
    const followingCount = await prisma.follow.count({
        where: { followerId: userId, status: "ACCEPTED" }
    });
    const followRow = await prisma.follow.findUnique({
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
        followStatus: followRow ? followRow.status : null, 
        isOwnProfile: req.user.id === userId
    });
}


async function getAllUsers(req, res) {
    const users = await prisma.user.findMany({
        where: {
            id: { not: req.user.id },
            isGuest: false
        },
        select: {
            id: true,
            name: true,
            username: true,
            profilePic: true
        },
        orderBy: { name: "asc" }
    });

    const myFollows = await prisma.follow.findMany({
        where: { followerId: req.user.id },
        select: { followingId: true, status: true }
    });

    const followMap = new Map(myFollows.map(f => [f.followingId, f.status]));

    const usersWithStatus = users.map(user => ({
        ...user,
        followStatus: followMap.get(user.id) || null
    }));

    return res.json(usersWithStatus);
}


async function getIncomingRequests(req, res) {
    const requests = await prisma.follow.findMany({
        where: {
            followingId: req.user.id,
            status: "PENDING"
        },
        include: {
            follower: {
                select: { id: true, name: true, username: true, profilePic: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return res.json(requests);
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
        return res.status(409).json({ message: "Already following or requested" });
    }

    await prisma.follow.create({
        data: {
            followerId: req.user.id,
            followingId,
            status: "PENDING"
        }
    });

    return res.status(201).json({ message: "Follow request sent" });
}


async function acceptFollowRequest(req, res) {
    const followerId = Number(req.params.followerId);

    const existing = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId: req.user.id
            }
        }
    });

    if (!existing) {
        return res.status(404).json({ message: "Follow request not found" });
    }
    if (existing.status === "ACCEPTED") {
        return res.status(409).json({ message: "Already accepted" });
    }

    await prisma.follow.update({
        where: {
            followerId_followingId: {
                followerId,
                followingId: req.user.id
            }
        },
        data: { status: "ACCEPTED" }
    });

    return res.status(200).json({ message: "Follow request accepted" });
}


async function unfollowUser(req, res) {
    const targetId = Number(req.params.userId);

    
    const asFollower = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: req.user.id,
                followingId: targetId
            }
        }
    });
    if (asFollower) {
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: req.user.id,
                    followingId: targetId
                }
            }
        });
        return res.status(204).send();
    }

    return res.status(404).json({ message: "Not following" });
}

async function updateMyProfile(req, res) {
    const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
            bio: req.body.bio !== undefined ? req.body.bio : undefined,
            profilePic: req.body.profilePic !== undefined ? req.body.profilePic : undefined
        }
    });

    return res.json({
        id: updated.id,
        name: updated.name,
        username: updated.username,
        bio: updated.bio,
        profilePic: updated.profilePic
    });
}

export {
    getUserProfile,
    getAllUsers,
    getIncomingRequests,
    followUser,
    acceptFollowRequest,
    unfollowUser,
    updateMyProfile
};