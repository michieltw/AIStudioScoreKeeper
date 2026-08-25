import '@testing-library/jest-dom'
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
