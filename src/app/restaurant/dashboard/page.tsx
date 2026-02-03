'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './dashboard.module.css';
import {
    saveDailyMenu,
    processMenuImage,
    fetchRestaurantReviews,
    replyToReview,
    upgradeToPremium
} from '../actions';
import { handleLogout } from '../../auth/actions';
import ImageUploader from '@/components/images/ImageUploader';
import dynamic from 'next/dynamic';
const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), { ssr: false });

export default function RestaurantDashboard() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Core States
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [entryMode, setEntryMode] = useState<'selection' | 'manual' | 'photo' | 'reviews' | 'settings'>('selection');
    const [reviews, setReviews] = useState<any[]>([]);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    // Status States
    const [isSaving, setIsSaving] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Premium States
    const [isPremium, setIsPremium] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [notifyFollowers, setNotifyFollowers] = useState(false);

    // Menu Data
    const [menu, setMenu] = useState({
        firstCourses: [''],
        secondCourses: [''],
        desserts: [''],
        price: ''
    });

    useEffect(() => {
        const restaurantId = localStorage.getItem('locame_restaurant_id');
        if (!restaurantId) {
            router.push('/restaurant/login');
            return;
        }

        // Cargar estado inicial
        setIsPremium(localStorage.getItem('locame_is_premium') === 'true');

        // Cargar reseñas
        const loadReviews = async () => {
            const data = await fetchRestaurantReviews(restaurantId);
            setReviews(data);
        };
        loadReviews();
    }, [router]);

    const handleUpgrade = async () => {
        const restaurantId = localStorage.getItem('locame_restaurant_id');
        if (!restaurantId) return;

        setIsSaving(true);
        const res = await upgradeToPremium(restaurantId);
        if (res.success) {
            setIsPremium(true);
            localStorage.setItem('locame_is_premium', 'true');
            setShowUpgradeModal(false);
            alert('¡Enhorabuena! Ahora eres Premium. Disfruta de todas las ventajas.');
        }
        setIsSaving(false);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const restaurantId = localStorage.getItem('locame_restaurant_id') || '';
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            const result = await processMenuImage(base64, restaurantId);

            if (result.success && result.data) {
                setMenu({
                    firstCourses: result.data.firstCourses,
                    secondCourses: result.data.secondCourses,
                    desserts: result.data.desserts,
                    price: result.data.price.toString()
                });
                setEntryMode('manual');
            } else if (result.needsUpgrade) {
                setShowUpgradeModal(true);
            } else {
                alert(result.error || 'Error al procesar la imagen');
            }
            setIsProcessing(false);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const restaurantId = localStorage.getItem('locame_restaurant_id') || '';

        const result = await saveDailyMenu({
            restaurantId,
            date: selectedDate,
            firstCourses: menu.firstCourses.filter(Boolean),
            secondCourses: menu.secondCourses.filter(Boolean),
            desserts: menu.desserts.filter(Boolean),
            price: parseFloat(menu.price) || 0,
            notifyFollowers: isPremium && notifyFollowers
        });

        if (result.success) {
            alert(isPremium && notifyFollowers
                ? '¡Menú publicado y notificaciones enviadas!'
                : '¡Menú publicado correctamente!');
        } else {
            alert(result.error || 'No se pudo guardar el menú');
        }
        setIsSaving(false);
    };

    const logout = async () => {
        setIsLoggingOut(true);
        localStorage.clear();
        await handleLogout();
    };

    const updateField = (category: 'firstCourses' | 'secondCourses' | 'desserts', index: number, value: string) => {
        const newList = [...menu[category]];
        newList[index] = value;
        setMenu({ ...menu, [category]: newList });
    };

    const addField = (category: 'firstCourses' | 'secondCourses' | 'desserts') => {
        setMenu({ ...menu, [category]: [...menu[category], ''] });
    };

    return (
        <div className={styles.dashboardWrapper}>
            <header className={`${styles.dashHeader} glass`}>
                <div className={styles.branding} onClick={() => setEntryMode('selection')}>
                    <Image src="/favicon.jpg" alt="LOCAME" width={32} height={32} className="header-logo" />
                    <span className={styles.logo}>LOCAME</span>
                    <span className={styles.context}>Panel de Control</span>
                    {isPremium && <span className={styles.premiumBadge}>PREMIUM</span>}
                </div>
                <div className="header-actions">
                    {!isPremium && (
                        <button onClick={() => setShowUpgradeModal(true)} className={styles.upgradeTrigger}>
                            Hazte Premium (9€)
                        </button>
                    )}
                    <button onClick={logout} className={styles.exitBtn} disabled={isLoggingOut}>
                        {isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}
                    </button>
                </div>
            </header>

            {showUpgradeModal && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.upgradeModal} glass`}>
                        <span className={styles.modalClose} onClick={() => setShowUpgradeModal(false)}>×</span>
                        <div className={styles.modalIcon}>⭐</div>
                        <h2>Potencia tu Restaurante</h2>
                        <p>Únete al plan Premium por solo <strong>9€/mes</strong> y desbloquea:</p>
                        <ul className={styles.benefitsList}>
                            <li>📷 <strong>OCR Inteligente:</strong> Súbe una foto y deja que nuestra IA escriba le menú por ti.</li>
                            <li>📢 <strong>Notificaciones Push:</strong> Avisa a tus seguidores cuando subas el menú diario.</li>
                            <li>🏆 <strong>Posicionado VIP:</strong> Aparece con borde dorado y arriba en la búsqueda.</li>
                        </ul>
                        <button className={`btn-primary ${styles.upgradeBtn}`} onClick={handleUpgrade} disabled={isSaving}>
                            {isSaving ? 'Procesando...' : 'Activar Premium - 9€/mes'}
                        </button>
                        <p className={styles.cancelInfo}>Cancela en cualquier momento.</p>
                    </div>
                </div>
            )}

            <main className="dash-content">
                {entryMode === 'selection' ? (
                    <div className={styles.selectionScreen}>
                        <header className="selection-header">
                            <h1 className="brand-font">¿Qué quieres hacer hoy?</h1>
                            <p>Gestiona tu menú rápido o revisa qué opinan tus clientes.</p>
                        </header>
                        <div className={styles.selectionGrid}>
                            <button className={`${styles.selectionCard} glass-interactive`} onClick={() => setEntryMode('manual')}>
                                <div className={styles.cardIcon}>🍽️</div>
                                <h2>Gestionar Menú</h2>
                                <p>Publicar o editar el menú del día.</p>
                            </button>
                            <button className={`${styles.selectionCard} glass-interactive`} onClick={() => setEntryMode('reviews')}>
                                <div className={styles.cardIcon}>💬</div>
                                <h2>Ver Reseñas</h2>
                                <p>Consulta y responde a tus clientes.</p>
                            </button>
                            <button className={`${styles.selectionCard} glass-interactive`} onClick={() => setEntryMode('settings')}>
                                <div className={styles.cardIcon}>⚙️</div>
                                <h2>Ajustes Local</h2>
                                <p>Configura tu ubicación y fotos del local.</p>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={styles.dashControls}>
                            <button className={styles.backToSelection} onClick={() => setEntryMode('selection')}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7 7-7-7 7-7" /></svg>
                                Volver al inicio
                            </button>

                            {entryMode !== 'reviews' && (
                                <div className={`${styles.dateSelector} glass-border`}>
                                    <label>Día del Menú</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className={styles.dateInput}
                                    />
                                </div>
                            )}

                            {entryMode !== 'reviews' && (
                                <div className={`${styles.modeTabs} glass-border`}>
                                    <button
                                        className={`${styles.tab} ${entryMode === 'manual' ? styles.tabActive : ''}`}
                                        onClick={() => setEntryMode('manual')}
                                    >
                                        Manual
                                    </button>
                                    <button
                                        className={`${styles.tab} ${entryMode === 'photo' ? styles.tabActive : ''}`}
                                        onClick={() => setEntryMode('photo')}
                                    >
                                        Subir Foto 📸 {!isPremium && '🔒'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={`glass ${styles.formCard}`}>
                            {entryMode === 'photo' ? (
                                <div className={styles.photoDropzoneContainer}>
                                    <div className={styles.photoDropzone} onClick={() => !isPremium ? setShowUpgradeModal(true) : fileInputRef.current?.click()}>
                                        {isProcessing ? (
                                            <div className="loader-container">
                                                <div className="spinner"></div>
                                                <p>Nuestra IA está analizando tu menú...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="upload-icon">{!isPremium ? '🔒' : '📸'}</div>
                                                <h2>Sube una foto de tu pizarra o papel</h2>
                                                <p>Ahorra tiempo y deja que LOCAME escriba por ti.</p>
                                                {!isPremium ? (
                                                    <span className="premium-link">Solo disponible para usuarios Premium</span>
                                                ) : (
                                                    <button className="btn-secondary">Seleccionar imagen</button>
                                                )}
                                            </>
                                        )}
                                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handlePhotoUpload} />
                                    </div>
                                    {!isPremium && (
                                        <div className="premium-overlay" onClick={() => setShowUpgradeModal(true)}>
                                            <div className="overlay-content">
                                                <p>¿Cansado de escribir todos los días?</p>
                                                <button className="btn-upgrade-mini">Hazte Premium</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : entryMode === 'reviews' ? (
                                <div className="reviews-tab">
                                    <header className="form-card-header">
                                        <h2>Reseñas de Clientes</h2>
                                        <p>Gestiona tu reputación online respondiendo a tus comensales.</p>
                                    </header>
                                    <div className="reviews-list">
                                        {reviews.length > 0 ? reviews.map((rev) => (
                                            <div key={rev.id} className="review-card glass-border">
                                                <div className="rev-header">
                                                    <div className="user-info">
                                                        <strong>{rev.first_name} {rev.last_name}</strong>
                                                        <span className="date">{new Date(rev.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="stars">{Array(rev.rating).fill('⭐').join('')}</div>
                                                </div>
                                                <p className="comment">{rev.comment}</p>

                                                {rev.reply ? (
                                                    <div className="reply-box">
                                                        <strong>Tu respuesta:</strong>
                                                        <p>{rev.reply}</p>
                                                    </div>
                                                ) : (
                                                    <div className="reply-action">
                                                        {replyingTo === rev.id ? (
                                                            <div className="reply-form">
                                                                <textarea
                                                                    placeholder="Escribe tu respuesta..."
                                                                    value={replyText}
                                                                    onChange={(e) => setReplyText(e.target.value)}
                                                                    className="modern-input"
                                                                />
                                                                <div className="reply-btns">
                                                                    <button
                                                                        className="btn-primary mini"
                                                                        onClick={async () => {
                                                                            const res = await replyToReview(rev.id, replyText);
                                                                            if (res.success) {
                                                                                const data = await fetchRestaurantReviews(localStorage.getItem('locame_restaurant_id')!);
                                                                                setReviews(data);
                                                                                setReplyingTo(null);
                                                                                setReplyText('');
                                                                            }
                                                                        }}
                                                                    >
                                                                        Enviar
                                                                    </button>
                                                                    <button className="exit-btn mini" onClick={() => setReplyingTo(null)}>Cancelar</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button className="btn-secondary mini" onClick={() => setReplyingTo(rev.id)}>Responder</button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )) : (
                                            <p className="empty-msg">No hay reseñas para mostrar todavía.</p>
                                        )}
                                    </div>
                                </div>
                            ) : entryMode === 'settings' ? (
                                <div className="settings-tab">
                                    <header className="form-card-header">
                                        <h2>Ajustes del Restaurante</h2>
                                        <p>Mantén actualizada tu ubicación y las mejores fotos de tu local.</p>
                                    </header>

                                    <div className="settings-grid">
                                        <div className="section-group">
                                            <h3>📍 Ubicación en el Mapa</h3>
                                            <p className="hint">Haz clic en el mapa para marcar la puerta exacta de tu restaurante.</p>
                                            <LocationPicker
                                                onChange={(coords) => {
                                                    console.log('Nueva ubicación seleccionada:', coords);
                                                }}
                                            />
                                        </div>

                                        <div className="section-group">
                                            <h3>🖼️ Galería de Fotos</h3>
                                            <p className="hint">Sube fotos de tu local y de tus mejores platos.</p>
                                            <ImageUploader
                                                entityId={typeof window !== 'undefined' ? localStorage.getItem('locame_restaurant_id') || '' : ''}
                                                entityType="RESTAURANT"
                                            />
                                        </div>
                                    </div>
                                    <style jsx>{`
                                        .settings-grid { display: flex; flex-direction: column; gap: 40px; margin-top: 32px; }
                                        .section-group { display: flex; flex-direction: column; gap: 12px; }
                                        .section-group h3 { font-size: 1.1rem; color: var(--text-main); }
                                        .hint { font-size: 0.85rem; color: var(--text-dim); margin-bottom: 8px; }
                                    `}</style>
                                </div>
                            ) : (
                                <form className="modern-form" onSubmit={(e) => e.preventDefault()}>
                                    <header className="form-card-header">
                                        <h2>Menú para {new Date(selectedDate).toLocaleDateString()}</h2>
                                        <p>Completa los platos de hoy.</p>
                                    </header>
                                    <div className="form-grid">
                                        <CourseSection
                                            title="Primeros Platos"
                                            items={menu.firstCourses}
                                            onUpdate={(i, v) => updateField('firstCourses', i, v)}
                                            onAdd={() => addField('firstCourses')}
                                        />
                                        <CourseSection
                                            title="Segundos Platos"
                                            items={menu.secondCourses}
                                            onUpdate={(i, v) => updateField('secondCourses', i, v)}
                                            onAdd={() => addField('secondCourses')}
                                        />
                                        <CourseSection
                                            title="Postres y Bebidas"
                                            items={menu.desserts}
                                            onUpdate={(i, v) => updateField('desserts', i, v)}
                                            onAdd={() => addField('desserts')}
                                        />

                                        <div className={`${styles.priceSection} ${styles.courseGroup}`}>
                                            <h3>Precio del Menú</h3>
                                            <div className={styles.priceWrapper}>
                                                <span>€</span>
                                                <input
                                                    type="number"
                                                    value={menu.price}
                                                    onChange={(e) => setMenu({ ...menu, price: e.target.value })}
                                                    placeholder="0.00" step="0.50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`${styles.premiumNotifications} glass-border`}>
                                        <div className={styles.notifContent}>
                                            <h4>📢 Avisar a Seguidores</h4>
                                            <p>Enviar notificación push a los usuarios que te tienen en favoritos.</p>
                                        </div>
                                        <div className={styles.notifAction}>
                                            {isPremium ? (
                                                <label className={styles.switch}>
                                                    <input
                                                        type="checkbox"
                                                        checked={notifyFollowers}
                                                        onChange={(e) => setNotifyFollowers(e.target.checked)}
                                                    />
                                                    <span className={`${styles.slider} ${styles.round}`}></span>
                                                    <span className={styles.labelText}>{notifyFollowers ? 'SÍ' : 'NO'}</span>
                                                </label>
                                            ) : (
                                                <button className={styles.btnNotifLocked} onClick={() => setShowUpgradeModal(true)}>
                                                    Bloqueado 🔒
                                                    <span className={styles.hint}>Solo Premium</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.formFooter}>
                                        <button
                                            type="button"
                                            className={`btn-primary ${styles.publishBtn}`}
                                            onClick={handleSave}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Guardando...' : 'Publicar Menú'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

function CourseSection({ title, items, onUpdate, onAdd }: {
    title: string,
    items: string[],
    onUpdate: (i: number, v: string) => void,
    onAdd: () => void
}) {
    return (
        <section className={styles.courseGroup}>
            <h3 className={styles.courseTitle}>{title}</h3>
            {items.map((item, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                    <input
                        type="text"
                        value={item}
                        onChange={(e) => onUpdate(i, e.target.value)}
                        placeholder="Ej: Gazpacho andaluz..."
                        className={styles.courseInput}
                    />
                </div>
            ))}
            <button type="button" onClick={onAdd} className={styles.addBtn}>
                + Añadir plato
            </button>
        </section>
    );
}
