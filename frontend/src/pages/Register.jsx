import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthBackground from '../components/AuthBackground';
import BrandLogo from '../components/BrandLogo';

function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
}

function drawCaptcha(canvas, text) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 55;

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Noise lines
    for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 200, Math.random() * 55);
        ctx.lineTo(Math.random() * 200, Math.random() * 55);
        ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 60%, 60%)`;
        ctx.beginPath();
        ctx.arc(Math.random() * 200, Math.random() * 55, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw each character with random style
    const colors = ['#4318FF', '#05CD99', '#EE5D50', '#2B3674', '#868CFF', '#ff922b'];
    for (let i = 0; i < text.length; i++) {
        ctx.save();
        ctx.font = `${Math.random() > 0.5 ? 'bold' : 'italic'} ${26 + Math.random() * 8}px 'Courier New', monospace`;
        ctx.fillStyle = colors[i % colors.length];
        const x = 20 + i * 28;
        const y = 32 + (Math.random() * 14 - 7);
        const angle = (Math.random() - 0.5) * 0.4;
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
    }
}

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [email, setEmail] = useState('');
    const [captchaText, setCaptchaText] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [canvasRef, setCanvasRef] = useState(null);
    const [passwordError, setPasswordError] = useState('');
    const [formError, setFormError] = useState('');
    const navigate = useNavigate();

    const refreshCaptcha = useCallback(() => {
        const newCaptcha = generateCaptcha();
        setCaptchaText(newCaptcha);
        setCaptchaInput('');
        drawCaptcha(canvasRef, newCaptcha);
    }, [canvasRef]);

    useEffect(() => {
        if (canvasRef) {
            refreshCaptcha();
        }
    }, [canvasRef, refreshCaptcha]);

    const validatePassword = (pwd) => {
        if (pwd.length < 8) return "Minimum 8 characters required";
        if (!/[A-Z]/.test(pwd)) return "At least 1 uppercase letter required";
        if (!/\d/.test(pwd)) return "At least 1 number required";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "At least 1 special character required";
        return "";
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        if (val) {
            setPasswordError(validatePassword(val));
        } else {
            setPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (captchaInput !== captchaText) {
            setFormError('Incorrect CAPTCHA. Please try again ❌');
            refreshCaptcha();
            return;
        }

        const err = validatePassword(password);
        if (err) {
            setPasswordError(err);
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFormError('Please enter a valid email address');
            return;
        }

        if (contactNumber && !/^\d{10}$/.test(contactNumber)) {
            setFormError('Contact number must be 10 digits');
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, firstName, lastName, contactNumber, email, role: 'CUSTOMER' })
            });
            if (res.ok) {
                alert('Registration successful! Please login.');
                navigate('/login');
            } else {
                const errText = await res.text();
                setFormError(errText || 'Registration failed');
                refreshCaptcha();
            }
        } catch (err) {
            console.error(err);
            setFormError('Server error. Is the backend running?');
        }
    };

    return (
        <div className="auth-content-container">
            <AuthBackground />
            <form className="glass auth-form" onSubmit={handleSubmit}>
                <BrandLogo showWelcome={true} isLogin={false} fontSize="1.8rem" />

                {formError && (
                    <p style={{ color: 'var(--error-color)', fontSize: '0.9rem', margin: '-5px 0 5px', background: 'rgba(238,93,80,0.08)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(238,93,80,0.2)' }}>
                        ⚠️ {formError}
                    </p>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>
                            Username <span style={{ color: 'var(--error-color)' }}>*</span>
                        </label>
                        <input placeholder="Choose a unique username" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>
                            First Name <span style={{ color: 'var(--error-color)' }}>*</span>
                        </label>
                        <input placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>
                            Last Name
                        </label>
                        <input placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>
                            Email
                        </label>
                        <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>
                            Contact Number
                        </label>
                        <input type="tel" placeholder="10-digit mobile" value={contactNumber} onChange={e => setContactNumber(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>
                        Password <span style={{ color: 'var(--error-color)' }}>*</span>
                    </label>
                    <div className="password-wrapper">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Min 8 chars, 1 uppercase, 1 num, 1 spec" 
                            value={password} 
                            onChange={handlePasswordChange} 
                            required 
                        />
                        <button 
                            type="button" 
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex="-1"
                        >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                    {passwordError && <p style={{ color: 'var(--error-color)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>{passwordError}</p>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                    <canvas
                        ref={ref => setCanvasRef(ref)}
                        style={{ borderRadius: '8px', border: '1px solid var(--border-color)', width: '150px', height: '45px' }}
                    />
                    <button
                        type="button"
                        onClick={refreshCaptcha}
                        style={{ background: 'transparent', border: '1px solid var(--border-color)', color: '#000', padding: '5px 10px', borderRadius: '8px', fontSize: '1.2rem' }}
                    >
                        🔄
                    </button>
                </div>
                <input
                    placeholder="Enter CAPTCHA"
                    value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value)}
                    required
                    style={{ letterSpacing: '2px', fontFamily: 'monospace' }}
                />

                <p style={{ fontSize: '0.75rem', margin: '-5px 0 0' }}>
                    Fields marked with <span style={{ color: 'var(--error-color)' }}>*</span> are mandatory
                </p>

                <button type="submit">Register</button>
                <p style={{ textAlign: 'center', marginTop: '16px', marginBottom: '8px' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--secondary-color)' }}>Login</Link>
                </p>
            </form>
        </div>
    );
}
