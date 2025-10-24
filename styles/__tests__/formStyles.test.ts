/**
 * @jest-environment node
 */
import { formStyles } from '../formStyles';

describe('Form Styles', () => {
  it('should have all required style keys', () => {
    const requiredKeys = [
      'form',
      'formTitle',
      'input',
      'inputError',
      'errorText',
      'formButtons',
      'button',
      'buttonDisabled',
      'buttonText',
      'cancelButton',
      'submitButton',
      'fullWidthButton',
    ];

    requiredKeys.forEach(key => {
      expect(formStyles).toHaveProperty(key);
    });
  });

  it('should have consistent form container styling', () => {
    expect(formStyles.form.backgroundColor).toBe('white');
    expect(formStyles.form.borderRadius).toBe(12);
    expect(formStyles.form.padding).toBe(20);
  });

  it('should have proper error styling', () => {
    expect(formStyles.inputError.borderColor).toBe('#ff6b6b');
    expect(formStyles.errorText.color).toBe('#ff6b6b');
  });

  it('should have consistent button flex values', () => {
    expect(formStyles.cancelButton.flex).toBe(1);
    expect(formStyles.submitButton.flex).toBe(2);
    expect(formStyles.fullWidthButton.flex).toBe(1);
  });

  it('should have proper button colors', () => {
    expect(formStyles.cancelButton.backgroundColor).toBe('#6c757d');
    expect(formStyles.submitButton.backgroundColor).toBe('#007AFF');
    expect(formStyles.buttonDisabled.backgroundColor).toBe('#ccc');
  });

  it('should have centered form title', () => {
    expect(formStyles.formTitle.textAlign).toBe('center');
  });

  it('should have consistent input styling', () => {
    expect(formStyles.input.backgroundColor).toBe('#f0f0f0');
    expect(formStyles.input.borderRadius).toBe(8);
  });

  it('should have proper shadow on form', () => {
    expect(formStyles.form.shadowOpacity).toBe(0.1);
    expect(formStyles.form.elevation).toBe(5);
  });

  it('should have flex row for buttons', () => {
    expect(formStyles.formButtons.flexDirection).toBe('row');
  });
});
