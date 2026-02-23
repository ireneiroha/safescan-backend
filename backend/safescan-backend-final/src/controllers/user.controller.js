exports.getProfile = async (req, res) => {
  const user = req.user; // set by requireAuth middleware

  res.json({
    id: user.id,
    email: user.email
  });
};

