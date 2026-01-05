import detectDeprecatedRule from './detect-deprecated.mjs';

const detectDeprecated = detectDeprecatedRule.default || detectDeprecatedRule;

if (!detectDeprecated || typeof detectDeprecated.create !== 'function') {
  throw new Error(
    `Invalid rule structure. Expected object with 'create' function, got: ${typeof detectDeprecated}`
  );
}

const customRules = {
  'detect-deprecated': detectDeprecated,
};

export { customRules };

