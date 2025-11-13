module.exports = {
  apps: [
    {
      name: "invoice-system",
      script: "npm",
      args: "start",
      cwd: "/var/www/invoice-system",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/home/expert/.pm2/logs/invoice-system-error.log",
      out_file: "/home/expert/.pm2/logs/invoice-system-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "1G",
      instances: 1,
      exec_mode: "fork",
    },
  ],
}
