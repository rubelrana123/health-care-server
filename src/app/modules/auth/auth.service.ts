//user service here
import bcrypt from 'bcryptjs';
 
import { prisma } from '../../shared/prisma';
 
import { UserStatus } from '@prisma/client';
import { jwtHelper } from '../../helpers/jwtHelpers';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';

 const login = async ({email, password} : {email :string, password : string}) => {
 
   
     const isUserExit = await prisma.user.findUnique({
         where: {
             email,
             status : UserStatus.ACTIVE
            },
        })
    const isCorrectPassword = await bcrypt.compare(password,isUserExit?.password as string);
    if(!isCorrectPassword) {
        throw new Error("password is incorrect")
    }
    
    const accessToken = jwtHelper.generateToken({ email: isUserExit?.email, role: isUserExit?.role }, "abcd", "10d");

    const refreshToken = jwtHelper.generateToken({ email: isUserExit?.email, role: isUserExit?.role }, "abcdefgh", "90d");

    return {
        accessToken,
        refreshToken,
        needPasswordChange: isUserExit?.needPasswordChange
    }
}
 
 const refreshToken = async (token: string) => {
    let decodedData;
    try {
        decodedData = jwtHelper.verifyToken(token, config.jwt.refresh_token_secret as Secret);
    }
    catch (err) {
        throw new Error("You are not authorized!")
    }

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: UserStatus.ACTIVE
        }
    });

    const accessToken = jwtHelper.generateToken({
        email: userData.email,
        role: userData.role
    },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );

    return {
        accessToken,
        needPasswordChange: userData.needPasswordChange
    };

};

export const AuthService = {
    login,
    refreshToken
}