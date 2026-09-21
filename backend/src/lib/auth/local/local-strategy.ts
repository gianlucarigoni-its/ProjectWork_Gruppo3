import { Strategy as LocalStrategy } from "passport-local";
import * as bcrypt from "bcrypt";
import passport from "passport";
import { UserIdentityModel } from "./user-identity.model";
import { Account } from "../../../modules/account/accounts.entity";

passport.use(
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username, password, done) => {
      try {
        const identity = await UserIdentityModel.findOne({
          "credentials.username": username.toLowerCase(),
        }).populate<{ user: Account }>("user");

        if (!identity) {
          return done(null, false, { message: "Email o password non corretti" });
        }

        const passwordMatches = await bcrypt.compare(password, identity.credentials.hashedPassword);
        if (!passwordMatches) {
          return done(null, false, { message: "Email o password non corretti" });
        }

        if (!identity.credentials.isConfirmed) {
          return done(null, false, {
            message: "Devi confermare la registrazione tramite l'email ricevuta prima di accedere",
          });
        }

        return done(null, identity.user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

export default passport;
