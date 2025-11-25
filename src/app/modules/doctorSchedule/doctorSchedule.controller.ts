import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { DoctorScheduleService } from "./doctorSchedule.service";
import { IJWTPayload } from "../../types";
import pick from "../../helpers/pick";
import { scheduleFilterableFields } from "./doctorSchedule.constant";
import { prisma } from "../../shared/prisma";
 
const insertIntoDB = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await DoctorScheduleService.insertIntoDB(user as IJWTPayload, req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Doctor Schedule created successfully!",
        data: result
    })
});
// Retrieve all doctor schedules with pagination, searching, filtering, and sorting functionality.

const getAllDoctorSchedules = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
      const filters = pick(req.query, scheduleFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await DoctorScheduleService.getAllDoctorSchedules(filters, options);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'doctor scheduiles retrieval successfully',
        meta: result.meta,
        data: result.data,
    });
});

 //    * Retrieve the authenticated doctor’s own schedules with **pagination**, **searching**, **filtering**, and **sorting** functionality.
const getMySchedules = catchAsync(async (req: Request & {user? : IJWTPayload}, res: Response) => {
    const filters = pick(req.query, scheduleFilterableFields) // searching , filtering
       const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting
      const result = await DoctorScheduleService.getMySchedules(req?.user as IJWTPayload, filters, options);

       sendResponse(res, {
           statusCode: 200,
           success: true,
           message: "My Schedules fetched successfully!",
           data: result
       })
   });


const deleteFromDB = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const scheduleId = req.params.id;
    const result = await DoctorScheduleService.deleteFromDB(req.user as IJWTPayload, scheduleId as string );

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctor Schedule deleted successfully!",
        data: result
    })
}       );  

export const DoctorScheduleController = {
    insertIntoDB,
    getAllDoctorSchedules,
    getMySchedules,
    deleteFromDB
}