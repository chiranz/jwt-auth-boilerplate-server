import { Router } from "express";
import { verify } from "jsonwebtoken";
import { User } from "../entity/User";
import { createAccessToken } from "../auth";

const refreshRouter = Router();

refreshRouter.post("/refresh_token", async (req, res) => {
  const token = req.cookies.jid;
  if (!token) {
    return res.send({ ok: false, accessToken: "" });
  }
  let payload: any = null;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
  } catch (err) {
    console.log(err);
    return res.send({ ok: false, accessToken: "" });
  }
  //   Token is Valid
  // Can send back access token
  const user = await User.findOne({ id: payload.userId });
  if (!user) {
    return res.send({ ok: false, accessToken: "" });
  }
  return res.send({ ok: true, accessToken: createAccessToken(user) });
});

export default refreshRouter;
