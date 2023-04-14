const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../../models/User');
const config = require('config');

const jwtSecret = config.get('jwtSecret');

// @route   POST api/users
// @desc    Register Route
// @access  Public

router.post(
  '/',
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please enter a valid email').isEmail(),
  body(
    'password',
    'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 }),
  async function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({
          errors: [{ msg: 'User already exists' }],
        });
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user._id,
        },
      };

      jwt.sign(
        payload,
        jwtSecret,
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
