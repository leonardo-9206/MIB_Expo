/* ==========================================================================
   M.I.B. SECCIÓN ADUANAS - ENGINE BRAIN OUT CON ASSETS PNG RECOR TADOS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let currentPhaseIndex = 0;
    let soundEnabled = true;

    // --- PHASE DEFINITIONS CON SOPORTE DE ASSETS PNG ---
    const phases = [
        null, // Index 0 is Intro
        {
            id: 1,
            title: "DESBLOQUEAR CASO 1",
            agent: "ANDY",
            topic: "DEPÓSITO FISCAL",
            passwords: ["DEPOSITO", "DEPÓSITO"],
            bgImage: "caso1.jpeg",
            overlayImage: "assets/caja.png",
            mechanicType: "drag",
            fallbackClueHTML: `
                <div class="sat-stamp"><span>🏛️ SAT ADUANAS</span></div>
                <div class="clue-text">
                    <strong>CÉDULA DE ALMACENAMIENTO:</strong><br>
                    Régimen legal de <strong>DEPÓSITO FISCAL</strong> (Art. 119 Ley Aduanera).
                </div>
            `
        },
        {
            id: 2,
            title: "DESBLOQUEAR CASO 2",
            agent: "MICH",
            topic: "LOCALES Y MERCANCÍAS DAÑADAS",
            passwords: ["NO"],
            bgImage: "caso2.jpeg",
            overlayImage: "assets/lona.png",
            mechanicType: "drain",
            fallbackClueHTML: `
                <div class="sat-stamp"><span>🏛️ SAT ADUANAS</span></div>
                <div class="clue-text">
                    <strong>DICTAMEN DE AVERÍA ACCIDENTAL:</strong><br>
                    Tubería rota. ¿Las 500 piezas fueron sustraídas ilegalmente?<br>
                    <span style="font-size:16px; color:#d32f2f; font-weight:bold; display:block; margin-top:6px;">RESPUESTA: NO</span>
                </div>
            `
        },
        {
            id: 3,
            title: "DESBLOQUEAR CASO 3",
            agent: "EMILY",
            topic: "TRÁNSITO INTERNO",
            passwords: ["INTERNO", "TRANSITO INTERNO", "TRÁNSITO INTERNO"],
            bgImage: "caso3.png",
            overlayImage: "assets/barrera.png",
            mechanicType: "scratch",
            fallbackClueHTML: `
                <div class="sat-stamp"><span>🏛️ SAT ADUANAS</span></div>
                <div class="clue-text">
                    <strong>GUÍA DE TRÁNSITO NACIONAL:</strong><br>
                    Aduana Nuevo Laredo a Cd. Hidalgo.<br>
                    <strong>MODALIDAD: TRÁNSITO INTERNO</strong>
                </div>
            `
        },
        {
            id: 4,
            title: "DESBLOQUEAR CASO 4",
            agent: "LIZ",
            topic: "TRÁNSITO INTERNACIONAL Y PLAZOS",
            passwords: ["IMPORTACION", "IMPORTACIÓN"],
            bgImage: "caso4.jpeg",
            overlayImage: "assets/llantas.png",
            mechanicType: "dial",
            fallbackClueHTML: `
                <div class="sat-stamp"><span>🏛️ SAT ADUANAS</span></div>
                <div class="clue-text">
                    <strong>AVISO DE VENCIMIENTO DE PLAZO:</strong><br>
                    Transcurridos 10 días sin arribo a aduana.<br>
                    <strong>CONSECUENCIA: IMPORTACIÓN DEFINITIVA</strong>
                </div>
            `
        },
        {
            id: 5,
            title: "DESBLOQUEAR CASO 5",
            agent: "ILSE",
            topic: "RESPONSABILIDADES Y AVISO",
            passwords: ["TRANSPORTISTA"],
            bgImage: "caso5.jpeg",
            overlayImage: "assets/bitacora.png",
            mechanicType: "longpress",
            fallbackClueHTML: `
                <div class="sat-stamp"><span>🏛️ SAT ADUANAS</span></div>
                <div class="clue-text">
                    <strong>DICTAMEN DE TELEMETRÍA:</strong><br>
                    Avería deliberada omitida por el operador.<br>
                    <strong>SUJETO RESPONSABLE: TRANSPORTISTA</strong>
                </div>
            `
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

        renderPhaseScene(phase);
    }

    // --- RENDER BRAIN OUT SCENE WITH USER'S CROPPED PNG ASSETS ---
    function renderPhaseScene(phase) {
        stageCanvas.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'interactive-scene-wrapper';

        // 1. Imagen de Fondo de la Ilustración
        const bgImg = document.createElement('img');
        bgImg.src = phase.bgImage;
        bgImg.className = 'bg-case-image';
        container.appendChild(bgImg);

        // 2. Documento de Evidencia Revelado
        const clueDoc = document.createElement('div');
        clueDoc.className = 'sat-document-clue brain-out-clue';
        clueDoc.innerHTML = phase.fallbackClueHTML;
        container.appendChild(clueDoc);

        // 3. PNG Interactivo Recortado
        const overlayDiv = document.createElement('div');
        overlayDiv.className = `brain-out-overlay overlay-${phase.mechanicType}`;

        const pngImg = document.createElement('img');
        pngImg.src = phase.overlayImage;
        pngImg.className = 'overlay-png';
        overlayDiv.appendChild(pngImg);

        // Setup Mechanics for PNG
        if (phase.mechanicType === 'drag') {
            overlayDiv.classList.add('draggable-item');
            setupDrag(overlayDiv);

        } else if (phase.mechanicType === 'drain') {
            overlayDiv.style.cursor = 'pointer';
            overlayDiv.title = 'Toca para levantar/vaciar';
            overlayDiv.addEventListener('click', () => {
                overlayDiv.classList.add('drained');
                playSound('beep');
            });

        } else if (phase.mechanicType === 'scratch') {
            overlayDiv.style.cursor = 'pointer';
            let touches = 0;
            function doScratch() {
                touches++;
                playSound('beep');
                if (touches >= 2) overlayDiv.classList.add('scratched');
            }
            overlayDiv.addEventListener('click', doScratch);
            overlayDiv.addEventListener('touchmove', doScratch, { passive: true });

        } else if (phase.mechanicType === 'dial') {
            overlayDiv.style.cursor = 'pointer';
            let currentRotation = 0;
            overlayDiv.addEventListener('click', () => {
                currentRotation += 90;
                overlayDiv.style.transform = `rotate(${currentRotation}deg)`;
                playSound('beep');
                if (currentRotation >= 360) {
                    overlayDiv.classList.add('drained');
                }
            });

        } else if (phase.mechanicType === 'longpress') {
            overlayDiv.style.cursor = 'pointer';
            let progressInterval = null;
            let progressVal = 0;

            function startPress() {
                progressVal = 0;
                playSound('beep');
                progressInterval = setInterval(() => {
                    progressVal += 20;
                    overlayDiv.style.opacity = 1 - (progressVal / 120);
                    if (progressVal >= 100) {
                        clearInterval(progressInterval);
                        playSound('success');
                        overlayDiv.classList.add('drained');
                    }
                }, 150);
            }

            function cancelPress() {
                clearInterval(progressInterval);
                if (progressVal < 100) {
                    progressVal = 0;
                    overlayDiv.style.opacity = 1;
                }
            }

            overlayDiv.addEventListener('mousedown', startPress);
            overlayDiv.addEventListener('mouseup', cancelPress);
            overlayDiv.addEventListener('mouseleave', cancelPress);
            overlayDiv.addEventListener('touchstart', startPress, { passive: true });
            overlayDiv.addEventListener('touchend', cancelPress);
        }

        container.appendChild(overlayDiv);
        stageCanvas.appendChild(container);
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

    // --- PASSWORD SUBMISSION ---
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

    btnFlashNeuralyzer.addEventListener('click', () => {
        playSound('zap');
        neutralizerFlash.classList.add('active');
        
        setTimeout(() => {
            neutralizerFlash.classList.remove('active');
            screenEpilogue.classList.add('hidden');
            screenGame.classList.add('hidden');
            screenIntro.classList.remove('hidden');
            currentPhaseIndex = 0;
        }, 1500);
    });
});
