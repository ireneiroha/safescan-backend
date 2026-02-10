
exports.register = async (req, res) => {
  res.json({ message: 'User registered (mock)' });
};

exports.login = async (req, res) => {
  res.json({ token: 'mock-jwt-token' });
};
