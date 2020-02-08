import { Router } from "express";
import { verify } from "jsonwebtoken";
import { User } from "../entity/User";
import { createAccessToken, createRefreshToken } from "../auth";
import { sendRefreshToken } from "../sendRefreshToken";

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
  if (user.tokenVersion !== payload.tokenVersion) {
    return res.send({ ok: false, accessToken: "" });
  }
  // Update refresh token every time the client asks for new accessToken
  sendRefreshToken(res, createRefreshToken(user));

  return res.send({ ok: true, accessToken: createAccessToken(user) });
});

export default refreshRouter;
