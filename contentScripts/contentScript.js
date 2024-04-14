
window.navigation.addEventListener("navigate", (event) => {
    const urlObject = new URL(event.destination.url);
    const url = urlObject.href


    if (url.includes("youtube.com/playlist")) {
        newPlaylistLoaded();
    }
    if (url.includes("youtube.com/watch")) {
        addPlaybackSpeedSlider();
        skipAd();
    }
});

firstUrl = window.location.href;

if (firstUrl.includes("youtube.com/playlist")) {
    newPlaylistLoaded()
}
if (firstUrl.includes("youtube.com/watch")) {
    addPlaybackSpeedSlider();
    skipAd();
}



function newPlaylistLoaded() {
    setTimeout(() => {
        const noOfVideosElement = document.querySelector('#page-manager > ytd-browse > ytd-playlist-header-renderer > div > div.immersive-header-content.style-scope.ytd-playlist-header-renderer > div.thumbnail-and-metadata-wrapper.style-scope.ytd-playlist-header-renderer > div > div.metadata-action-bar.style-scope.ytd-playlist-header-renderer > div.metadata-text-wrapper.style-scope.ytd-playlist-header-renderer > ytd-playlist-byline-renderer > div > yt-formatted-string:nth-child(2) > span:nth-child(1)');

        if (noOfVideosElement) {
            const noOfVideos = parseInt(noOfVideosElement.innerText, 10);

            const durationElements = document.querySelectorAll("#contents > ytd-playlist-video-renderer #time-status > #text");

            if (noOfVideos === durationElements.length) {
                const totalDuration = findTotalDuration(durationElements);
                const remainingDuration = findRemainingDuration(durationElements);

                addDurationTimestamp(totalDuration, remainingDuration);

            } else {
                addDurationTimestamp("Playlist is not Fully Loaded (Scroll Down and RELOAD)");

            }
        }

    }, 1000);

}

function addPlaybackSpeedSlider() {
    const sliderContainer = document.createElement("div");
    sliderContainer.setAttribute("class", "playback-speed-slider-container");

    // const playbackSpeedValueElement = document.createElement("input");
    const playbackSpeedValueElement = document.createElement("div");
    playbackSpeedValueElement.setAttribute("class", "playback-speed-value-element");
    playbackSpeedValueElement.innerText = "1x";
    // playbackSpeedValueElement.setAttribute("type", "number");
    // playbackSpeedValueElement.setAttribute("min", "1");
    // playbackSpeedValueElement.setAttribute("max", "16");
    // playbackSpeedValueElement.setAttribute("value", "1");

    const playbackSpeedSliderElement = document.createElement("input");
    playbackSpeedSliderElement.setAttribute("class", "playback-speed-slider");
    playbackSpeedSliderElement.setAttribute("type", "range");
    playbackSpeedSliderElement.setAttribute("min", "1");
    playbackSpeedSliderElement.setAttribute("max", "16");
    playbackSpeedSliderElement.setAttribute("step", "0.01");
    playbackSpeedSliderElement.setAttribute("value", "1");




    const leftControlsYT = document.querySelector("#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls");

    if (!leftControlsYT.innerHTML.includes("playback-speed-slider-container")) {
        leftControlsYT.appendChild(sliderContainer);
    }

    if (!sliderContainer.innerHTML.includes("playback-speed-value-element")) {
        sliderContainer.appendChild(playbackSpeedValueElement);
    }

    if (!sliderContainer.innerHTML.includes("playback-speed-slider")) {
        sliderContainer.appendChild(playbackSpeedSliderElement);

    }


    playbackSpeedSliderElement.addEventListener("input", function () {
        let playbackSpeedVal = this.value;
        // playbackSpeedValueElement.value = playbackSpeedVal;
        playbackSpeedValueElement.innerText = `${playbackSpeedVal}x`;
        document.querySelector('.html5-main-video').playbackRate = playbackSpeedVal;

    });

    // playbackSpeedValueElement.addEventListener("input", function () {
    //     let playbackSpeedVal = this.value;
    //     if (playbackSpeedVal >= 1 && playbackSpeedVal <= 16) {
    //         playbackSpeedSliderElement.value = playbackSpeedVal;
    //         document.querySelector('.html5-main-video').playbackRate = playbackSpeedVal;

    //     } else if (isNaN(playbackSpeedVal)) {
    //         playbackSpeedSliderElement.value = 1;

    //     } else {
    //         playbackSpeedSliderElement.value = 1;
    //         playbackSpeedValueElement.value = 1;

    //     }


    // });


}

function addDurationToSeconds(arrayOfDuration) {
    let totalSeconds = 0;

    for (const duration of arrayOfDuration) {

        const durationParts = duration.split(":");
        let seconds = 0;
        let minutes = 0;
        let hours = 0;
        let days = 0;


        if (durationParts.length === 1) {
            seconds = parseInt(durationParts[0], 10);
        } else if (durationParts.length === 2) {
            minutes = parseInt(durationParts[0], 10);
            seconds = parseInt(durationParts[1], 10);
        } else if (durationParts.length === 3) {
            hours = parseInt(durationParts[0], 10);
            minutes = parseInt(durationParts[1], 10);
            seconds = parseInt(durationParts[2], 10);

        } else if (durationParts.length === 4) {
            days = parseInt(durationParts[0], 10);
            hours = parseInt(durationParts[1], 10);
            minutes = parseInt(durationParts[2], 10);
            seconds = parseInt(durationParts[3], 10);
        }

        totalSeconds += (days * 86400) + (hours * 3600) + (minutes * 60) + seconds

    }

    return totalSeconds;
}

function secondsToDuration(totalSeconds) {
    let days = Math.floor(totalSeconds / 86400);
    let hours = Math.floor((totalSeconds % 86400) / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = Math.floor(totalSeconds % 60)

    const totalDuration = `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return totalDuration;
}


function findTotalDuration(durationElements) {
    let durationOfEachVideo = [];

    durationElements.forEach(durationElement => {

        let duration = durationElement.innerText;
        duration = duration.trim();

        durationOfEachVideo.push(duration)

    });


    const totalSeconds = addDurationToSeconds(durationOfEachVideo);
    const totalDuration = secondsToDuration(totalSeconds);

    return totalDuration;
}

function findRemainingDuration(durationElements) {
    let durationOfRemainingVideo = [];

    durationElements.forEach(durationElement => {
        const parent = durationElement.parentNode.parentNode.parentNode;

        let duration = durationElement.innerText;
        duration = duration.trim();

        if (parent.querySelector('ytd-thumbnail-overlay-resume-playback-renderer')) {
            let progressElement = parent.querySelector('ytd-thumbnail-overlay-resume-playback-renderer').querySelector('#progress')
            let progressInPercent = parseInt(progressElement.style.width, 10);

            let durationArray = new Array(duration);

            let seconds = addDurationToSeconds(durationArray);

            let remainingSeconds = Math.floor(seconds - ((progressInPercent / 100) * seconds));
            let remainingDuration = secondsToDuration(remainingSeconds);
            durationOfRemainingVideo.push(remainingDuration);

        } else {
            durationOfRemainingVideo.push(duration)
        }

    });

    const totalRemainingSeconds = addDurationToSeconds(durationOfRemainingVideo);
    const totalRemainingDuration = secondsToDuration(totalRemainingSeconds);

    return totalRemainingDuration;
}


function addDurationTimestamp(totalDuration, remainingDuration) {
    const playlistThumbnailElement = document.querySelector("#page-manager > ytd-browse > ytd-playlist-header-renderer > div > div.immersive-header-content.style-scope.ytd-playlist-header-renderer > div.thumbnail-and-metadata-wrapper.style-scope.ytd-playlist-header-renderer > a > div > ytd-hero-playlist-thumbnail-renderer > div > div > yt-img-shadow");

    const totalDurationTimestampElement = document.createElement("span");
    totalDurationTimestampElement.innerHTML = totalDuration;
    totalDurationTimestampElement.classList.add("playlist-total-duration-timestamp");


    // Injecting HTML to Playlist Thumbnail Element
    if (document.querySelector('.playlist-total-duration-timestamp')) {
        const totalDurationElement = document.querySelector(".playlist-total-duration-timestamp");
        playlistThumbnailElement.removeChild(totalDurationElement);
    }
    playlistThumbnailElement.appendChild(totalDurationTimestampElement);

    totalDurationTimestampElement.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();





        if (totalDurationTimestampElement.innerText === totalDuration) {
            totalDurationTimestampElement.innerText = remainingDuration;
        } else {
            totalDurationTimestampElement.innerText = totalDuration;
        }



    });

}


function skipAd() {
    const videoPlayerElement = document.querySelector('#movie_player');
    const ytVideo = document.querySelector('#movie_player > div.html5-video-container > video');

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.target.classList[0] === "video-ads") {
                ytVideo.currentTime = ytVideo.duration;

            }
        }
    });

    observer.observe(videoPlayerElement, {
        childList: true,
        subtree: true

    });
}


