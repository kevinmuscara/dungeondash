import Phaser from 'phaser'
import Graphics from '../assets/Graphics';

export default class Chest {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly body: Phaser.Physics.Arcade.Body;

  constructor(x: number, y: number, scene: Phaser.Scene) {
    this.sprite = scene.physics.add.sprite(x, y, Graphics.chest.name, 0);
    this.sprite.setSize(10, 10);
    this.sprite.setDepth(10);

    this.body = <Phaser.Physics.Arcade.Body>this.sprite.body;
    this.body.bounce.set(0, 0);
    this.body.setImmovable(true);
  }

  update(_time: number) {
    this.body.setVelocity(0);
  }

  collect() {
    this.sprite.destroy();
  }
}
