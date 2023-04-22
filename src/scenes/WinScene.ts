import Phaser from "phaser";
import Fonts from "../assets/Fonts";
import Player from '../entities/Player';

export default class WinScene extends Phaser.Scene {
  player: Player | undefined;
  scoreVal?: number;
  coins?: number;
  potions?: number;
  hearts?: number;
  slimes?: number;
  chests?: number;
  instructions?: Phaser.GameObjects.DynamicBitmapText;
  score?: Phaser.GameObjects.DynamicBitmapText;
  lives?: Phaser.GameObjects.DynamicBitmapText;

  lastUpdate?: number;

  constructor() {
    super({ key: "WinScene" });
  }

  preload(): void {
    this.load.bitmapFont("default", ...Fonts.default);
  }

  init(data: any): void {
    this.scoreVal = data.score;
    this.coins = data.coins;
    this.potions = data.potions;
    this.hearts = data.hearts;
    this.slimes = data.slimes;
    this.chests = data.chests;
  }

  create(): void {
    this.input.keyboard.on('keydown_ENTER', () => {
      this.scene.stop();
      this.scene.stop('DungeonScene');
      this.scene.run('DungeonScene');
    });

    this.instructions = this.add.dynamicBitmapText(screen.width / 3 + 50, screen.height/3, "default", "", 90);
    this.instructions.setAlpha(0.7);

    this.score = this.add.dynamicBitmapText(screen.width / 2.25, screen.height / 3 + 150, "default", "", 35);
    this.score.setAlpha(0.7);

    this.lives = this.add.dynamicBitmapText(screen.width / 2.25, 1050, "default", "", 12);
    this.lives.setAlpha(0.7);

    this.lastUpdate = 0;
  }

  update(time: number, _: number): void {
    if (time > this.lastUpdate! + 100) {
      this.instructions!.setText([
        "You Win!"
      ]);

      this.score!.setText([
        `Score: ${this.scoreVal}`,
        `Coins: ${this.coins}`,
        `Chests: ${this.chests}`,
        `Hearts: ${this.hearts}`,
        `Slimes: ${this.slimes}`,
        `Potions: ${this.potions}`
      ]);
      

      this.lives!.setText([
        "Press ENTER to play again"
      ]);

      this.lastUpdate = time;
    }
  }
}
