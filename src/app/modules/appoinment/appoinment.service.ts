import { prisma } from "../../shared/prisma";
 
import { v4 as uuidv4 } from 'uuid';
import { IJWTPayload } from "../../types";
import stripe from "../../helpers/stripe";
import { IOptions, paginationHelper } from "../../helpers/paginationHelpers";
import { AppointmentStatus, Prisma, UserRole } from "@prisma/client";
import { canUpdateStatus } from "../../utils/StatusUpdate";
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

export const AppointmentService = {
    createAppointment,
    getMyAppointment,
    updateAppointmentStatus
};