import prisma from "@/lib/prisma";

export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserByPhone = async (phone) => {
  return prisma.user.findUnique({
    where: { phone },
  });
};

export const createUser = async (userData) => {
  return prisma.user.create({
    data: userData,
  });
};

export const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id: BigInt(id) },
  });
};

export const updateUser = async (id, updateData) => {
  return prisma.user.update({
    where: { id: BigInt(id) },
    data: updateData,
  });
};

export const countUsersByRole = async (role) => {
  return prisma.user.count({
    where: { role },
  });
};
