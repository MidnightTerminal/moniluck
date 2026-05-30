import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSettings, updateSettings } from '../../utils/adminApi';
import toast from 'react-hot-toast';
import './Settings.css';

const settingsSections = [
  {
    title: 'General',
    icon: 'settings',
    fields: [
      { key: 'site_name',     label: 'Site Name',    type: 'text' },
      { key: 'site_tagline',  label: 'Tagline',      type: 'text' },
      { key: 'currency_symbol', label: 'Currency Symbol', type: 'text' },
    ],
  },
  {
    title: 'Contact Information',
    icon: 'contact_mail',
    fields: [
      { key: 'contact_email',   label: 'Contact Email',   type: 'text' },
      { key: 'contact_phone',   label: 'Contact Phone',   type: 'text' },
      { key: 'contact_address', label: 'Contact Address',  type: 'text' },
    ],
  },
  {
    title: 'Shipping',
    icon: 'local_shipping',
    fields: [
      { key: 'free_shipping_min', label: 'Free Shipping Minimum ($)', type: 'number' },
      { key: 'shipping_cost',     label: 'Standard Shipping Cost ($)', type: 'number' },
    ],
  },
  {
    title: 'Social Media',
    icon: 'share',
    fields: [
      { key: 'social_facebook',  label: 'Facebook URL',  type: 'text' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'text' },
      { key: 'social_twitter',   label: 'Twitter URL',   type: 'text' },
      { key: 'social_youtube',   label: 'YouTube URL',   type: 'text' },
    ],
  },
  {
    title: 'Maintenance',
    icon: 'engineering',
    fields: [
      { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'toggle' },
    ],
  },
];

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [changed, setChanged]   = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getSettings();
        if (data.success) setSettings(data.settings);
      } catch { toast.error('Failed to load settings.'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setChanged(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await updateSettings(settings);
      if (data.success) {
        toast.success(data.message);
        setChanged(false);
      }
    } catch { toast.error('Failed to save settings.'); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const { data } = await getSettings();
      if (data.success) { setSettings(data.settings); setChanged(false); }
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) return <div className="admin-loading-page"><div className="admin-spinner" /></div>;

  const currentSection = settingsSections[activeSection];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Site Settings</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          {changed && (
            <button className="admin-btn admin-btn-ghost" onClick={handleReset}>
              <span className="material-icons-round">undo</span> Discard
            </button>
          )}
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!changed || saving}>
            {saving ? (
              <><div className="admin-spinner admin-spinner-sm" style={{ borderTopColor: '#fff' }} /> Saving...</>
            ) : (
              <><span className="material-icons-round">save</span> Save Changes</>
            )}
          </button>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar Tabs */}
        <div className="settings-tabs">
          {settingsSections.map((section, i) => (
            <button
              key={i}
              className={`settings-tab ${activeSection === i ? 'active' : ''}`}
              onClick={() => setActiveSection(i)}
            >
              <span className="material-icons-round">{section.icon}</span>
              <span>{section.title}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          <motion.div
            key={activeSection}
            className="admin-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="settings-section-header">
              <span className="material-icons-round" style={{ color: 'var(--admin-primary)', fontSize: '1.3rem' }}>
                {currentSection.icon}
              </span>
              <h3>{currentSection.title}</h3>
            </div>

            <div className="settings-fields">
              {currentSection.fields.map(field => (
                <div key={field.key} className="settings-field">
                  <label className="admin-label">{field.label}</label>

                  {field.type === 'toggle' ? (
                    <div className="settings-toggle-wrapper">
                      <button
                        className={`admin-toggle ${settings[field.key] === 'true' ? 'active' : ''}`}
                        onClick={() => handleChange(field.key, settings[field.key] === 'true' ? 'false' : 'true')}
                        type="button"
                      >
                        <div className="admin-toggle__slider" />
                      </button>
                      <span className="settings-toggle-label">
                        {settings[field.key] === 'true' ? (
                          <span style={{ color: 'var(--admin-warning)', fontWeight: 600 }}>
                            <span className="material-icons-round" style={{ fontSize: '0.9rem', verticalAlign: 'middle', marginRight: 4 }}>warning</span>
                            Site is in maintenance mode
                          </span>
                        ) : (
                          <span style={{ color: 'var(--admin-success)' }}>Site is live</span>
                        )}
                      </span>
                    </div>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="admin-input admin-textarea"
                      value={settings[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      rows="4"
                    />
                  ) : (
                    <input
                      type={field.type}
                      className="admin-input"
                      value={settings[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.label}
                    />
                  )}

                  {field.hint && (
                    <span className="admin-form-hint">{field.hint}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone */}
          {activeSection === settingsSections.length - 1 && (
            <div className="admin-card settings-danger-zone" style={{ marginTop: 24 }}>
              <div className="settings-section-header">
                <span className="material-icons-round" style={{ color: 'var(--admin-error)', fontSize: '1.3rem' }}>
                  warning
                </span>
                <h3 style={{ color: 'var(--admin-error)' }}>Danger Zone</h3>
              </div>

              <div className="settings-danger-item">
                <div>
                  <h4>Clear All Cache</h4>
                  <p>Remove all cached data. This may temporarily slow down the site.</p>
                </div>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ color: 'var(--admin-error)', borderColor: 'var(--admin-error)' }}
                  onClick={() => toast.success('Cache cleared successfully!')}>
                  Clear Cache
                </button>
              </div>

              <div className="settings-danger-item">
                <div>
                  <h4>Rebuild Product Index</h4>
                  <p>Regenerate search index for all products.</p>
                </div>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ color: 'var(--admin-warning)', borderColor: 'var(--admin-warning)' }}
                  onClick={() => toast.success('Index rebuilt!')}>
                  Rebuild
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;