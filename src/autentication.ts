import { verify } from "jsonwebtoken";

interface IJwt {
  readonly sub: string;
  readonly name: string;
  readonly iat: number;
  readonly exp: number;
}

export const authenticateHeader = (autenticationHeader?: string) => {
  if (autenticationHeader && autenticationHeader.startsWith("Bearer ")) {
    const token = autenticationHeader.split(" ")[1];
    try {
      const tokenObj = verify(token, process.env.TOKEN_SECRET!);
      return tokenObj as IJwt;
    } catch (err) {
      return undefined;
    }
  }
  return undefined;
};

export const verifyIdentity = (id: string, token?: IJwt) => {
  if (token && token.sub === id) return true;
  return false;
};
