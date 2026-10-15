/**
 * Mede a taxa de quadros nos primeiros segundos. Se a máquina não sustentar ~24 fps
 * (sem aceleração de vídeo, por exemplo), liga o "modo leve" que desliga os efeitos mais caros.
 * Forçar pela URL: ?fx=low ou ?fx=high
 */
export function watchPerformance() {
  const root = document.documentElement;
  const forced = new URLSearchParams(location.search).get('fx');
  if (forced === 'low') return root.classList.add('low-fx');
  if (forced === 'high') return;

  let frames = 0;
  let start = 0;
  const tick = (t: number) => {
    if (!start) start = t;
    frames++;
    if (t - start < 4000) requestAnimationFrame(tick);
    else if ((frames * 1000) / (t - start) < 24 && !document.hidden) root.classList.add('low-fx');
  };
  // espera a abertura começar antes de medir
  setTimeout(() => requestAnimationFrame(tick), 1500);
}
