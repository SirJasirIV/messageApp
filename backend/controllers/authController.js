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

function getMessage(req, res) {
    return res.status(200).json({
        verified: true
    });
}
export { getSignup, getLogin, getMessage };