import React, { useState, useEffect } from 'react';

export default function BrandLogo({ fontSize = '1.5rem', showWelcome = false, isLogin = false }) {
    const [isKannada, setIsKannada] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsKannada(prev => !prev);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const englishBrand = (
        <>
            <span style={{ color: '#ff4d4d' }}>Nanna</span>
            <span style={{ color: '#ffcc00' }}>Pustaka</span>
        </>
    );

    const kannadaBrand = (
        <>
            <span style={{ color: '#ff4d4d' }}>ನನ್ನ</span>
            <span style={{ color: '#ffcc00' }}>ಪುಸ್ತಕ</span>
        </>
    );

    if (showWelcome) {
        return (
            <h2 style={{
                textAlign: 'center',
                fontSize: fontSize,
                border: 'none',
                marginBottom: '10px',
                height: '100px',
                minHeight: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                lineHeight: '1.4',
                transition: 'opacity 0.5s ease',
                margin: '0 0 10px 0',
                padding: 0,
            }}>
                <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>
                    {isKannada ? (
                        isLogin ? (
                            <>ನನ್ನ ಪುಸ್ತಕಕ್ಕೆ <span style={{ color: 'var(--primary-color)' }}>ಸ್ವಾಗತ</span></>
                        ) : (
                            <>ನನ್ನ ಪುಸ್ತಕದ <span style={{ color: 'var(--primary-color)' }}>ಕುಟುಂಬಕ್ಕೆ ಸೇರಿ</span></>
                        )
                    ) : (
                        isLogin ? (
                            <>Welcome Back to {englishBrand}</>
                        ) : (
                            <>Join the {englishBrand} family</>
                        )
                    )}
                </span>
            </h2>
        );
    }

    return (
        <span style={{ 
            fontSize: fontSize, 
            fontWeight: 'bold', 
            transition: 'all 0.5s ease', 
            display: 'inline-block',
            width: '100%',
            whiteSpace: 'nowrap'
        }}>
            {isKannada ? kannadaBrand : englishBrand}
        </span>
    );
}
