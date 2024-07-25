let globalPlaybackSpeed = 1;

window.navigation.addEventListener("navigate", (event) => {
    const urlObject = new URL(event.destination.url);
    const url = urlObject.href

    initializeFeatures(url);
});

firstUrl = window.location.href;
initializeFeatures(firstUrl);


function initializeFeatures(url) {
    if (url.includes("youtube.com/playlist")) {
        playlistDuration();
    }
    if (url.includes("youtube.com/watch")) {
        addPlaybackSpeedSlider();
        skipAd();
        videoRemainingTime();
    }
}

function playlistDuration() {

    function totalVideosInPlaylist() {
        const noOfVideosElement = document.querySelector('ytd-playlist-byline-renderer > div > yt-formatted-string:nth-child(2) > span:nth-child(1)');
        if (!noOfVideosElement) return;
        const noOfVideos = parseInt(noOfVideosElement.innerText, 10);
        return noOfVideos;
    }

    function UnavailableVideos() {
        const noOfUnavailableVideosElement = document.querySelector("ytd-alert-with-button-renderer > #text");
        let noOfUnavailableVideos = 0
        if (noOfUnavailableVideosElement) noOfUnavailableVideos = parseInt(noOfUnavailableVideosElement.innerText, 10);
        if (isNaN(noOfUnavailableVideos)) noOfUnavailableVideos = 0;
        return noOfUnavailableVideos;
    }

    function handlePlaylist() {
        const durationElements = Array.from(document.querySelectorAll("#contents > ytd-playlist-video-renderer #time-status > #text"));

        const noOfAvailableVideos = totalVideosInPlaylist() - UnavailableVideos();

        if (noOfAvailableVideos === durationElements.length) {
            const totalDuration = findTotalDuration(durationElements);
            const remainingDuration = findRemainingDuration(durationElements);

            addDurationTimestamp(totalDuration, remainingDuration);

        } else if (noOfAvailableVideos > durationElements.length) {
            let videoNumberElement = Array.from(document.querySelectorAll('#index'));
            const lastVideoNumber = parseInt(videoNumberElement[videoNumberElement.length - 1].innerText, 10);

            if (lastVideoNumber % 100 === 0) {
                // Known Issue: If the last video number is a multiple of 100, the duration of the last video is not displayed
                addDurationTimestamp("Playlist is not fully loaded, scroll down till the time appears");

                const playlistCardContainer = document.querySelector("ytd-playlist-video-list-renderer > #contents");

                const playlistObserver = new MutationObserver(() => {
                    handlePlaylist();
                    playlistObserver.disconnect();
                });

                playlistObserver.observe(playlistCardContainer, {
                    childList: true,
                });
            } else {
                const totalDuration = findTotalDuration(durationElements);
                const remainingDuration = findRemainingDuration(durationElements);

                addDurationTimestamp(totalDuration, remainingDuration);

            }

        } else if (noOfAvailableVideos < durationElements.length) {
            const totalDuration = findTotalDuration(durationElements.slice(0, noOfAvailableVideos));
            const remainingDuration = findRemainingDuration(durationElements.slice(0, noOfAvailableVideos));
            addDurationTimestamp(totalDuration, remainingDuration);
        } else {
            addDurationTimestamp("Unknown Error")
        }
    }

    function addDurationTimestamp(totalDuration, remainingDuration) {
        if (!remainingDuration) remainingDuration = totalDuration;
        const playlistThumbnailElement = document.querySelector("#page-manager > ytd-browse > ytd-playlist-header-renderer > div > div.immersive-header-content.style-scope.ytd-playlist-header-renderer > div.thumbnail-and-metadata-wrapper.style-scope.ytd-playlist-header-renderer > a > div > ytd-hero-playlist-thumbnail-renderer > div > div > yt-img-shadow");

        const totalDurationTimestampElement = document.createElement("span");
        totalDurationTimestampElement.innerHTML = totalDuration;
        totalDurationTimestampElement.classList.add("playlist-total-duration-timestamp");


        // Injecting HTML to Playlist Thumbnail Element
        removePreviousTimestamp();
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

    function removePreviousTimestamp() {
        const playlistThumbnailElement = document.querySelector("#page-manager > ytd-browse > ytd-playlist-header-renderer > div > div.immersive-header-content.style-scope.ytd-playlist-header-renderer > div.thumbnail-and-metadata-wrapper.style-scope.ytd-playlist-header-renderer > a > div > ytd-hero-playlist-thumbnail-renderer > div > div > yt-img-shadow");
        if (document.querySelector('.playlist-total-duration-timestamp')) {
            const totalDurationElement = document.querySelector(".playlist-total-duration-timestamp");
            playlistThumbnailElement.removeChild(totalDurationElement);
        }
    }

    function waitForPlaylist() {
        let checkTime = 0;
        let maxTime = 60;
        const checkPlaylistInterval = setInterval(() => {
            if (checkTime >= maxTime) clearInterval(checkPlaylistInterval);

            const noOfAvailableVideos = totalVideosInPlaylist() - UnavailableVideos();
            const durationElements = document.querySelectorAll("#contents > ytd-playlist-video-renderer #time-status > #text");

            if (noOfAvailableVideos > 100) {
                addDurationTimestamp("Playlist is not fully loaded, scroll down till the time appears");
            }

            if (noOfAvailableVideos === durationElements.length) {
                clearInterval(checkPlaylistInterval);
                handlePlaylist();
            } else {
                handlePlaylist();
            }
            checkTime++;
        }, 1000);
    }

    removePreviousTimestamp();
    waitForPlaylist();

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

    if (!leftControlsYT.innerHTML.includes("playback-speed-slider-container"))
        leftControlsYT.appendChild(sliderContainer);

    if (!sliderContainer.innerHTML.includes("playback-speed-value-element"))
        sliderContainer.appendChild(playbackSpeedValueElement);

    if (!sliderContainer.innerHTML.includes("playback-speed-slider"))
        sliderContainer.appendChild(playbackSpeedSliderElement);


    playbackSpeedSliderElement.addEventListener("input", function () {
        let playbackSpeedVal = this.value;
        // playbackSpeedValueElement.value = playbackSpeedVal;
        playbackSpeedValueElement.innerText = `${playbackSpeedVal}x`;
        document.querySelector('.html5-main-video').playbackRate = playbackSpeedVal;
        globalPlaybackSpeed = playbackSpeedVal

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
        console.log(typeof durationParts[0]);
        let seconds = 0;
        let minutes = 0;
        let hours = 0;
        let days = 0;

        if (durationParts.length === 1) {
            const reg = /^\d+$/;
            reg.test(durationParts[0]) ? seconds = parseInt(durationParts[0], 10) : seconds = 0
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

    let totalDuration = `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    totalDuration = totalDuration.replace(/^00:/, "");

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


function skipAd() {
    const videoPlayerElement = document.querySelector('#movie_player');
    const ytVideo = document.querySelector('#movie_player > div.html5-video-container > video');

    const adObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.target.classList[0] === "video-ads" || mutation.target.classList[0] === "ytp-ad-text") {
                if (!isNaN(ytVideo.duration)) {
                    ytVideo.currentTime = ytVideo.duration;
                }
            }
            if (document.querySelector('.ytp-skip-ad-button')) {
                const skipAdBtn = document.querySelector('.ytp-skip-ad-button');
                skipAdBtn.click()
            }
            // This is not related to skipping ads but to set the playback speed to the global playback speed
            // Doing it here to use the already defined mutation observer
            if (document.querySelector('.html5-main-video').playbackRate != globalPlaybackSpeed) {
                document.querySelector('.html5-main-video').playbackRate = globalPlaybackSpeed;
            }
        }
    });

    adObserver.observe(videoPlayerElement, {
        childList: true,
        subtree: true

    });
}


function videoRemainingTime() {

    const ytVideo = document.querySelector('#movie_player > div.html5-video-container > video');
    const leftControlsYT = document.querySelector("#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls");
    // const timeWatchedElement = document.querySelector('.ytp-time-current');

    const videoRemainingDurationContainer = document.createElement("div");
    videoRemainingDurationContainer.setAttribute("class", "video-remaining-duration-container");


    setInterval(() => {
        const videoDuration = ytVideo.duration;
        if (isNaN(videoDuration)) return;

        // const timeWatched = addDurationToSeconds([timeWatchedElement.innerText]);    // Better Sync
        const timeWatched = ytVideo.currentTime;    // More Reliable and Efficient
        const playbackSpeed = ytVideo.playbackRate;

        const videoRemainingDuration = Math.floor((videoDuration - timeWatched) / playbackSpeed);

        videoRemainingDurationContainer.innerText = secondsToDuration([videoRemainingDuration]);

        if (leftControlsYT.querySelectorAll('.video-remaining-duration-container').length == 0) {
            leftControlsYT.appendChild(videoRemainingDurationContainer);
        }
    }, 1000);
}
