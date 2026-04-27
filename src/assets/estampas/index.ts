/**
 * Tipo da estampa de costas no catálogo (Firestore + admin).
 * As imagens já não vêm de ficheiros locais nesta pasta.
 */
export interface Stamp {
  id: string;
  name: string;
  /** Coleção / grupo (ex.: valor do campo "coleção" no admin). */
  category: string;
  src: string;
  /** Identificador auxiliar (ex.: id do documento Firestore). */
  file: string;
  /** `undefined`/`null` = estoque ilimitado. */
  stock?: number | null;
  /** Referência máx. para vitrine “n/m” (opcional). */
  stockInitial?: number | null;
}
