export class AccountNotConfirmedError extends Error {
  constructor(message = "Devi confermare la registrazione tramite l'email ricevuta prima di accedere") {
    super(message);
    this.name = "AccountNotConfirmedError";
  }
}
