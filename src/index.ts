import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { UserResolver } from "./resolvers/UserResolver";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import refreshRouter from "./routes/refreshRoute";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 4000;

(async () => {
  const app = express();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true
    })
  );
  app.use(cookieParser());
  app.get("/", (_, res) => res.send("Hello World!"));
  app.use("/", refreshRouter);
  await createConnection()
    .then(() => console.log("Database Connected!"))
    .catch(() => console.log("Database connection failed"));
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver]
    }),
    context: ({ req, res }) => ({ req, res })
  });

  apolloServer.applyMiddleware({ app, cors: false });
  app.listen(PORT, () => {
    console.log(`Port running on ${PORT}`);
  });
})();
