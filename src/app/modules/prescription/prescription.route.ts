import { UserRole } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import { PrescriptionController } from './prescription.controller';
const router = express.Router();


router.post(
    "/",
    auth(UserRole.DOCTOR),
    PrescriptionController.createPrescription
);

router.get(
    '/my-prescription',
    auth(UserRole.PATIENT),
    PrescriptionController.patientPrescription
)
export const PrescriptionRoutes = router;