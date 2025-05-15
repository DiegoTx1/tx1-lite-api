
let countdown = 60;
let interval = setInterval(() => {
  countdown--;
  document.getElementById("countdown").innerText = "Próxima leitura em: " + countdown + "s";
  if (countdown <= 0) {
    countdown = 60;
    getCandles();
  }
}, 1000);

async function getCandles() {
  try {
    const res = await fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=20");
    const data = await res.json();

    const closes = data.map(c => parseFloat(c[4]));
    const gains = [], losses = [];
    for (let i = 1; i < 15; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains.push(diff);
      else losses.push(Math.abs(diff));
    }
    const avgGain = gains.reduce((a, b) => a + b, 0) / 14 || 0.01;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / 14 || 0.01;
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    const c2 = data[data.length - 2];
    const c3 = data[data.length - 1];
    const open2 = parseFloat(c2[1]), close2 = parseFloat(c2[4]);
    const open3 = parseFloat(c3[1]), close3 = parseFloat(c3[4]);

    const ema3 = closes.slice(-3).reduce((a, b) => a + b) / 3;
    const ema7 = closes.slice(-7).reduce((a, b) => a + b) / 7;

    let signal = "ESPERAR";
    let reason = "RSI(14): " + rsi.toFixed(2);

    if (rsi < 30 && close3 > open3 && close2 < open2 && ema3 > ema7) {
      signal = "CALL";
      reason = "RSI < 30 + Engolfo de Alta + EMA3 > EMA7";
    } else if (rsi > 70 && close3 < open3 && close2 > open2 && ema3 < ema7) {
      signal = "PUT";
      reason = "RSI > 70 + Engolfo de Baixa + EMA3 < EMA7";
    }

    document.getElementById("signal").innerText = signal;
    document.getElementById("criteria").innerText = reason;
    const alert = document.getElementById("alert");
    alert.play();

    const log = document.createElement("li");
    log.textContent = new Date().toLocaleTimeString() + " → " + signal + " (" + reason + ")";
    const list = document.getElementById("history");
    list.prepend(log);
    if (list.children.length > 5) list.removeChild(list.lastChild);
  } catch (err) {
    document.getElementById("signal").innerText = "ERRO";
    document.getElementById("criteria").innerText = "Falha ao buscar dados.";
  }
}

getCandles();
