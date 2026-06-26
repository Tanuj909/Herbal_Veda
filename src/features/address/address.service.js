import * as addressRepository from "./address.repository";

/**
 * Fetch all addresses for a user.
 */
export const getUserAddresses = async (userId) => {
  return addressRepository.findAddressesByUserId(userId);
};

/**
 * Add a new address.
 */
export const addUserAddress = async (userId, addressData) => {
  const { full_name, phone, address_line1, city, state, country, postal_code } = addressData;

  // Simple validation checks
  if (!full_name || !phone || !address_line1 || !city || !state || !country || !postal_code) {
    throw new Error("Missing required address fields");
  }

  // Add user_id to payload
  const payload = {
    ...addressData,
    user_id: userId,
  };

  return addressRepository.createAddress(payload);
};

/**
 * Edit an existing address.
 */
export const editUserAddress = async (id, userId, updateData) => {
  const existing = await addressRepository.findAddressById(id);
  
  if (!existing) {
    throw new Error("Address not found");
  }

  // Access check: users can only update their own addresses
  if (existing.user_id.toString() !== userId.toString()) {
    throw new Error("Access denied: You cannot modify this address");
  }

  return addressRepository.updateAddress(id, userId, updateData);
};

/**
 * Delete a user's address.
 */
export const removeUserAddress = async (id, userId) => {
  const existing = await addressRepository.findAddressById(id);

  if (!existing) {
    throw new Error("Address not found");
  }

  // Access check
  if (existing.user_id.toString() !== userId.toString()) {
    throw new Error("Access denied: You cannot delete this address");
  }

  return addressRepository.deleteAddress(id);
};
