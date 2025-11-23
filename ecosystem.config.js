module.exports = {
  apps: [
    {
      name: 'lmms-frontend',
      port: 3000,
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        NITRO_PORT: 3000,
        NITRO_HOST: '0.0.0.0'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
}


