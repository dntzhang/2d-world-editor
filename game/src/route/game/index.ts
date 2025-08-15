import * as PIXI from 'pixi.js'
import { animate } from 'popmotion'
import { stage, screen, ticker } from '~/core'

import { spriteSheet } from './attack'

let root: PIXI.Container
let fishes: Fish[] = []

const bound = screen.clone().pad(100)
const { max, random, PI, sin, cos } = Math

interface Fish extends PIXI.Sprite {
  speed: number
  direction: number
  turnSpeed: number
}


function init() {
  root = new PIXI.Container()

  const bed = PIXI.Sprite.from('bkg.jpg')
  bed.zIndex = -1
  bed.scale.set(max(screen.width / bed.width, screen.height / bed.height))

  const baseTexture = PIXI.BaseTexture.from('swordsman_lvl1_attack_full.png');

  const frames = []
  for (let i = 0; i < 8; i++) {
    const frame = spriteSheet.frames['ab' + i].frame
    const rect = new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h);
    const subTexture = new PIXI.Texture(baseTexture, rect); // 创建子纹理
    frames.push(subTexture)
  }

  const animatedSprite = new PIXI.AnimatedSprite(frames)
  animatedSprite.x = 350
  animatedSprite.y = 100
  animatedSprite.scale.x = 3
  animatedSprite.scale.y = 3
  animatedSprite.animationSpeed = 0.5;
  animatedSprite.play();
  root.addChild(animatedSprite);


  /* 水面 */
  const overlay = PIXI.TilingSprite.from('overlay.png', { width: screen.width, height: screen.height })
  overlay.zIndex = 1

  /* 潭中鱼可百许头 */
  for (let i = 0; i < 16; i++) {
    const fish = PIXI.Sprite.from(`fish.${i % 4 + 1}.png`) as Fish
    fish.anchor.set(.5)
    fish.scale.set(.5)

    fish.speed = (1 + random()) * 2
    fish.direction = random() * PIXI.PI_2
    fish.turnSpeed = random() - .8

    fish.position.set(random() * screen.width, random() * screen.height)
    fish.anchor.set(.5)

    fishes.push(fish)
  }

  root.addChild(overlay, bed, ...fishes)

  ticker.add(() => {
    for (const fish of fishes) {
      fish.direction += fish.turnSpeed * .01
      fish.direction %= PIXI.PI_2
      fish.rotation = fish.direction
      fish.x -= cos(fish.rotation) * fish.speed
      fish.y -= sin(fish.rotation) * fish.speed

      fish.x < bound.left ? fish.x = bound.right :
        fish.x > bound.right ? fish.x = bound.left : 0

      fish.y < bound.top ? fish.y = bound.bottom :
        fish.y > bound.bottom ? fish.y = bound.top : 0
    }


    overlay.tilePosition.x -= 1
    overlay.tilePosition.y -= 1

    overlay.tilePosition.x %= 512
    overlay.tilePosition.y %= 512
  })
}

export function show() {
  if (!root) init()
  stage.addChild(root)
  root.alpha = 0
  animate({
    from: 0,
    to: 1,
    duration: 1e3,
    onUpdate: v => root.alpha = v
  })
}

export function hide() {
  stage.removeChild(root)
}
