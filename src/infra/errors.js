export class InternalServerError extends Error {
  constructor({ cause, message, action, statusCode } = {}) {
    super(message || "Internal error.", { cause });
    this.name = "InternalServerError";
    this.action = action || "Please contact support.";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause, message, action, context } = {}) {
    super(message || "Service unavailable at the moment.", { cause });
    this.name = "ServiceError";
    this.action = action || "Verify if the service is up and running.";
    this.statusCode = 503;
    this.context = context;
  }

  toJSON() {
    const json = {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };

    if (process.env.NODE_ENV === "development" && this.context) {
      json.context = this.context;
    }

    return json;
  }
}

export class ValidationError extends Error {
  constructor({ cause, message, action } = {}) {
    super(message || "A validation error has occurred.", { cause });
    this.name = "ValidationError";
    this.action = action || "Adjust the sent data and try again.";
    this.statusCode = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class NotFoundError extends Error {
  constructor({ cause, message, action } = {}) {
    super(message || "We could not find this resource in the system.", {
      cause,
    });
    this.name = "NotFoundError";
    this.action =
      action || "Verify if the sent parameters in the request are correct.";
    this.statusCode = 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ForbiddenError extends Error {
  constructor({ cause, message, action } = {}) {
    super(message || "Access denied.", { cause });
    this.name = "ForbiddenError";
    this.action = action || "Verify if your user has access to this resource.";
    this.statusCode = 403;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class UnauthorizedError extends Error {
  constructor({ cause, message, action } = {}) {
    super(message || "User not authenticated.", { cause });
    this.name = "UnauthorizedError";
    this.action = action || "Login again to continue.";
    this.statusCode = 401;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor({ cause } = {}) {
    super("Method not allowed for this endpoint.", { cause });
    this.name = "MethodNotAllowedError";
    this.action = "Verify if the HTTP method sent is valid for this endpoint.";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
