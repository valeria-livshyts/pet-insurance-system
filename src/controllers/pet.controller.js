const Pet = require('../models/Pet');

// @desc    Створити нову тварину
// @route   POST /api/pets
// @access  Private
exports.createPet = async (req, res) => {
  try {
    // Якщо owner не вказано - беремо з JWT токену
    if (!req.body.owner) {
      req.body.owner = req.user._id;
    }

    const pet = await Pet.create(req.body);

    res.status(201).json({
      success: true,
      data: pet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Отримати всіх тварин користувача
// @route   GET /api/pets
// @access  Private
exports.getAllPets = async (req, res) => {
  try {
    // Показувати тільки своїх тварин
    const query = { owner: req.user._id };

    const pets = await Pet.find(query).populate('owner', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: pets.length,
      data: pets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Отримати тварину за ID
// @route   GET /api/pets/:id
// @access  Private
exports.getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('owner', 'firstName lastName email');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Тварину не знайдено'
      });
    }

    // Перевірка доступу
    if (pet.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Доступ заборонено'
      });
    }

    res.status(200).json({
      success: true,
      data: pet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Оновити дані тварини
// @route   PUT /api/pets/:id
// @access  Private
exports.updatePet = async (req, res) => {
  try {
    let pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Тварину не знайдено'
      });
    }

    // Перевірка доступу
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Доступ заборонено'
      });
    }

    pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: pet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Видалити тварину
// @route   DELETE /api/pets/:id
// @access  Private
exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Тварину не знайдено'
      });
    }

    // Перевірка доступу
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Доступ заборонено'
      });
    }

    await pet.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Тварину видалено'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
