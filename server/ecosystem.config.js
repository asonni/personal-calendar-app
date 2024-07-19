module.exports = {
  apps: [
    {
      name: 'personal-calendar-app-api', // The name of your application
      script: './dist/src/server.js', // The script to run
      instances: 'max', // Number of instances to start
      autorestart: true, // Whether to restart apps on failure
      watch: true, // Watch for changes to restart (in development)
      max_memory_restart: '2G', // Restart app if it exceeds this memory amount
      env: {
        NODE_ENV: 'development' // Set the development environment
      },
      env_production: {
        NODE_ENV: 'production' // Set the production environment
      }
    }
  ]
};
