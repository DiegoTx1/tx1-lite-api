
async function getCandles() {
  try {
    const response = await fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=10");
    const data = await response.json();

    const c1 = data[data.length - 3];
    const c2 = data[data.length - 2];
    const c3 = data[data.length - 1];

    const closes = data.map(c => parseFloat(c[4]));
    const gains = [], losses = [];
    for (let i = 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains.push(diff);
      else losses.push(Math.abs(diff));
    }
    const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length || 0.01;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length || 0.01;
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    let signal = "ESPERAR";
    let reason = "RSI: " + rsi.toFixed(2);

    const open3 = parseFloat(c3[1]);
    const close3 = parseFloat(c3[4]);
    const open2 = parseFloat(c2[1]);
    const close2 = parseFloat(c2[4]);

    if (rsi < 30 && close3 > open3 && close2 < open2) {
      signal = "CALL";
      reason = "RSI < 30 + Engolfo de Alta detectado";
    } else if (rsi > 70 && close3 < open3 && close2 > open2) {
      signal = "PUT";
      reason = "RSI > 70 + Engolfo de Baixa detectado";
    }

    document.getElementById("signal").innerText = signal;
    document.getElementById("criteria").innerText = reason;
  } catch (error) {
    document.getElementById("signal").innerText = "ERRO";
    document.getElementById("criteria").innerText = "Falha ao buscar dados da API.";
  }
}

getCandles();
setInterval(getCandles, 60000);
