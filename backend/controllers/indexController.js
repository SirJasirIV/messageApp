import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function getConversations(req, res) {
    const conversations = await prisma.conversationMember.findMany({
        where: { userId: req.user.id },
        include: {
            conversation: {
                include: {
                    messages: true,
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
                    author: true
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
    return res.status(401).json({
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
    const checkUser = await prisma.conversationMember.findUnique({
        where: { userId_conversationId: {
            userId: req.user.id,
            conversationId: Number(req.params.conversationId)
         }}
        });
    if (!checkUser) {
    return res.status(401).json({
        message: "Access to conversation denied"
      })
    };
    if (!req.body.text?.trim()) {
    return res.status(400).json({
        message: "Message cannot be empty"
    })};
    const newMessage = await prisma.message.create({
    data: { text: req.body.text,
        authorId: req.user.id,
        conversationId: Number(req.params.conversationId)
       }
    });

    return res.status(201).json(newMessage);
}
async function getUser(req, res) {
  const searchedUser = req.query.search;
  const users = await prisma.user.findMany({
  where: {
    id: {
      not: req.user.id,
    },
    OR: [
      {
        username: {
          contains: req.query.search,
          mode: "insensitive",
        },
      },
      {
        name: {
          contains: searchedUser,
          mode: "insensitive",
        },
      },
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

export { getConversations, getConversation, sendMessage, getUser, createConversation }