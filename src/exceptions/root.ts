// Enum defining predefined error codes for HttpException
export enum ErrorCode {
    USER_NOT_FOUND = 1001,             // User not found
    USER_ALREADY_EXISTS = 1002,        // User already exists
    INCORRECT_PASSWORD = 1003,         // Incorrect password
    ADDRESS_NOT_FOUND = 1004,          // Address not found
    ADDRESS_DOES_NOT_BELONG = 1005,    // Address does not belong
    UNPROCESSABLE_ENTITY = 2001,       // Unprocessable entity
    INTERNAL_EXCEPTION = 3001,         // Internal server exception
    UNAUTHORIZED = 4001,               // Unauthorized access
    PRODUCT_NOT_FOUND = 5001,          // Product not found
    ORDER_NOT_FOUND = 6001,            // Order not found
    BAD_REQUEST = 5000,                //
    CART_ITEM_NOT_FOUND = 7000,
    CART_NOT_FOUND = 7001
}

// Custom HTTP Exception class representing errors in HTTP requests or responses
export class HttpException extends Error {
    // Properties to store error details
    message: string;        // Error message
    errorCode: any;         // Identifier representing the specific error code
    statusCode: number;     // HTTP status code
    errors: ErrorCode;      // Predefined error codes

    // Constructor to initialize the HttpException instance
    constructor(message: string, errorCode: ErrorCode, statusCode: number, error: any) {
        // Call the constructor of the Error class to set the error message
        super(message);

        // Assign the provided values to the corresponding properties
        this.message = message;         // Error message
        this.errorCode = errorCode;     // Specific error code
        this.statusCode = statusCode;   // HTTP status code
        this.errors = error;            // Additional error information
    }
}

