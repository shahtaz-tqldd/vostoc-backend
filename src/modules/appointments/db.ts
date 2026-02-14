import { prisma } from "../../helpers/prisma";

const buildAppointmentWhere = (input: {
  doctorId?: string;
  departmentIds?: string[];
  search?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const where: {
    doctorId?: string;
    departmentId?: { in: string[] };
    appointmentDate?: { gte?: Date; lte?: Date };
    OR?: Array<Record<string, unknown>>;
  } = {};

  if (input.doctorId) {
    where.doctorId = input.doctorId;
  }
  if (input.departmentIds && input.departmentIds.length > 0) {
    where.departmentId = { in: input.departmentIds };
  }
  if (input.startDate || input.endDate) {
    where.appointmentDate = {};
    if (input.startDate) {
      where.appointmentDate.gte = new Date(`${input.startDate}T00:00:00.000Z`);
    }
    if (input.endDate) {
      where.appointmentDate.lte = new Date(`${input.endDate}T00:00:00.000Z`);
    }
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

export const listAppointments = (input: {
  doctorId?: string;
  departmentIds?: string[];
  skip: number;
  take: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return prisma.appointment.findMany({
    where: buildAppointmentWhere({
      doctorId: input.doctorId,
      departmentIds: input.departmentIds,
      search: input.search,
      startDate: input.startDate,
      endDate: input.endDate
    }),
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

export const countAppointments = (input: {
  doctorId?: string;
  departmentIds?: string[];
  search?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return prisma.appointment.count({
    where: buildAppointmentWhere({
      doctorId: input.doctorId,
      departmentIds: input.departmentIds,
      search: input.search,
      startDate: input.startDate,
      endDate: input.endDate
    })
  });
};

export const countTodayAppointmentsStats = async (input: { doctorId?: string; departmentIds?: string[] }) => {
  const todayDateString = new Date().toISOString().slice(0, 10);
  const todayDate = new Date(`${todayDateString}T00:00:00.000Z`);
  const baseWhere: {
    appointmentDate: Date;
    doctorId?: string;
    departmentId?: { in: string[] };
  } = {
    appointmentDate: todayDate
  };

  if (input.doctorId) {
    baseWhere.doctorId = input.doctorId;
  }
  if (input.departmentIds && input.departmentIds.length > 0) {
    baseWhere.departmentId = { in: input.departmentIds };
  }

  const [total, completed] = await Promise.all([
    prisma.appointment.count({ where: baseWhere }),
    prisma.appointment.count({
      where: {
        ...baseWhere,
        status: "complete"
      }
    })
  ]);

  return {
    total,
    completed
  };
};

export const listTodayPendingAppointmentsForQueue = (input: { departmentIds?: string[] }) => {
  const todayDateString = new Date().toISOString().slice(0, 10);
  const todayDate = new Date(`${todayDateString}T00:00:00.000Z`);

  return prisma.appointment.findMany({
    where: {
      appointmentDate: todayDate,
      status: {
        not: "complete"
      },
      departmentId:
        input.departmentIds && input.departmentIds.length > 0
          ? {
              in: input.departmentIds
            }
          : undefined
    },
    orderBy: [{ doctorId: "asc" }, { appointmentTime: "asc" }, { createdAt: "asc" }],
    select: {
      doctorId: true,
      patientName: true,
      patientAge: true,
      patientGender: true,
      patientPhone: true,
      department: {
        select: {
          id: true,
          name: true
        }
      },
      doctor: {
        select: {
          id: true,
          name: true,
          specialty: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  }) as Promise<
    Array<{
      doctorId: string;
      patientName: string;
      patientAge: number;
      patientGender: string;
      patientPhone: string;
      department: { id: string; name: string };
      doctor: {
        id: string;
        name: string;
        specialty: {
          id: string;
          name: string;
        };
      };
    }>
  >;
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
