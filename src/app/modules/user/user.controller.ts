import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserService } from "./user.service";
import pick from "../../helpers/pick";
import { userFilterableFields } from "./user.constant";
import { IJWTPayload } from "../../types";

const createPatient = catchAsync(async (req: Request, res: Response) => {
    console.log("hello i am controller", req)
    const result = await UserService.createPatient(req);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Patient created successfully!",
        data: result
    })
})

const createAdmin = catchAsync(async (req: Request, res: Response) => {
    console.log("hello admin cintrolller")
    console.log(req.body, "req from controller")
    const result = await UserService.createAdmin(req);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Admin Created successfuly!",
        data: result
    })
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  console.log(req, "req from controller")
    const result = await UserService.createDoctor(req);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Doctor Created successfuly!",
        data: result
    })
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, userFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting

    const result = await UserService.getAllFromDB(filters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User retrive successfully!",
        meta: result.meta,
        data: result.data
    })
})

const getMyProfile = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await UserService.getMyProfile(user as IJWTPayload);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User profile retrive successfully!",
        data: result
    })
});

export const UserController = {
    createPatient,  
    createAdmin,
    createDoctor,
    getAllFromDB,
    getMyProfile
};