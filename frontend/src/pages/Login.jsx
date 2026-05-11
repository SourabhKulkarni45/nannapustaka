import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
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
    ctx.fillStyle = '#1e1e2e';
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
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8'];
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

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [captchaText, setCaptchaText] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [canvasRef, setCanvasRef] = useState(null);
    const { setUser, setToken, showPopup } = useContext(StoreContext);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (captchaInput !== captchaText) {
            showPopup('Incorrect CAPTCHA. Please try again ❌');
            refreshCaptcha();
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setToken(data.token);
                showPopup(`Welcome back, ${data.user.username}! 👋`);
                navigate('/');
            } else {
                showPopup('Invalid credentials ❌');
                refreshCaptcha();
            }
        } catch (err) {
            console.error(err);
            showPopup('Server error. Is the backend running? ⚠️');
        }
    };

    return (
        <div className="auth-content-container">
            <AuthBackground />
            <form className="glass auth-form" onSubmit={handleSubmit}>
            <BrandLogo showWelcome={true} isLogin={true} fontSize="1.8rem" />
            <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            <div className="password-wrapper">
                <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <canvas
                    ref={ref => setCanvasRef(ref)}
                    style={{ borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
                <button
                    type="button"
                    onClick={refreshCaptcha}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        minWidth: '44px'
                    }}
                    title="Refresh CAPTCHA"
                >
                    🔄
                </button>
            </div>
            <input
                placeholder="Enter CAPTCHA above"
                value={captchaInput}
                onChange={e => setCaptchaInput(e.target.value)}
                required
                style={{ letterSpacing: '3px', fontFamily: 'monospace', fontSize: '1.1rem' }}
            />

            <button type="submit">Login</button>
            <p style={{textAlign: 'center'}}>
                Don't have an account? <Link to="/register" style={{color: 'var(--secondary-color)'}}>Register slowly here</Link>
                <br /><br />
                Forgot/Change Password? <Link to="/reset-password" style={{color: 'var(--secondary-color)'}}>Reset here</Link>
            </p>
            </form>
        </div>
    );
}
