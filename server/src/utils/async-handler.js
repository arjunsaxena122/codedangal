const asyncHandler = (requresHandler) => {
  return (req, res, next) => {
    Promise.resolve(requresHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};

export default asyncHandler;
