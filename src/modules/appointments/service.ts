import {
  countAppointments,
  countTodayAppointmentsStats,
  createAppointment,
  findPatientByContactNumber,
  listAppointments,
  listTodayPendingAppointmentsForQueue
} from "./db";
import { findReceptionistDepartmentIdsByUserId } from "../receptionists/db";

export const listAppointmentsService = async (
  { user, page, pageSize, search, startDate, endDate, departmentId, doctorId }
    : {
      user: { id: string; role: "ADMIN" | "RECEPTIONIST" | "DOCTOR" };
      page: number;
      pageSize: number;
      search?: string;
      startDate?: string;
      endDate?: string;
      departmentId?: string;
      doctorId?: string;
    }) => {
  const scopedDoctorId = user.role === "DOCTOR" ? user.id : undefined;
  const effectiveDoctorId = scopedDoctorId || doctorId;
  const receptionistDepartmentIds =
    user.role === "RECEPTIONIST" ? await findReceptionistDepartmentIdsByUserId(user.id) : undefined;
  const skip = (page - 1) * pageSize;

  if (
    user.role === "RECEPTIONIST" &&
    (!receptionistDepartmentIds || receptionistDepartmentIds.length === 0)
  ) {
    return {
      data: [],
      meta: {
        page,
        pageSize,
        total: 0
      }
    };
  }

  const effectiveDepartmentIds =
    user.role === "RECEPTIONIST"
      ? departmentId
        ? receptionistDepartmentIds?.includes(departmentId)
          ? [departmentId]
          : []
        : receptionistDepartmentIds
      : departmentId
        ? [departmentId]
        : undefined;

  if (user.role === "RECEPTIONIST" && effectiveDepartmentIds && effectiveDepartmentIds.length === 0) {
    return {
      data: [],
      meta: {
        page,
        pageSize,
        total: 0
      }
    };
  }

  const [data, total] = await Promise.all([
    listAppointments({
      doctorId: effectiveDoctorId,
      departmentIds: effectiveDepartmentIds,
      skip,
      take: pageSize,
      search,
      startDate,
      endDate
    }),
    countAppointments({
      doctorId: effectiveDoctorId,
      departmentIds: effectiveDepartmentIds,
      search,
      startDate,
      endDate
    })
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

export const getTodayAppointmentStatsService = async (user: {
  id: string;
  role: "ADMIN" | "RECEPTIONIST" | "DOCTOR";
}) => {
  const scopedDoctorId = user.role === "DOCTOR" ? user.id : undefined;
  const receptionistDepartmentIds =
    user.role === "RECEPTIONIST" ? await findReceptionistDepartmentIdsByUserId(user.id) : undefined;

  if (
    user.role === "RECEPTIONIST" &&
    (!receptionistDepartmentIds || receptionistDepartmentIds.length === 0)
  ) {
    return {
      total: 0,
      completed: 0,
      pending: 0
    };
  }

  const { total, completed } = await countTodayAppointmentsStats({
    doctorId: scopedDoctorId,
    departmentIds: receptionistDepartmentIds
  });

  return {
    total,
    completed,
    pending: Math.max(0, total - completed)
  };
};

export const getNextPatientQueueService = async (user: {
  id: string;
  role: "ADMIN" | "RECEPTIONIST" | "DOCTOR";
}) => {
  let departmentIds: string[] | undefined;

  if (user.role === "RECEPTIONIST") {
    departmentIds = await findReceptionistDepartmentIdsByUserId(user.id);
    if (departmentIds.length === 0) {
      return [];
    }
  }

  const pendingAppointments = await listTodayPendingAppointmentsForQueue({ departmentIds });
  const queueByDoctor = new Map<
    string,
    {
      nextPatient: {
        name: string;
        age: number;
        gender: string;
        contact: string;
      };
      department: { id: string; name: string };
      doctor: {
        id: string;
        name: string;
        specialty: {
          id: string;
          name: string;
        };
      };
      leftForDoctor: number;
    }
  >();

  for (const appointment of pendingAppointments) {
    const existing = queueByDoctor.get(appointment.doctorId);
    if (!existing) {
      queueByDoctor.set(appointment.doctorId, {
        nextPatient: {
          name: appointment.patientName,
          age: appointment.patientAge,
          gender: appointment.patientGender,
          contact: appointment.patientPhone
        },
        department: {
          id: appointment.department.id,
          name: appointment.department.name
        },
        doctor: {
          id: appointment.doctor.id,
          name: appointment.doctor.name,
          specialty: {
            id: appointment.doctor.specialty.id,
            name: appointment.doctor.specialty.name
          }
        },
        leftForDoctor: 1
      });
      continue;
    }

    existing.leftForDoctor += 1;
  }

  return Array.from(queueByDoctor.values());
};
