import Phaser from "phaser";
import Fonts from "../assets/Fonts";
import Player from '../entities/Player';
import eventsCenter from "../EventCenter";

export default class InfoScene extends Phaser.Scene {
  player: Player | undefined;

  instructions?: Phaser.GameObjects.DynamicBitmapText;
  score?: Phaser.GameObjects.DynamicBitmapText;
  lives?: Phaser.GameObjects.DynamicBitmapText;

  lastUpdate?: number;

  constructor() {
    super({ key: "InfoScene" });
  }

  preload(): void {
    this.load.bitmapFont("default", ...Fonts.default);
  }

  create(): void {

    this.instructions = this.add.dynamicBitmapText(15, 25, "default", "", 15);
    this.instructions.setAlpha(0.7);

    this.score = this.add.dynamicBitmapText(15, 85, "default", "", 15);
    this.score.setAlpha(0.7);

    this.lives = this.add.dynamicBitmapText(15, 112, "default", "", 15);
    this.lives.setAlpha(0.7);

    this.lastUpdate = 0;

    eventsCenter.on('update-data', this.updateData, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => eventsCenter.off('update-data', this.updateData, this));
  }

  updateData(data: { score: number; lives: number; slimes: number; }) {
    this.score!.setText([
      `Score: ${data.score}`,
    ]);

    this.lives!.setText([
      `Lives: ${data.lives}`,
      `Slimes: ${data.slimes}`
    ]);
  }

  update(time: number, _: number): void {
    if (time > this.lastUpdate! + 100) {
      this.instructions!.setText([
        "Press space while moving to attack",
        "Kill all the slimes to win!",
      ]);

      this.lastUpdate = time;
    }
  }
}
