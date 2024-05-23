const ErrorMap = {
  Unauthorized: {
    code: 4100,
    message:
      "The requested method and/or account has not been authorized by the user.",
  },
  UserRejected: {
    code: 4001,
    message: "The user rejected the request.",
  },
  InternalError: {
    code: 99999,
    message: "Internal error",
  },
};

module.exports = {
  ErrorMap,
};
