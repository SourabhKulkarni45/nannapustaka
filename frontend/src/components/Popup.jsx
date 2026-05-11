import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';

export default function Popup() {
    const { popupMsg } = useContext(StoreContext);

    if (!popupMsg) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-icon">✨</div>
                <h3>{popupMsg}</h3>
            </div>
        </div>
    );
}
