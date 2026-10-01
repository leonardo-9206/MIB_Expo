/* ==========================================================================
   M.I.B. SECCIÓN ADUANAS - CASOS DE INVESTIGACIÓN CON IMÁGENES DEDICADAS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let currentPhaseIndex = 0;
    let soundEnabled = true;

    // --- PHASE DEFINITIONS ---
    const phases = [
        null, // Index 0 is Intro
        {
            id: 1,
            title: "DESBLOQUEAR CASO 1",
            agent: "ANDY",
            topic: "DEPÓSITO FISCAL",
            passwords: ["DEPOSITO", "DEPÓSITO"],
            imageSrc: "caso1.jpeg"
        },
        {
            id: 2,
            title: "DESBLOQUEAR CASO 2",
            agent: "MICH",
            topic: "LOCALES Y MERCANCÍAS DAÑADAS",
            passwords: ["NO"],
            imageSrc: "caso2.jpeg"
        },
        {
            id: 3,
            title: "DESBLOQUEAR CASO 3",
            agent: "EMILY",
            topic: "TRÁNSITO INTERNO",
            passwords: ["INTERNO", "TRANSITO INTERNO", "TRÁNSITO INTERNO"],
            imageSrc: "caso3.png"
        },
        {
            id: 4,
            title: "DESBLOQUEAR CASO 4",
            agent: "LIZ",
            topic: "TRÁNSITO INTERNACIONAL Y PLAZOS",
            passwords: ["IMPORTACION", "IMPORTACIÓN"],
            imageSrc: "caso4.jpeg"
        },
        {
            id: 5,
            title: "DESBLOQUEAR CASO 5",
            agent: "ILSE",
            topic: "RESPONSABILIDADES Y AVISO",
            passwords: ["TRANSPORTISTA"],
            imageSrc: "caso5.jpeg"
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

    // --- RENDER SCENE (MUESTRA LA IMAGEN DEL CASO) ---
    function renderPhaseScene(phase) {
        stageCanvas.innerHTML = '';
        
        const imgContainer = document.createElement('div');
        imgContainer.className = 'case-image-wrapper';
        
        const img = document.createElement('img');
        img.src = phase.imageSrc;
        img.alt = `Escena de investigación ${phase.title}`;
        img.className = 'case-image';

        imgContainer.appendChild(img);
        stageCanvas.appendChild(imgContainer);
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
