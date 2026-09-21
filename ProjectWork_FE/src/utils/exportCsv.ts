import type { RigaMovimento } from '../types';

export function esportaCsv(nomeFile: string, righe: RigaMovimento[]) {
  const esc = (v: string) => '"' + v.replace(/"/g, '""') + '"';
  const intestazione = ['Data', 'Importo', 'NomeCategoria'].map(esc).join(';');
  const corpo = righe.map((r) =>
    [
      new Date(r.data).toLocaleDateString('it-IT'),
      r.importo.toFixed(2).replace('.', ','),
      r.categoriaMovimentoId?.nomeCategoria ?? '-',
    ]
      .map(esc)
      .join(';')
  );
  const contenuto = '\uFEFF' + [intestazione, ...corpo].join('\r\n');

  const blob = new Blob([contenuto], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeFile;
  a.click();
  URL.revokeObjectURL(url);
}
