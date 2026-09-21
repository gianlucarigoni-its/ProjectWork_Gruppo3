import http from 'http';

const categorie = [
  { _id: 'c1', nomeCategoria: 'Stipendio', tipologia: 'Entrata' },
  { _id: 'c2', nomeCategoria: 'Bollette', tipologia: 'Uscita' },
  { _id: 'c3', nomeCategoria: 'Affitto', tipologia: 'Uscita' },
  { _id: 'c4', nomeCategoria: 'Bonifici', tipologia: 'Entrata' },
  { _id: 'c5', nomeCategoria: 'Abbonamenti', tipologia: 'Uscita' },
  { _id: 'c6', nomeCategoria: 'Apertura', tipologia: 'Entrata' },
];
const cat = (id) => categorie.find((c) => c._id === id);

const righe = [
  ['Apertura Conto', 0, 'c6'],
  ['Bonifico disposto da Luca Bianchi', 1500, 'c4'],
  ['Addebito diretto a favore di Enel Energia', -85.4, 'c2'],
  ['Bonifico disposto a favore di Affitti Srl', -600, 'c3'],
  ['Bonifico disposto da Anna Verdi', 250, 'c4'],
  ['Addebito diretto a favore di Telecom', -29.9, 'c2'],
  ['Bonifico disposto a favore di Paolo Neri', -120, 'c4'],
  ['Bonifico disposto da Mario Stipendi Spa', 1800, 'c1'],
  ['Addebito diretto a favore di Palestra Fit', -45, 'c5'],
  ['Bonifico disposto a favore di Giulia Rossi', -200, 'c4'],
];

const movimenti = [];
let saldo = 0;
righe.forEach(([descrizioneEstesa, importo, catId], i) => {
  saldo = Math.round((saldo + importo) * 100) / 100;
  movimenti.push({
    _id: 'm' + (i + 1),
    contoCorrenteId: 'cc1',
    data: new Date(2026, 8, i + 1).toISOString(),
    descrizioneEstesa,
    categoriaMovimentoId: cat(catId),
    importo,
    saldo,
  });
});

const ordina = (arr) => [...arr].sort((a, b) => new Date(b.data) - new Date(a.data));

const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(JSON.stringify(body));
};

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const u = new URL(req.url, 'http://localhost');
  const url = u.pathname;
  const q = u.searchParams;
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const dati = body ? JSON.parse(body) : {};
    console.log(req.method, url + u.search);

    if (url === '/api/auth/login' && req.method === 'POST') {
      if (dati.email === 'mario@test.it' && dati.password === 'Password!1') {
        return send(res, 200, { token: 'fake-token', nomeTitolare: 'Mario', cognomeTitolare: 'Rossi' });
      }
      return send(res, 401, { message: 'Credenziali non valide' });
    }
    if (url === '/api/auth/registra' && req.method === 'POST') {
      if (dati.email === 'mario@test.it') return send(res, 409, { message: 'Email già registrata.' });
      return send(res, 201, { message: 'Registrazione completata.' });
    }
    if (url.startsWith('/api/auth/conferma/')) {
      return send(res, 200, { message: 'Registrazione confermata!' });
    }

    if (req.headers.authorization !== 'Bearer fake-token') {
      return send(res, 401, { message: 'Non autorizzato' });
    }

    const n = Number(q.get('n')) || 10;

    if (url === '/api/account/modifica-password' && req.method === 'POST') {
      if (dati.passwordAttuale !== 'Password!1') {
        return send(res, 400, { message: 'La password attuale non è corretta.' });
      }
      return send(res, 200, { message: 'Password modificata con successo.' });
    }

    if (url === '/api/account/home') {
      return send(res, 200, {
        benvenuto: 'Benvenuto Mario Rossi',
        saldo,
        ultimiMovimenti: ordina(movimenti).slice(0, 5),
      });
    }
    if (url === '/api/account/categorie') {
      return send(res, 200, categorie);
    }
    if (url === '/api/account/ricerca/ultimi') {
      return send(res, 200, { saldo, movimenti: ordina(movimenti).slice(0, n) });
    }
    if (url === '/api/account/ricerca/categoria') {
      const filtrati = movimenti.filter((m) => m.categoriaMovimentoId._id === q.get('categoriaId'));
      return send(res, 200, { movimenti: ordina(filtrati).slice(0, n) });
    }
    if (url === '/api/account/ricerca/date') {
      const da = new Date(q.get('dal') + 'T00:00:00');
      const a = new Date(q.get('al') + 'T23:59:59');
      const filtrati = movimenti.filter((m) => {
        const d = new Date(m.data);
        return d >= da && d <= a;
      });
      return send(res, 200, { movimenti: ordina(filtrati).slice(0, n) });
    }
    if (url.startsWith('/api/account/movimenti/')) {
      const m = movimenti.find((x) => x._id === url.split('/').pop());
      return m ? send(res, 200, m) : send(res, 404, { message: 'Movimento non trovato' });
    }
    send(res, 404, { message: 'Rotta non trovata' });
  });
}).listen(3000, () => console.log('Mock API su http://localhost:3000'));
