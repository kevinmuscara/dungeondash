import Phaser from "phaser";
import Graphics from "../assets/Graphics";
import FOVLayer from "../entities/FOVLayer";
import Player from "../entities/Player";
import Slime from "../entities/Slime";
import Map from "../entities/Map";
import Heart from '../entities/Heart';
import Coin from '../entities/Coin';
import Potion from '../entities/Potion';
import Chest from '../entities/Chest';
import Fonts from "../assets/Fonts";
import eventsCenter from "../EventCenter";

const worldTileHeight = 81;
const worldTileWidth = 81;

export default class DungeonScene extends Phaser.Scene {
  lastUpdate?: number;
  coinsCollected: number;
  chestsCollected: number;
  potionsCollected: number;
  slimesKilled: number;
  heartsCollected: number;
  lives: number;
  score: number;
  lastX: number;
  lastY: number;
  player: Player | null;
  chests: Chest[];
  chestGroup: Phaser.GameObjects.Group | null;
  potions: Potion[];
  potionGroup: Phaser.GameObjects.Group | null;
  coins: Coin[];
  coinGroup: Phaser.GameObjects.Group | null;
  hearts: Heart[];
  heartGroup: Phaser.GameObjects.Group | null;
  slimes: Slime[];
  slimeGroup: Phaser.GameObjects.Group | null;
  fov: FOVLayer | null;
  tilemap: Phaser.Tilemaps.Tilemap | null;
  roomDebugGraphics?: Phaser.GameObjects.Graphics;
  instructions?: Phaser.GameObjects.DynamicBitmapText;
  scoreText?: Phaser.GameObjects.DynamicBitmapText;
  livesText?: Phaser.GameObjects.DynamicBitmapText;
  map?: Map;
  totalSlimes?: number;

  preload(): void {
    this.load.bitmapFont('default', ...Fonts.default);
    this.load.image(Graphics.environment.name, Graphics.environment.file);
    this.load.image(Graphics.util.name, Graphics.util.file);
    this.load.spritesheet(Graphics.player.name, Graphics.player.file, {
      frameHeight: Graphics.player.height,
      frameWidth: Graphics.player.width
    });

    this.load.spritesheet(Graphics.potion.name, Graphics.potion.file, {
      frameHeight: Graphics.potion.height,
      frameWidth: Graphics.potion.width
    });

    this.load.spritesheet(Graphics.coin.name, Graphics.coin.file, {
      frameHeight: Graphics.coin.height,
      frameWidth: Graphics.coin.width
    });

    this.load.spritesheet(Graphics.chest.name, Graphics.chest.file, {
      frameHeight: Graphics.chest.height,
      frameWidth: Graphics.chest.width
    });

    this.load.spritesheet(Graphics.heart.name, Graphics.heart.file, {
      frameHeight: Graphics.heart.height,
      frameWidth: Graphics.heart.width
    });

    this.load.spritesheet(Graphics.slime.name, Graphics.slime.file, {
      frameHeight: Graphics.slime.height,
      frameWidth: Graphics.slime.width
    });
  }

  constructor() {
    super("DungeonScene");
    this.lastX = -1;
    this.lastY = -1;
    this.player = null;
    this.fov = null;
    this.tilemap = null;
    this.chests = [];
    this.chestGroup = null;
    this.potions = [];
    this.potionGroup = null;
    this.coins = [];
    this.coinGroup = null;
    this.hearts = [];
    this.heartGroup = null;
    this.slimes = [];
    this.slimeGroup = null;
    this.score = 0;
    this.lives = 5;
    this.coinsCollected = 0;
    this.slimesKilled = 0;
    this.heartsCollected = 0;
    this.chestsCollected = 0;
    this.potionsCollected = 0;
  }

  chestPlayerCollide(_: Phaser.GameObjects.GameObject, chestSprite: Phaser.GameObjects.GameObject) {
    const chest = this.chests.find(c => c.sprite === chestSprite);
    if(!chest) {
      console.log('missing chest for chest collision');
      return;
    }

    this.score += 10;
    this.chestsCollected += 1;

    this.chests = this.chests.filter(c => c != chest);
    chest.collect();
    return true;
  }

  potionPlayerCollide(_: Phaser.GameObjects.GameObject, potionSprite: Phaser.GameObjects.GameObject) {
    const potion = this.potions.find(p => p.sprite === potionSprite);
    if(!potion) {
      console.log('missing potion for potion collision');
      return;
    }

    this.potionsCollected += 1;

    this.potions = this.potions.filter(p => p != potion);

    this.fov!.layer.setVisible(!this.fov!.layer.visible);
    setTimeout(() => {
      this.fov!.layer.setVisible(!this.fov!.layer.visible);
    }, 2500);

    potion.collect();
    return true;
  }

  coinPlayerCollide(_: Phaser.GameObjects.GameObject, coinSprite: Phaser.GameObjects.GameObject) {
    const coin = this.coins.find(c => c.sprite === coinSprite);
    if(!coin) {
      console.log('missing coin for coin collision');
      return;
    }

    this.coinsCollected += 1;
    this.score += 1;

    this.coins = this.coins.filter(c => c != coin);
    coin.collect();
    return true;
  }

  heartPlayerCollide(_: Phaser.GameObjects.GameObject, heartSprite: Phaser.GameObjects.GameObject) {
    const heart = this.hearts.find(h => h.sprite === heartSprite);
    if(!heart) {
      console.log('missing heart for heart collision');
      return;
    }

    this.heartsCollected += 1;
    this.lives += 1;

    this.hearts = this.hearts.filter(h => h != heart);
    heart.collect();
    return true;
  }

  slimePlayerCollide(
    _: Phaser.GameObjects.GameObject,
    slimeSprite: Phaser.GameObjects.GameObject
  ) {
    const slime = this.slimes.find(s => s.sprite === slimeSprite);
    if (!slime) {
      console.log("Missing slime for sprite collision!");
      return;
    }

    if (this.player!.isAttacking()) {
      this.slimes = this.slimes.filter(s => s != slime);
      slime.kill();
      this.totalSlimes! -= 1;
      this.score += 1;
      this.slimesKilled += 1;

      return false;
    } else {
      this.lives -= 1;
      this.player!.stagger();
      return true;
    }
  }

  create(): void {
    this.instructions = this.add.dynamicBitmapText(15, 25, "default", "", 15);
    this.instructions.setAlpha(0.7);

    this.scoreText = this.add.dynamicBitmapText(15, 85, "default", "", 15);
    this.scoreText.setAlpha(0.7);

    this.livesText = this.add.dynamicBitmapText(15, 112, "default", "", 15);
    this.livesText.setAlpha(0.7);

    this.lastUpdate = 0;

    this.events.on("wake", () => {
      this.lives = 5;
      this.score = 0;
      this.scene.run("InfoScene");
    });

    Object.values(Graphics.player.animations).forEach(anim => {
      if (!this.anims.get(anim.key)) {
        this.anims.create({
          ...anim,
          frames: this.anims.generateFrameNumbers(
            Graphics.player.name,
            anim.frames
          )
        });
      }
    });

    Object.values(Graphics.slime.animations).forEach(anim => {
      if (!this.anims.get(anim.key)) {
        this.anims.create({
          ...anim,
          frames: this.anims.generateFrameNumbers(
            Graphics.slime.name,
            anim.frames
          )
        });
      }
    });

    this.map = new Map(worldTileWidth, worldTileHeight, this);
    this.tilemap = this.map.tilemap;

    this.totalSlimes = this.map!.slimes.length;

    this.fov = new FOVLayer(this.map);

    this.player = new Player(
      this.tilemap.tileToWorldX(this.map.startingX),
      this.tilemap.tileToWorldY(this.map.startingY),
      this
    );

    this.chests = this.map.chests;
    this.chestGroup = this.physics.add.group(this.chests.map(c => c.sprite));

    this.potions = this.map.potions;
    this.potionGroup = this.physics.add.group(this.potions.map(p => p.sprite));

    this.coins = this.map.coins;
    this.coinGroup = this.physics.add.group(this.coins.map(c => c.sprite));

    this.hearts = this.map.hearts;
    this.heartGroup = this.physics.add.group(this.hearts.map(h => h.sprite));

    this.slimes = this.map.slimes;
    this.slimeGroup = this.physics.add.group(this.slimes.map(s => s.sprite));

    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(3);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.width * Graphics.environment.width, 
      this.map.height * Graphics.environment.height
    );
    this.cameras.main.startFollow(this.player.sprite);

    this.physics.add.collider(this.player.sprite, this.map.wallLayer);
    this.physics.add.collider(this.chestGroup, this.map.wallLayer);

    this.physics.add.collider(this.player.sprite, this.map.doorLayer);
    this.physics.add.collider(this.chestGroup, this.map.doorLayer);

    this.physics.add.collider(this.player.sprite, this.map.wallLayer);
    this.physics.add.collider(this.coinGroup, this.map.wallLayer);

    this.physics.add.collider(this.player.sprite, this.map.doorLayer);
    this.physics.add.collider(this.coinGroup, this.map.doorLayer);

    this.physics.add.collider(this.player.sprite, this.map.wallLayer);
    this.physics.add.collider(this.potionGroup, this.map.wallLayer);

    this.physics.add.collider(this.player.sprite, this.map.doorLayer);
    this.physics.add.collider(this.potionGroup, this.map.doorLayer);

    this.physics.add.collider(this.player.sprite, this.map.wallLayer);
    this.physics.add.collider(this.heartGroup, this.map.wallLayer);

    this.physics.add.collider(this.player.sprite, this.map.doorLayer);
    this.physics.add.collider(this.heartGroup, this.map.doorLayer);

    this.physics.add.collider(this.player.sprite, this.map.wallLayer);
    this.physics.add.collider(this.slimeGroup, this.map.wallLayer);

    this.physics.add.collider(this.player.sprite, this.map.doorLayer);
    this.physics.add.collider(this.slimeGroup, this.map.doorLayer);

    this.physics.add.collider(
      this.player.sprite,
      this.slimeGroup,
      undefined,
      this.slimePlayerCollide,
      this
    );

    this.physics.add.collider(
      this.player.sprite,
      this.potionGroup,
      undefined,
      this.potionPlayerCollide,
      this
    );

    this.physics.add.collider(
      this.player.sprite,
      this.chestGroup,
      undefined,
      this.chestPlayerCollide,
      this
    );

    this.physics.add.collider(
      this.player.sprite,
      this.coinGroup,
      undefined,
      this.coinPlayerCollide,
      this
    );

    this.physics.add.collider(
      this.player.sprite,
      this.heartGroup,
      undefined,
      this.heartPlayerCollide,
      this
    );

    this.roomDebugGraphics = this.add.graphics({ x: 0, y: 0 });
    this.roomDebugGraphics.setVisible(false);
    this.roomDebugGraphics.lineStyle(2, 0xff5500, 0.5);
    for (let room of this.map.rooms) {
      this.roomDebugGraphics.strokeRect(
        this.tilemap!.tileToWorldX(room.x),
        this.tilemap!.tileToWorldY(room.y),
        this.tilemap!.tileToWorldX(room.width),
        this.tilemap!.tileToWorldY(room.height)
      );
    }

    this.scene.run("InfoScene");
  }

  update(time: number, delta: number) {
    this.player!.update(time);

    if(this.totalSlimes === 0 || this.totalSlimes! < 0) {
      this.scene.stop();
      this.scene.stop('InfoScene');
      this.scene.run('WinScene', {
        score: this.score,
        coins: this.coinsCollected,
        potions: this.potionsCollected,
        hearts: this.heartsCollected,
        slimes: this.slimesKilled,
        chests: this.chestsCollected
      });
      this.score = 0;
      this.lives = 5;
    }

    if(this.lives === 0 || this.lives < 0) {
      this.scene.stop();
      this.scene.stop("InfoScene");
      this.scene.run('GameOver', { 
        score: this.score,
        coins: this.coinsCollected,
        potions: this.potionsCollected,
        hearts: this.heartsCollected,
        slimes: this.slimesKilled,
        chests: this.chestsCollected
      });
      this.score = 0;
      this.lives = 5;
    }

    const camera = this.cameras.main;

    eventsCenter.emit('update-data', {score: this.score, lives: this.lives, slimes: this.totalSlimes });
  
    for (let chest of this.chests) {
      chest.update(time);
    }

    for (let coin of this.coins) {
      coin.update(time);
    }

    for (let potion of this.potions) {
      potion.update(time);
    }

    for (let heart of this.hearts) {
      heart.update(time);
    }

    for (let slime of this.slimes) {
      slime.update(time);
    }

    const player = new Phaser.Math.Vector2({
      x: this.tilemap!.worldToTileX(this.player!.sprite.body.x),
      y: this.tilemap!.worldToTileY(this.player!.sprite.body.y)
    });

    const bounds = new Phaser.Geom.Rectangle(
      this.tilemap!.worldToTileX(camera.worldView.x) - 1,
      this.tilemap!.worldToTileY(camera.worldView.y) - 1,
      this.tilemap!.worldToTileX(camera.worldView.width) + 2,
      this.tilemap!.worldToTileX(camera.worldView.height) + 2
    );

    this.fov!.update(player, bounds, delta);
  }
}