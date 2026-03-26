import { useState, useEffect } from 'react';
import api from '../services/api';
import { Save } from 'lucide-react';

const Settings = () => {
    const [profile, setProfile] = useState({
        shop_name: '',
        address: '',
        phone: '',
        email: '',
        gstin: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data) setProfile(res.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(profile.phone)) {
            return alert('Please enter a valid 10-digit phone number');
        }

        setSaving(true);
        try {
            await api.put('/settings', profile);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading Settings...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Shop Settings</h1>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Shop Name</label>
                        <input
                            type="text"
                            name="shop_name"
                            value={profile.shop_name}
                            onChange={handleChange}
                            required
                            className="input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            name="address"
                            value={profile.address}
                            onChange={handleChange}
                            required
                            className="input"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            required
                            className="input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={profile.email || ''}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <div className="form-group">
                        <label>GSTIN</label>
                        <input
                            type="text"
                            name="gstin"
                            value={profile.gstin || ''}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}
                    >
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
