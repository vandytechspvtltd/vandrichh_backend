export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: string[]
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      errors: this.errors || [],
    };
  }
}
