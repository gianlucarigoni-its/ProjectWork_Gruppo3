import { Schema, model, Types } from "mongoose";

interface LocalCredentials {
  username: string; // email
  hashedPassword: string;
  isConfirmed: boolean;
  confirmationToken: string | null;
  confirmationExpires: Date | null;
}

export interface UserIdentity {
  provider: "local";
  user: Types.ObjectId; // ref -> Account
  credentials: LocalCredentials;
}

const credentialsSchema = new Schema<LocalCredentials>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    hashedPassword: { type: String, required: true },
    isConfirmed: { type: Boolean, required: true, default: false },
    confirmationToken: { type: String, default: null },
    confirmationExpires: { type: Date, default: null },
  },
  { _id: false },
);

const userIdentitySchema = new Schema<UserIdentity>({
  provider: { type: String, required: true, enum: ["local"] },
  user: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  credentials: { type: credentialsSchema, required: true },
});

export const UserIdentityModel = model<UserIdentity>("UserIdentity", userIdentitySchema);
