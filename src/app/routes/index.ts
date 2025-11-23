import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { ScheduleRoutes } from '../modules/schedule/schedule.route';
import { doctorScheduleRoutes } from '../modules/doctorSchedule/doctorSchedule.route';
import { SpecialtiesRoutes } from '../modules/specialties/specialties.routes';
import { DoctorRoutes } from '../modules/doctor/doctor.route';
import { PatientRoutes } from '../modules/patient/patient.route';
import { AdminRoutes } from '../modules/admin/admin.route';
import path from 'path';
import { AppointmentRoutes } from '../modules/appoinment/appoinment.route';
import { PrescriptionRoutes } from '../modules/prescription/prescription.route';


const router = express.Router();

const moduleRoutes = [
        {
        path: '/user',
        route: UserRoutes
    },
    {
        path : "/auth",
        route : AuthRoutes
    },
    {
        path : "/schedule",
        route : ScheduleRoutes
    },
    {
        path : "/doctor-schedule",
        route : doctorScheduleRoutes
    },
        {
        path: '/specialties',
        route: SpecialtiesRoutes
    },
    {
        path : "/doctor",
        route : DoctorRoutes
    },
    {
        path : "/patient",
        route : PatientRoutes
    },
    {
        path : "/admin",
        route : AdminRoutes
    },
    {
        path : "/appointment",
        route : AppointmentRoutes
    },
    {
        path : "/prescription",
        route : PrescriptionRoutes
    }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;