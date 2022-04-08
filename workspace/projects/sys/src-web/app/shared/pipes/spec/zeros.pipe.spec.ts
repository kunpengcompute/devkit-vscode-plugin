import { ZerosPipe } from '../zeros.pipe';

describe('ZerosPipe', () => {
  it('create an instance', () => {
    const pipe = new ZerosPipe();
    expect(pipe).toBeTruthy();
  });
});
