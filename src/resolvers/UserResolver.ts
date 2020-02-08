import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
  Int
} from "type-graphql";
import { hash, compare } from "bcryptjs";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";
import { createRefreshToken, createAccessToken } from "../auth";
import { isAuth } from "../isAuth";
import { sendRefreshToken } from "../sendRefreshToken";
import { getConnection } from "typeorm";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "Hello World!";
  }

  // Private route
  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    return `Your userId is: ${payload!.userId} `;
  }

  @Query(() => [User])
  getUsers() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(@Arg("userId", () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, "tokenVersion", 1);
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("username", () => String) username: string,
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string
  ) {
    const hashedPassword = await hash(password, 12);
    const checkUser = await User.findOne({ where: { email } });
    if (checkUser) {
      throw new Error("Email already registered!");
    }
    try {
      await User.insert({
        username,
        email,
        password: hashedPassword
      });
    } catch (err) {
      console.log(err);
      return false;
    }
    return true;
  }
  @Mutation(() => LoginResponse)
  async login(
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const valid = await compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid Credentials");
    }

    // Login Successful

    // Set refresh token in cookie
    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user)
    };
  }
}
