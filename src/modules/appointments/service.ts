import { createAppointment, listAppointments } from "./db";

export const listAppointmentsService = async (user: { id: string; role: "ADMIN" | "RECEPTIONIST" | "DOCTOR" }) => {
  const doctorId = user.role === "DOCTOR" ? user.id : undefined;
  return listAppointments(doctorId);
};

export const createAppointmentService = async (input: {
  title: string;
  startsAt: string;
  endsAt: string;
  status?: string;
  doctorId?: string | null;
}) => {
  return createAppointment({
    title: input.title,
    startsAt: new Date(input.startsAt),
    endsAt: new Date(input.endsAt),
    status: input.status || "scheduled",
    doctorId: input.doctorId ?? null
  });
};
