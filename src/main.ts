import Phaser from "phaser";
import ReferenceScene from "./scenes/ReferenceScene";
import DungeonScene from "./scenes/DungeonScene";
import InfoScene from "./scenes/InfoScene";
import GameOver from "./scenes/GameOver";
import StartScene from './scenes/StartScene';
import WinScene from "./scenes/WinScene";

new Phaser.Game({
  type: Phaser.WEBGL,
  width: window.innerWidth,
  height: window.innerHeight,
  render: { pixelArt: true },
  physics: { default: "arcade", arcade: { debug: false, gravity: { y: 0 } } },
  scene: [StartScene, DungeonScene, InfoScene, ReferenceScene, GameOver, WinScene],
  scale: {
    mode: Phaser.Scale.RESIZE
  }
});


