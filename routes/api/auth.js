const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const config = require('config');

// @route   GET api/auth
// @desc    Get user Route
// @access  Public

router.get('/', auth, async function (req, res) {
  const { id } = req.user;
  try {
    const user = await User.findById(id).select('-password');
    res.status(200).json({
      user,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users
// @desc    Authenticate User & Get Token
// @access  Public

router.post(
  '/',
  body('email', 'Please enter a valid email').isEmail(),
  body('password', 'Password is required').exists(),
  async function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({
          errors: [{ msg: 'Invalid Credentials' }],
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          errors: [{ msg: 'Invalid Credentials' }],
        });
      }

      const payload = {
        user: {
          id: user._id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err;
          res.status(201).json({
            status: 'success',
            data: {
              token,
            },
          });
        }
      );
    } catch (error) {
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
