export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// Password special character regex - includes common punctuation and symbols
// Covers: ! @ # $ % ^ & * ( ) _ + - = [ ] { } ; ' : " \ | , . < > / ?
const PASSWORD_SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export class AuthValidator {
    static validateEmail(email: string): ValidationResult {
        if (!email) {
            return { isValid: false, error: "Email is required" };
        }

        if (email.length > 320) {
            return { isValid: false, error: "Email address is too long" };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, error: "Please enter a valid email address" };
        }

        // Check for common email provider typos
        const domain = email.split("@")[1]?.toLowerCase();
        const suggestions: { [key: string]: string } = {
            "gmai.com": "gmail.com",
            "gmail.co": "gmail.com",
            "yaho.com": "yahoo.com",
            "yahoo.co": "yahoo.com",
            "hotmai.com": "hotmail.com",
            "hotmail.co": "hotmail.com",
            "outlok.com": "outlook.com",
            "outlook.co": "outlook.com",
        };

        if (domain && suggestions[domain]) {
            return {
                isValid: false,
                error: `Did you mean ${email.split("@")[0]}@${suggestions[domain]}?`
            };
        }

        return { isValid: true };
    }

    static validateName(name: string): ValidationResult {
        if (!name) {
            return { isValid: false, error: "Name is required" };
        }

        const trimmedName = name.trim();

        if (trimmedName.length < 2) {
            return { isValid: false, error: "Name must be at least 2 characters long" };
        }

        if (trimmedName.length > 50) {
            return { isValid: false, error: "Name must be less than 50 characters" };
        }

        // Check for potentially invalid characters
        const validNameRegex = /^[a-zA-Z\s\-'\.]+$/;
        if (!validNameRegex.test(trimmedName)) {
            return { isValid: false, error: "Name contains invalid characters" };
        }

        // Check for excessive spaces
        if (trimmedName.includes("  ")) {
            return { isValid: false, error: "Name contains excessive spaces" };
        }

        return { isValid: true };
    }

    static validateImageFile(file: File): ValidationResult {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
            };
        }

        if (file.size > maxSize) {
            return {
                isValid: false,
                error: "Image size must be less than 5MB",
            };
        }

        return { isValid: true };
    }

    static validatePassword(password: string): ValidationResult {
        if (!password) {
            return { isValid: false, error: "Password is required" };
        }

        if (password.length < 8) {
            return { isValid: false, error: "Password must be at least 8 characters long" };
        }

        if (password.length > 128) {
            return { isValid: false, error: "Password must be less than 128 characters" };
        }

        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            return { isValid: false, error: "Password must contain at least one uppercase letter" };
        }

        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            return { isValid: false, error: "Password must contain at least one lowercase letter" };
        }

        // Check for at least one number
        if (!/\d/.test(password)) {
            return { isValid: false, error: "Password must contain at least one number" };
        }

        // Check for at least one special character
        if (!PASSWORD_SPECIAL_CHAR_REGEX.test(password)) {
            return { isValid: false, error: "Password must contain at least one special character" };
        }

        return { isValid: true };
    }

    static validateForm(fields: { [key: string]: string }): { isValid: boolean; errors: { [key: string]: string } } {
        const errors: { [key: string]: string } = {};

        Object.entries(fields).forEach(([key, value]) => {
            let result: ValidationResult;

            switch (key) {
                case "email":
                    result = this.validateEmail(value);
                    break;
                case "name":
                    result = this.validateName(value);
                    break;
                case "password":
                    result = this.validatePassword(value);
                    break;
                default:
                    result = { isValid: true };
            }

            if (!result.isValid && result.error) {
                errors[key] = result.error;
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }
}
