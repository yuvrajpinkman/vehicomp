const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');

// @route   GET /api/recommendations
// @desc    Get ranked vehicle recommendations using query criteria
// @access  Public / Customer / Admin
router.get('/', (req, res, next) => recommendationController.getRecommendations(req, res, next));

// @route   POST /api/recommendations
// @desc    Get ranked vehicle recommendations using complex criteria & weights
// @access  Public / Customer / Admin
router.post('/', (req, res, next) => recommendationController.getRecommendations(req, res, next));

module.exports = router;
