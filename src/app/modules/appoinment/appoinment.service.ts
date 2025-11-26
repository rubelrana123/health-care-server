import { prisma } from "../../shared/prisma";
 
import { v4 as uuidv4 } from 'uuid';
import { IJWTPayload } from "../../types";
import stripe from "../../helpers/stripe";
import { IOptions, paginationHelper } from "../../helpers/paginationHelpers";
import { AppointmentStatus, PaymentStatus, Prisma, UserRole } from "@prisma/client";
import { canUpdateStatus } from "../../utils/StatusUpdate";
import { appoinmentSearchableFields } from "./appoinment.constant";
const createAppointment = async (user: IJWTPayload, payload: { doctorId: string, scheduleId: string }) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false
        }
    });

    const isBookedOrNot = await prisma.doctorSchedules.findFirstOrThrow({
        where: {
            doctorId: payload.doctorId,
            scheduleId: payload.scheduleId,
            isBooked: false
        }
    })

    const videoCallingId = uuidv4();

    const result = await prisma.$transaction(async (tnx) => {
        const appointmentData = await tnx.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId
            }
        })
      console.log("create appoinment ok.....")
        await tnx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId
                }
            },
            data: {
                isBooked: true
            }
        })
        console.log("update doctor schedule ok")

        const transactionId = uuidv4();

        const paymentData = await tnx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })
        console.log("create payment ok");

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: "bdt",
                        product_data: {
                            name: `Appointment with ${doctorData.name}`,
                        },
                        unit_amount: doctorData.appointmentFee * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                appointmentId: appointmentData.id,
                paymentId: paymentData.id
            },
            success_url: `https://www.programming-hero.com/`,
            cancel_url: `https://next.programming-hero.com/level-2.0/`,
        });
        console.log("session is ok", session)

        return { paymentUrl: session.url };
    })


    return result;
};

const getMyAppointment = async (user: IJWTPayload, filters: any, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const { ...filterData } = filters;

    const andConditions: Prisma.AppointmentWhereInput[] = [];

    if (user.role === UserRole.PATIENT) {
        andConditions.push({
            patient: {
                email: user.email
            }
        })
    }
    else if (user.role === UserRole.DOCTOR) {
        andConditions.push({
            doctor: {
                email: user.email
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map(key => ({
            [key]: {
                equals: (filterData as any)[key]
            }
        }))

        andConditions.push(...filterConditions)
    }

    const whereConditions: Prisma.AppointmentWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: (user.role === UserRole.DOCTOR) ?
            { patient: true } : { doctor: true }
    });

    const total = await prisma.appointment.count({
        where: whereConditions
    });

    return {
        meta: {
            total,
            limit,
            page
        },
        data: result
    }

}

const updateAppointmentStatus = async (
  user: IJWTPayload,
  appointmentId: string,
  status: AppointmentStatus
) => {
  const appoinmentData = await prisma.appointment.findFirstOrThrow({
    where: { id: appointmentId },
    include: { doctor: true, patient: true }
  });

  if (appoinmentData.doctor.email !== user.email) {
    throw new Error("You are not authorized to update this appointment");
  }

  // CHECK STATUS FLOW HERE
  const currentStatus = appoinmentData.status;

  if (!canUpdateStatus(currentStatus, status)) {
    throw new Error(
      `Invalid status change: ${currentStatus} → ${status} is not allowed`
    );
  }

  // VALID → update now
  const updatedAppoinmentData = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status }
  });

  return updatedAppoinmentData;
};

//// Retrieve all appointments with pagination, searching, filtering, and sorting functionality.
const getAllAppointments = async (filters: any, options: IOptions) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { patientEmail, doctorEmail, ...filterData } = filters;
    const andConditions = [];

    if (patientEmail) {
        andConditions.push({
            patient: {
                email: patientEmail
            }
        })
    }
    else if (doctorEmail) {
        andConditions.push({
            doctor: {
                email: doctorEmail
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                return {
                    [key]: {
                        equals: (filterData as any)[key]
                    }
                };
            })
        });
    }

    // console.dir(andConditions, { depth: Infinity })
    const whereConditions: Prisma.AppointmentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                    createdAt: 'desc',
                },
        include: {
            doctor: true,
            patient: true
        }
    });
    const total = await prisma.appointment.count({
        where: whereConditions
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
const cancelUnpaidAppointments = async () => {
    // Calculate the timestamp of 30 minutes ago
    // Date.now() gives current time in milliseconds.
    // 30 * 60 * 1000 = 30 minutes in ms.
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Find all appointments that:
    // - were created 30 mins ago or earlier (createdAt <= thirtyMinAgo)
    // - still have paymentStatus = UNPAID
    const unPaidAppointments = await prisma.appointment.findMany({
        where: {
            createdAt: {
                lte: thirtyMinAgo
            },
            paymentStatus: PaymentStatus.UNPAID
        }
    });

    // Extract only the IDs of those unpaid appointments into an array
    const appointmentIdsToCancel = unPaidAppointments.map(appointment => appointment.id);

    // Run everything inside a transaction.
    // This means: if one task fails, nothing is saved.
    await prisma.$transaction(async (tnx) => {

        // Delete all payment records linked to those appointment IDs
        await tnx.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmentIdsToCancel
                }
            }
        });

        // Delete all the unpaid appointments themselves
        await tnx.appointment.deleteMany({
            where: {
                id: {
                    in: appointmentIdsToCancel
                }
            }
        });

        // Loop through each unpaid appointment and free the doctor’s schedule
        for (const unPaidAppointment of unPaidAppointments) {

            // doctorSchedules uses a compound unique key: doctorId + scheduleId
            // So we update that specific schedule slot and mark it unbooked
            await tnx.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: unPaidAppointment.doctorId,
                        scheduleId: unPaidAppointment.scheduleId
                    }
                },
                data: {
                    isBooked: false  // free the schedule
                }
            });
        }
    });
};

export const AppointmentService = {
    createAppointment,
    getMyAppointment,
    updateAppointmentStatus,
    getAllAppointments,
    cancelUnpaidAppointments
};