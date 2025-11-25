import express from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
 
import validateRequest from "../../middlewares/validateRequest";
import { DoctorScheduleValidation } from "./doctorSchedule.validation";
 
 

const router = express.Router();

router.post(
    "/", validateRequest(DoctorScheduleValidation.createDoctorScheduleValidationSchema),
    auth(UserRole.DOCTOR, UserRole.ADMIN),
    DoctorScheduleController.insertIntoDB
)
// Get All Doctor Schedules (Admin Only)

// Retrieve all doctor schedules with pagination, searching, filtering, and sorting functionality.
// Access: Admin only.
router.get(
    "/",
    auth(UserRole.ADMIN), 
    DoctorScheduleController.getAllDoctorSchedules
);

router.get(
    "/my-schedules",
    auth(UserRole.DOCTOR),
    DoctorScheduleController.getMySchedules
);
router.delete(
    "/:id",
    auth(UserRole.DOCTOR),
    DoctorScheduleController.deleteFromDB
);
export const doctorScheduleRoutes = router;