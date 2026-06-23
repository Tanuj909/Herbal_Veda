export const validateRegisterInput = (data) => {
  const errors = {};
  const { name, email, phone, password } = data;

  if (!name || name.trim() === "") {
    errors.name = "Name is required";
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Valid email is required";
  }

  if (!phone || phone.trim() === "") {
    errors.phone = "Phone number is required";
  } else {
    // Basic phone validation (allowing starting with + and 10 to 15 digits)
    const cleanPhone = phone.replace(/[\s-()]/g, "");
    if (!/^\+?[1-9]\d{9,14}$/.test(cleanPhone)) {
      errors.phone = "Invalid phone number format. It should be 10-15 digits.";
    }
  }

  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLoginInput = (data) => {
  const errors = {};
  const { phone, password } = data;

  if (!phone || phone.trim() === "") {
    errors.phone = "Phone number is required";
  }

  if (!password || password.trim() === "") {
    errors.password = "Password is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
