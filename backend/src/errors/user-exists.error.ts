export class UserExistsError extends Error {
  constructor(message = "Un utente con questa email è già registrato") {
    super(message);
    this.name = "UserExistsError";
  }
}
