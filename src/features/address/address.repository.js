import prisma from "@/lib/prisma";

/**
 * Find all addresses for a specific user.
 * @param {string|number|BigInt} userId
 * @returns {Promise<Array>}
 */
export const findAddressesByUserId = async (userId) => {
  return prisma.address.findMany({
    where: { user_id: BigInt(userId) },
    orderBy: {
      created_at: "desc",
    },
  });
};

/**
 * Find a specific address by ID.
 * @param {string|number|BigInt} id
 * @returns {Promise<Object|null>}
 */
export const findAddressById = async (id) => {
  return prisma.address.findUnique({
    where: { id: BigInt(id) },
  });
};

/**
 * Create a new address for a user.
 * If is_default is true, runs in transaction to unset previous default address.
 * @param {Object} addressData
 * @returns {Promise<Object>}
 */
export const createAddress = async (addressData) => {
  const {
    user_id,
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    country,
    postal_code,
    is_default,
  } = addressData;

  const data = {
    user_id: BigInt(user_id),
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    country,
    postal_code,
    is_default: !!is_default,
  };

  if (is_default) {
    return prisma.$transaction(async (tx) => {
      // Unset previous default
      await tx.address.updateMany({
        where: { user_id: BigInt(user_id), is_default: true },
        data: { is_default: false },
      });

      return tx.address.create({ data });
    });
  }

  return prisma.address.create({ data });
};

/**
 * Update an existing address.
 * If is_default is changed to true, runs in transaction to unset previous default.
 * @param {string|number|BigInt} id
 * @param {string|number|BigInt} userId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateAddress = async (id, userId, updateData) => {
  const {
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    country,
    postal_code,
    is_default,
  } = updateData;

  const data = {};
  if (full_name !== undefined) data.full_name = full_name;
  if (phone !== undefined) data.phone = phone;
  if (address_line1 !== undefined) data.address_line1 = address_line1;
  if (address_line2 !== undefined) data.address_line2 = address_line2;
  if (city !== undefined) data.city = city;
  if (state !== undefined) data.state = state;
  if (country !== undefined) data.country = country;
  if (postal_code !== undefined) data.postal_code = postal_code;
  if (is_default !== undefined) data.is_default = !!is_default;

  if (is_default) {
    return prisma.$transaction(async (tx) => {
      // Unset other defaults for this user
      await tx.address.updateMany({
        where: { user_id: BigInt(userId), is_default: true },
        data: { is_default: false },
      });

      return tx.address.update({
        where: { id: BigInt(id) },
        data,
      });
    });
  }

  return prisma.address.update({
    where: { id: BigInt(id) },
    data,
  });
};

/**
 * Delete an address.
 * @param {string|number|BigInt} id
 * @returns {Promise<Object>}
 */
export const deleteAddress = async (id) => {
  return prisma.address.delete({
    where: { id: BigInt(id) },
  });
};
