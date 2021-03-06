module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    quotes: 'off',
    semi: 'off',
    'no-multiple-empty-lines': 0,
    'comma-dangle': 'off',
    indent: ["off", 2],
    'prefer-const': 'off',
    'space-before-function-paren': 'off',
    'vue/no-parsing-error': 'off'
  }
}
