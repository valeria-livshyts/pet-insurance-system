const User = require('../models/User');
const Pet = require('../models/Pet');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const Clinic = require('../models/Clinic');

/**
 * AdminController - Контролер адміністрування системи
 */

// Отримання списку користувачів
exports.getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Зміна ролі користувача
exports.updateUserRole = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { role: req.body.role },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ success: false, message: 'Користувача не знайдено' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Блокування/розблокування користувача
exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { isActive: req.body.isActive },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ success: false, message: 'Користувача не знайдено' });
        res.json({ success: true, message: req.body.isActive ? 'Розблоковано' : 'Заблоковано', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Дашборд - статистика системи
exports.getDashboard = async (req, res) => {
    try {
        const [totalUsers, totalPets, totalPolicies, activePolicies, totalClaims, pendingClaims, totalClinics] = await Promise.all([
            User.countDocuments({ isActive: true }),
            Pet.countDocuments({ isActive: true }),
            Policy.countDocuments(),
            Policy.countDocuments({ status: 'active' }),
            Claim.countDocuments(),
            Claim.countDocuments({ status: 'pending' }),
            Clinic.countDocuments({ isActive: true })
        ]);

        res.json({
            success: true,
            data: {
                totalUsers, totalPets, totalPolicies, activePolicies,
                totalClaims, pendingClaims, totalClinics
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Створення клініки
exports.createClinic = async (req, res) => {
    try {
        const clinic = new Clinic(req.body);
        await clinic.save();
        res.status(201).json({ success: true, data: clinic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Оновлення клініки
exports.updateClinic = async (req, res) => {
    try {
        const clinic = await Clinic.findByIdAndUpdate(req.params.clinicId, req.body, { new: true });
        if (!clinic) return res.status(404).json({ success: false, message: 'Клініку не знайдено' });
        res.json({ success: true, data: clinic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Стан системи
exports.getSystemHealth = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        res.json({
            success: true,
            data: {
                status: 'healthy',
                database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
                uptime: process.uptime(),
                timestamp: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Простий звіт
exports.generateReport = async (req, res) => {
    try {
        const policies = await Policy.find().populate('pet owner');
        const claims = await Claim.find().populate('policy');

        const totalPremiums = policies.reduce((sum, p) => sum + (p.premium || 0), 0);
        const totalClaimed = claims.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
        const totalPaid = claims.filter(c => c.status === 'paid').reduce((sum, c) => sum + (c.approvedAmount || 0), 0);

        res.json({
            success: true,
            data: {
                generatedAt: new Date(),
                policiesCount: policies.length,
                claimsCount: claims.length,
                financial: { totalPremiums, totalClaimed, totalPaid }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
