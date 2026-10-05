import { Link, Navigate } from "react-router-dom";
import { Send, Wallet, ArrowLeftRight, ShieldCheck } from "lucide-react";

const FUNZIONI = [
  {
    icona: Send,
    titolo: "Bonifici",
    testo: "Invia denaro a qualsiasi IBAN in pochi passaggi, direttamente dal tuo conto.",
  },
  {
    icona: Wallet,
    titolo: "Ricariche telefoniche",
    testo: "Ricarica il tuo cellulare con i principali operatori, senza uscire di casa.",
  },
  {
    icona: ArrowLeftRight,
    titolo: "Movimenti sotto controllo",
    testo: "Cerca e filtra le operazioni per categoria e data, ed esportale in CSV.",
  },
  {
    icona: ShieldCheck,
    titolo: "Accesso protetto",
    testo: "Registrazione con conferma via email e password custodite in forma criptata.",
  },
];

const PASSAGGI = [
  { titolo: "Registrati", testo: "Inserisci i tuoi dati e scegli una password sicura." },
  { titolo: "Conferma l'email", testo: "Clicca sul link che ti inviamo per attivare il conto." },
  { titolo: "Accedi", testo: "Entra nella tua area personale e inizia a usare il conto." },
];

export default function LandingPage() {
  // Se l'utente è già dentro, la landing non serve
  if (localStorage.getItem("token")) return <Navigate to="/home" replace />;

  return (
    <div className="landing">
      <header className="landing-nav">
        <img src="/img/3Vision_DigitalBank_LogoRMBG_white.png" alt="3Vision DigitalBank" />
        <Link to="/login" className="btn-ghost btn-sm">
          Accedi
        </Link>
      </header>

      <main>
        <section className="landing-hero">
          <h1 className="hero-title">
            La tua banca, <span>semplice</span> e sempre a portata di mano
          </h1>
          <p className="hero-subtitle">
            Apri il tuo conto online, gestisci bonifici e ricariche e tieni sotto controllo ogni
            movimento da qualsiasi dispositivo.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary btn-lg">
              Apri conto
            </Link>
            <Link to="/login" className="btn-ghost btn-lg">
              Accedi al tuo conto
            </Link>
          </div>
        </section>

        <section className="landing-section" aria-labelledby="titolo-funzioni">
          <h2 id="titolo-funzioni">Tutto quello che ti serve</h2>
          <div className="feature-grid">
            {FUNZIONI.map(({ icona: Icona, titolo, testo }) => (
              <article key={titolo} className="feature-card">
                <div className="feature-icon">
                  <Icona size={24} aria-hidden="true" />
                </div>
                <h3>{titolo}</h3>
                <p>{testo}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section" aria-labelledby="titolo-passaggi">
          <h2 id="titolo-passaggi">Come iniziare</h2>
          <ol className="steps">
            {PASSAGGI.map((p, i) => (
              <li key={p.titolo}>
                <span className="step-number" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{p.titolo}</h3>
                <p>{p.testo}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="landing-section">
          <div className="landing-cta">
            <h2>Pronto a iniziare?</h2>
            <p>Aprire un conto con 3Vision DigitalBank richiede pochi minuti.</p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary btn-lg">
                Apri conto
              </Link>
              <Link to="/login" className="btn-ghost btn-lg">
                Accedi al tuo conto
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        © {new Date().getFullYear()} 3Vision DigitalBank · Project work
      </footer>
    </div>
  );
}
