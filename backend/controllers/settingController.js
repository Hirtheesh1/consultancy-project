const { ShopProfile } = require('../models');

exports.getProfile = async (req, res) => {
    try {
        let profile = await ShopProfile.findOne();
        if (!profile) {
            // Seed with default data if not exists
            profile = await ShopProfile.create({
                shop_name: 'Maruthi Auto Parts',
                address: 'Karur Salem Bypass Road, 639005',
                phone: '8111034356',
                email: '',
                gstin: ''
            });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        let profile = await ShopProfile.findOne();
        if (!profile) {
            profile = await ShopProfile.create(req.body);
        } else {
            await profile.update(req.body);
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
