'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, Send, Loader2 } from 'lucide-react';
import { createReview } from '@/app/actions/review-actions';

interface ReviewFormProps {
    restaurantId: string;
    userId: string;
    onSuccess?: () => void;
}

export default function ReviewForm({ restaurantId, userId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Por favor, selecciona una puntuación');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('restaurantId', restaurantId);
        formData.append('rating', rating.toString());
        formData.append('comment', comment);

        try {
            const result = await createReview(formData);
            if (result.success) {
                setRating(0);
                setComment('');
                if (onSuccess) onSuccess();
            } else {
                setError(result.error || 'Error al enviar la reseña');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <style jsx>{`
                .review-form {
                    padding: 24px;
                    background: var(--bg-light);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-lg);
                    border: 1px solid var(--glass-border);
                }

                .title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .stars-selector {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                }

                .star-btn {
                    background: none;
                    border: none;
                    padding: 4px;
                    cursor: pointer;
                    transition: var(--transition-smooth);
                }

                .star-btn:hover {
                    transform: scale(1.2);
                }

                .textarea-wrapper {
                    position: relative;
                    margin-bottom: 20px;
                }

                textarea {
                    width: 100%;
                    min-height: 120px;
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                    background: var(--bg-card);
                    font-family: inherit;
                    resize: vertical;
                    transition: var(--transition-smooth);
                }

                textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: var(--bg-light);
                    box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
                }

                .submit-btn {
                    width: 100%;
                    padding: 14px;
                    background: var(--primary);
                    color: var(--text-main);
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: var(--transition-smooth);
                }

                .submit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
                    filter: brightness(1.05);
                }

                .submit-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .error-msg {
                    color: #ef4444;
                    font-size: 0.875rem;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
            `}</style>

            <h3 className="title">
                <Star size={24} color="#f59e0b" fill="#f59e0b" />
                Danos tu opinión
            </h3>

            <div className="stars-selector">
                {[1, 2, 3, 4, 5].map((s) => (
                    <button
                        key={s}
                        type="button"
                        className="star-btn"
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(s)}
                        aria-label={`Calificar con ${s} estrellas`}
                    >
                        <Star
                            size={32}
                            color={(hoverRating || rating) >= s ? '#f59e0b' : '#cbd5e1'}
                            fill={(hoverRating || rating) >= s ? '#f59e0b' : 'transparent'}
                        />
                    </button>
                ))}
            </div>

            <div className="textarea-wrapper">
                <textarea
                    placeholder="Cuéntanos tu experiencia..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || rating === 0}
            >
                {isSubmitting ? <Loader2 className="spin" size={20} /> : <Send size={20} />}
                {isSubmitting ? 'Enviando...' : 'Publicar reseña'}
            </button>
        </form>
    );
}
