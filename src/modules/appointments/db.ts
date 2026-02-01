import { prisma } from "../../helpers/prisma";

export const listAppointments = (doctorId?: string) => {
  return prisma.appointment.findMany({
    where: doctorId ? { doctorId } : {},
    orderBy: { startsAt: "asc" }
  });
};

export const createAppointment = (data: {
  title: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  doctorId?: string | null;
}) => {
  return prisma.appointment.create({ data });
};
