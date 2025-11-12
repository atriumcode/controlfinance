module.exports = {
  apps: [
    {
      name: "invoice-system",
      script: "./load-env.sh",
      cwd: "/var/www/invoice-system",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
}
