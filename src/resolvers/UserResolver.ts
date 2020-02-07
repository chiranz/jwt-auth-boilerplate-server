import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx
} from "type-graphql";
import { hash, compare } from "bcryptjs";
import { User } from "../entity/User";
import { sign } from "jsonwebtoken";
import { MyContext } from "../MyContext";

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
    res.cookie(
      "jid",
      sign(
        { userId: user.id, name: user.username },
        "Try thinking and give up",
        {
          expiresIn: "7d"
        }
      ),
      {
        httpOnly: true
      }
    );
    return {
      accessToken: sign({ userId: user.id }, "you will never know why", {
        expiresIn: "15m"
      })
    };
  }
}
