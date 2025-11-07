import React, { useState } from 'react';
import './Settings.scss';

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <div className="settings">
      <div className="settings__header">
        <div>
          <h1 className="settings__title">Settings</h1>
          <p className="settings__subtitle">Manage your application settings and preferences</p>
        </div>
      </div>

      <div className="settings__grid">
        {/* General Settings */}
        <div className="settings__card">
          <div className="settings__card-header">
            <div className="settings__card-icon">⚙️</div>
            <h3 className="settings__card-title">General Settings</h3>
          </div>
          <div className="settings__form">
            <div className="settings__form-group">
              <label className="settings__label">Company Name</label>
              <input
                type="text"
                className="settings__input"
                placeholder="BusBooking Platform"
                defaultValue="BusBooking Platform"
              />
            </div>
            <div className="settings__form-group">
              <label className="settings__label">Support Email</label>
              <input
                type="email"
                className="settings__input"
                placeholder="support@busbooking.com"
                defaultValue="support@busbooking.com"
              />
            </div>
            <div className="settings__form-group">
              <label className="settings__label">Support Phone</label>
              <input
                type="tel"
                className="settings__input"
                placeholder="+91 1800 123 4567"
                defaultValue="+91 1800 123 4567"
              />
            </div>
            <div className="settings__form-group">
              <label className="settings__label">Time Zone</label>
              <select className="settings__select">
                <option>IST (UTC +5:30)</option>
                <option>EST (UTC -5:00)</option>
                <option>PST (UTC -8:00)</option>
                <option>GMT (UTC +0:00)</option>
              </select>
            </div>
            <button className="settings__btn settings__btn--primary">
              💾 Save Changes
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings__card">
          <div className="settings__card-header">
            <div className="settings__card-icon">🔔</div>
            <h3 className="settings__card-title">Notifications</h3>
          </div>
          <div className="settings__form">
            <div className="settings__toggle-group">
              <div className="settings__toggle-item">
                <div>
                  <div className="settings__toggle-label">Email Notifications</div>
                  <div className="settings__toggle-desc">Receive notifications via email</div>
                </div>
                <label className="settings__toggle">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <span className="settings__toggle-slider"></span>
                </label>
              </div>

              <div className="settings__toggle-item">
                <div>
                  <div className="settings__toggle-label">SMS Notifications</div>
                  <div className="settings__toggle-desc">Receive notifications via SMS</div>
                </div>
                <label className="settings__toggle">
                  <input
                    type="checkbox"
                    checked={smsNotifications}
                    onChange={(e) => setSmsNotifications(e.target.checked)}
                  />
                  <span className="settings__toggle-slider"></span>
                </label>
              </div>

              <div className="settings__toggle-item">
                <div>
                  <div className="settings__toggle-label">Push Notifications</div>
                  <div className="settings__toggle-desc">Receive push notifications</div>
                </div>
                <label className="settings__toggle">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                  />
                  <span className="settings__toggle-slider"></span>
                </label>
              </div>
            </div>
            <button className="settings__btn settings__btn--primary">
              💾 Save Preferences
            </button>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="settings__card">
          <div className="settings__card-header">
            <div className="settings__card-icon">💳</div>
            <h3 className="settings__card-title">Payment Settings</h3>
          </div>
          <div className="settings__form">
            <div className="settings__form-group">
              <label className="settings__label">Currency</label>
              <select className="settings__select">
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            <div className="settings__form-group">
              <label className="settings__label">Payment Gateway</label>
              <select className="settings__select">
                <option>Stripe</option>
                <option>Razorpay</option>
                <option>PayPal</option>
                <option>Paytm</option>
              </select>
            </div>
            <div className="settings__form-group">
              <label className="settings__label">Refund Policy (Days)</label>
              <input
                type="number"
                className="settings__input"
                placeholder="7"
                defaultValue="7"
              />
            </div>
            <button className="settings__btn settings__btn--primary">
              💾 Update Settings
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="settings__card">
          <div className="settings__card-header">
            <div className="settings__card-icon">🔒</div>
            <h3 className="settings__card-title">Security</h3>
          </div>
          <div className="settings__form">
            <div className="settings__form-group">
              <label className="settings__label">Current Password</label>
              <input
                type="password"
                className="settings__input"
                placeholder="Enter current password"
              />
            </div>
            <div className="settings__form-group">
              <label className="settings__label">New Password</label>
              <input
                type="password"
                className="settings__input"
                placeholder="Enter new password"
              />
            </div>
            <div className="settings__form-group">
              <label className="settings__label">Confirm Password</label>
              <input
                type="password"
                className="settings__input"
                placeholder="Confirm new password"
              />
            </div>
            <button className="settings__btn settings__btn--primary">
              🔑 Change Password
            </button>
          </div>
        </div>

        {/* Backup & Data */}
        <div className="settings__card">
          <div className="settings__card-header">
            <div className="settings__card-icon">💾</div>
            <h3 className="settings__card-title">Backup & Data</h3>
          </div>
          <div className="settings__form">
            <div className="settings__info-box">
              <div className="settings__info-icon">ℹ️</div>
              <div>
                <div className="settings__info-title">Last Backup</div>
                <div className="settings__info-text">January 20, 2024 at 3:45 PM</div>
              </div>
            </div>
            <button className="settings__btn settings__btn--secondary">
              📥 Download Backup
            </button>
            <button className="settings__btn settings__btn--secondary">
              🔄 Create New Backup
            </button>
            <button className="settings__btn settings__btn--danger">
              🗑️ Clear All Data
            </button>
          </div>
        </div>

        {/* API Settings */}
        <div className="settings__card">
          <div className="settings__card-header">
            <div className="settings__card-icon">🔌</div>
            <h3 className="settings__card-title">API Settings</h3>
          </div>
          <div className="settings__form">
            <div className="settings__form-group">
              <label className="settings__label">API Key</label>
              <div className="settings__input-group">
                <input
                  type="password"
                  className="settings__input"
                  defaultValue="sk_live_1234567890abcdef"
                  readOnly
                />
                <button className="settings__input-btn">👁️</button>
              </div>
            </div>
            <div className="settings__form-group">
              <label className="settings__label">Webhook URL</label>
              <input
                type="url"
                className="settings__input"
                placeholder="https://example.com/webhook"
                defaultValue="https://example.com/webhook"
              />
            </div>
            <button className="settings__btn settings__btn--secondary">
              🔄 Regenerate API Key
            </button>
            <button className="settings__btn settings__btn--primary">
              💾 Save API Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
