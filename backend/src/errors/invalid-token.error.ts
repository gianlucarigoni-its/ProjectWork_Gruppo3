export class InvalidTokenError extends Error {
  constructor(message = "Link di conferma non valido o scaduto") {
    super(message);
    this.name = "InvalidTokenError";
  }
}
