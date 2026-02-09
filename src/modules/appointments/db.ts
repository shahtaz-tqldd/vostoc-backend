import { prisma } from "../../helpers/prisma";

const buildAppointmentWhere = (input: { doctorId?: string; search?: string }) => {
  const where: {
    doctorId?: string;
    OR?: Array<Record<string, unknown>>;
  } = {};

  if (input.doctorId) {
    where.doctorId = input.doctorId;
  }

  const search = input.search?.trim();
  if (!search) {
    return where;
  }

  where.OR = [
    { patientName: { contains: search, mode: "insensitive" } },
    { patientPhone: { contains: search, mode: "insensitive" } },
    { status: { contains: search, mode: "insensitive" } },
    { department: { name: { contains: search, mode: "insensitive" } } },
    { doctor: { name: { contains: search, mode: "insensitive" } } }
  ];

  return where;
};

export const listAppointments = (input: { doctorId?: string; skip: number; take: number; search?: string }) => {
  return prisma.appointment.findMany({
    where: buildAppointmentWhere({ doctorId: input.doctorId, search: input.search }),
    skip: input.skip,
    take: input.take,
    orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }],
    include: {
      patient: true,
      department: true,
      doctor: {
        include: {
          department: true,
          specialty: true
        }
      }
    }
  });
};

export const countAppointments = (input: { doctorId?: string; search?: string }) => {
  return prisma.appointment.count({
    where: buildAppointmentWhere({ doctorId: input.doctorId, search: input.search })
  });
};

export const createAppointment = (data: {
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  patientNotes?: string;
  departmentId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const existingPatient = await tx.patient.findUnique({
      where: { phoneNumber: data.patientPhone }
    });

    if (existingPatient) {
      await tx.patient.update({
        where: { phoneNumber: data.patientPhone },
        data: {
          name: data.patientName,
          age: data.patientAge,
          gender: data.patientGender,
          notes: data.patientNotes
        }
      });
    } else {
      await tx.patient.create({
        data: {
          phoneNumber: data.patientPhone,
          name: data.patientName,
          age: data.patientAge,
          gender: data.patientGender,
          notes: data.patientNotes
        }
      });
    }

    return tx.appointment.create({
      data: {
        ...data,
        status: existingPatient ? "follow-up" : "new"
      },
      include: {
        patient: true,
        department: true,
        doctor: {
          include: {
            department: true,
            specialty: true
          }
        }
      }
    });
  });
};

export const findPatientByContactNumber = async (contactNumber: string) => {
  const patient = await prisma.patient.findUnique({
    where: { phoneNumber: contactNumber }
  });

  if (!patient) {
    return null;
  }

  const lastAppointment = await prisma.appointment.findFirst({
    where: { patientPhone: contactNumber },
    orderBy: [{ appointmentDate: "desc" }, { appointmentTime: "desc" }, { createdAt: "desc" }],
    include: { department: true }
  });

  return {
    patientName: patient.name,
    patientAge: patient.age,
    patientGender: patient.gender,
    department: lastAppointment?.department?.name,
    departmentId: lastAppointment?.departmentId,
    doctorId: lastAppointment?.doctorId
  };
};
