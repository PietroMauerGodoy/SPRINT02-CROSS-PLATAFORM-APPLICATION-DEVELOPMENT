// Mesmo formato esperado pelo app Motiva (ver types/index.ts do app principal
// e docs/integracao-api-sensores.md, na raiz do repositório).
export type LeituraSensorRaw = {
  id: string; // km do ponto de medição, ex: "5.0"
  altura: number; // altura da vegetação em cm
};

export function ehLeituraValida(valor: unknown): valor is LeituraSensorRaw {
  if (typeof valor !== 'object' || valor === null) return false;
  const v = valor as Record<string, unknown>;
  return typeof v.id === 'string' && v.id.trim() !== '' && typeof v.altura === 'number' && !Number.isNaN(v.altura);
}
