// ==========================================
// 1. МУЗЫКА (Визуальный Плеер)
// ==========================================
const playlist = [
    { file: "music/track1.mp3", title: "YAW", artist: "GERXMVP", cover: "cover1.jpg" },
    { file: "music/track2.mp3", title: "Overlook (Slowed)", artist: "Bomby.", cover: "cover2.jpg" },
    { file: "music/track3.mp3", title: "Faith", artist: "Hugeloud", cover: "cover3.jpg" },
    { file: "music/track4.mp3", title: "Liquid", artist: "GreenHuedee", cover: "cover4.jpg" },
    { file: "music/track5.mp3", title: "VEM ME PEGAR", artist: "HONEYWOOD", cover: "cover5.jpg" },
    { file: "music/track6.mp3", title: "CHOL L", artist: "TRXSHBXY", cover: "cover6.jpg" }
];

let currentTrack = 0;
const player = document.getElementById('bg-music');

if (player) {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const trackTitle = document.getElementById('track-title');
    const trackArtist = document.getElementById('track-artist');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');

    function loadTrack(index) {
        const track = playlist[index];
        player.src = track.file;
        player.volume = 0.1;
        if(trackTitle) trackTitle.textContent = track.title;
        if(trackArtist) trackArtist.textContent = track.artist;
        if(progressBar) progressBar.style.width = '0%';
        const cover = document.getElementById('player-cover-img');
        if(cover) cover.src = track.cover; 
    }

    function updateProgress() {
        if (player.duration && progressBar) {
            const percent = (player.currentTime / player.duration) * 100;
            progressBar.style.width = `${percent}%`;
        }
    }

    if (progressContainer) {
        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            player.currentTime = percent * player.duration;
        });
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (player.paused) {
                player.play();
                playPauseBtn.textContent = '⏸';
            } else {
                player.pause();
                playPauseBtn.textContent = '▶';
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
            loadTrack(currentTrack);
            player.play();
            if(playPauseBtn) playPauseBtn.textContent = '⏸';
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentTrack = (currentTrack + 1) % playlist.length;
            loadTrack(currentTrack);
            player.play();
            if(playPauseBtn) playPauseBtn.textContent = '⏸';
        });
    }

    player.addEventListener('timeupdate', updateProgress);
    player.addEventListener('ended', () => {
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack);
        player.play();
    });

    loadTrack(currentTrack);

    document.body.addEventListener('click', function initAudio() {
        if (player.paused) {
            player.play().catch(e => console.log("Ошибка воспроизведения:", e));
            if(playPauseBtn) playPauseBtn.textContent = '⏸';
        }
        document.body.removeEventListener('click', initAudio);
    }, { once: true });
}

// ==========================================
// 1.1 АУДИО ВИЗУАЛИЗАТОР
// ==========================================
const canvasViz = document.getElementById('visualizer');
if (canvasViz) {
    const ctxViz = canvasViz.getContext('2d');
    let audioContext, analyser, dataArray;

    function initVisualizer() {
        if (!audioContext && player) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaElementSource(player);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            analyser.fftSize = 128;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        }
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);
        ctxViz.fillStyle = 'rgba(15, 15, 15, 0.2)';
        ctxViz.fillRect(0, 0, canvasViz.width, canvasViz.height);
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        const barWidth = (canvasViz.width / dataArray.length) * 2.5;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = dataArray[i] / 2;
            const gradient = ctxViz.createLinearGradient(0, 0, 0, canvasViz.height);
            gradient.addColorStop(0, '#4ade80');
            gradient.addColorStop(1, '#3b82f6');
            ctxViz.fillStyle = gradient;
            ctxViz.fillRect(x, canvasViz.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    document.body.addEventListener('click', function initAudioAndViz() {
        initVisualizer();
        drawVisualizer();
        document.body.removeEventListener('click', initAudioAndViz);
    }, { once: true });
}

// ==========================================
// 2. СМЕНА ТЕМЫ (День/Ночь)
// ==========================================
const toggleBtn = document.getElementById('theme-toggle');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });
}

// ==========================================
// 3. ЖИВЫЕ ЧАСЫ
// ==========================================
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');

function updateClock() {
    const now = new Date();
    if (clockEl) clockEl.textContent = now.toLocaleTimeString('ru-RU');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

if (clockEl) {
    updateClock(); // Вызываем сразу, чтобы время появилось моментально
    setInterval(updateClock, 1000); // И потом обновляем каждую секунду
}

// ==========================================
// 4. ГЕНЕРАТОР ЦВЕТОВ
// ==========================================
const colorBtn = document.getElementById('color-btn');
if (colorBtn) {
    colorBtn.addEventListener('click', () => {
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        document.body.style.backgroundColor = randomColor;
        const code = document.getElementById('color-code');
        if(code) code.textContent = randomColor.toUpperCase();
    });
}

// ==========================================
// 5. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК (Внутренние)
// ==========================================
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        // Если это ссылка, не трогаем её
        if (button.tagName === 'A') return;

        e.preventDefault();

        const targetId = button.getAttribute('data-target');
        const targetTab = document.getElementById(targetId);
        if (!targetTab) return;
        
        const parentMenu = button.closest('.nav-menu');
        if (!parentMenu) return;
        
        parentMenu.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const parentContainer = parentMenu.parentElement;
        if (parentContainer) {
            parentContainer.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        }
        
        button.classList.add('active');
        targetTab.classList.add('active');
    });
});

// ==========================================
// 6. МАТРИЦА (Частицы)
// ==========================================
const canvas = document.createElement('canvas');
canvas.id = 'matrix-canvas';
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];
const particleCount = 60;
const mouse = { x: null, y: null, radius: 150 };
window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
    }
    update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = '#4ade80';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    }
}
for (let i = 0; i < particleCount; i++) particles.push(new Particle());
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update(); p.draw();
        if (mouse.x && mouse.y) {
            let dx = p.x - mouse.x, dy = p.y - mouse.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < mouse.radius) {
                ctx.strokeStyle = `rgba(74, 222, 128, ${1 - dist/mouse.radius})`;
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ==========================================
// 7. СКАНЕР СЕТИ
// ==========================================
const scanBtn = document.getElementById('scan-btn');
if (scanBtn) {
    scanBtn.addEventListener('click', async () => {
        const logBox = document.getElementById('scan-log');
        if (!logBox) return;
        logBox.style.display = 'block';
        logBox.innerHTML = '> Инициализация сканера...<br>';
        const devices = ["Router", "Desktop-PC", "Unknown Smartphone", "IP-Camera", "Smart TV"];
        for (let i = 0; i < devices.length; i++) {
            await new Promise(r => setTimeout(r, 600));
            logBox.innerHTML += `> Пинг ... OK<br>`;
            await new Promise(r => setTimeout(r, 400));
            logBox.innerHTML += `> <span style="color:#3b82f6;">Найдено: ${devices[i]}</span><br>`;
            logBox.scrollTop = logBox.scrollHeight;
        }
        logBox.innerHTML += `> Сканирование завершено.<br>`;
    });
}

// ==========================================
// 8. АНАЛИЗАТОР ПАРОЛЕЙ
// ==========================================
const passInput = document.getElementById('password-input');
const passResult = document.getElementById('password-result');
if (passInput && passResult) {
    passInput.addEventListener('input', () => {
        const pass = passInput.value;
        if (pass.length === 0) { passResult.innerHTML = ''; return; }
        let score = 0;
        if (pass.length > 5) score++;
        if (pass.length > 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        let msg = "", color = "";
        if (score <= 2) { msg = "🔴 СЛАБЫЙ."; color = "#ff5f56"; }
        else if (score === 3 || score === 4) { msg = "🟡 СРЕДНИЙ."; color = "#ffbd2e"; }
        else { msg = "🟢 НАДЕЖНЫЙ."; color = "#27c93f"; }
        passResult.innerHTML = `<span style="color: ${color}">${msg}</span>`;
    });
}

// ==========================================
// 9. МУЛЬТИПОИСК
// ==========================================
const multiSearchBtn = document.getElementById('multi-search-btn');
if (multiSearchBtn) {
    multiSearchBtn.addEventListener('click', () => {
        const username = document.getElementById('multi-search-input').value.trim();
        if (!username) return alert("Введи ник!");
        const sites = [`https://github.com/${username}`, `https://t.me/${username}`, `https://vk.com/${username}`, `https://steamcommunity.com/id/${username}`, `https://www.tiktok.com/@${username}`, `https://www.instagram.com/${username}/`];
        sites.forEach(url => window.open(url, '_blank'));
    });
}

// ==========================================
// 10. МОНИТОРИНГ ПК
// ==========================================
const cpuBar = document.getElementById('cpu-bar');
if (cpuBar) {
    setInterval(() => {
        const cpu = Math.floor(Math.random() * 40) + 10;
        const ram = Math.floor(Math.random() * 20) + 40;
        const gpu = Math.floor(Math.random() * 15) + 45;
        document.getElementById('cpu-value').textContent = cpu + '%';
        document.getElementById('ram-value').textContent = ram + '%';
        document.getElementById('gpu-value').textContent = gpu + '°C';
        cpuBar.style.width = cpu + '%';
        document.getElementById('ram-bar').style.width = ram + '%';
        const gpuBar = document.getElementById('gpu-bar');
        gpuBar.style.width = gpu + '%';
        gpuBar.style.backgroundColor = (gpu > 55) ? '#ff5f56' : '#a855f7';
    }, 2000);
}

// ==========================================
// 11. КНОПКА "НАВЕРХ"
// ==========================================
const scrollTopBtn = document.getElementById('scroll-top-btn');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        scrollTopBtn.style.display = (window.scrollY > 300) ? 'flex' : 'none';
    });
    scrollTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

// ==========================================
// 12. МАТРИЧНЫЙ ДОЖДЬ
// ==========================================
const matrixCanvas = document.createElement('canvas');
matrixCanvas.id = 'matrix-rain';
document.body.prepend(matrixCanvas);
const mCtx = matrixCanvas.getContext('2d');
matrixCanvas.width = window.innerWidth;
matrixCanvas.height = window.innerHeight;
matrixCanvas.style.position = 'fixed';
matrixCanvas.style.top = '0';
matrixCanvas.style.left = '0';
matrixCanvas.style.zIndex = '-2';
matrixCanvas.style.opacity = '0.4';
const matrixChars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const fontSize = 16;
const columns = matrixCanvas.width / fontSize;
const drops = [];
for (let x = 0; x < columns; x++) drops[x] = 1;
setInterval(() => {
    mCtx.fillStyle = 'rgba(15, 15, 15, 0.05)';
    mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    mCtx.fillStyle = '#4ade80';
    mCtx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
        const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        mCtx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}, 50);

// ==========================================
// 14. МИНИ-ТЕРМИНАЛ
// ==========================================
const termInput = document.getElementById('terminal-input');
const termOutput = document.getElementById('terminal-output');

if (termInput && termOutput) {
    const commands = {
        help: "Доступные команды: help, about, clear, matrix, date, user, ascii",
        about: "Я — Fadr. Этот терминал написан на чистом JavaScript.",
        date: new Date().toLocaleString('ru-RU'),
        matrix: "Матрица уже вокруг тебя..."
    };

    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawCmd = termInput.value.trim();
            const cmd = rawCmd.toLowerCase();
            if (cmd === '') return;

            // Выводим введенную команду
            const p = document.createElement('p');
            p.innerHTML = `$ ${rawCmd}`;
            termOutput.appendChild(p);

            // --- ОБРАБОТКА КОМАНД ---
            if (cmd === 'clear') {
                termOutput.innerHTML = '';
            } 
            else if (cmd === 'user') {
                // СБОР ДАННЫХ О ПОЛЬЗОВАТЕЛЕ (OSINT)
                const userInfo = [
                    `ОС: ${navigator.platform}`,
                    `Браузер: ${navigator.userAgent}`,
                    `Язык: ${navigator.language}`,
                    `Экран: ${window.screen.width}x${window.screen.height}`,
                    `Онлайн: ${navigator.onLine ? 'Да' : 'Нет'}`,
                    `Часовой пояс: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`
                ].join('\n');
                
                const res = document.createElement('p');
                res.style.color = '#3b82f6';
                res.style.whiteSpace = 'pre-wrap'; // Чтобы переносить строки
                res.textContent = userInfo;
                termOutput.appendChild(res);
            }
            else if (cmd === 'ascii') {
                // ASCII АРТ
                const asciiArt = `
  ███████╗ █████╗ ██████╗ ██████╗ 
  ██╔════╝██╔══██╗██╔══██╗██╔══██╗
  █████╗  ███████║██║  ██║██████╔╝
  ██╔══╝  ██╔══██║██║  ██║██╔══██╗
  ██║     ██║  ██║██████╔╝██║  ██║
  ╚═╝     ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝ 
                `;
                const res = document.createElement('pre');
                res.style.color = '#4ade80';
                res.style.fontSize = '0.6rem';
                res.style.lineHeight = '1';
                res.textContent = asciiArt;
                termOutput.appendChild(res);
            }
            else if (commands[cmd]) {
                const res = document.createElement('p');
                res.style.color = '#3b82f6';
                res.textContent = commands[cmd];
                termOutput.appendChild(res);
            } 
            else {
                const err = document.createElement('p');
                err.style.color = '#ff5f56';
                err.textContent = `Команда не найдена: ${cmd}`;
                termOutput.appendChild(err);
            }

            // Очищаем поле и скроллим вниз
            termInput.value = '';
            termOutput.scrollTop = termOutput.scrollHeight;
        }
    });
}


// ==========================================
// 15. СВЕЧЕНИЕ ЗА МЫШКОЙ
// ==========================================
const glow = document.createElement('div');
glow.id = 'cursor-glow';
document.body.appendChild(glow);
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// ==========================================
// 16. ТАЙМЕР ПОМОДОРО
// ==========================================
const pomodoroDisplay = document.getElementById('pomodoro-display');
const startBtn = document.getElementById('pomodoro-start');
const resetBtn = document.getElementById('pomodoro-reset');
if (pomodoroDisplay && startBtn && resetBtn) {
    let pomodoroTime = 25 * 60;
    let pomodoroInterval;
    const updateDisplay = () => {
        const minutes = Math.floor(pomodoroTime / 60);
        const seconds = pomodoroTime % 60;
        pomodoroDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    startBtn.addEventListener('click', () => {
        if (pomodoroInterval) {
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;
            startBtn.textContent = 'Старт';
        } else {
            startBtn.textContent = 'Пауза';
            pomodoroInterval = setInterval(() => {
                if (pomodoroTime > 0) {
                    pomodoroTime--;
                    updateDisplay();
                } else {
                    clearInterval(pomodoroInterval);
                    pomodoroInterval = null;
                    startBtn.textContent = 'Старт';
                    alert("Время вышло! Пора отдохнуть.");
                    pomodoroTime = 25 * 60;
                    updateDisplay();
                }
            }, 1000);
        }
    });
    resetBtn.addEventListener('click', () => {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
        startBtn.textContent = 'Старт';
        pomodoroTime = 25 * 60;
        updateDisplay();
    });
}

// ==========================================
// 17. БЛОКНОТ
// ==========================================
const notepad = document.getElementById('notepad');
if (notepad) {
    const savedText = localStorage.getItem('myNotepad');
    if (savedText) notepad.value = savedText;
    notepad.addEventListener('input', () => {
        localStorage.setItem('myNotepad', notepad.value);
    });
}

// ==========================================
// 18. ПОГОДА (Резервный API wttr.in)
// ==========================================
const weatherBtn = document.getElementById('weather-btn');
if (weatherBtn) {
    weatherBtn.addEventListener('click', async () => {
        const cityInput = document.getElementById('city-input');
        const resultBox = document.getElementById('weather-result');
        
        if (!cityInput || !resultBox) return;
        const city = cityInput.value.trim();
        if (!city) return alert("Введи город!");

        resultBox.innerHTML = "Загрузка...";

        try {
            // Используем формат j1 (JSON) для получения данных
            const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error("Город не найден");
            
            const data = await response.json();
            const current = data.current_condition[0];
            
            const temp = current.temp_C;
            const desc = current.lang_ru ? current.lang_ru[0].value : current.weatherDesc[0].value;

            resultBox.innerHTML = `
                <div class="weather-temp">${temp}°C</div>
                <div class="weather-desc">${city}: ${desc}</div>
            `;
        } catch (error) {
            console.error("Ошибка погоды:", error);
            resultBox.innerHTML = "Ошибка: город не найден или нет связи.";
        }
    });
}

// ==========================================
// 19. IP / DOMAIN ИНСТРУМЕНТ
// ==========================================
const targetBtn = document.getElementById('target-btn');
if (targetBtn) {
    targetBtn.addEventListener('click', () => {
        const target = document.getElementById('target-input').value.trim();
        if (!target) return alert("Введи IP или домен!");
        const services = [`https://www.virustotal.com/gui/ip-address/${target}`, `https://www.shodan.io/host/${target}`, `https://2ip.ru/whois/${target}`, `https://whois.ru/${target}`];
        services.forEach(url => window.open(url, '_blank'));
    });
}

// ==========================================
// 20. ИНТЕРАКТИВНЫЙ ТАЙМЛАЙН
// ==========================================
function toggleTimeline(element) {
    if(element && element.parentElement) {
        element.parentElement.classList.toggle('active');
    }
}

// ==========================================
// 21. УПРАВЛЕНИЕ ГЛАВНЫМИ ВКЛАДКАМИ (Боковая панель)
// ==========================================
function openTab(tabId) {
    document.querySelectorAll('.tab-page').forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(tabId);
    if (targetPage) targetPage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 22. АККОРДЕОН
// ==========================================
function toggleSection(headerElement) {
    if(!headerElement || !headerElement.parentElement) return;
    const section = headerElement.parentElement;
    if (section.classList.contains('tab-content')) return;
    section.classList.toggle('active');
}

// ==========================================
// 23. СМЕНА ЦВЕТА АКЦЕНТА
// ==========================================
function changeAccent(color) {
    localStorage.setItem('accentColor', color);
    document.documentElement.style.setProperty('--accent-color', color);
    const logoSpan = document.querySelector('.sidebar-logo span');
    if (logoSpan) logoSpan.style.color = color;
}
// ==========================================
// 24. ЗАЩИТА ССЫЛОК ОТ ПЕРЕХВАТА
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const allLinks = document.querySelectorAll('a[href^="http"], a[href^="mailto"]');
    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    
    // Применяем сохраненный цвет при загрузке
    const savedColor = localStorage.getItem('accentColor');
    if (savedColor) {
        changeAccent(savedColor);
    } else {
        changeAccent('#4ade80');
    }
});
// ==========================================
// 25. ПРОВЕРКА УТЕЧЕК EMAIL (XposedOrNot через прокси)
// ==========================================
const emailBtn = document.getElementById('email-check-btn');
if (emailBtn) {
    emailBtn.addEventListener('click', async () => {
        const emailInput = document.getElementById('email-input');
        const resultBox = document.getElementById('email-result');
        
        if (!emailInput || !resultBox) return;
        const email = emailInput.value.trim();
        if (!email) return alert("Введи email!");

        resultBox.innerHTML = "Проверка...";

        try {
            // Используем публичный CORS-прокси для обхода блокировки браузера
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const targetUrl = `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`;
            
            const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
            
            if (!response.ok) {
                if (response.status === 404) {
                    resultBox.innerHTML = "✅ Этот email не найден в известных утечках.";
                    return;
                }
                throw new Error("Ошибка сервера");
            }

            const data = await response.json();
            
            if (data && data.breaches && data.breaches.length > 0) {
                let html = `<p style="color: #ff5f56; font-weight: bold;">⚠️ Найдено в ${data.breaches.length} утечках:</p><ul style="color: #d1d1d1; margin-top: 5px;">`;
                data.breaches.forEach(breach => {
                    html += `<li>${breach}</li>`;
                });
                html += `</ul>`;
                resultBox.innerHTML = html;
            } else {
                resultBox.innerHTML = "✅ Этот email не найден в известных утечках.";
            }
        } catch (error) {
            console.error("Ошибка проверки:", error);
            resultBox.innerHTML = "❌ Ошибка соединения. Попробуй позже.";
        }
    });
}