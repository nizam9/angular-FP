module.exports = function () {
  // export NODE_ENV=development / production set this in machine

  switch (process.env.NODE_ENV) {
    default:
      case 'development':
      return {
      MONGO_SERVER_PATH: "mongodb://localhost:27017/test", // DB-NAME HERE
      APP_PORT: 8080,
    };
    break;
    case 'production':
        return {};
      break;
  }
};
