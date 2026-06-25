export function openCalculator() {
  document.dispatchEvent(new CustomEvent('open-calculator'));
}
