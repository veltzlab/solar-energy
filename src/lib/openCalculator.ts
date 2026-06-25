export function openCalculator(valorConta?: number) {
  document.dispatchEvent(new CustomEvent('open-calculator', { detail: { valorConta } }));
}
