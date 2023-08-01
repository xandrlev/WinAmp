import { data } from "./data.js";
import { toMinSec, shuffle } from "./utils.js";

const AudioController = {
  state: {
    audios: [],
    current: {},
    playing: false,
    repeating: false,
    sound: true,
    volume: 0.5,
  },

  init() {
    this.initVariables();
    this.initEvents();
    this.renderAudios();
  },

  initVariables() {
    this.audioList = document.querySelector(".items");
    this.currentItem = document.querySelector(".current");
    this.repeatButton = document.querySelector(".handling-repeat");
    this.volumeButton = document.querySelector(".handling-sound");
    this.volumeBar = document.querySelector(".controls-volume");
    this.shuffleButton = document.querySelector(".handling-shuffle");
  },

  // render select track
  renderCurrentItem({ link, group, track, year, duration }) {
    const [image] = link.split(".");
    return `
    <div class="current-image" style="background-image: url(./assets/images/${image}.jpg)"></div>
    <div class="current-info">
      <div class="current-info__top">
        <div class="current-info__titles">
          <h2 class="current-info__group">${group}</h2>
          <h3 class="current-info__track">${track}</h3>
        </div>
        <div class="current-info__year">${year}</div>
      </div>
      <div class="controls">
        <div class="controls-buttons">
          <button class="controls-button controls-prev">
            <svg class="icon-arrow">
              <use xlink:href="./assets/images/sprite.svg#arrow" />
            </svg>
          </button>

          <button class="controls-button controls-play">
            <svg class="icon-pause">
              <use xlink:href="./assets/images/sprite.svg#pause" />
            </svg>
            <svg class="icon-play">
              <use xlink:href="./assets/images/sprite.svg#play" />
            </svg>
          </button>

          <button class="controls-button controls-next">
            <svg class="icon-arrow">
              <use xlink:href="./assets/images/sprite.svg#arrow" />
            </svg>
          </button>
        </div>

        <div class="controls-progress">
          <div class="progress">
            <div class="progress-current"></div>
          </div>

          <div class="timeline">
            <span class="timeline-start">00:00</span>
            <span class="timeline-end">${toMinSec(duration)}</span>
          </div>
        </div>
      </div>
    </div>`;
  },

  pauseCurrentAudio() {
    const {
      current: { audio },
    } = this.state;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  },

  togglePlayPause() {
    // don't work
    const play = document.querySelector(".controls-play");
    const {
      playing,
      current: { audio },
    } = this.state;
    playing ? audio.play() : audio.pause();
    play.classList.toggle("playing");
  },

  setCurrentItem(itemId) {
    const current = this.state.audios.find(({ id }) => +id === +itemId);
    if (current) {
      this.pauseCurrentAudio();
      this.state.current = current;
      this.currentItem.innerHTML = this.renderCurrentItem(current);
      current.audio.volume = this.state.volume;
      this.handlePlayer();
      this.audioUpdateHandler(current);
      setTimeout(() => {
        this.togglePlayPause();
      }, 10);
    }
  },

  // click on item list
  initEvents() {
    this.audioList.addEventListener("click", ({ target }) => {
      if (target.dataset.id) {
        this.setCurrentItem(target.dataset.id);
      }
    });

    this.repeatButton.addEventListener("click", ({ currentTarget }) => {
      const { repeating } = this.state;
      currentTarget.classList.toggle("active");
      this.state.repeating = !repeating;
    });

    // mute sound
    // this.volumeButton.addEventListener("click", () => {
    //   const {
    //     sound,
    //     current: { audio },
    //   } = this.state;
    //   this.state.sound = !sound;
    //   // sound ? (audio.volume = 0) : this.state.current.sound;
    //   sound ? (audio.volume = 0) : audio.volume = 0.5;
    //   console.log(this.state.current);
    // });

    this.volumeBar.addEventListener("mousemove", ({ target: { value } }) => {
      const { current } = this.state;
      if (current) {
        this.state.volume = value;
        current.audio.volume = value;
      }
    });

    this.shuffleButton.addEventListener("click", () => {
      const { children } = this.audioList;
      const shuffled = shuffle([...children]);

      this.audioList.innerHTML = "";
      shuffled.forEach((item) => this.audioList.appendChild(item));
    });
  },

  // render audio list
  renderItem({ id, link, group, track, genre, duration }) {
    const [image] = link.split(".");

    return `
    <div class="item" data-id='${id}'>
    <div class="item-image" style="background-image: url(./assets/images/${image}.jpg)"></div>

    <div class="item-titles">
      <h2 class="item-group">${group}</h2>
      <h3 class="item-track">${track}</h3>
    </div>

    <p class="item-duration">${toMinSec(duration)}</p>
    <p class="item-genre">${genre}</p>
    <button class="item-play">
      <!-- <svg class="icon-pause">
        <use xlink:href="./assets/images/sprite.svg#pause" />
      </svg> -->
      <svg class="icon-play">
        <use xlink:href="./assets/images/sprite.svg#play" />
      </svg>
    </button>
  </div>`;
  },

  // load data from audio
  renderAudios() {
    data.forEach((item) => {
      const audio = new Audio(`./assets/audio/${item.link}`);
      audio.addEventListener("loadeddata", () => {
        const newItem = { ...item, audio, duration: audio.duration };

        this.state.audios = [...this.state.audios, newItem];
        this.audioList.innerHTML += this.renderItem(newItem);
      });
    });
  },

  // progress bar
  audioUpdateHandler({ audio, duration, playing }) {
    const progress = document.querySelector(".progress-current");
    const timeline = document.querySelector(".timeline-start");

    audio.play();
    this.state.playing = !playing;
    audio.addEventListener("timeupdate", ({ target }) => {
      const { currentTime } = target;
      const width = (currentTime * 100) / duration;
      timeline.innerHTML = toMinSec(currentTime);
      progress.style.width = `${width}%`;
    });

    //auto repeat
    audio.addEventListener("ended", ({ target }) => {
      target.currentTime = 0;
      progress.style.width = `0%`;
      // repeat audio or next audio
      this.state.repeating ? target.play() : this.prevNextAudio("next");
    });
  },

  prevNextAudio(status) {
    const { current } = this.state;
    const currentItem = document.querySelector(`[data-id="${current.id}"]`);
    const nextItem = currentItem.nextElementSibling?.dataset;
    const firstItem = this.audioList.firstElementChild?.dataset;
    const prevItem = currentItem.previousElementSibling?.dataset;
    const lastItem = this.audioList.lastElementChild?.dataset;
    let itemId = null;

    switch (status) {
      case "prev":
        itemId = prevItem?.id || lastItem?.id;
        break;
      case "next":
        itemId = nextItem?.id || firstItem?.id;
    }

    if (itemId) {
      this.setCurrentItem(itemId);
    }
  },

  //play audio
  handlePlayer() {
    const play = document.querySelector(".controls-play");
    const next = document.querySelector(".controls-next");
    const prev = document.querySelector(".controls-prev");

    play.addEventListener("click", () => {
      const { playing, current } = this.state;
      const { audio } = current;
      !playing ? audio.play() : audio.pause();
      this.state.playing = !playing;
      play.classList.toggle("playing");
    });

    next.addEventListener("click", this.prevNextAudio.bind(this, "next"));
    prev.addEventListener("click", this.prevNextAudio.bind(this, "prev"));
  },
};

AudioController.init();
