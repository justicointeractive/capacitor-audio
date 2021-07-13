import { WebPlugin } from "@capacitor/core";
import videojs, { VideoJsPlayer } from "video.js";
import type {
  AudioPluginPlugin,
  NowPlayingInfo,
  PlaylistItem,
} from "./definitions";

export class AudioPluginWeb extends WebPlugin implements AudioPluginPlugin {
  constructor() {
    super({
      name: "Audio",
      platforms: ["web"],
    });
  }

  current?: VideoJsPlayer;
  currentIndex = 0;
  audios?: VideoJsPlayer[];
  info?: NowPlayingInfo;

  playList({ items }: { items: PlaylistItem[] }) {
    this.audios = items.map((item) => {
      let audio = videojs(new Audio());
      audio.src(item);
      audio.load();
      return audio;
    });
    this.current = this.audios[0];
    this.currentIndex = 0;
    this.play();
  }

  triggerEvent(name: string) {
    var event; // The custom event that will be created
    if (document.createEvent) {
      event = document.createEvent("HTMLEvents");
      event.initEvent(name, true, true);
      // event.eventName = name;
      window.dispatchEvent(event);
    }
  }

  play() {
    if (this.current == null) {
      throw new Error("no current item to play");
    }
    const audios = this.audios;
    if (audios == null) {
      throw new Error("no playlist");
    }
    this.current.on("ended", () => {
      this.triggerEvent("playEnd");
      if (this.current === audios[audios.length - 1]) {
        this.triggerEvent("playAllEnd");
      } else {
        this.currentIndex += 1;
        this.current = audios[this.currentIndex];
        this.play();
      }
    });
    this.current.on("pause", () => {
      this.triggerEvent("playPaused");
    });
    this.current.on("playing", () => {
      this.triggerEvent("playResumed");
    });
    this.current && this.current.play();
  }

  pausePlay() {
    this.current && this.current.pause();
  }

  resumePlay() {
    this.play();
  }

  setPlaying(info: NowPlayingInfo) {
    this.info = info;
    return new Promise<void>((r) => r());
  }

  async seek(options: { to: number }): Promise<void> {
    if (this.current) {
      if (options != null) {
        this.current.currentTime(options.to);
      }
    }
  }
}
