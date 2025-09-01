export async function onRequest(context: any) {
  const { request, env } = context;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Kids Image Generator - Matrix Neon</title>
<style>
body { margin:0; background:black; font-family:'Courier New', monospace; overflow:hidden; color:#0f0; }
canvas#matrix { position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; }

#container { position:relative; z-index:1; max-width:800px; margin:0 auto; padding:20px; }
h1 { text-align:center; font-size:2em; color:#0f0; }

input#prompt { width:100%; padding:10px; font-size:16px; background:#111; color:#0f0; border:2px solid #0f0; }
button { padding:10px 20px; font-size:16px; border:2px solid #0f0; background:black; color:#0f0; cursor:pointer; margin-top:10px; }

#result img { margin-top:20px; max-width:100%; border:2px solid #0f0; }
</style>
</head>
<body>
<canvas id="matrix"></canvas>
<div id="container">
<h1>Kids Image Generator</h1>
<input id="prompt" type="text" placeholder="Type what you want generated...">
<button id="generate">Generate</button>
<div id="result"></div>
</div>

<script>
/* MATRIX RAIN */
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const fontSize = 20;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function randomColor() {
  const colors = ['#ff00ff','#00ffff','#ffff00','#ff0000','#00ff00','#ffffff','#ff9900'];
  return colors[Math.floor(Math.random()*colors.length)];
}

function draw() {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.font = fontSize + 'px Courier';
  drops.forEach((y,i)=>{
    const text = letters[Math.floor(Math.random()*letters.length)];
    ctx.fillStyle = randomColor();
    ctx.fillText(text,i*fontSize,y*fontSize);
    if(y*fontSize>canvas.height && Math.random()>0.975) drops[i]=0;
    drops[i]++;
  });
}
setInterval(draw,50);

/* FRONT END FUNCTIONALITY */
const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generate');
const resultDiv = document.getElementById('result');

function randomNeonColor() {
  const colors = ['#ff00ff','#00ffff','#ffff00','#ff0000','#00ff00','#ffffff','#ff9900'];
  return colors[Math.floor(Math.random()*colors.length)];
}

generateBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if(!prompt) return alert('Please type something!');

  resultDiv.innerHTML = '';

  // Call Cloudflare AI Worker
  try {
    const res = await fetch('/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        size: '1024x1024'
      })
    });

    const data = await res.json();
    const imgUrl = data.result?.[0]?.url || '';

    const img = document.createElement('img');
    img.alt = 'Generated Image';
    img.src = imgUrl;
    resultDiv.appendChild(img);

  } catch(err) {
    console.error(err);
    resultDiv.textContent = 'Error generating image. Check console.';
    resultDiv.style.color = randomNeonColor();
  }

  // Neon effect for button and input border
  generateBtn.style.borderColor = randomNeonColor();
  generateBtn.style.color = randomNeonColor();
  promptInput.style.borderColor = randomNeonColor();
});
</script>
</body>
</html>
`;

  return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}
