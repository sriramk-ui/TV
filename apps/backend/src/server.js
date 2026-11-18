const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initializeCronScheduler } = require('./jobs/cronScheduler');

async function startServer() {
  try {
    await connectDB();

    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty on startup. Automatically seeding initial users, settings, and sample data...');
      const seed = require('./config/seeder');
      await seed(false);
    }

    initializeCronScheduler();

    const server = app.listen(env.PORT, () => {
      console.log('========================================================');
      console.log(` Sri Sankara TV Production REST API Server running`);
      console.log(` Environment : ${env.NODE_ENV}`);
      console.log(` Listening on: http://localhost:${env.PORT}/api/v1`);
      console.log('========================================================');
    });

    const shutdown = async () => {
      console.log('Shutting down API server gracefully...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
