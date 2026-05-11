import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useLocation } from 'react-router-dom';

export default function GlobalSearch() {
    const { searchQuery, setSearchQuery } = useContext(StoreContext);
    const location = useLocation();

    // Only show on home page or search-relevant pages if desired
    // For now, let's show it everywhere as requested "below the nav bar"
    if (location.pathname !== '/') return null;

    return (
        <div className="global-search-wrapper">
            <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                    type="text" 
                    placeholder="What are you looking for today? Search by title or author..." 
                    value={searchQuery || ''}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
    );
}
