import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { UserResolver } from "./resolvers/UserResolver";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";

const PORT = process.env.PORT || 4000;

(async () => {
  const app = express();
  app.get("/", (_, res) => res.send("Hello World!"));

  await createConnection()
    .then(() => console.log("Database Connected!"))
    .catch(() => console.log("Database connection failed"));
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver]
    })
  });

  apolloServer.applyMiddleware({ app });
  app.listen(PORT, () => {
    console.log(`Port running on ${PORT}`);
  });
})();
