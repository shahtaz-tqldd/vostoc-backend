import { countAppointments, createAppointment, findPatientByContactNumber, listAppointments } from "./db";

export const listAppointmentsService = async (
  { user, page, pageSize, search }
    : {
      user: { id: string; role: "ADMIN" | "RECEPTIONIST" | "DOCTOR" };
      page: number;
      pageSize: number;
      search?: string
    }) => {
  const doctorId = user.role === "DOCTOR" ? user.id : undefined;
  const skip = (page - 1) * pageSize;

  const [data, total] = await Promise.all([
    listAppointments({
      doctorId,
      skip,
      take: pageSize,
      search
    }),
    countAppointments({ doctorId, search })
  ]);

  return {
    data,
    meta: {
      page,
      pageSize,
      total
    }
  };
};

export const createAppointmentService = async (input: {
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  patientNotes?: string;
  departmentId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
}) => {
  const parsedDate = new Date(`${input.appointmentDate}T00:00:00.000Z`);

  return createAppointment({
    patientName: input.patientName,
    patientPhone: input.patientPhone,
    patientAge: input.patientAge,
    patientGender: input.patientGender,
    patientNotes: input.patientNotes,
    departmentId: input.departmentId,
    doctorId: input.doctorId,
    appointmentDate: parsedDate,
    appointmentTime: input.appointmentTime
  });
};

export const getPatientByContactNumberService = async (contactNumber: string) => {
  return findPatientByContactNumber(contactNumber);
};
