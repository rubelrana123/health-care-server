import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
 
 
const router = express.Router();

router.get(
    '/me',
    auth(
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    AuthController.getMe
);

router.post(
    "/login",AuthController.login

)

router.post(
    '/refresh-token',
    AuthController.refreshToken
)

router.post(
    '/change-password',
    auth(
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    AuthController.changePassword
);

router.post(
    '/forgot-password',
    AuthController.forgotPassword
);

router.post(
    '/reset-password',
    AuthController.resetPassword
)



 export const AuthRoutes = router;