module.exports = {
  async rewrites() {
    return [
      {
        source: '/.well-known/code-payments.json',
        destination: '/api/code-payments',
      },
    ];
  },
}; 