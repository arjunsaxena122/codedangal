export class ApiError extends Error {
  public data: null;
  public success: boolean;
  constructor(
    public statusCode: number,
    public message: string = "something went wrong",
    public errors: any[] = [],
    public stack: string = "",
  ) {
    super(message);
    (this.statusCode = statusCode),
      (this.errors = errors),
      (this.data = null),
      (this.success = false);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
