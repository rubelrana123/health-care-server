import express from 'express'
import { ReviewController } from './review.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
    '/',
    auth(UserRole.PATIENT),
    ReviewController.insertIntoDB
);
router.get(
    '/',
    // auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
    ReviewController.getAllFromDB
);

export const ReviewRoutes = router;