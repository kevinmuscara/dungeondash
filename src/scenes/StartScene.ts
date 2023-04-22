import Phaser from 'phaser';
import Fonts from '../assets/Fonts';

export default class StartScene extends Phaser.Scene {
  instructions?: Phaser.GameObjects.DynamicBitmapText;
  play?: Phaser.GameObjects.DynamicBitmapText;

  lastUpdate?: number;
  text?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'StartScene' });
  }

  preload(): void {
    this.load.image('background', '../../assets/Bg.png');
    this.load.bitmapFont('default', ...Fonts.default);
  }

  create(): void {
    this.add.image(screen.width, screen.height, 'background');

    this.instructions = this.add.dynamicBitmapText(screen.width / 3 - 30, screen.height / 3, 'default', '', 90);
    this.instructions.setAlpha(0.7);

    this.play = this.add.dynamicBitmapText(screen.width / 2.5 - 50, screen.height / 3 + 150, 'default', '', 35);
    this.play.setAlpha(0.7);

    this.lastUpdate = 0;

    this.input.keyboard.on("keydown_ENTER", () => {
      this.scene.sleep();
      this.scene.run('DungeonScene');
    });
  }

  update(time: number, _: number): void {

    if(time > this.lastUpdate! + 100) {
      this.play!.setText([
        "Press ENTER to play!",
      ])

      this.instructions!.setText([
        "Game Name"
      ]);

      this.lastUpdate = time;
    }
  }
}