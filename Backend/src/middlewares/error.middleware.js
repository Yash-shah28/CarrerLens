import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    // Log for debugging
    console.error("Backend Error Caught:", err);

    if (!(error instanceof ApiError)) {
        // Handle Mongoose Duplicate Key Error
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue || {})[0];
            const statusCode = 409;
            const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
            error = new ApiError(statusCode, message);
        } else {
            const statusCode = error.statusCode || 500;
            const message = error.message || "Something went wrong";
            error = new ApiError(statusCode, message, error?.errors || [], err.stack);
        }
    }

    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    };

    return res.status(error.statusCode).json(response);
};

export { errorHandler };
