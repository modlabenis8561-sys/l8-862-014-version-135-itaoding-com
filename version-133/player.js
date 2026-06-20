import { H as Hls } from './assets/hls-vendor.js';

export function bootPlayer(url) {
    const video = document.querySelector('[data-player]');
    const buttons = Array.from(document.querySelectorAll('[data-start]'));
    const layer = document.querySelector('[data-layer]');
    let attached = false;
    let hls = null;

    const attach = () => {
        if (!video || attached) return Promise.resolve();
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            return Promise.resolve();
        }
        if (Hls && Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            return new Promise((resolve) => {
                hls.on(Hls.Events.MANIFEST_PARSED, resolve);
                setTimeout(resolve, 1200);
            });
        }
        video.src = url;
        return Promise.resolve();
    };

    const play = async () => {
        if (!video) return;
        if (layer) layer.classList.add('is-hidden');
        await attach();
        video.controls = true;
        try {
            await video.play();
        } catch (error) {
            video.controls = true;
        }
    };

    buttons.forEach((button) => button.addEventListener('click', play));
    if (video) {
        video.addEventListener('click', () => {
            if (video.paused) play();
        });
        video.addEventListener('play', () => {
            if (layer) layer.classList.add('is-hidden');
        });
    }
    window.addEventListener('beforeunload', () => {
        if (hls) hls.destroy();
    });
}
