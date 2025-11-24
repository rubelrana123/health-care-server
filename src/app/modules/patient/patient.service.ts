import { Patient, Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helpers/paginationHelpers";
import { patientSearchableFields } from "./patient.constant";
import { IJWTPayload } from "../../types";

const getAllPatient = async (filters: any, options: IOptions) => {
   const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
      const { searchTerm, specialties, ...filterData } = filters;
  
      const andConditions: Prisma.PatientWhereInput[] = [];
  
      if (searchTerm) {
          andConditions.push({
              OR: patientSearchableFields.map((field) => ({
                  [field]: {
                      contains: searchTerm,
                      mode: "insensitive"
                  }
              }))
          })
      }
 
      if (Object.keys(filterData).length > 0) {
          const filterConditions = Object.keys(filterData).map((key) => ({
              [key]: {
                  equals: (filterData as any)[key]
              }
          }))
  
          andConditions.push(...filterConditions)
      }


   const whereConditions: Prisma.PatientWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}

    const result = await prisma.patient.findMany({
        skip,
        take: limit,

        where: whereConditions,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.patient.count({
        where: whereConditions
    });
    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };
}


const deletePatientFromDB = async (id: string) => {
    return await prisma.patient.delete({
        where: {
            id
        }
    })

}



//patch payload example /patiendt/
// {      //update
//         "email": "mdmohon@gmail.com",
//         "name": "Md. Mohon 1",
//         "profilePhoto": null,
//         "contactNumber": null,
//         "address": null,
//         "createdAt": "2023-12-25T05:59:02.145Z",
//         "updatedAt": "2023-12-25T14:11:30.372Z",
//        //create
//         "medicalReport": {  
//             "id": "5c8516e7-2036-429d-aea3-c44159dfcb51",
//             "patientId": "87f85211-5468-4d4a-8343-087751240c55",
//             "reportName": "Past surgery",
//             "reportLink": "reportlink",
//             "createdAt": "2023-12-25T14:55:40.584Z",
//             "updatedAt": "2023-12-25T14:57:24.092Z"
//         },
//         //create and update
//         "patientHelthData": {
//             "id": "f62e395f-bbe5-4efe-8fbf-2c6fdef609ee",
//             "patientId": "87f85211-5468-4d4a-8343-087751240c55",
//             "dateOfBirth": "2023-12-25T05:59:02.145Z",
//             "gender": "MALE",
//             "bloodGroup": "B_POSITIVE",
//             "hasAllergies": false,
//             "hasDiabetes": false,
//             "height": null,
//             "weight": "50 Kg",
//             "smokingStatus": false,
//             "dietaryPreferences": null,
//             "pregnancyStatus": false,
//             "mentalHealthHistory": null,
//             "immunizationStatus": false,
//             "hasPastSurgeries": false,
//             "recentAnxiety": false,
//             "recentDepression": false,
//             "maritalStatus": "UNMARRIED",
//             "createdAt": "2023-12-25T14:10:18.426Z",
//             "updatedAt": "2023-12-25T14:15:15.546Z"
//         }
//     }

// PatientHealthData, MedicalReport, patient

const updateIntoDB = async (user: IJWTPayload, payload: any) => {
    const { medicalReport, patientHealthData, ...patientData } = payload;
 console.log(user, "user auth here ")
    const patientInfo = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
            isDeleted: false
        }
    });

    return await prisma.$transaction(async (tnx) => {
        await tnx.patient.update({
            where: {
                id: patientInfo.id
            },
            data: patientData
        })

        if (patientHealthData) {
            await tnx.patientHealthData.upsert({
                where: {
                    patientId: patientInfo.id
                },
                update: patientHealthData,
                create: {
                    ...patientHealthData,
                    patientId: patientInfo.id
                }
            })
        }

        if (medicalReport) {
            await tnx.medicalReport.create({
                data: {
                    ...medicalReport,
                    patientId: patientInfo.id
                }
            })
        }

        const result = await tnx.patient.findUnique({
            where: {
                id: patientInfo.id
            },
            include: {
                patientHealthData: true,
                medicalReports: true
            }
        })
        return result;
    })



}
export const PatientService = {
    getAllPatient,
    updateIntoDB,
    deletePatientFromDB,
}