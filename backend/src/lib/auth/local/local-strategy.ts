import { Strategy as LocalStrategy } from "passport-local";
import * as bcrypt from "bcrypt";
import passport from "passport";
import { UserIdentityModel } from "./user-identity.model";
import { Account } from "../../../api/accounts/accounts.entity";

passport.use(
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username, password, done) => {
      try {
        const identity = await UserIdentityModel.findOne({
          "credentials.username": username,
        }).populate<{ user: Account }>("user");

        if (!identity) {
          return done(null, false, { message: "Username o password non corretti" });
        }

        const passwordMatches = await bcrypt.compare(password, identity.credentials.hashedPassword);
        if (!passwordMatches) {
          return done(null, false, { message: "Username o password non corretti" });
        }

        return done(null, identity.user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

export default passport;
