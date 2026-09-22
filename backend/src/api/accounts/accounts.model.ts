import { Schema, model } from "mongoose";
import { Account } from "./accounts.entity";

const accountSchema = new Schema<Account>({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  IBAN: { type: String, required: false, default: "" }, // valorizzato manualmente in seguito
  balance: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, required: true, default: Date.now },
});

accountSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

accountSchema.set("toObject", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
export const AccountModel = model<Account>("Account", accountSchema);
