import prisma from "../prisma/client.js";
import fs from "fs/promises";
import { fileTypeFromFile } from "file-type";
import { userOwnsUpload, deleteIfUnused } from "../utils/uploads.js";



async function getConversations(req, res) {
    const conversations = await prisma.conversationMember.findMany({
        where: { userId: req.user.id },
        include: {
            conversation: {
                include: {
                    messages: true,
                    participants: {
                     include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true
                            }
                        }
                     }
                    }
                }
            }  
        }})

    return res.json(conversations);
};

async function getConversation(req, res) {
    const conversationId = Number(req.params.conversationId);
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }, 
        include: {
            messages: {
    include: {
        author: { select: { id: true, name: true } }
    }
}
        }
    });
    const checkUser = await prisma.conversationMember.findUnique({
        where: { userId_conversationId: {
            userId: req.user.id,
            conversationId: Number(req.params.conversationId)
         }}
        });
    if (!checkUser) {
    return res.status(403).json({
        message: "Access to conversation denied"
      })
    };
    if (!conversation) {
    return res.status(404).json({
        message: "Conversation not found",
    });
};
    return res.json(conversation);
};

async function sendMessage(req, res) {
    const conversationId = Number(req.params.conversationId);

    const checkUser = await prisma.conversationMember.findUnique({
        where: {
            userId_conversationId: {
                userId: req.user.id,
                conversationId
            }
        }
    });

    if (!checkUser) {
        return res.status(403).json({ message: "Access to conversation denied" });
    }

    const text = req.body.text?.trim() ?? "";
    const imageUrl = req.body.imageUrl || null;

    if (imageUrl && !(await userOwnsUpload(req.user.id, imageUrl))) {
  return res.status(400).json({ message: "Invalid image" });
}
if (text.length > 2000) {
  return res.status(400).json({ message: "Message too long" });
}

    const message = await prisma.message.create({
        data: {
            text,
            imageUrl,
            authorId: req.user.id,
            conversationId
        },
        include: { author: { select: { id: true, name: true } } }
    });

    const io = req.app.get("io");

    if (io) {
        try {
            const members = await prisma.conversationMember.findMany({
                where: { conversationId },
                select: { userId: true }
            });

            members.forEach((m) => {
                io.to(`user:${m.userId}`).emit("message:new", message);
            });
        } catch (err) {
            console.error("Socket emit failed:", err);
        }
    }

    return res.status(201).json(message);
}

async function getUser(req, res) {
  const searchedUser = req.query.search;
  const users = await prisma.user.findMany({
  where: {
    id: { not: req.user.id },
    isGuest: false,
    OR: [
      { username: { contains: req.query.search, mode: "insensitive" } },
      { name: { contains: searchedUser, mode: "insensitive" } },
    ],
  },
  select: {
    id: true,
    username: true,
    name: true,
  },
});
return res.json(users);
};
async function createConversation(req, res) {
    if (req.body.isGroup) {
            if (!req.body.groupName?.trim()) {
        return res.status(400).json({
        message: "No group name"
      })
};

if (!Array.isArray(req.body.memberIds) || req.body.memberIds.length === 0) {
    return res.status(400).json({
        message: "No members"
    })}
    const createdGroup = await prisma.conversation.create({
        data: {
            name: req.body.groupName,
            isGroup: true
        }
       });
    await prisma.conversationMember.create({
        data: {
            userId: req.user.id,
            conversationId: createdGroup.id
        }});
    for (const memberId of req.body.memberIds) {
        await prisma.conversationMember.create({
            data: {
                userId: memberId,
                conversationId: createdGroup.id
            }
          })
        };


    return res.status(201).json(createdGroup);
    } 
    else {
 
const existingConversation = await prisma.conversation.findFirst({
    where: {
        AND: [
        {
    participants: {
    some: {
        userId: req.user.id
    }}}, 
{
    participants: {
    some: {
        userId: req.body.memberId
    }}
}       ]}}
    );
    if (existingConversation) {
        return res.status(409).json({
            message: "Conversation already exists!",
            id: existingConversation.id
        })
    };
    const createdConversation = await prisma.conversation.create({
        data: {}
    });
    await prisma.conversationMember.create({
        data: {
            conversationId: createdConversation.id,
            userId: req.user.id
        }
    });
    await prisma.conversationMember.create({
        data: {
            conversationId: createdConversation.id,
            userId: req.body.memberId
        }
    });
    return res.status(201).json(createdConversation)};
    
};

async function uploadImage(req, res) {
  await prisma.upload.create({
    data: { filename: req.file.filename, ownerId: req.user.id },
  });

  const url = `${process.env.API_URL || "http://localhost:3000"}/uploads/${req.file.filename}`;
  return res.status(201).json({ url });
}

async function typeValidation(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const type = await fileTypeFromFile(req.file.path);

    if (!type || !["image/jpeg", "image/png", "image/webp"].includes(type.mime)) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: "File is not a valid image" });
    }
    next();
  } catch (err) {
    await fs.unlink(req.file.path).catch(() => {});
    return res.status(500).json({ message: "Could not validate file" });
  }
}

  
  
async function upload(req, res){
  const url = `${process.env.API_URL || "http://localhost:3000"}/uploads/${req.file.filename}`;
  return res.status(201).json({ url });
}

async function updateMe(req, res) {
  const { bio, name, profilePic } = req.body;
  const data = {};

  if (typeof bio === "string") data.bio = bio.trim().slice(0, 300);

  if (typeof name === "string") {
    if (!name.trim()) return res.status(400).json({ message: "Name can't be empty" });
    data.name = name.trim().slice(0, 50);
  }

  if (profilePic !== undefined) {
    if (profilePic !== null && !(await userOwnsUpload(req.user.id, profilePic))) {
      return res.status(400).json({ message: "Invalid profile picture" });
    }
    data.profilePic = profilePic;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  const before = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { profilePic: true },
  });

  const user = await prisma.user.update({
    where: { id: req.user.id }, 
    data,                       
    select: { id: true, name: true, username: true, bio: true, profilePic: true },
  });

  if (before?.profilePic && before.profilePic !== user.profilePic) {
    await deleteIfUnused(before.profilePic);
  }

  return res.json(user);
}

export { getConversations, getConversation, sendMessage, getUser, createConversation, uploadImage, updateMe, typeValidation };