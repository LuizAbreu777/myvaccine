export const config = {
  jwtSecret: process.env.JWT_SECRET || 'myvaccine-super-secret-key-2025',
  port: process.env.PORT || 3001,
  databasePath: process.env.DATABASE_PATH || 'database.sqlite',
  nodeEnv: process.env.NODE_ENV || 'development',
};