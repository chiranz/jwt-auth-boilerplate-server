import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { hash } from "bcryptjs";
import { User } from "../entity/User";

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
}
