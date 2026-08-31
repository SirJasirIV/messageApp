import prisma from "../prisma/client.js";

const GUEST_MAX_AGE_HOURS = 24;

async function cleanupGuests() {
    const cutoff = new Date(Date.now() - GUEST_MAX_AGE_HOURS * 60 * 60 * 1000);

    const staleGuests = await prisma.user.findMany({
        where: {
            isGuest: true,
            createdAt: { lt: cutoff }
        },
        select: { id: true }
    });

    for (const guest of staleGuests) {
        const guestId = guest.id;

        const guestPosts = await prisma.post.findMany({
            where: { authorId: guestId },
            select: { id: true }
        });
        const guestPostIds = guestPosts.map(p => p.id);

        await prisma.comment.deleteMany({
            where: {
                OR: [
                    { authorId: guestId },
                    { postId: { in: guestPostIds } }
                ]
            }
        });
        await prisma.like.deleteMany({
            where: {
                OR: [
                    { userId: guestId },
                    { postId: { in: guestPostIds } }
                ]
            }
        });
        await prisma.post.deleteMany({ where: { authorId: guestId } });
        await prisma.message.deleteMany({ where: { authorId: guestId } });
        await prisma.follow.deleteMany({
            where: {
                OR: [
                    { followerId: guestId },
                    { followingId: guestId }
                ]
            }
        });
        await prisma.conversationMember.deleteMany({ where: { userId: guestId } });
        await prisma.user.delete({ where: { id: guestId } });

        console.log(`Cleaned up guest user ${guestId}`);
    }

    if (staleGuests.length > 0) {
        console.log(`Guest cleanup: removed ${staleGuests.length} account(s)`);
    }
}

export default cleanupGuests;