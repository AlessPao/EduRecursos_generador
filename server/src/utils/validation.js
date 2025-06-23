import { body } from 'express-validator';

const meaninglessWords = [
  'nada', 'na', 'x', 'xx', 'xxx', 'asdf', 'qwerty', '...', '..', '.', 'aaa', 'bbb', 'ccc',
  'qwertryuja', 'test', 'prueba', 'asdasd', 'sdfsdf', 'zxcvbn'
];

const inappropriateWords = [
    // Spanish
    'alcohol', 'caca', 'cannabis', 'cocaína', 'cojones', 'coño', 'culo', 'drogas', 'follar',
    'heroína', 'hostia', 'joder', 'mierda', 'muerte', 'pene', 'picha', 'pito', 'polla',
    'porno', 'prostituta', 'puta', 'puto', 'sexo', 'tetas', 'vagina', 'violar', 'violencia',
    // English
    'alcohol', 'ass', 'bitch', 'cannabis', 'cocaine', 'cock', 'cunt', 'dick', 'drugs', 'fuck',
    'heroin', 'kill', 'murder', 'penis', 'piss', 'porn', 'prostitute', 'pussy', 'sex', 'shit',
    'tits', 'vagina', 'violence'
];

const combinedBlacklist = [...new Set([...meaninglessWords, ...inappropriateWords])];

const customValidation = (value, { req, location, path: fieldName }, fieldLabel) => {
    const trimmedValue = value.trim();
    // Check if it contains at least one letter
    if (!/[a-zA-Z]/.test(trimmedValue)) {
      throw new Error(`El ${fieldLabel} debe contener al menos una letra`);
    }
    // Check for numbers only
    if (/^[0-9]+$/.test(trimmedValue)) {
        throw new Error(`El ${fieldLabel} no puede ser solo números`);
    }
    // Check for symbols only (no letters, no numbers)
    if (!/[a-zA-Z0-9]/.test(trimmedValue)) {
        throw new Error(`El ${fieldLabel} no puede contener solo símbolos`);
    }
    // Check for meaningless or inappropriate words
    if (combinedBlacklist.includes(trimmedValue.toLowerCase())) {
      throw new Error(`Por favor ingresa un ${fieldLabel} con sentido y apropiado`);
    }
    // Check for random-like strings (e.g. "asdasd", "qwqwqw")
    if (/(\w)\1{3,}/.test(trimmedValue)) { // 4 or more repeated characters
        throw new Error(`El ${fieldLabel} parece ser una cadena aleatoria`);
    }
    // Check for alternating keyboard patterns
    if (/(qwe|asd|zxc|rty|fgh|vbn|uio|jkl|m,n){2,}/i.test(trimmedValue)) {
        throw new Error(`El ${fieldLabel} parece ser una cadena aleatoria`);
    }

    return true;
}

export const validateString = (fieldName, fieldLabel) => {
  return body(fieldName)
    .trim()
    .notEmpty().withMessage(`El ${fieldLabel} es obligatorio`)
    .isLength({ min: 2 }).withMessage(`El ${fieldLabel} debe tener al menos 2 caracteres`)
    .custom((value, meta) => customValidation(value, meta, fieldLabel));
};

export const validateOptionalString = (fieldName, fieldLabel) => {
    return body(fieldName)
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 2 }).withMessage(`El ${fieldLabel} debe tener al menos 2 caracteres`)
      .custom((value, meta) => {
        if (!value) return true;
        return customValidation(value, meta, fieldLabel);
      });
  };
