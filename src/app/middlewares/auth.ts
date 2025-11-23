import { NextFunction, Request, Response } from "express"
import { jwtHelper } from "../helpers/jwtHelpers";
 

const auth = (...roles: string[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            //access token
            const token = req.cookies.accessToken;

            if (!token) {
                throw new Error("You are not authorized!!")
            }
           console.log(token , roles, "here auth")
            const verifyUser = jwtHelper.verifyToken(token, "abcd");
console.log(verifyUser , "verifyUser")
            req.user = verifyUser;

            if (roles.length && !roles.includes(verifyUser.role)) {
                throw new Error("You are not authorized!!!!")
            }

            next();
        }
        catch (err) {
            next(err)
        }
    }
}

export default auth;