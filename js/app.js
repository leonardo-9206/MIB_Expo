/* ==========================================================================
   M.I.B. SECCIÓN ADUANAS - BRAIN OUT PUZZLE ENGINE & MOBILE MECHANICS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let currentPhaseIndex = 0;
    let soundEnabled = true;

    // --- PHASE DEFINITIONS & UNIQUE MECHANICS ---
    const phases = [
        null, // Index 0 is Intro
        {
            id: 1,
            title: "DESBLOQUEAR CASO 1",
            agent: "ANDY",
            topic: "DEPÓSITO FISCAL",
            passwords: ["DEPOSITO", "DEPÓSITO"],
            instructionHint: "💡 Arrastra la caja 'Lote Q-900' a un lado para revelar la evidencia.",
            clueHTML: `
                <div class="sat-stamp">
                    <span>🏛️ SAT ADUANAS</span>
                </div>
                <div class="clue-text">
                    <strong>CÉDULA DE ALMACENAMIENTO:</strong><br>
                    Mercancía resguardada en almacén general autorizado bajo el régimen legal de <strong>DEPÓSITO FISCAL</strong> (Art. 119 Ley Aduanera).
                </div>
            `,
            mechanicType: "drag"
        },
        {
            id: 2,
            title: "DESBLOQUEAR CASO 2",
            agent: "MICH",
            topic: "LOCALES Y MERCANCÍAS DAÑADAS",
            passwords: ["NO"],
            instructionHint: "💡 Toca el botón azul (o inclina tu celular) para vaciar el agua de la fuga.",
            clueHTML: `
                <div class="sat-stamp">
                    <span>🏛️ SAT ADUANAS</span>
                </div>
                <div class="clue-text">
                    <strong>DICTAMEN DE AVERÍA ACCIDENTAL:</strong><br>
                    Tubería rota en bodega. ¿La evidencia demuestra que las 500 piezas fueron sustraídas ilegalmente?<br>
                    <span style="font-size:16px; color:#d32f2f; font-weight:bold; display:block; margin-top:6px;">RESPUESTA: NO</span>
                </div>
            `,
            mechanicType: "drain"
        },
        {
            id: 3,
            title: "DESBLOQUEAR CASO 3",
            agent: "EMILY",
            topic: "TRÁNSITO INTERNO",
            passwords: ["INTERNO", "TRANSITO INTERNO", "TRÁNSITO INTERNO"],
            instructionHint: "💡 Frota con tu dedo o cursor sobre la tarjeta gris para desempañarla.",
            clueHTML: `
                <div class="sat-stamp">
                    <span>🏛️ SAT ADUANAS</span>
                </div>
                <div class="clue-text">
                    <strong>GUÍA DE TRÁNSITO NACIONAL:</strong><br>
                    Traslado bajo control fiscal de Aduana Nuevo Laredo a Aduana Cd. Hidalgo.<br>
                    <strong>MODALIDAD: TRÁNSITO INTERNO</strong>
                </div>
            `,
            mechanicType: "scratch"
        },
        {
            id: 4,
            title: "DESBLOQUEAR CASO 4",
            agent: "LIZ",
            topic: "TRÁNSITO INTERNACIONAL Y PLAZOS",
            passwords: ["IMPORTACION", "IMPORTACIÓN"],
            instructionHint: "💡 Haz clic en la perilla de 3 días para girarla y abrir la declaración.",
            clueHTML: `
                <div class="sat-stamp">
                    <span>🏛️ SAT ADUANAS</span>
                </div>
                <div class="clue-text">
                    <strong>AVISO DE VENCIMIENTO DE PLAZO:</strong><br>
                    Han transcurrido 10 días sin arribo a aduana de salida ni aviso justificativo.<br>
                    <strong>CONSECUENCIA: IMPORTACIÓN DEFINITIVA</strong>
                </div>
            `,
            mechanicType: "dial"
        },
        {
            id: 5,
            title: "DESBLOQUEAR CASO 5",
            agent: "ILSE",
            topic: "RESPONSABILIDADES Y AVISO",
            passwords: ["TRANSPORTISTA"],
            instructionHint: "💡 Mantén presionado el escáner de bitácora durante 1.5 segundos.",
            clueHTML: `
                <div class="sat-stamp">
                    <span>🏛️ SAT ADUANAS</span>
                </div>
                <div class="clue-text">
                    <strong>DICTAMEN DE TELEMETRÍA:</strong><br>
                    Avería deliberada omitida por el operador del vehículo.<br>
                    <strong>SUJETO RESPONSABLE: TRANSPORTISTA</strong>
                </div>
            `,
            mechanicType: "longpress"
        }
    ];

    // --- DOM ELEMENTS ---
    const soundToggle = document.getElementById('soundToggle');
    const screenIntro = document.getElementById('screen-intro');
    const screenGame = document.getElementById('screen-game');
    const screenEpilogue = document.getElementById('screen-epilogue');
    const btnStartMission = document.getElementById('btn-start-mission');
    const introTyping = document.getElementById('intro-typing');
    const passwordForm = document.getElementById('password-form');
    const passwordInput = document.getElementById('password-input');
    const passwordFeedback = document.getElementById('password-feedback');
    const phaseTitleBadge = document.getElementById('phase-title-badge');
    const progressFill = document.getElementById('progress-fill');
    const currentAgentTag = document.getElementById('current-agent-tag');
    const phaseUnlockTitle = document.getElementById('phase-unlock-title');
    const stageCanvas = document.getElementById('stage-canvas');
    const btnFlashNeuralyzer = document.getElementById('btn-flash-neuralyzer');
    const neutralizerFlash = document.getElementById('neutralizer-flash');
    const hintBannerText = document.getElementById('hint-banner-text');

    // --- WEB AUDIO SYNTHESIZER ---
    let audioCtx = null;
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playSound(type) {
        if (!soundEnabled) return;
        try {
            initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;

            if (type === 'beep') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                osc.start(now);
                osc.stop(now + 0.06);
            } else if (type === 'success') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.1);
                osc.frequency.setValueAtTime(783.99, now + 0.2);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
            } else if (type === 'error') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.setValueAtTime(110, now + 0.12);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            } else if (type === 'zap') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(2200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
            }
        } catch (e) {
            console.log('Audio error:', e);
        }
    }

    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.querySelector('.sound-text').textContent = soundEnabled ? 'AUDIO ON' : 'AUDIO OFF';
        soundToggle.querySelector('.sound-icon').textContent = soundEnabled ? '🔊' : '🔇';
    });

    // --- INTRO TYPING ---
    const introTextStr = "SISTEMA MIB ADUANAS // EXPEDIENTE A-119/134 CARGADO...";
    let textIdx = 0;
    function typeIntro() {
        if (textIdx < introTextStr.length) {
            introTyping.textContent += introTextStr.charAt(textIdx);
            textIdx++;
            playSound('beep');
            setTimeout(typeIntro, 40);
        }
    }
    typeIntro();

    btnStartMission.addEventListener('click', () => {
        playSound('success');
        startPhase(1);
    });

    // --- START PHASE ---
    function startPhase(phaseNum) {
        currentPhaseIndex = phaseNum;
        const phase = phases[phaseNum];

        screenIntro.classList.add('hidden');
        screenEpilogue.classList.add('hidden');
        screenGame.classList.remove('hidden');

        phaseTitleBadge.textContent = `FASE ${phase.id} DE 5`;
        progressFill.style.width = `${(phase.id / 5) * 100}%`;
        currentAgentTag.textContent = `AGENTE: ${phase.agent}`;
        phaseUnlockTitle.textContent = phase.title;
        passwordInput.value = '';
        passwordFeedback.textContent = '';
        passwordFeedback.className = "feedback-msg";

        if (hintBannerText) {
            hintBannerText.textContent = phase.instructionHint;
        }

        renderPhaseScene(phase);
    }

    // --- RENDER SCENE & MECHANICS ---
    function renderPhaseScene(phase) {
        stageCanvas.innerHTML = '';
        const scene = document.createElement('div');
        scene.className = 'stage-scene';

        const profesorDiv = document.createElement('div');
        profesorDiv.innerHTML = getProfesorSVG();

        const agentDiv = document.createElement('div');
        agentDiv.innerHTML = getAgentSVG(phase.agent);

        const satDoc = document.createElement('div');
        satDoc.className = 'sat-document-clue';
        satDoc.innerHTML = phase.clueHTML;

        scene.appendChild(profesorDiv);
        scene.appendChild(agentDiv);
        scene.appendChild(satDoc);

        if (phase.mechanicType === 'drag') {
            const crate = document.createElement('div');
            crate.className = 'draggable-item';
            crate.innerHTML = `
                <div style="text-align:center;">
                    <svg viewBox="0 0 130 130" class="item-svg">
                        <rect x="10" y="10" width="110" height="110" fill="#D7CCC8" stroke="#5D4037" stroke-width="6" rx="6"/>
                        <line x1="10" y1="10" x2="120" y2="120" stroke="#5D4037" stroke-width="4"/>
                        <line x1="120" y1="10" x2="10" y2="120" stroke="#5D4037" stroke-width="4"/>
                        <text x="65" y="70" font-size="14" font-weight="bold" fill="#5D4037" text-anchor="middle" font-family="monospace">Lote Q-900</text>
                    </svg>
                    <div style="background:rgba(0,0,0,0.8); color:#00ff66; font-size:11px; padding:3px 8px; border-radius:10px; font-family:monospace; margin-top:4px;">📦 Arrastrar caja</div>
                </div>
            `;
            setupDrag(crate);
            scene.appendChild(crate);

        } else if (phase.mechanicType === 'drain') {
            const waterOverlay = document.createElement('div');
            waterOverlay.className = 'water-leak-overlay';
            waterOverlay.innerHTML = `
                <span style="font-size:30px; margin-bottom:5px;">💧💧</span>
                <button class="drain-btn">🚰 Tocar para drenar agua</button>
            `;
            
            function drainWater() {
                waterOverlay.classList.add('drained');
                playSound('beep');
            }

            waterOverlay.addEventListener('click', drainWater);
            
            if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', (e) => {
                    if (Math.abs(e.gamma) > 30 || Math.abs(e.beta) > 30) {
                        drainWater();
                    }
                }, { once: true });
            }

            scene.appendChild(waterOverlay);

        } else if (phase.mechanicType === 'scratch') {
            const scratchCover = document.createElement('div');
            scratchCover.className = 'scratch-cover';
            scratchCover.innerHTML = `
                <div style="text-align:center;">
                    <span style="font-size:24px;">🧽</span><br>
                    <strong>Frota para desempañar</strong>
                </div>
            `;

            let touches = 0;
            function doScratch() {
                touches++;
                playSound('beep');
                if (touches >= 2) {
                    scratchCover.classList.add('scratched');
                }
            }

            scratchCover.addEventListener('click', doScratch);
            scratchCover.addEventListener('touchmove', doScratch, { passive: true });
            scene.appendChild(scratchCover);

        } else if (phase.mechanicType === 'dial') {
            const dialKnob = document.createElement('div');
            dialKnob.className = 'dial-knob';
            dialKnob.innerHTML = `
                <div style="text-align:center;">
                    <div class="dial-pointer"></div>
                    <span style="color:#00ff66; font-size:10px; font-family:monospace;">⏳ 3 DÍAS</span>
                </div>
            `;

            let currentRotation = 0;
            dialKnob.addEventListener('click', () => {
                currentRotation += 90;
                dialKnob.style.transform = `rotate(${currentRotation}deg)`;
                playSound('beep');
            });

            scene.appendChild(dialKnob);

        } else if (phase.mechanicType === 'longpress') {
            const scannerPad = document.createElement('div');
            scannerPad.className = 'scanner-pad';
            scannerPad.innerHTML = `
                <span style="font-size:28px;">📋</span>
                <span>Mantén presionado 1.5s</span>
                <div class="scanner-progress" id="scanner-bar"></div>
            `;

            let progressInterval = null;
            let progressVal = 0;
            const progressBar = scannerPad.querySelector('#scanner-bar');

            function startPress() {
                progressVal = 0;
                playSound('beep');
                progressInterval = setInterval(() => {
                    progressVal += 10;
                    progressBar.style.width = `${progressVal}%`;
                    if (progressVal >= 100) {
                        clearInterval(progressInterval);
                        playSound('success');
                        scannerPad.style.borderColor = '#00ff66';
                        scannerPad.innerHTML = '<span style="font-size:28px; color:#00ff66;">✔ ESCANEO OK</span>';
                    }
                }, 120);
            }

            function cancelPress() {
                clearInterval(progressInterval);
                if (progressVal < 100) {
                    progressVal = 0;
                    progressBar.style.width = '0%';
                }
            }

            scannerPad.addEventListener('mousedown', startPress);
            scannerPad.addEventListener('mouseup', cancelPress);
            scannerPad.addEventListener('mouseleave', cancelPress);
            scannerPad.addEventListener('touchstart', startPress, { passive: true });
            scannerPad.addEventListener('touchend', cancelPress);

            scene.appendChild(scannerPad);
        }

        stageCanvas.appendChild(scene);
    }

    function setupDrag(item) {
        let isDragging = false;
        let startX, startY;

        function start(e) {
            isDragging = true;
            startX = e.clientX || (e.touches && e.touches[0].clientX);
            startY = e.clientY || (e.touches && e.touches[0].clientY);
            playSound('beep');
        }

        function end() {
            if (!isDragging) return;
            isDragging = false;
            item.classList.add('dragged');
            playSound('beep');
        }

        item.addEventListener('mousedown', start);
        window.addEventListener('mouseup', end);
        item.addEventListener('touchstart', start, { passive: true });
        window.addEventListener('touchend', end);
        item.addEventListener('click', () => item.classList.add('dragged'));
    }

    function getProfesorSVG() {
        return `
            <svg viewBox="0 0 140 180" class="character-svg">
                <rect x="25" y="130" width="90" height="10" fill="#795548" rx="3"/>
                <rect x="32" y="140" width="8" height="35" fill="#5D4037"/>
                <rect x="100" y="140" width="8" height="35" fill="#5D4037"/>
                <rect x="35" y="80" width="70" height="55" fill="#424242" rx="8"/>
                <path d="M50 80 L70 105 L90 80" fill="#ffffff"/>
                <line x1="70" y1="80" x2="70" y2="125" stroke="#b71c1c" stroke-width="4"/>
                <circle cx="70" cy="48" r="24" fill="#ffcc80"/>
                <rect x="54" y="42" width="13" height="9" rx="2" fill="none" stroke="#d32f2f" stroke-width="3"/>
                <rect x="73" y="42" width="13" height="9" rx="2" fill="none" stroke="#d32f2f" stroke-width="3"/>
                <line x1="67" y1="46" x2="73" y2="46" stroke="#d32f2f" stroke-width="3"/>
                <path d="M52 55 Q70 72 88 55" fill="#e0e0e0"/>
            </svg>
        `;
    }

    function getAgentSVG(name) {
        return `
            <svg viewBox="0 0 140 180" class="character-svg">
                <rect x="35" y="75" width="70" height="80" fill="#111" rx="8"/>
                <path d="M50 75 L70 100 L90 75" fill="#fff"/>
                <line x1="70" y1="75" x2="70" y2="120" stroke="#000" stroke-width="4"/>
                <circle cx="70" cy="46" r="24" fill="#f5cba7"/>
                <polygon points="50,42 66,42 64,52 52,52" fill="#000"/>
                <polygon points="74,42 90,42 88,52 76,52" fill="#000"/>
                <text x="70" y="170" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111" text-anchor="middle">AGENTE ${name}</text>
            </svg>
        `;
    }

    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPass = passwordInput.value.trim().toUpperCase();
        const currentPhase = phases[currentPhaseIndex];

        const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normEntered = normalize(enteredPass);

        const isCorrect = currentPhase.passwords.some(pass => normalize(pass.toUpperCase()) === normEntered);

        if (isCorrect) {
            playSound('success');
            passwordFeedback.textContent = "✔ ¡CÓDIGO CORRECTO! ACCESO CONCEDIDO";
            passwordFeedback.className = "feedback-msg success";

            setTimeout(() => {
                if (currentPhaseIndex < 5) {
                    startPhase(currentPhaseIndex + 1);
                } else {
                    showEpilogue();
                }
            }, 750);
        } else {
            playSound('error');
            passwordFeedback.textContent = "✖ CÓDIGO INCORRECTO. INTENTA DE NUEVO";
            passwordFeedback.className = "feedback-msg error";
            passwordInput.select();
        }
    });

    function showEpilogue() {
        screenGame.classList.add('hidden');
        screenEpilogue.classList.remove('hidden');
        playSound('success');
    }

    // Neutralizer memory wipe button action -> triggers flash and returns to start screen
    btnFlashNeuralyzer.addEventListener('click', () => {
        playSound('zap');
        neutralizerFlash.classList.add('active');
        
        setTimeout(() => {
            neutralizerFlash.classList.remove('active');
            // Reset to Intro screen
            screenEpilogue.classList.add('hidden');
            screenGame.classList.add('hidden');
            screenIntro.classList.remove('hidden');
            currentPhaseIndex = 0;
        }, 1500);
    });
});
