export default {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{json,md}': [
    'prettier --write',
  ],
  '*.{css,scss}': [
    'prettier --write',
  ],
};
