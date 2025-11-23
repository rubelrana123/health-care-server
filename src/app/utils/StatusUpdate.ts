import { AppointmentStatus } from "@prisma/client";

// Allowed status transitions
export const StatusFlow: Record<AppointmentStatus, AppointmentStatus[]> = {
  SCHEDULED: ["CANCEL", "INPROGRESS"],
  INPROGRESS: ["COMPLETED"],
  COMPLETED: [], // no further changes
  CANCEL: [], // no further changes
};


export function canUpdateStatus(
  currentStatus: AppointmentStatus,
  nextStatus: AppointmentStatus
): boolean {
  const allowed = StatusFlow[currentStatus] || [];
  return allowed.includes(nextStatus);
}
