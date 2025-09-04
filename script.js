/**
 * Este script maneja la reproducción automática de videos de YouTube
 * al hacer scroll y detectarlos en el viewport.
 */

// 1. Carga la API de YouTube de forma asíncrona.
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. Esta función se ejecuta cuando la API está lista.
let players = [];
function onYouTubeIframeAPIReady() {
    const iframes = document.querySelectorAll('.video-container iframe');
    iframes.forEach((iframe, index) => {
        players[index] = new YT.Player(iframe.id, {
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    });

    // Una vez que los reproductores están listos, inicializa el observador de intersección.
    createIntersectionObserver();

    // Añadido: Forzar la reproducción del primer video al cargar la página.
    // Se usa un pequeño retardo para asegurar que el reproductor esté 100% listo.
    setTimeout(() => {
        if (players.length > 0) {
            players[0].mute();
            players[0].playVideo();
        }
    }, 500);
}

// 3. Bucle: Cuando un video termina (state 0), lo vuelve a reproducir.
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        event.target.playVideo();
    }
}

// 4. Observador de Intersección: Detecta qué video está en pantalla.
function createIntersectionObserver() {
    const slides = document.querySelectorAll('.video-slide');

    const options = {
        root: document.querySelector('.video-scroller'), // Observa dentro del contenedor de scroll
        rootMargin: '0px',
        threshold: 0.75 // El video debe estar visible en un 75% para reaccionar
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Encuentra el índice del slide que está siendo observado.
            const slideIndex = Array.from(slides).indexOf(entry.target);
            const player = players[slideIndex];

            if (!player) return;

            if (entry.isIntersecting) {
                // El video está visible: reprodúcelo en silencio.
                player.mute();
                player.playVideo();
            } else {
                // El video ya no está visible: páusalo.
                player.pauseVideo();
            }
        });
    }, options);

    // Asigna el observador a cada slide.
    slides.forEach(slide => {
        observer.observe(slide);
    });
}