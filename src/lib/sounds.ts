// Audio synthesis disabled per user preference (silent operation, window open only)
export function playChimeSound(_type: 'reminder' | 'success' | 'alert' = 'reminder') {
  // Silent: no audio alerts per requirement ("não é necessário aviso sonoro, somente abrir a janela")
  return;
}
