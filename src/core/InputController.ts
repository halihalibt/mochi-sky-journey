export interface ControlState {
  moveForward: number;
  moveRadial: number;
  flightPitch: number;
  jumpBuffered: boolean;
}

export class InputController {
  private keys = new Set<string>();
  private touchVector = { x: 0, y: 0 };
  private jumpBufferTimer = 0;
  private readonly JUMP_BUFFER_WINDOW = 0.15;

  private touchContainer!: HTMLElement;
  private joystickKnob!: HTMLElement;
  private joystickActive = false;
  private joystickOrigin = { x: 0, y: 0 };

  private onPauseToggle?: () => void;

  constructor(onPauseToggle?: () => void) {
    this.onPauseToggle = onPauseToggle;
    this.bindKeyboardEvents();
    this.createMobileTouchControls();
  }

  private bindKeyboardEvents(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code === 'Space' || e.code === 'KeyK') {
        this.jumpBufferTimer = this.JUMP_BUFFER_WINDOW;
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        this.onPauseToggle?.();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.touchVector = { x: 0, y: 0 };
    });
  }

  private createMobileTouchControls(): void {
    this.touchContainer = document.createElement('div');
    this.touchContainer.id = 'mochi-touch-controls';
    this.touchContainer.style.cssText = [
      'position: fixed;',
      'inset: 0;',
      'pointer-events: none;',
      'z-index: 40;',
      'display: flex;',
      'justify-content: space-between;',
      'align-items: flex-end;',
      'padding: 28px 32px;',
      'user-select: none;',
      '-webkit-user-select: none;'
    ].join(' ');

    const joystickBase = document.createElement('div');
    joystickBase.style.cssText = [
      'width: 128px;',
      'height: 128px;',
      'border-radius: 50%;',
      'background: rgba(15, 23, 42, 0.55);',
      'border: 2px solid rgba(25, 230, 255, 0.45);',
      'box-shadow: 0 0 20px rgba(25, 230, 255, 0.2);',
      'position: relative;',
      'pointer-events: auto;',
      'touch-action: none;'
    ].join(' ');

    this.joystickKnob = document.createElement('div');
    this.joystickKnob.style.cssText = [
      'width: 54px;',
      'height: 54px;',
      'border-radius: 50%;',
      'background: radial-gradient(circle, #19e6ff 0%, #a624f2 100%);',
      'position: absolute;',
      'left: 37px;',
      'top: 37px;',
      'transition: transform 0.04s linear;'
    ].join(' ');
    joystickBase.appendChild(this.joystickKnob);

    const jumpBtn = document.createElement('button');
    jumpBtn.type = 'button';
    jumpBtn.textContent = 'JUMP';
    jumpBtn.style.cssText = [
      'width: 96px;',
      'height: 96px;',
      'border-radius: 50%;',
      'background: linear-gradient(135deg, rgba(166, 36, 242, 0.8), rgba(25, 230, 255, 0.8));',
      'border: 2px solid #ffffff;',
      'color: #ffffff;',
      'font-weight: 800;',
      'font-size: 16px;',
      'letter-spacing: 1px;',
      'box-shadow: 0 0 24px rgba(166, 36, 242, 0.5);',
      'pointer-events: auto;',
      'touch-action: none;'
    ].join(' ');

    const maxRadius = 46;
    joystickBase.addEventListener('pointerdown', (e) => {
      this.joystickActive = true;
      const rect = joystickBase.getBoundingClientRect();
      this.joystickOrigin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      joystickBase.setPointerCapture(e.pointerId);
    });

    joystickBase.addEventListener('pointermove', (e) => {
      if (!this.joystickActive) return;
      const dx = e.clientX - this.joystickOrigin.x;
      const dy = e.clientY - this.joystickOrigin.y;
      const dist = Math.hypot(dx, dy);
      const clampedDist = Math.min(dist, maxRadius);
      const angle = Math.atan2(dy, dx);

      const kx = Math.cos(angle) * clampedDist;
      const ky = Math.sin(angle) * clampedDist;
      this.joystickKnob.style.transform = 'translate(' + kx + 'px, ' + ky + 'px)';

      this.touchVector.x = kx / maxRadius;
      this.touchVector.y = -ky / maxRadius;
    });

    const resetJoystick = () => {
      this.joystickActive = false;
      this.touchVector = { x: 0, y: 0 };
      this.joystickKnob.style.transform = 'translate(0px, 0px)';
    };
    joystickBase.addEventListener('pointerup', resetJoystick);
    joystickBase.addEventListener('pointercancel', resetJoystick);

    jumpBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.jumpBufferTimer = this.JUMP_BUFFER_WINDOW;
      jumpBtn.style.transform = 'scale(0.92)';
    });
    jumpBtn.addEventListener('pointerup', () => {
      jumpBtn.style.transform = 'scale(1)';
    });

    this.touchContainer.appendChild(joystickBase);
    this.touchContainer.appendChild(jumpBtn);
    document.body.appendChild(this.touchContainer);

    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 900;
    this.setTouchControlsVisible(isTouchDevice);
  }

  public setTouchControlsVisible(visible: boolean): void {
    this.touchContainer.style.display = visible ? 'flex' : 'none';
  }

  public consumeJumpBuffer(): void {
    this.jumpBufferTimer = 0;
  }

  public update(dt: number): ControlState {
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    let kbX = 0;
    let kbY = 0;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) kbX += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) kbX -= 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) kbY += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) kbY -= 1;

    const forwardInput =
      Math.abs(this.touchVector.x) > 0.08
        ? this.touchVector.x
        : kbX !== 0
        ? kbX
        : kbY;

    const radialInput =
      Math.abs(this.touchVector.y) > 0.12 ? -this.touchVector.y : -kbY;

    return {
      moveForward: Math.max(-1, Math.min(1, forwardInput)),
      moveRadial: Math.max(-1, Math.min(1, radialInput)),
      flightPitch: Math.max(-1, Math.min(1, this.touchVector.y || kbY)),
      jumpBuffered: this.jumpBufferTimer > 0
    };
  }
}
