import ApiError from "../utils/api-error.js";

export function globalErrorHandler(err, req, res, next) {
    // Check if error is an instance of our custom ApiError
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // Handle Mongoose CastError (e.g., Invalid ObjectId) globally
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }

    // Default to 500 Internal Server Error
    console.error("Unhandled Error:", err);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
}
