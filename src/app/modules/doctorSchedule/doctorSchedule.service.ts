import { IOptions, paginationHelper } from "../../helpers/paginationHelpers";
import { prisma } from "../../shared/prisma";
import { IJWTPayload } from "../../types";

const insertIntoDB = async (user: IJWTPayload, payload: {
    scheduleIds: string[]
}) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });

    const doctorScheduleData = payload.scheduleIds.map(scheduleId => ({
        doctorId: doctorData.id,
        scheduleId
    }))

    console.log(doctorScheduleData, "doctor schedule data")

    return await prisma.doctorSchedules.createMany({
        data: doctorScheduleData
    });
}


const getAllDoctorSchedules = async(filters: any, options: IOptions) => { 
     const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;
//   ?status=PAID&paymentStatus=PAID  ==> { status: 'PAID', paymentStatus: 'PAID' } ==> filterData ==>Object.keys(filterData) ==> ['status', 'paymentStatus'].map(...) => .map((key) = key = "status", key = "paymentStatus") ====>   [key]: {equals: filterData[key] } ==>{ status: {  equals: "PAID"}}



    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            doctor: {
                name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            },
        });
    }

    if (Object.keys(filterData).length > 0) {
        if (typeof filterData.isBooked === 'string' && filterData.isBooked === 'true') {
            filterData.isBooked = true;
        } else if (typeof filterData.isBooked === 'string' && filterData.isBooked === 'false') {
            filterData.isBooked = false;
        }
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        });
    }

    const whereConditions: any =
        andConditions.length > 0 ? { AND: andConditions } : {};
    const result = await prisma.doctorSchedules.findMany({
        include: {
            doctor: true,
            schedule: true,
        },
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {},
    });
    const total = await prisma.doctorSchedules.count({
        where: whereConditions,
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};

export const DoctorScheduleService = {
    insertIntoDB,
    getAllDoctorSchedules
}