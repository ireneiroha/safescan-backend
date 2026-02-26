export function validateSignup({ fullName, email, password, confirmPassword }) {
    const errors = {};

    if (!fullName.trim()) errors.fullName = "Full name is required.";

    if (!email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Enter a valid email address.";

    if (!password) {
        errors.password = "Password is required.";
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    } else if (!/[0-9].*[0-9]/.test(password)) {
        errors.password = "Password must contain at least 2 numbers.";
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.password = "Password must contain at least 1 symbol (e.g. @, #, !).";
    }

    if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";

    return errors;
}

export function validateLogin({ email, password }) {
    const errors = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    return errors;
}