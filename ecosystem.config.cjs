module.exports = {
  apps: [
    {
      name: "restaurant-engine",
      script: "npm",
      args: "start",
      env: {
        PORT: 3006,
        NODE_ENV: "production",
      },
    },
  ],
};

