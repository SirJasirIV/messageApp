import jsonwebtoken from "jsonwebtoken";

function verifyUser(req, res, next){
    console.log("Authorization header:", req.headers.authorization);
    const data = req.headers.authorization;
    console.log("Authorization header:", data);
    if (!data) {
        return res.status(401).json({
            message: "unauthorized"
        });
    };
    if (!data.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "unauthorized"
        })
    }
   const token = data.split(" ")[1];
   try { 
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
   } catch(err) {
    console.error(err)
    return ( 
        res.status(401).json({
        message: "an error happened in verification"
    }))
}
   
}

export default verifyUser;