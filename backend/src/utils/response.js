function successResponse(res, data = {}, message = "Success", status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

function errorResponse(res, message = "Error", status = 500, error = null) {
  return res.status(status).json({
    success: false,
    message,
    error,
  });
}

function validationErrorResponse(
  res,
  errors = [],
  message = "Validation Error",
  status = 400
) {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
}

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
};
