export type Ease = (t: number) => number;

export const easeOutCubic: Ease = (t) => 1 - (1 - t) ** 3;
export const easeInOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const easeOutBack: Ease = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

type Running = {
  elapsed: number;
  duration: number;
  step: (k: number) => void;
  ease: Ease;
  resolve: () => void;
};

/**
 * Game-clock tweens. Everything that waits in the table flow (animations, bot
 * thinking, banners) goes through here so pause, speed-up and test hooks all
 * control one clock.
 */
export class Tweens {
  speed = 1;
  private running: Running[] = [];

  to(duration: number, step: (k: number) => void, ease: Ease = easeOutCubic): Promise<void> {
    return new Promise((resolve) => {
      if (duration <= 0) {
        step(1);
        resolve();
        return;
      }
      this.running.push({ elapsed: 0, duration, step, ease, resolve });
    });
  }

  wait(seconds: number): Promise<void> {
    return this.to(seconds, () => undefined);
  }

  update(delta: number): void {
    if (!this.running.length) return;
    const dt = delta * this.speed;
    const done: Running[] = [];
    for (const tween of this.running) {
      tween.elapsed += dt;
      const k = Math.min(1, tween.elapsed / tween.duration);
      tween.step(tween.ease(k));
      if (k >= 1) done.push(tween);
    }
    if (done.length) {
      this.running = this.running.filter((t) => !done.includes(t));
      for (const t of done) t.resolve();
    }
  }

  /** Finish everything immediately (used when leaving a table mid-animation). */
  flush(): void {
    const pending = this.running;
    this.running = [];
    for (const t of pending) {
      t.step(1);
      t.resolve();
    }
  }
}
