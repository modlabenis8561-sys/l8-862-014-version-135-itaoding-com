function setupPlayer(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var layer = document.querySelector("[data-player-layer]");
    if (!video || !streamUrl) {
        return;
    }

    var hlsInstance = null;
    var loaded = false;

    function attachMedia() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function(event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                }
            });
        } else {
            video.src = streamUrl;
        }
    }

    function startPlayback() {
        attachMedia();
        if (layer) {
            layer.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var result = video.play();
        if (result && result.catch) {
            result.catch(function() {});
        }
    }

    if (layer) {
        layer.addEventListener("click", startPlayback);
    }
    video.addEventListener("click", function() {
        if (video.paused) {
            startPlayback();
        }
    });
    window.addEventListener("beforeunload", function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
