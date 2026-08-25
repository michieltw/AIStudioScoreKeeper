import '@testing-library/jest-dom';
import { vi } from 'vitest';

window.HTMLMediaElement.prototype.play = vi.fn().mockReturnValue(Promise.resolve());
window.HTMLMediaElement.prototype.pause = vi.fn();
