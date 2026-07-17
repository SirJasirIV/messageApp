import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

async function testController(req, res) {
    console.log(req.body);
    const { name, user, password } = req.body;
    const existingUser = await prisma.user.findUnique({
        where: {
            username: user
        }
    });
    const hashedPass = await bcrypt.hash(password, 10)

if (!name?.trim || !user?.trim || !password?.trim) {
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

export default testController;