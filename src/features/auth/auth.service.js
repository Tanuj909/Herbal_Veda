import * as authRepository from "./auth.repository";
import { hashPassword, comparePassword } from "@/lib/bcrypt";
import { generateToken } from "@/lib/jwt";

export const registerUser = async (userData) => {
  // Check if email already exists
  const existingEmailUser = await authRepository.findUserByEmail(userData.email);
  if (existingEmailUser) {
    throw new Error("Email already registered");
  }

  // Check if phone already exists
  const existingPhoneUser = await authRepository.findUserByPhone(userData.phone);
  if (existingPhoneUser) {
    throw new Error("Phone number already registered");
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const newUser = await authRepository.createUser({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    password: hashedPassword,
    role: "CUSTOMER", // default role is CUSTOMER
  });

  // Generate JWT token
  const token = generateToken({
    id: newUser.id.toString(), // stringify bigint
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
  });

  return {
    role: newUser.role,
    token,
  };
};

export const loginUser = async (phone, password) => {
  // Find user by phone (mobile)
  const user = await authRepository.findUserByPhone(phone);
  if (!user) {
    throw new Error("Invalid phone number or password");
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid phone number or password");
  }

  if (!user.is_active) {
    throw new Error("User account is inactive");
  }

  // Generate JWT token
  const token = generateToken({
    id: user.id.toString(), // stringify bigint
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return {
    role: user.role,
    token,
  };
};

export const createAdmin = async (adminData) => {
  // Enforce single admin limit
  const adminCount = await authRepository.countUsersByRole("ADMIN");
  if (adminCount >= 1) {
    throw new Error("An admin user already exists. Only one admin is allowed.");
  }

  // Check if email already exists
  const existingEmail = await authRepository.findUserByEmail(adminData.email);
  if (existingEmail) {
    throw new Error("Email already registered");
  }

  // Check if phone already exists
  const existingPhone = await authRepository.findUserByPhone(adminData.phone);
  if (existingPhone) {
    throw new Error("Phone number already registered");
  }

  // Hash password
  const hashedPassword = await hashPassword(adminData.password);

  // Create user with ADMIN role
  const newAdmin = await authRepository.createUser({
    name: adminData.name,
    email: adminData.email,
    phone: adminData.phone,
    password: hashedPassword,
    role: "ADMIN",
    is_active: true,
  });

  // Exclude password from return
  const { password, ...result } = newAdmin;
  return result;
};

export const updateAdmin = async (id, updateData) => {
  const targetUser = await authRepository.findUserById(id);
  if (!targetUser) {
    throw new Error("Admin user not found");
  }

  if (targetUser.role !== "ADMIN") {
    throw new Error("Target user is not an Admin");
  }

  // Verify email uniqueness if being updated
  if (updateData.email && updateData.email !== targetUser.email) {
    const existingEmail = await authRepository.findUserByEmail(updateData.email);
    if (existingEmail) {
      throw new Error("Email already in use");
    }
  }

  // Verify phone uniqueness if being updated
  if (updateData.phone && updateData.phone !== targetUser.phone) {
    const existingPhone = await authRepository.findUserByPhone(updateData.phone);
    if (existingPhone) {
      throw new Error("Phone number already in use");
    }
  }

  const updatedAdmin = await authRepository.updateUser(id, {
    name: updateData.name,
    email: updateData.email,
    phone: updateData.phone,
    is_active: updateData.is_active,
  });

  const { password, ...result } = updatedAdmin;
  return result;
};

export const getAdminProfile = async (id) => {
  const user = await authRepository.findUserById(id);
  if (!user) {
    throw new Error("Admin user not found");
  }

  if (user.role !== "ADMIN") {
    throw new Error("Target user is not an Admin");
  }

  const { password, ...result } = user;
  return result;
};

/**
 * Fetch all users for admin panels (excluding passwords).
 */
export const getAllUsers = async (filters = {}) => {
  const users = await authRepository.findAllUsers(filters);
  return users.map((user) => {
    const { password, ...result } = user;
    return result;
  });
};

/**
 * Update any user's basic profile or status (SUPER_ADMIN only).
 */
export const adminUpdateUser = async (id, updateData) => {
  const targetUser = await authRepository.findUserById(id);
  if (!targetUser) {
    throw new Error("User not found");
  }

  // Prevent self-deactivation of SUPER_ADMIN
  if (updateData.is_active === false && targetUser.role === "SUPER_ADMIN") {
    throw new Error("A Super Admin cannot deactivate their own account");
  }

  // Verify email uniqueness if being updated
  if (updateData.email && updateData.email !== targetUser.email) {
    const existingEmail = await authRepository.findUserByEmail(updateData.email);
    if (existingEmail) {
      throw new Error("Email already in use");
    }
  }

  // Verify phone uniqueness if being updated
  if (updateData.phone && updateData.phone !== targetUser.phone) {
    const existingPhone = await authRepository.findUserByPhone(updateData.phone);
    if (existingPhone) {
      throw new Error("Phone number already in use");
    }
  }

  const updatedUser = await authRepository.updateUser(id, {
    name: updateData.name,
    email: updateData.email,
    phone: updateData.phone,
    role: updateData.role,
    is_active: updateData.is_active,
  });

  const { password, ...result } = updatedUser;
  return result;
};
