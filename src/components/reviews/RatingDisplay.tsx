'use client';

import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingDisplayProps {
    rating: number;
    count?: number;
    size?: number;
    showLabel?: boolean;
}

/**
 * COMPONENTE DE VISUALIZACIÓN DE RATING (Atomic Vibe)
 */
export default function RatingDisplay({
    rating,
    count,
    size = 16,
    showLabel = true
}: RatingDisplayProps) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="rating-container">
            <style jsx>{`
                .rating-container {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                .stars {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                }
                .count {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .label {
                    font-weight: 700;
                    color: var(--text-main);
                    font-size: 1rem;
                }
            `}</style>

            {showLabel && <span className="label">{rating.toFixed(1)}</span>}

            <div className="stars">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} size={size} fill="#f59e0b" color="#f59e0b" />
                ))}
                {hasHalfStar && <StarHalf size={size} fill="#f59e0b" color="#f59e0b" />}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`empty-${i}`} size={size} color="#cbd5e1" />
                ))}
            </div>

            {count !== undefined && <span className="count">({count})</span>}
        </div>
    );
}
