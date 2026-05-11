export function calcularSistema(valorConta: number) {
  const consumoMensal = valorConta / 0.85;
  const geracaoNecessaria = consumoMensal * 1.25;
  const sistemaKwp = geracaoNecessaria / 120;
  const custoPorKwp = 3500;
  const investimento = sistemaKwp * custoPorKwp;
  const economiaAnual = valorConta * 0.9 * 12;
  const payback = investimento / economiaAnual;
  const economia25anos = economiaAnual * 25;

  return {
    sistemaKwp: parseFloat(sistemaKwp.toFixed(2)),
    economiaAnual: parseFloat(economiaAnual.toFixed(2)),
    economiaProjetada: parseFloat((valorConta * 0.9).toFixed(2)),
    payback: parseFloat(payback.toFixed(1)),
    economia25anos: parseFloat(economia25anos.toFixed(2)),
  };
}
