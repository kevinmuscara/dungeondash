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

    console.log({height: screen.height, width: screen.width})
    // this.instructions = this.add.dynamicBitmapText(screen.width/2, screen.height / 3, 'default', '', 90).setOrigin(0.5);
    this.instructions = this.add.dynamicBitmapText(this.cameras.main.width/2, this.cameras.main.height / 2, 'default', '', 90).setOrigin(0.5);
    this.instructions.setAlpha(0.7);

    this.play = this.add.dynamicBitmapText(this.cameras.main.width / 2, this.cameras.main.height / 2 + 150, 'default', '', 35).setOrigin(0.5);
    this.play.setAlpha(0.7);

    const onResize = () => {
      this.instructions.x = this.cameras.main.width / 2;
      this.instructions.y = this.cameras.main.height / 2;
      this.play.x = this.cameras.main.width / 2;
      this.play.y = this.cameras.main.height / 2 + 150;
    }
  
    window.addEventListener('resize', onResize.bind(this));


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
        "Dasher"
      ]);

      this.lastUpdate = time;
    }
  }
}