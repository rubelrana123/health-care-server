import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
 
import { IJWTPayload } from "../../types";
import sendResponse from "../../shared/sendResponse";
 
 
import pick from "../../helpers/pick";
import { AppointmentService } from "./appoinment.service";
import { AppointmentStatus } from "@prisma/client";
import { appointmentFilterableFields } from "./appoinment.constant";
 


const createAppointment = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await AppointmentService.createAppointment(user as IJWTPayload, req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Appointment created successfully!",
        data: result
    })
});

const getMyAppointment = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const fillters = pick(req.query, ["status", "paymentStatus"])
    const user = req.user;
    const result = await AppointmentService.getMyAppointment(user as IJWTPayload, fillters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Appointment fetched successfully!",
        data: result
    })
})

const updateAppointmentStatus = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const appointmentId = req.params.id;
    const status : AppointmentStatus = req.body.status;
    const result = await AppointmentService.updateAppointmentStatus(req.user as IJWTPayload, appointmentId, status);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Appointment status updated successfully!",
        data: result
    })
})

const getAllAppointments = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
     const filters = pick(req.query, appointmentFilterableFields)
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await AppointmentService.getAllAppointments(filters, options);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Appointment retrieval successfully',
        meta: result.meta,
        data: result.data,
    });
});

export const AppointmentController = {
    createAppointment,
    getMyAppointment,
    updateAppointmentStatus,
    getAllAppointments
}