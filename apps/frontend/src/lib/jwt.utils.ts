import jwt from "jsonwebtoken";
const jwtKey = process.env.JWT_SECRET;

export const generateToken = (
  payload: { id: string; email: string; role: string }) =>
    {return jwt.sign(payload, jwtKey!, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, jwtKey!);
};
