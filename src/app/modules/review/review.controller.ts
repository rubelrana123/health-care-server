import { Request, Response } from "express";
import httpStatus from "http-status";
import { ReviewService } from "./review.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types";
import pick from "../../helpers/pick";

const insertIntoDB = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await ReviewService.insertIntoDB(user as IJWTPayload, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review created successfully',
        data: result,
    });
});


const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query,  ['patientEmail', 'doctorEmail']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await ReviewService.getAllFromDB(filters, options as any);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
export const ReviewController = {
    insertIntoDB,
    getAllFromDB
}