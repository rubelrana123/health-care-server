import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
 
import pick from "../../helpers/pick";
import { PatientService } from "./patient.service";
import { patientFilterableFields } from "./patient.constant";
import { IJWTPayload } from "../../types";
 
 
const getAllPatient = catchAsync(async (req: Request, res: Response) => {
 const filters = pick(req.query, patientFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting

    const result = await PatientService.getAllPatient(filters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Patients fetched successfully!",
        data: result
    })
});

const updateIntoDB = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await PatientService.updateIntoDB(user as IJWTPayload, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Patient updated successfully',
        data: result,
    });
});

const deletePatientFromDB = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.deletePatientFromDB(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Patient deleted successfully!",
        data: result
    })
})
export const PatientController = {
    getAllPatient,
    updateIntoDB,
    deletePatientFromDB,
  
};