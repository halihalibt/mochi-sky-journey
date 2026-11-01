import { i18n } from '../i18n/I18nManager';

export interface ControlState {
  moveForward: number;
  moveRadial: number;
  flightPitch: number;
  jumpBuffered: boolean;
  dashBuffered: boolean;
  glideHeld: boolean;
}

export class InputController {
  private keys = new Set<string>();
  private touchVector = { x: 0, y: 0 };

  private jumpBufferTimer = 0;
  private dashBufferTimer = 0;
  private readonly BUFFER_WINDOW = 0.16;

  private touchJumpHeld = false;
  private touchGlideHeld = false;

  private touchContainer!: HTMLElement;
  private joystickKnob!: HTMLElement;
  private jumpBtn!: HTMLButtonElement;
  private dashBtn!: HTMLButtonElement;
  private glideBtn!: HTMLButtonElement;

  private joystickActive = false;
  private joystickPointerId: number | null = null;
  private joystickOrigin = { x: 0, y: 0 };

  private onPauseToggle?: () => void;

  constructor(onPauseToggle?: () => void) {
    this.onPauseToggle = onPauseToggle;
    this.bindKeyboardEvents();
    this.createMobileTouchControls();

    i18n.onChange(() => {
      this.refreshTouchLabels();
    });
  }

  private bindKeyboardEvents(): void {
    window.addEventListener('keydown', (e) => {
      if (!this.keys.has(e.code)) {
        if (e.code === 'Space' || e.code === 'KeyK') {
          this.jumpBufferTimer = this.BUFFER_WINDOW;
        }
        if (
          e.code === 'ShiftLeft' ||
          e.code === 'ShiftRight' ||
          e.code === 'KeyJ' ||
          e.code === 'KeyL'
        ) {
          this.dashBufferTimer = this.BUFFER_WINDOW;
        }
        if (e.code === 'Escape' || e.code === 'KeyP') {
          this.onPauseToggle?.();
        }
      }
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.touchVector = { x: 0, y: 0 };
      this.touchJumpHeld = false;
      this.touchGlideHeld = false;
    });
  }

  private createMobileTouchControls(): void {
    const strings = i18n.getStrings();

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
      'padding: calc(20px + var(--safe-top, 0px)) calc(24px + var(--safe-right, 0px)) calc(24px + var(--safe-bottom, 0px)) calc(24px + var(--safe-left, 0px));',
      'user-select: none;',
      '-webkit-user-select: none;'
    ].join(' ');

    // Left Virtual Joystick
    const joystickBase = document.createElement('div');
    joystickBase.style.cssText = [
      'width: 132px;',
      'height: 132px;',
      'border-radius: 50%;',
      'background: radial-gradient(circle, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.45) 100%);',
      'border: 2px solid rgba(25, 230, 255, 0.48);',
      'box-shadow: 0 0 24px rgba(25, 230, 255, 0.22);',
      'position: relative;',
      'pointer-events: auto;',
      'touch-action: none;'
    ].join(' ');

    this.joystickKnob = document.createElement('div');
    this.joystickKnob.style.cssText = [
      'width: 56px;',
      'height: 56px;',
      'border-radius: 50%;',
      'background: radial-gradient(circle, #19e6ff 0%, #a624f2 100%);',
      'border: 2px solid #ffffff;',
      'position: absolute;',
      'left: 38px;',
      'top: 38px;',
      'box-shadow: 0 0 14px rgba(25, 230, 255, 0.6);',
      'transition: transform 0.03s linear;'
    ].join(' ');
    joystickBase.appendChild(this.joystickKnob);

    // Right Action Cluster (DASH, GLIDE, JUMP)
    const actionCluster = document.createElement('div');
    actionCluster.style.cssText = [
      'display: flex;',
      'align-items: flex-end;',
      'gap: 14px;',
      'pointer-events: none;'
    ].join(' ');

    const subBtnColumn = document.createElement('div');
    subBtnColumn.style.cssText = [
      'display: flex;',
      'flex-direction: column;',
      'gap: 12px;',
      'pointer-events: none;'
    ].join(' ');

    this.glideBtn = document.createElement('button');
    this.glideBtn.type = 'button';
    this.glideBtn.textContent = strings.touchGlide;
    this.glideBtn.style.cssText = [
      'width: 72px;',
      'height: 72px;',
      'border-radius: 50%;',
      'background: linear-gradient(135deg, rgba(14, 165, 233, 0.85), rgba(52, 211, 153, 0.85));',
      'border: 2px solid #a5f3fc;',
      'color: #ffffff;',
      'font-weight: 800;',
      'font-size: 13px;',
      'box-shadow: 0 0 18px rgba(56, 189, 248, 0.45);',
      'pointer-events: auto;',
      'touch-action: none;'
    ].join(' ');

    this.dashBtn = document.createElement('button');
    this.dashBtn.type = 'button';
    this.dashBtn.textContent = strings.touchDash;
    this.dashBtn.style.cssText = [
      'width: 76px;',
      'height: 76px;',
      'border-radius: 50%;',
      'background: linear-gradient(135deg, rgba(245, 158, 11, 0.88), rgba(236, 72, 153, 0.88));',
      'border: 2px solid #fde68a;',
      'color: #ffffff;',
      'font-weight: 800;',
      'font-size: 14px;',
      'box-shadow: 0 0 20px rgba(245, 158, 11, 0.48);',
      'pointer-events: auto;',
      'touch-action: none;'
    ].join(' ');

    this.jumpBtn = document.createElement('button');
    this.jumpBtn.type = 'button';
    this.jumpBtn.textContent = strings.touchJump;
    this.jumpBtn.style.cssText = [
      'width: 98px;',
      'height: 98px;',
      'border-radius: 50%;',
      'background: linear-gradient(135deg, rgba(166, 36, 242, 0.88), rgba(25, 230, 255, 0.88));',
      'border: 2.5px solid #ffffff;',
      'color: #ffffff;',
      'font-weight: 900;',
      'font-size: 16px;',
      'letter-spacing: 0.5px;',
      'box-shadow: 0 0 26px rgba(166, 36, 242, 0.55);',
      'pointer-events: auto;',
      'touch-action: none;'
    ].join(' ');

    subBtnColumn.append(this.glideBtn, this.dashBtn);
    actionCluster.append(subBtnColumn, this.jumpBtn);

    // Joystick Pointer Events
    const maxRadius = 48;
    joystickBase.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.joystickActive = true;
      this.joystickPointerId = e.pointerId;
      const rect = joystickBase.getBoundingClientRect();
      this.joystickOrigin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      joystickBase.setPointerCapture(e.pointerId);
    });

    joystickBase.addEventListener('pointermove', (e) => {
      if (!this.joystickActive || e.pointerId !== this.joystickPointerId) return;
      const dx = e.clientX - this.joystickOrigin.x;
      const dy = e.clientY - this.joystickOrigin.y;
      const dist = Math.hypot(dx, dy);
      const clampedDist = Math.min(dist, maxRadius);
      const angle = Math.atan2(dy, dx);

      const kx = Math.cos(angle) * clampedDist;
      const ky = Math.sin(angle) * clampedDist;
      this.joystickKnob.style.transform =
        'translate(' + kx.toFixed(1) + 'px, ' + ky.toFixed(1) + 'px)';

      this.touchVector.x = kx / maxRadius;
      this.touchVector.y = -ky / maxRadius;
    });

    const resetJoystick = (e: PointerEvent) => {
      if (this.joystickPointerId !== null && e.pointerId !== this.joystickPointerId) {
        return;
      }
      this.joystickActive = false;
      this.joystickPointerId = null;
      this.touchVector = { x: 0, y: 0 };
      this.joystickKnob.style.transform = 'translate(0px, 0px)';
    };
    joystickBase.addEventListener('pointerup', resetJoystick);
    joystickBase.addEventListener('pointercancel', resetJoystick);

    // Jump Button Events (tap jumps, holding in air also glides)
    this.jumpBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.jumpBufferTimer = this.BUFFER_WINDOW;
      this.touchJumpHeld = true;
      this.jumpBtn.style.transform = 'scale(0.92)';
    });
    const endJumpHold = () => {
      this.touchJumpHeld = false;
      this.jumpBtn.style.transform = 'scale(1)';
    };
    this.jumpBtn.addEventListener('pointerup', endJumpHold);
    this.jumpBtn.addEventListener('pointercancel', endJumpHold);
    this.jumpBtn.addEventListener('pointerleave', endJumpHold);

    // Dash Button Events
    this.dashBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.dashBufferTimer = this.BUFFER_WINDOW;
      this.dashBtn.style.transform = 'scale(0.91)';
    });
    const endDashHold = () => {
      this.dashBtn.style.transform = 'scale(1)';
    };
    this.dashBtn.addEventListener('pointerup', endDashHold);
    this.dashBtn.addEventListener('pointercancel', endDashHold);

    // Glide Button Events
    this.glideBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.touchGlideHeld = true;
      this.glideBtn.style.transform = 'scale(0.91)';
    });
    const endGlideHold = () => {
      this.touchGlideHeld = false;
      this.glideBtn.style.transform = 'scale(1)';
    };
    this.glideBtn.addEventListener('pointerup', endGlideHold);
    this.glideBtn.addEventListener('pointercancel', endGlideHold);
    this.glideBtn.addEventListener('pointerleave', endGlideHold);

    this.touchContainer.appendChild(joystickBase);
    this.touchContainer.appendChild(actionCluster);
    document.body.appendChild(this.touchContainer);

    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth < 920;
    this.setTouchControlsVisible(isTouchDevice);
  }

  public refreshTouchLabels(): void {
    const strings = i18n.getStrings();
    if (this.jumpBtn) this.jumpBtn.textContent = strings.touchJump;
    if (this.dashBtn) this.dashBtn.textContent = strings.touchDash;
    if (this.glideBtn) this.glideBtn.textContent = strings.touchGlide;
  }

  public setTouchControlsVisible(visible: boolean): void {
    this.touchContainer.style.display = visible ? 'flex' : 'none';
  }

  public consumeJumpBuffer(): void {
    this.jumpBufferTimer = 0;
  }

  public consumeDashBuffer(): void {
    this.dashBufferTimer = 0;
  }

  public update(dt: number): ControlState {
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }
    if (this.dashBufferTimer > 0) {
      this.dashBufferTimer = Math.max(0, this.dashBufferTimer - dt);
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
        : 0;

    const radialInput =
      Math.abs(this.touchVector.y) > 0.12 ? -this.touchVector.y : -kbY;

    const glideHeld =
      this.keys.has('Space') ||
      this.keys.has('KeyK') ||
      this.keys.has('KeyE') ||
      this.touchJumpHeld ||
      this.touchGlideHeld;

    return {
      moveForward: Math.max(-1, Math.min(1, forwardInput)),
      moveRadial: Math.max(-1, Math.min(1, radialInput)),
      flightPitch: Math.max(-1, Math.min(1, this.touchVector.y || kbY)),
      jumpBuffered: this.jumpBufferTimer > 0,
      dashBuffered: this.dashBufferTimer > 0,
      glideHeld
    };
  }
}
