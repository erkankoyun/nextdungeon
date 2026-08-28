(() => {
  const WORLD_W = 1280;
  const WORLD_H = 720;
  const state = {
    started: false,
    paused: false,
    muted: false,
    left: false,
    right: false,
    jumpQueued: false,
    attackQueued: false,
    score: 0,
    hp: 3,
    won: false
  };

  let game;
  let sceneRef;

  class DungeonDemo extends Phaser.Scene {
    constructor() {
      super('DungeonDemo');
      this.player = null;
      this.platforms = [];
      this.enemies = [];
      this.coins = [];
      this.keys = null;
      this.vx = 0;
      this.vy = 0;
      this.grounded = false;
      this.facing = 1;
      this.invulnerableUntil = 0;
      this.attackUntil = 0;
      this.hudText = null;
      this.messageText = null;
      this.door = null;
    }

    create() {
      sceneRef = this;
      this.cameras.main.setBackgroundColor('#071126');

      const bg = this.add.graphics();
      bg.fillStyle(0x071126, 1);
      bg.fillRect(0, 0, WORLD_W, WORLD_H);
      bg.fillStyle(0x0d1b33, 1);
      for (let y = 72; y < WORLD_H; y += 48) {
        for (let x = (Math.floor(y / 48) % 2) * 24; x < WORLD_W; x += 72) {
          bg.fillRect(x, y, 68, 3);
        }
      }
      bg.fillStyle(0x102947, 1);
      for (let x = 0; x < WORLD_W; x += 160) bg.fillRect(x, 0, 6, WORLD_H);

      this.add.circle(1100, 120, 80, 0x183c68, 0.5);
      this.add.circle(1100, 120, 48, 0x8ecbff, 0.5);

      this.platforms = [
        this.makePlatform(640, 690, 1280, 60),
        this.makePlatform(270, 545, 310, 30),
        this.makePlatform(650, 455, 300, 30),
        this.makePlatform(1015, 355, 310, 30),
        this.makePlatform(760, 610, 190, 24)
      ];

      this.player = this.add.container(150, 620);
      const cloak = this.add.rectangle(0, 5, 38, 48, 0x176be0).setStrokeStyle(3, 0x75bdff);
      const face = this.add.rectangle(0, -11, 22, 17, 0xf4c38c);
      const hood = this.add.rectangle(0, -20, 30, 12, 0x071225);
      const sword = this.add.rectangle(24, 0, 30, 5, 0xcdeeff).setOrigin(0, 0.5);
      this.player.add([cloak, face, hood, sword]);
      this.player.setDepth(5);
      this.player.bodyW = 36;
      this.player.bodyH = 50;
      this.player.sword = sword;

      this.enemies.push(this.makeEnemy(485, 625, 390, 580));
      this.enemies.push(this.makeEnemy(700, 405, 590, 750));
      this.enemies.push(this.makeEnemy(1040, 305, 910, 1160));

      this.coins.push(this.makeCoin(310, 500));
      this.coins.push(this.makeCoin(650, 410));
      this.coins.push(this.makeCoin(780, 565));
      this.coins.push(this.makeCoin(1080, 310));

      this.door = this.add.container(1180, 625);
      const portalOuter = this.add.rectangle(0, 0, 56, 102, 0x142846).setStrokeStyle(6, 0xff9f00);
      const portalInner = this.add.rectangle(0, 5, 35, 78, 0x3b1b64);
      this.door.add([portalOuter, portalInner]);
      this.door.setDepth(2);

      this.hudText = this.add.text(22, 18, '', {
        fontFamily: 'monospace',
        fontSize: '23px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 5
      }).setDepth(20);

      this.messageText = this.add.text(WORLD_W / 2, 80, 'Defeat all monsters and reach the portal', {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#ffd166',
        backgroundColor: '#061126cc',
        padding: { x: 14, y: 8 }
      }).setOrigin(0.5).setDepth(20);

      this.keys = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        up: Phaser.Input.Keyboard.KeyCodes.UP,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        w: Phaser.Input.Keyboard.KeyCodes.W,
        z: Phaser.Input.Keyboard.KeyCodes.Z,
        x: Phaser.Input.Keyboard.KeyCodes.X,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        r: Phaser.Input.Keyboard.KeyCodes.R
      });

      this.refreshHud();
    }

    makePlatform(x, y, w, h) {
      const p = this.add.rectangle(x, y, w, h, 0x132c4d).setStrokeStyle(3, 0x376a9c);
      p.bodyW = w;
      p.bodyH = h;
      return p;
    }

    makeEnemy(x, y, minX, maxX) {
      const enemy = this.add.container(x, y);
      const body = this.add.rectangle(0, 0, 42, 46, 0x8e1d2c).setStrokeStyle(3, 0xff5b5b);
      const eye1 = this.add.rectangle(-9, -8, 6, 6, 0xffe070);
      const eye2 = this.add.rectangle(9, -8, 6, 6, 0xffe070);
      enemy.add([body, eye1, eye2]);
      enemy.minX = minX;
      enemy.maxX = maxX;
      enemy.dir = 1;
      enemy.alive = true;
      enemy.bodyW = 42;
      enemy.bodyH = 46;
      enemy.speed = 70 + Math.random() * 25;
      enemy.setDepth(4);
      return enemy;
    }

    makeCoin(x, y) {
      const coin = this.add.circle(x, y, 12, 0xffc928).setStrokeStyle(3, 0xfff0a3);
      coin.collected = false;
      this.tweens.add({ targets: coin, scaleX: 0.55, duration: 450, yoyo: true, repeat: -1 });
      return coin;
    }

    refreshHud() {
      const hearts = '♥'.repeat(Math.max(0, state.hp)) + '♡'.repeat(Math.max(0, 3 - state.hp));
      const alive = this.enemies.filter(e => e.alive).length;
      this.hudText.setText(`HP ${hearts}   COINS ${state.score}   ENEMIES ${alive}`);
      if (alive === 0 && !state.won) {
        this.messageText.setText('Portal unlocked — reach the door!');
        this.door.list[1].setFillStyle(0x25d4ff);
      }
    }

    update(time, delta) {
      if (!state.started || state.paused || state.won) return;

      const dt = Math.min(delta / 1000, 0.035);
      const leftDown = state.left || this.keys.left.isDown || this.keys.a.isDown;
      const rightDown = state.right || this.keys.right.isDown || this.keys.d.isDown;
      const jumpPressed = state.jumpQueued || Phaser.Input.Keyboard.JustDown(this.keys.up) || Phaser.Input.Keyboard.JustDown(this.keys.w) || Phaser.Input.Keyboard.JustDown(this.keys.x) || Phaser.Input.Keyboard.JustDown(this.keys.space);
      const attackPressed = state.attackQueued || Phaser.Input.Keyboard.JustDown(this.keys.z);

      state.jumpQueued = false;
      state.attackQueued = false;

      if (Phaser.Input.Keyboard.JustDown(this.keys.r)) this.resetRun();

      const speed = 300;
      this.vx = 0;
      if (leftDown) { this.vx = -speed; this.facing = -1; }
      if (rightDown) { this.vx = speed; this.facing = 1; }

      if (jumpPressed && this.grounded) {
        this.vy = -650;
        this.grounded = false;
      }

      if (attackPressed) this.attack(time);

      this.vy += 1650 * dt;
      const prevY = this.player.y;
      const nextX = Phaser.Math.Clamp(this.player.x + this.vx * dt, 22, WORLD_W - 22);
      let nextY = this.player.y + this.vy * dt;
      this.grounded = false;

      const halfW = this.player.bodyW / 2;
      const halfH = this.player.bodyH / 2;
      const prevBottom = prevY + halfH;
      const nextBottom = nextY + halfH;

      for (const p of this.platforms) {
        const top = p.y - p.bodyH / 2;
        const left = p.x - p.bodyW / 2;
        const right = p.x + p.bodyW / 2;
        const horizontal = nextX + halfW > left && nextX - halfW < right;
        if (this.vy >= 0 && horizontal && prevBottom <= top + 8 && nextBottom >= top) {
          nextY = top - halfH;
          this.vy = 0;
          this.grounded = true;
        }
      }

      this.player.x = nextX;
      this.player.y = nextY;
      this.player.scaleX = this.facing;

      if (time > this.attackUntil) this.player.sword.setFillStyle(0xcdeeff);

      if (this.player.y > WORLD_H + 80) {
        this.damagePlayer(time, true);
      }

      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        enemy.x += enemy.dir * enemy.speed * dt;
        if (enemy.x < enemy.minX) { enemy.x = enemy.minX; enemy.dir = 1; }
        if (enemy.x > enemy.maxX) { enemy.x = enemy.maxX; enemy.dir = -1; }
        if (this.overlap(this.player, enemy, 32, 42, 38, 42) && time > this.attackUntil) {
          this.damagePlayer(time, false);
        }
      }

      for (const coin of this.coins) {
        if (coin.collected) continue;
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, coin.x, coin.y) < 42) {
          coin.collected = true;
          coin.destroy();
          state.score += 1;
          this.refreshHud();
        }
      }

      const aliveCount = this.enemies.filter(e => e.alive).length;
      if (aliveCount === 0 && this.player.x > 1135 && this.player.y > 535) {
        this.win();
      }
    }

    overlap(a, b, aw, ah, bw, bh) {
      return Math.abs(a.x - b.x) < (aw + bw) / 2 && Math.abs(a.y - b.y) < (ah + bh) / 2;
    }

    attack(time) {
      this.attackUntil = time + 170;
      this.player.sword.setFillStyle(0xffd23d);
      const attackX = this.player.x + this.facing * 58;
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        if (Math.abs(enemy.y - this.player.y) < 64 && Math.abs(enemy.x - attackX) < 70) {
          enemy.alive = false;
          enemy.setVisible(false);
          state.score += 2;
          this.cameras.main.shake(70, 0.003);
        }
      }
      this.refreshHud();
    }

    damagePlayer(time, fell) {
      if (time < this.invulnerableUntil) return;
      state.hp -= 1;
      this.invulnerableUntil = time + 900;
      this.cameras.main.shake(120, 0.008);
      if (state.hp <= 0) {
        this.resetRun();
        return;
      }
      this.player.x = 150;
      this.player.y = 620;
      this.vx = 0;
      this.vy = fell ? 0 : -220;
      this.refreshHud();
    }

    win() {
      state.won = true;
      this.messageText.setText(`DUNGEON CLEARED!  SCORE ${state.score}  —  Press R to replay`);
      this.messageText.setFontSize(26);
      this.messageText.setColor('#7dffb2');
      this.cameras.main.flash(350, 100, 230, 255);
      this.input.keyboard.once('keydown-R', () => this.resetRun());
    }

    resetRun() {
      state.score = 0;
      state.hp = 3;
      state.won = false;
      this.scene.restart();
    }
  }

  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: WORLD_W,
    height: WORLD_H,
    backgroundColor: '#071126',
    pixelArt: true,
    antialias: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: WORLD_W,
      height: WORLD_H
    },
    scene: DungeonDemo
  };

  game = new Phaser.Game(config);

  const startPanel = document.getElementById('start-panel');
  document.getElementById('start-game').addEventListener('click', () => {
    state.started = true;
    startPanel.classList.add('hidden');
    if (sceneRef) sceneRef.input.keyboard.enabled = true;
  });

  const bindHold = (id, prop) => {
    const btn = document.getElementById(id);
    const on = (event) => { event.preventDefault(); state[prop] = true; btn.classList.add('pressed'); };
    const off = (event) => { event.preventDefault(); state[prop] = false; btn.classList.remove('pressed'); };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointercancel', off);
    btn.addEventListener('pointerleave', off);
  };

  bindHold('left-btn', 'left');
  bindHold('right-btn', 'right');

  document.getElementById('jump-btn').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    state.jumpQueued = true;
  });

  document.getElementById('attack-btn').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    state.attackQueued = true;
  });

  const pauseBtn = document.getElementById('pause-btn');
  pauseBtn.addEventListener('click', () => {
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? '▶' : 'Ⅱ';
    document.querySelector('.game-frame').classList.toggle('game-paused', state.paused);
  });

  const soundBtn = document.getElementById('sound-btn');
  soundBtn.addEventListener('click', () => {
    state.muted = !state.muted;
    soundBtn.textContent = state.muted ? '🔇' : '🔊';
  });

  document.getElementById('fullscreen-btn').addEventListener('click', () => {
    if (game.scale.isFullscreen) game.scale.stopFullscreen();
    else game.scale.startFullscreen();
  });
})();
