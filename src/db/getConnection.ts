import { createConnection } from "typeorm";

export const GetConnection = async () =>
  await createConnection({
    type: "mysql",
    host: process.env.TYPEORM_HOST,
    port: parseInt(process.env.TYPEORM_PORT!, 10),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    logging: !!process.env.LOGGING,
    entities: [process.env.TYPEORM_ENTITIES!],
    database: process.env.TYPEORM_DATABASE,
    synchronize: true // Run this update db
  }).catch((err) => {
    console.error(err);
  });
