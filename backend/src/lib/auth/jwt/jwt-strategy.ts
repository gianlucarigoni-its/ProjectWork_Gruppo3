import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { AccountModel } from "../../../api/accounts/accounts.model";

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: "my_jwt_secret",
    },
    async (payload, done) => {
      try {
        const account = await AccountModel.findById(payload.id);
        if (account) {
          done(null, account.toObject());
        } else {
          done(null, false, { message: "invalid token" });
        }
      } catch (err) {
        done(err);
      }
    },
  ),
);
