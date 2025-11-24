import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
 

const login = catchAsync(async (req: Request, res: Response) => {
    // console.log("hello i am controller", req)
    const result = await AuthService.login(req.body);
    const {accessToken, refreshToken, needPasswordChange} = result;
    res.cookie("accessToken", accessToken), {
        secure : true,
        httpOnly : true,
        sameSite : "none",
        maxAge : 1000 * 60 * 60
    };
        res.cookie("refreshToken", refreshToken), {
        secure : true,
        httpOnly : true,
        sameSite : "none",
        maxAge : 1000 * 60 * 60 * 24 * 90
    }
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "user login successfully!",
        data: result
    })
})


const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    const result = await AuthService.refreshToken(refreshToken);
    res.cookie("accessToken", result.accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60,
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Access token genereated successfully!",
        data: {
            message: "Access token genereated successfully!",
        },
    });
});


export const AuthController = {
    login,  
    refreshToken
};