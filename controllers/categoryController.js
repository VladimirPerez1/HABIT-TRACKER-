// controllers/categoryController.js
const Category = require('../models/Category');

// Obtener todas las categorías del usuario + predefinidas
exports.getAll = async (req, res, next) => {
    try {
        const categories = await Category.findByUserId(req.userId);

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });

    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        next(error);
    }
};

// Obtener una categoría por ID
exports.getById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        res.json({
            success: true,
            data: category
        });

    } catch (error) {
        console.error('Error obteniendo categoría:', error);
        next(error);
    }
};

// Crear categoría personalizada
exports.create = async (req, res, next) => {
    try {
        const { name, color, icon } = req.body;

        const category = await Category.create(req.userId, name, color, icon);

        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: category
        });

    } catch (error) {
        console.error('Error creando categoría:', error);
        next(error);
    }
};

// Actualizar categoría
exports.update = async (req, res, next) => {
    try {
        const { name, color, icon } = req.body;

        // Verificar que no sea predefinida
        const existing = await Category.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        if (existing.user_id === null) {
            return res.status(403).json({
                success: false,
                message: 'No puedes modificar categorías predefinidas'
            });
        }

        const category = await Category.update(req.params.id, req.userId, name, color, icon);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada o no tienes permiso'
            });
        }

        res.json({
            success: true,
            message: 'Categoría actualizada exitosamente',
            data: category
        });

    } catch (error) {
        console.error('Error actualizando categoría:', error);
        next(error);
    }
};

// Eliminar categoría
exports.delete = async (req, res, next) => {
    try {
        // Verificar que no sea predefinida
        const existing = await Category.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        if (existing.user_id === null) {
            return res.status(403).json({
                success: false,
                message: 'No puedes eliminar categorías predefinidas'
            });
        }

        const deleted = await Category.delete(req.params.id, req.userId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada o no tienes permiso'
            });
        }

        res.json({
            success: true,
            message: 'Categoría eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando categoría:', error);
        next(error);
    }
};