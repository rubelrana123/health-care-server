import express from "express";
 
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { AppointmentController } from "./appoinment.controller";

const router = express.Router();

router.get(
    "/my-appointments",
    auth(UserRole.PATIENT, UserRole.DOCTOR),
    AppointmentController.getMyAppointment
)

router.post(
    "/",
    auth(UserRole.PATIENT),
    AppointmentController.createAppointment
)

router.patch(
    "/status/:id",
    auth(UserRole.DOCTOR),
    AppointmentController.updateAppointmentStatus
 )

// task //  Get All Appointments (Admin Only)

// Retrieve all appointments with pagination, searching, filtering, and sorting functionality.
// Access: Admin only.

router.get(
    "/",
    auth(UserRole.ADMIN),
    AppointmentController.getAllAppointments
)

export const AppointmentRoutes = router;