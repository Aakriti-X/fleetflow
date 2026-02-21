import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
    { label: 'Admin', email: 'admin@fleetflow.io', password: 'admin123', color: 'purple' },
    { label: 'Manager', email: 'manager@fleetflow.io', password: 'manager123', color: 'blue' },
    { label: 'Viewer', email: 'viewer@fleetflow.io', password: 'viewer123', color: 'slate' },
];

export default function Login() {
    const { login, loginError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate slight async (real-world: API call here)
        await new Promise(r => setTimeout(r, 500));
        const ok = login(email, password);
        setLoading(false);
        if (ok) navigate(from, { replace: true });
    };

    const quickLogin = (acc) => {
        setEmail(acc.email);
        setPassword(acc.password);
    };

    return (
        <div className="login-page">
            {/* Background glow orbs */}
            <div className="login-page__orb login-page__orb--1" />
            <div className="login-page__orb login-page__orb--2" />

            <div className="login-card">
                {/* Brand */}
                <div className="login-card__brand">
                    <div className="login-card__logo">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h1 className="login-card__product">FleetFlow</h1>
                        <p className="login-card__tagline">Fleet & Logistics Management</p>
                    </div>
                </div>

                <div className="login-card__divider" />

                <h2 className="login-card__title">Welcome back</h2>
                <p className="login-card__subtitle">Sign in to your account to continue</p>

                {/* Error */}
                {loginError && (
                    <div className="login-error">
                        <AlertCircle size={15} />
                        <span>{loginError}</span>
                    </div>
                )}

                {/* Form */}
                <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-field">
                        <label className="form-label">Email address</label>
                        <input
                            className="form-input"
                            type="email"
                            placeholder="you@fleetflow.io"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-field">
                        <label className="form-label">Password</label>
                        <div className="login-form__pwd-wrap">
                            <input
                                className="form-input"
                                type={showPwd ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="login-form__pwd-toggle"
                                onClick={() => setShowPwd(v => !v)}
                                tabIndex={-1}
                            >
                                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`btn btn--primary login-form__submit ${loading ? 'login-form__submit--loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="login-spinner" />
                        ) : (
                            <><LogIn size={16} /> Sign In</>
                        )}
                    </button>
                </form>

                {/* Demo Accounts */}
                <div className="login-demo">
                    <div className="login-demo__label">Quick demo login</div>
                    <div className="login-demo__accounts">
                        {DEMO_ACCOUNTS.map(acc => (
                            <button
                                key={acc.label}
                                className={`login-demo__btn login-demo__btn--${acc.color}`}
                                type="button"
                                onClick={() => quickLogin(acc)}
                            >
                                <span className="login-demo__role">{acc.label}</span>
                                <span className="login-demo__email">{acc.email}</span>
                            </button>
                        ))}
                    </div>
                    <p className="login-demo__hint">Click a role above to auto-fill credentials, then sign in.</p>
                </div>
            </div>

            <p className="login-footer">© 2026 FleetFlow · Modular Logistics Platform</p>
        </div>
    );
}
