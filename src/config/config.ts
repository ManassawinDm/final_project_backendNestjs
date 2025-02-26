export default () => ({
    jwt: {
      secret: process.env.JWT_SECRET,
    },
    pythonApi: {
      baseUrl: process.env.PYTHON_API_BASE_URL,
    },
  });