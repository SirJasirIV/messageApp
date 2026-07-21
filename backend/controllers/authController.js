import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function getSignup(req, res) {
    console.log(req.body);
    const { name, user, password } = req.body;
    const existingUser = await prisma.user.findUnique({
        where: {
            username: user
        }
    });
    const hashedPass = await bcrypt.hash(password, 10)

if (!name?.trim() || !user?.trim() || !password?.trim()) {
    return res.status(400).json({
        message: "All fields are required."
    });
} if (existingUser) {
    return res.status(409).json({
        message: "Username already taken"
    })
};
    await prisma.user.create({
        data: {
            name: name,
            username: user,
            password: hashedPass
        }
    });
    return res.status(201).json({
        success: true,
        message: "User created successfully",
    });
}

async function getLogin(req, res) {
    const { user, password } = req.body
    const foundUser = await prisma.user.findUnique({
    where: {
    username: user,
    },
});
    if(!foundUser) {
     return res.status(401).json({
        message: "Invalid username or password"
     })
    };
  const matchedPass = await bcrypt.compare(
  password,
  foundUser.password
  );
  if(!matchedPass) {
     return res.status(401).json({
        message: "Invalid username or password"
    })
  } 
    const token = jwt.sign(
  { id: foundUser.id },

  process.env.JWT_SECRET,
  
  { expiresIn: "1h" });

  return res.status(200).json({
    message: "Logged in successfully",
    token
  })
}

function getMe(req, res) {
    
    return res.status(200).json({
        verified: true
    });
}
async function getConversations(req, res) {
    const conversations = await prisma.conversationMember.findMany({
        where: { userId: req.user.id },
        include: {
            conversation: {
                include: {
                    messages: true,
                }
            }
        }
    })

    return res.json(conversations);
}
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
         } }
        });
    if (!checkUser) {
      return res.status(401).json({
        message: "Access to conversation denied"
      })
    }
    if (!conversation) {
    return res.status(404).json({
        message: "Conversation not found",
    });
};
    console.log(conversation)
    return res.json(conversation)
}

async function sendMessage(req, res) {
        if (!req.body.text?.trim()) {
    return res.status(400).json({
        message: "Message cannot be empty"
    })};
    const newMessage = await prisma.message.create({
       data: { text: req.body.text,
        authorId: req.user.id,
        conversationId: Number(req.params.conversationId)
       }
    })

    return res.status(201).json(newMessage);
}
export { getSignup, getLogin, getMe, getConversations, getConversation, sendMessage };