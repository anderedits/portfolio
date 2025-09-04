/**
 * Este script maneja la reproducción automática de videos de YouTube
 * al hacer scroll y detectarlos en el viewport, e incluye un botón de mute/unmute.
 */

// --- Variables Globales ---
let players = [];
let activePlayerIndex = -1;
let isMuted = true;

// 1. Carga la API de YouTube de forma asíncrona.
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. Esta función se ejecuta cuando la API está lista.
function onYouTubeIframeAPIReady() {
    const iframes = document.querySelectorAll('.video-container iframe');
    iframes.forEach((iframe, index) => {
        players[index] = new YT.Player(iframe.id, {
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    });

    createIntersectionObserver();
    setupMuteButton();

    // Forzar la reproducción del primer video al cargar la página.
    setTimeout(() => {
        if (players.length > 0) {
            activePlayerIndex = 0;
            const firstPlayer = players[activePlayerIndex];
            firstPlayer.mute(); // Siempre empieza en silencio
            firstPlayer.playVideo();
        }
    }, 500);
}

// 3. Bucle: Cuando un video termina, lo vuelve a reproducir.
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        event.target.playVideo();
    }
}

// 4. Observador de Intersección: Detecta qué video está en pantalla.
function createIntersectionObserver() {
    const slides = document.querySelectorAll('.video-slide');
    const options = {
        root: document.querySelector('.video-scroller'),
        rootMargin: '0px',
        threshold: 0.75
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const slideIndex = Array.from(slides).indexOf(entry.target);
            const player = players[slideIndex];
            if (!player) return;

            if (entry.isIntersecting) {
                activePlayerIndex = slideIndex;
                if (isMuted) {
                    player.mute();
                } else {
                    player.unMute();
                }
                player.playVideo();
            } else {
                player.pauseVideo();
            }
        });
    }, options);

    slides.forEach(slide => {
        observer.observe(slide);
    });
}

// 5. Lógica del botón de Sonido
function setupMuteButton() {
    const muteButton = document.getElementById('mute-button');
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted; // Invierte el estado

        if (activePlayerIndex !== -1) {
            const activePlayer = players[activePlayerIndex];
            if (isMuted) {
                activePlayer.mute();
            } else {
                activePlayer.unMute();
            }
        }

        // Actualiza el icono y la clase del botón
        muteButton.textContent = isMuted ? '🔇' : '🔊';
        muteButton.classList.toggle('unmuted', !isMuted);
    });
}
