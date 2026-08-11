/* =========================================================
   A Little Birthday Letter For My Bubub — script.js
   Clean structured vanilla JS state machine
========================================================= */

(function () {
  'use strict';

  /* -------------------- STATE -------------------- */
  const state = {
    currentScene: 1,
    currentPage: 1,
    totalPages: 4,
    musicOn: false,
    playfulRevealed: false,
  };

  /* -------------------- DOM REFS -------------------- */
  const scenes = {
    1: document.getElementById('scene1'),
    2: document.getElementById('scene2'),
    3: document.getElementById('scene3'),
    4: document.getElementById('scene4'),
  };

  const bgLayer = document.getElementById('bgLayer');
  const cursorSparkle = document.getElementById('cursorSparkle');

  const introLine = document.getElementById('introLine');
  const introStars = document.getElementById('introStars');
  const introBtn = document.getElementById('openSurpriseBtn');
  const introScene = document.getElementById('scene1');

  const openSurpriseBtn = document.getElementById('openSurpriseBtn');
  const letsOpenBtn = document.getElementById('letsOpenBtn');
  const welcomeFloaters = document.getElementById('welcomeFloaters');

  const envelopeFloaters = document.getElementById('envelopeFloaters');
  const envelope = document.getElementById('envelope');

  const letterFloaters = document.getElementById('letterFloaters');
  const letterPages = document.querySelectorAll('.letter-page');
  const progressDots = document.querySelectorAll('.dot');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');

  const stillThereBtn = document.getElementById('stillThereBtn');
  const playfulReveal = document.getElementById('playfulReveal');
  const openLastPageBtn = document.getElementById('openLastPageBtn');
  const playfulStage = document.getElementById('playfulStage');

  const finalStage = document.getElementById('finalStage');
  const oneMoreThingBtn = document.getElementById('oneMoreThingBtn');

  const finalModal = document.getElementById('finalModal');
  const replayBtn = document.getElementById('replayBtn');

  const musicBtn = document.getElementById('musicBtn');
  const musicIcon = document.getElementById('musicIcon');
  const bgMusic = document.getElementById('bgMusic');

  /* -------------------- UTIL -------------------- */
  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createEl(tag, className, parent) {
    const el = document.createElement(tag);
    el.className = className;
    parent.appendChild(el);
    return el;
  }

  /* -------------------- SCENE MANAGEMENT -------------------- */
  function showScene(sceneNumber) {
    Object.values(scenes).forEach((el) => {
      if (!el) return;
      el.classList.remove('is-active');
    });
    const target = scenes[sceneNumber];
    if (target) {
      // slight delay allows transition to feel like one continuous journey
      requestAnimationFrame(() => target.classList.add('is-active'));
    }
    state.currentScene = sceneNumber;
  }

  /* -------------------- SCENE 1: CINEMATIC INTRO -------------------- */
  const introSequence = [
    { text: 'Hey...', hold: 1800 },
    { text: 'Can I tell you something?', hold: 2200 },
    { text: 'Something special...', hold: 2200, warmAfter: true },
    { text: 'Because today...', hold: 1900 },
    { text: "It's all about you. ❤️", hold: 2600 },
  ];

  function runIntroSequence() {
    let i = 0;

    function step() {
      if (i >= introSequence.length) {
        introBtn.classList.add('is-visible');
        return;
      }
      const item = introSequence[i];

      introLine.classList.remove('is-visible');
      setTimeout(() => {
        introLine.textContent = item.text;
        introLine.classList.add('is-visible');
        if (item.warmAfter) {
          setTimeout(() => introScene.classList.add('is-warm'), item.hold * 0.5);
        }
      }, 450);

      setTimeout(() => {
        i += 1;
        step();
      }, item.hold + 450);
    }

    step();
  }

  function createIntroStars() {
    const count = 26;
    for (let i = 0; i < count; i++) {
      const star = createEl('span', 'floating-star', introStars);
      const size = rand(1, 3);
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = rand(0, 100) + '%';
      star.style.top = rand(0, 100) + '%';
      star.style.animation = `twinkleFloat ${rand(6, 12)}s ease-in-out ${rand(0, 4)}s infinite`;
    }
  }

  /* -------------------- FLOATING HEARTS / SPARKLES / PARTICLES -------------------- */
  function createFloatingHearts(container, count) {
    for (let i = 0; i < count; i++) {
      const heart = createEl('span', 'floating-heart', container);
      heart.textContent = '❤';
      heart.style.left = rand(2, 96) + '%';
      heart.style.bottom = '-30px';
      heart.style.fontSize = rand(10, 22) + 'px';
      heart.style.opacity = rand(0.35, 0.85);
      const duration = rand(7, 14);
      const delay = rand(0, 6);
      heart.style.animation = `floatUp ${duration}s ease-in ${delay}s infinite`;
    }
  }

  function createSparkles(container, count) {
    for (let i = 0; i < count; i++) {
      const spark = createEl('span', 'floating-sparkle', container);
      spark.textContent = '✦';
      spark.style.left = rand(2, 98) + '%';
      spark.style.top = rand(2, 98) + '%';
      spark.style.fontSize = rand(8, 14) + 'px';
      spark.style.opacity = rand(0.2, 0.7);
      spark.style.animation = `sparklePulse ${rand(2.5, 5)}s ease-in-out ${rand(0, 3)}s infinite`;
    }
  }

  /* inject keyframes for particle motion once */
  (function injectParticleKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatUp {
        0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
        10% { opacity: .8; }
        90% { opacity: .5; }
        100% { transform: translateY(-115vh) translateX(20px) rotate(20deg); opacity: 0; }
      }
      @keyframes sparklePulse {
        0%, 100% { transform: scale(.7); opacity: .15; }
        50% { transform: scale(1.15); opacity: .8; }
      }
      @keyframes twinkleFloat {
        0%, 100% { opacity: .2; transform: translateY(0); }
        50% { opacity: .9; transform: translateY(-6px); }
      }
    `;
    document.head.appendChild(style);
  })();

  /* -------------------- CURSOR SPARKLE (desktop only) -------------------- */
  function initCursorSparkle() {
    if (window.matchMedia('(hover: none)').matches) return; // skip on touch devices
    let hideTimeout;
    document.addEventListener('mousemove', (e) => {
      cursorSparkle.style.left = e.clientX + 'px';
      cursorSparkle.style.top = e.clientY + 'px';
      cursorSparkle.style.opacity = '0.85';
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => { cursorSparkle.style.opacity = '0'; }, 600);
    });
  }

  /* -------------------- MUSIC -------------------- */
  function toggleMusic(forcePlay) {
    if (forcePlay === true && state.musicOn) return;

    if (forcePlay === true) {
      bgMusic.play().then(() => {
        state.musicOn = true;
        musicBtn.classList.remove('is-muted');
      }).catch(() => {
        // autoplay blocked or file missing — fail silently
        state.musicOn = false;
        musicBtn.classList.add('is-muted');
      });
      return;
    }

    if (state.musicOn) {
      bgMusic.pause();
      state.musicOn = false;
      musicBtn.classList.add('is-muted');
    } else {
      bgMusic.play().then(() => {
        state.musicOn = true;
        musicBtn.classList.remove('is-muted');
      }).catch(() => {
        state.musicOn = false;
        musicBtn.classList.add('is-muted');
      });
    }
  }

  bgMusic.addEventListener('error', () => {
    // asset missing — keep site fully functional
    musicBtn.classList.add('is-muted');
  });

  musicBtn.addEventListener('click', () => toggleMusic());

  /* -------------------- SCENE 3: ENVELOPE -------------------- */
  function openEnvelope() {
    if (envelope.classList.contains('is-open')) return;

    envelope.classList.add('is-scaleUp');

    setTimeout(() => {
      envelope.classList.add('is-sealGlow');
    }, 250);

    setTimeout(() => {
      envelope.classList.add('is-open');
    }, 650);

    setTimeout(() => {
      document.getElementById('scene3').classList.add('is-blurring');
      envelope.classList.add('is-fading');
    }, 1800);

    setTimeout(() => {
      goToLetter();
    }, 2500);
  }

  function goToLetter() {
    showScene(4);
    state.currentPage = 1;
    renderLetterPage();
  }

  /* -------------------- SCENE 4: LETTER PAGES -------------------- */
  function renderLetterPage() {
    letterPages.forEach((page) => {
      const pageNum = parseInt(page.dataset.page, 10);
      page.classList.toggle('is-active', pageNum === state.currentPage);
    });

    progressDots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === state.currentPage - 1);
    });

    backBtn.disabled = state.currentPage === 1;
    nextBtn.style.visibility = state.currentPage === state.totalPages ? 'hidden' : 'visible';

    // scroll letter body back to top on page change
    const letterBody = document.getElementById('letterBody');
    if (letterBody) letterBody.scrollTop = 0;
  }

  function nextLetterPage() {
    if (state.currentPage < state.totalPages) {
      state.currentPage += 1;
      renderLetterPage();
    }
  }

  function previousLetterPage() {
    if (state.currentPage > 1) {
      state.currentPage -= 1;
      renderLetterPage();
      // reset playful/final sequences if navigating back into them
    }
  }

  /* -------------------- PAGE 3: PLAYFUL SEQUENCE -------------------- */
  function runPlayfulSequence() {
    const lines = playfulStage.querySelectorAll('.playful-line, .playful-btn');
    lines.forEach((line) => line.classList.remove('is-shown'));
    playfulReveal.classList.remove('is-visible');
    state.playfulRevealed = false;

    let delay = 500;
    lines.forEach((line) => {
      setTimeout(() => {
        line.classList.add('is-shown');
      }, delay);
      delay += 750;
    });
  }

  function revealPlayfulFinal() {
    if (state.playfulRevealed) return;
    state.playfulRevealed = true;
    createHeartConfetti();
    setTimeout(() => {
      playfulReveal.classList.add('is-visible');
    }, 300);
  }

  function createHeartConfetti() {
    const layer = document.getElementById('letterFloaters');
    const count = 22;
    for (let i = 0; i < count; i++) {
      const heart = createEl('span', 'floating-heart confetti-heart', layer);
      heart.textContent = '❤';
      heart.style.left = rand(30, 70) + '%';
      heart.style.top = '50%';
      heart.style.fontSize = rand(12, 26) + 'px';
      const angle = rand(0, 360);
      const distance = rand(80, 240);
      const x = Math.cos((angle * Math.PI) / 180) * distance;
      const y = Math.sin((angle * Math.PI) / 180) * distance;
      heart.style.setProperty('--dx', x + 'px');
      heart.style.setProperty('--dy', y + 'px');
      heart.style.animation = `confettiPop 1.4s ease-out forwards`;
      setTimeout(() => heart.remove(), 1600);
    }
  }

  (function injectConfettiKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confettiPop {
        0% { transform: translate(0,0) scale(.4); opacity: 1; }
        100% { transform: translate(var(--dx), var(--dy)) scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  })();

  /* -------------------- PAGE 4: FINAL SEQUENCE -------------------- */
  let finalSequenceRun = false;

  function runFinalSequence() {
    if (finalSequenceRun) return;
    finalSequenceRun = true;

    const items = Array.from(finalStage.querySelectorAll('[data-order]'))
      .sort((a, b) => a.dataset.order - b.dataset.order);

    let delay = 400;
    items.forEach((item) => {
      setTimeout(() => item.classList.add('is-shown'), delay);
      delay += item.classList.contains('final-word') ? 700 : 550;
    });

    setTimeout(() => {
      createFloatingHearts(letterFloaters, 18);
      createSparkles(letterFloaters, 12);
    }, delay);
  }

  function showFinalSurprise() {
    finalModal.classList.add('is-visible');
    createHeartConfetti();
  }

  /* -------------------- RESTART -------------------- */
  function restartExperience() {
    finalModal.classList.remove('is-visible');

    // reset states
    state.currentPage = 1;
    finalSequenceRun = false;
    state.playfulRevealed = false;

    document.getElementById('scene3').classList.remove('is-blurring');
    envelope.classList.remove('is-open', 'is-fading', 'is-scaleUp', 'is-sealGlow');
    document.getElementById('scene3').style.opacity = '';

    document.querySelectorAll('.confetti-heart').forEach((el) => el.remove());

    finalStage.querySelectorAll('.is-shown').forEach((el) => el.classList.remove('is-shown'));

    introScene.classList.remove('is-warm');

    showScene(1);
    setTimeout(runIntroSequence, 400);
  }

  /* -------------------- EVENT LISTENERS -------------------- */
  openSurpriseBtn.addEventListener('click', () => {
    toggleMusic(true);
    showScene(2);
  });

  letsOpenBtn.addEventListener('click', () => {
    toggleMusic(true);
    showScene(3);
  });

  envelope.addEventListener('click', openEnvelope);
  envelope.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openEnvelope();
  });

  backBtn.addEventListener('click', previousLetterPage);
  nextBtn.addEventListener('click', () => {
    if (state.currentPage === 2) {
      nextLetterPage();
      setTimeout(runPlayfulSequence, 200);
    } else {
      nextLetterPage();
    }
  });

  stillThereBtn.addEventListener('click', revealPlayfulFinal);

  openLastPageBtn.addEventListener('click', () => {
    nextLetterPage();
    setTimeout(runFinalSequence, 250);
  });

  oneMoreThingBtn.addEventListener('click', showFinalSurprise);
  replayBtn.addEventListener('click', restartExperience);

  /* -------------------- INIT -------------------- */
  function init() {
    createIntroStars();
    createFloatingHearts(welcomeFloaters, 14);
    createFloatingHearts(envelopeFloaters, 10);
    createSparkles(envelopeFloaters, 8);
    createFloatingHearts(letterFloaters, 8);
    initCursorSparkle();

    renderLetterPage();
    setTimeout(runIntroSequence, 600);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
