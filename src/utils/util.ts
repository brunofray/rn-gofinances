export function getNumberFormatted(number: number) {
  return Number(number).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
} 

export function getDateFormatted(date: Date) {
  return Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format( date );
}

export function getNamDateFormatted(date: Date) {
  return `${date.getDate()} de ${getNamMonth(date)}`;
}

export function getNamMonth(date: Date) {
  return date.toLocaleString('pt-BR', {month: 'long'});
}