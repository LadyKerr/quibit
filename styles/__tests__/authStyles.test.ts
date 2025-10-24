/**
 * @jest-environment node
 */
import { authStyles } from '../authStyles';

describe('Auth Styles', () => {
  it('should have all required style keys', () => {
    const requiredKeys = [
      'container',
      'logo',
      'title',
      'subtitle',
      'formContainer',
      'label',
      'input',
      'button',
      'buttonDisabled',
      'buttonText',
    ];

    requiredKeys.forEach(key => {
      expect(authStyles).toHaveProperty(key);
    });
  });

  it('should have consistent button styling', () => {
    expect(authStyles.button.backgroundColor).toBe('#4B7BEC');
    expect(authStyles.buttonDisabled.backgroundColor).toBe('#A5B1C2');
  });

  it('should have consistent spacing', () => {
    expect(authStyles.container.padding).toBe(24);
  });

  it('should have proper input styling', () => {
    expect(authStyles.input.backgroundColor).toBe('#f5f5f5');
    expect(authStyles.input.borderRadius).toBe(12);
  });

  it('should have centered title', () => {
    expect(authStyles.title.textAlign).toBe('center');
    expect(authStyles.subtitle.textAlign).toBe('center');
  });

  it('should have proper logo dimensions', () => {
    expect(authStyles.logo.width).toBe(120);
    expect(authStyles.logo.height).toBe(120);
  });
});
