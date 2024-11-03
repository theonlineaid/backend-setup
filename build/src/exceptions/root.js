"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = exports.ErrorCode = void 0;
// Enum defining predefined error codes for HttpException
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["USER_NOT_FOUND"] = 1001] = "USER_NOT_FOUND";
    ErrorCode[ErrorCode["EMAIL_NOT_FOUND"] = 1007] = "EMAIL_NOT_FOUND";
    ErrorCode[ErrorCode["USER_ALREADY_EXISTS"] = 1002] = "USER_ALREADY_EXISTS";
    ErrorCode[ErrorCode["INCORRECT_PASSWORD"] = 1003] = "INCORRECT_PASSWORD";
    ErrorCode[ErrorCode["ADDRESS_NOT_FOUND"] = 1004] = "ADDRESS_NOT_FOUND";
    ErrorCode[ErrorCode["ADDRESS_DOES_NOT_BELONG"] = 1005] = "ADDRESS_DOES_NOT_BELONG";
    ErrorCode[ErrorCode["USERNAME_REQUIRED"] = 1006] = "USERNAME_REQUIRED";
    ErrorCode[ErrorCode["UNPROCESSABLE_ENTITY"] = 2001] = "UNPROCESSABLE_ENTITY";
    ErrorCode[ErrorCode["INTERNAL_EXCEPTION"] = 3001] = "INTERNAL_EXCEPTION";
    ErrorCode[ErrorCode["UNAUTHORIZED"] = 4001] = "UNAUTHORIZED";
    ErrorCode[ErrorCode["PRODUCT_NOT_FOUND"] = 5001] = "PRODUCT_NOT_FOUND";
    ErrorCode[ErrorCode["ORDER_NOT_FOUND"] = 6001] = "ORDER_NOT_FOUND";
    ErrorCode[ErrorCode["BAD_REQUEST"] = 5000] = "BAD_REQUEST";
    ErrorCode[ErrorCode["CART_ITEM_NOT_FOUND"] = 7000] = "CART_ITEM_NOT_FOUND";
    ErrorCode[ErrorCode["CART_NOT_FOUND"] = 7001] = "CART_NOT_FOUND";
    ErrorCode[ErrorCode["REVIEW_NOT_FOUND"] = 8000] = "REVIEW_NOT_FOUND";
    ErrorCode[ErrorCode["VALIDATION_ERROR"] = 9000] = "VALIDATION_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
// Custom HTTP Exception class representing errors in HTTP requests or responses
class HttpException extends Error {
    // Constructor to initialize the HttpException instance
    constructor(message, errorCode, statusCode, error) {
        // Call the constructor of the Error class to set the error message
        super(message);
        // Assign the provided values to the corresponding properties
        this.message = message; // Error message
        this.errorCode = errorCode; // Specific error code
        this.statusCode = statusCode; // HTTP status code
        this.errors = error; // Additional error information
    }
}
exports.HttpException = HttpException;
