import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field
} from "type-graphql";
import { hash, compare } from "bcryptjs";
import { User } from "../entity/User";
import { sign } from "jsonwebtoken";

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
  @Query(() => [User])
  getUsers() {
    return User.find();
  }
  @Mutation(() => Boolean)
  async register(
    @Arg("username", () => String) username: string,
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string
  ) {
    const hashedPassword = await hash(password, 12);
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
    @Arg("password", () => String) password: string
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
    return {
      accessToken: sign({ userId: user.id }, "you will never know why", {
        expiresIn: "15m"
      })
    };
  }
}
