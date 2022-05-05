import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

export class TransparentWindow extends BrowserWindow {
  constructor() {
    const options:BrowserWindowConstructorOptions = {
      movable: true,
      alwaysOnTop: true,
      frame: false,
      transparent: true,
      zoomToPageWidth: true,
    }
    super(options);
  }
}