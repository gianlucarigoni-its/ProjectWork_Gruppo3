/**
 * Generatore di IBAN validi (checksum MOD-97 corretto secondo ISO 13616).
 * Attenzione: genera IBAN sintatticamente validi ma di conti INESISTENTI,
 * utili solo per test/sviluppo (es. seed di database, mock, unit test).
 */

function randomDigits(n: number): string {
  let result = "";
  for (let i = 0; i < n; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

function randomLetters(n: number): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < n; i++) {
    result += letters[Math.floor(Math.random() * letters.length)];
  }
  return result;
}

/** Converte lettere in numeri secondo lo standard IBAN (A=10, B=11, ..., Z=35) */
function letterToNum(input: string): string {
  return input
    .split("")
    .map((ch) => {
      if (/[0-9]/.test(ch)) return ch;
      return (ch.toUpperCase().charCodeAt(0) - "A".charCodeAt(0) + 10).toString();
    })
    .join("");
}

/** Calcola il modulo 97 di una stringa numerica molto lunga, a blocchi (per evitare overflow) */
function mod97(numericStr: string): number {
  let remainder = 0;
  for (const digit of numericStr) {
    remainder = (remainder * 10 + parseInt(digit, 10)) % 97;
  }
  return remainder;
}

/** Genera il BBAN (Basic Bank Account Number) in base al paese */
function generateBban(country: string): string {
  switch (country) {
    case "IT": {
      const cin = randomLetters(1);
      const abi = randomDigits(5);
      const cab = randomDigits(5);
      const conto = randomDigits(12);
      return cin + abi + cab + conto;
    }
    default: {
      // Fallback generico: 20 cifre casuali
      return randomDigits(20);
    }
  }
}

/**
 * Genera un IBAN valido (checksum corretto) per il paese specificato.
 * @param country codice paese ISO a 2 lettere (default: 'IT')
 */
export function generateRandomIban(country: string = "IT"): string {
  const bban = generateBban(country);

  // Sposta paese + checksum fittizio (00) in coda, converte in numeri, calcola mod 97
  const rearranged = `${bban}${country}00`;
  const numeric = letterToNum(rearranged);
  const remainder = mod97(numeric);
  const checksum = (98 - remainder).toString().padStart(2, "0");

  return `${country}${checksum}${bban}`;
}

// Esempio d'uso:
// const iban = generateRandomIban('IT');
