/* ==========================================================================
   M.I.B. SECCIÓN ADUANAS - ENGINE BRAIN OUT CON ARRASTRE REAL Y GIROSCOPIO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    let currentPhaseIndex = 0;
    let soundEnabled = true;

    // --- DEFINICIÓN DE FASES Y ASSETS ---
    const phases = [
        null, // Index 0 is Intro
        {
            id: 1,
            title: "DESBLOQUEAR CASO 1",
            agent: "ANDY",
            topic: "DEPÓSITO FISCAL",
            passwords: ["DEPOSITO", "DEPÓSITO"],
            bgImage: "assets/fondo1.png",
            fallbackBgImage: "caso1.jpeg",
            overlayImage: "assets/caja.png",
            mechanicType: "drag",
            redAnswerText: "DEPOSITO"
        },
        {
            id: 2,
            title: "DESBLOQUEAR CASO 2",
            agent: "MICH",
            topic: "LOCALES Y MERCANCÍAS DAÑADAS",
            passwords: ["NO"],
            bgImage: "assets/fondo2.png",
            fallbackBgImage: "caso2.jpeg",
            overlayImage: "assets/lona.png",
            mechanicType: "tilt", // Giroscopio / Arrastrar
            redAnswerText: "NO"
        },
        {
            id: 3,
            title: "DESBLOQUEAR CASO 3",
            agent: "EMILY",
            topic: "TRÁNSITO INTERNO",
            passwords: ["INTERNO", "TRANSITO INTERNO", "TRÁNSITO INTERNO"],
            bgImage: "assets/fondo3.png",
            fallbackBgImage: "caso3.png",
            overlayImage: "assets/barrera.png",
            mechanicType: "drag",
            redAnswerText: "INTERNO"
        },
        {
            id: 4,
            title: "DESBLOQUEAR CASO 4",
            agent: "LIZ",
            topic: "TRÁNSITO INTERNACIONAL Y PLAZOS",
            passwords: ["DEFINITIVA", "IMPORTACION DEFINITIVA", "IMPORTACIÓN DEFINITIVA", "IMPORTACION", "IMPORTACIÓN"],
            bgImage: "assets/fondo4.png",
            fallbackBgImage: "caso4.jpeg",
            overlayImage: "assets/llantas.png",
            mechanicType: "drag",
            redAnswerText: "DEFINITIVA"
        },
        {
            id: 5,
            title: "DESBLOQUEAR CASO 5",
            agent: "ILSE",
            topic: "RESPONSABILIDADES Y AVISO",
            passwords: ["TRANSPORTISTA"],
            bgImage: "assets/fondo5.png",
            fallbackBgImage: "caso5.jpeg",
            overlayImage: "assets/bitacora.png",
            mechanicType: "drag",
            redAnswerText: "TRANSPORTISTA"
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

    // --- AUDIO SYNTHESIZER ---
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

    // --- RENDERIZADO DE ESCENA BRAIN OUT ---
    function renderPhaseScene(phase) {
        stageCanvas.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'interactive-scene-wrapper';

        // 1. Imagen de Fondo Limpio
        const bgImg = document.createElement('img');
        bgImg.src = phase.bgImage;
        bgImg.className = 'bg-case-image';
        bgImg.onerror = () => {
            bgImg.src = phase.fallbackBgImage;
        };
        container.appendChild(bgImg);

        // 2. Respuesta en ROJO (Oculta al inicio)
        const redAnswerBox = document.createElement('div');
        redAnswerBox.className = 'red-answer-box hidden';
        redAnswerBox.innerHTML = `
            <div class="red-answer-title">RESPUESTA:</div>
            <div class="red-answer-value">${phase.redAnswerText}</div>
        `;
        container.appendChild(redAnswerBox);

        let answerRevealed = false;
        function revealRedAnswer() {
            if (answerRevealed) return;
            answerRevealed = true;
            playSound('success');
            redAnswerBox.classList.remove('hidden');
        }

        // 3. PNG Interactivo Recortado
        const overlayDiv = document.createElement('div');
        overlayDiv.className = `brain-out-overlay overlay-phase-${phase.id} draggable-item`;

        const pngImg = document.createElement('img');
        pngImg.src = phase.overlayImage;
        pngImg.className = 'overlay-png';
        overlayDiv.appendChild(pngImg);

        // Configurar Mecánica de Arrastre Dinámico (Real Touch & Pointer Drag)
        setupRealDrag(overlayDiv, revealRedAnswer);

        // Configurar Giroscopio en Celular si la fase es tilt (o en cualquiera)
        if (phase.mechanicType === 'tilt' && window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                if (!answerRevealed && (Math.abs(e.gamma) > 25 || Math.abs(e.beta) > 25)) {
                    overlayDiv.classList.add('tilted');
                    revealRedAnswer();
                }
            });
        }

        container.appendChild(overlayDiv);
        stageCanvas.appendChild(container);
    }

    // ARRASTRE REAL EN TIEMPO REAL (Touch & Pointer)
    function setupRealDrag(item, onReleaseCallback) {
        let isDragging = false;
        let startX, startY, currentTransX = 0, currentTransY = 0;

        function getCoord(e) {
            if (e.touches && e.touches.length > 0) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
            return { x: e.clientX, y: e.clientY };
        }

        function onPointerDown(e) {
            isDragging = true;
            const coord = getCoord(e);
            startX = coord.x - currentTransX;
            startY = coord.y - currentTransY;
            item.style.transition = 'none';
            playSound('beep');
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            const coord = getCoord(e);
            currentTransX = coord.x - startX;
            currentTransY = coord.y - startY;

            item.style.transform = `translate(${currentTransX}px, ${currentTransY}px) rotate(8deg)`;

            // Si se arrastra más de 50px en cualquier dirección, revela la respuesta
            if (Math.abs(currentTransX) > 50 || Math.abs(currentTransY) > 50) {
                onReleaseCallback();
            }
        }

        function onPointerUp() {
            if (!isDragging) return;
            isDragging = false;
            item.style.transition = 'transform 0.3s ease';
            if (Math.abs(currentTransX) > 30 || Math.abs(currentTransY) > 30) {
                onReleaseCallback();
            }
        }

        item.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        item.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp);

        // Click / Tap directo de respaldo
        item.addEventListener('click', () => {
            item.classList.add('dragged');
            onReleaseCallback();
        });
    }

    // --- CONTRASEÑAS ---
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
