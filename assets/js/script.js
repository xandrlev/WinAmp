import { data } from "./data.js";
import { toMinSec } from "./utils.js";

const AudioController = {
  state: {
    audios: [],
  },

  init() {
    this.initVariables();
    this.renderAudios();
  },

  initVariables() {
    this.audioList = document.querySelector(".items");
  },

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

  loadAudio(audio) {
    this.audioList.innerHTML += this.renderItem(audio);
  },

  renderAudios() {
    data.forEach((item) => {
      const audio = new Audio(`./assets/audio/${item.link}`);
      audio.addEventListener("loadeddata", () => {
        const newItem = { ...item, duration: audio.duration };

        this.loadAudio(newItem);
        this.state.audios = [...this.state.audios, newItem];
      });
    });
  },
};

AudioController.init();
