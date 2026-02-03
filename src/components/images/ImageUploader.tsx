'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadEntityImage } from '@/app/actions/image-actions';

interface ImageUploaderProps {
    entityId: string;
    entityType: 'RESTAURANT' | 'MENU_ITEM' | 'REVIEW' | 'USER';
    bucket?: string;
    onUploadSuccess?: (image: any) => void;
    maxSizeMB?: number;
}

/**
 * COMPONENTE DE SUBIDA DE IMÁGENES (Atomic Vibe - Regla III)
 * Estética premium con estados de carga, error y éxito.
 */
export default function ImageUploader({
    entityId,
    entityType,
    bucket = 'restaurant-images',
    onUploadSuccess,
    maxSizeMB = 5
}: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        // Validación básica (Regla IV.2)
        if (!file.type.startsWith('image/')) {
            setError('Por favor, selecciona un archivo de imagen válido (JPG, PNG, WebP)');
            return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`La imagen es demasiado grande. Máximo ${maxSizeMB}MB`);
            return;
        }

        setError(null);
        setSuccess(false);
        setPreviewUrl(URL.createObjectURL(file));
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('entityId', entityId);
        formData.append('entityType', entityType);
        formData.append('bucket', bucket);

        try {
            const result = await uploadEntityImage(formData);
            if (result.success) {
                setSuccess(true);
                if (onUploadSuccess) onUploadSuccess(result.image);
                // Limpiar después de un tiempo
                setTimeout(() => {
                    setPreviewUrl(null);
                    setSuccess(false);
                }, 3000);
            } else {
                setError(result.error || 'Error al subir la imagen');
            }
        } catch (err) {
            setError('Error de Red/Sistema al procesar la subida');
        } finally {
            setIsUploading(false);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div className="uploader-container">
            <style jsx>{`
                .uploader-container {
                    width: 100%;
                    max-width: 400px;
                    font-family: inherit;
                }

                .dropzone {
                    position: relative;
                    border: 2px dashed var(--glass-border);
                    border-radius: var(--radius-xl);
                    padding: 40px 20px;
                    text-align: center;
                    background: var(--bg-card);
                    backdrop-filter: blur(8px);
                    transition: var(--transition-smooth);
                    cursor: pointer;
                    overflow: hidden;
                }

                .dropzone.dragging {
                    border-color: var(--primary);
                    background: rgba(var(--primary-rgb), 0.05);
                    transform: scale(1.02);
                }

                .dropzone.uploading {
                    cursor: default;
                    pointer-events: none;
                }

                .icon-wrapper {
                    display: inline-flex;
                padding: 12px;
                background: var(--secondary);
                border-radius: 12px;
                margin-bottom: 16px;
                color: var(--text-dim);
                transition: var(--transition-smooth);
                }

                .dropzone:hover .icon-wrapper {
                    background: #e2e8f0;
                color: var(--primary);
                }

                .text-main {
                    display: block;
                font-weight: 600;
                color: var(--text-main);
                margin-bottom: 4px;
                }

                .text-sub {
                    font - size: 0.875rem;
                color: var(--text-muted);
                }

                .preview-overlay {
                    position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10;
                animation: fadeIn 0.2s ease;
                }

                .img-preview {
                    width: 100%;
                height: 100%;
                object-fit: cover;
                position: absolute;
                top: 0;
                left: 0;
                opacity: 0.3;
                filter: blur(2px);
                }

                .status-icon {
                    margin - bottom: 12px;
                animation: bounce 0.5s ease;
                }

                .loader {
                    animation: spin 1s linear infinite;
                }

                .error-message {
                    display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 12px;
                padding: 10px 16px;
                background: #fef2f2;
                color: #b91c1c;
                border-radius: 8px;
                font-size: 0.875rem;
                border: 1px solid #fee2e2;
                }

                @keyframes fadeIn {
                    from {opacity: 0; }
                to {opacity: 1; }
                }

                @keyframes spin {
                    from {transform: rotate(0deg); }
                to {transform: rotate(360deg); }
                }

                @keyframes bounce {
                    0 %, 100 % { transform: translateY(0); }
                    50% {transform: translateY(-5deg); }
                }
            `}</style>

            <div
                className={`dropzone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />

                {previewUrl && (
                    <div className="preview-overlay">
                        <img src={previewUrl} className="img-preview" alt="Preview" />
                        {isUploading ? (
                            <div className="status-icon">
                                <Loader2 className="loader" size={32} color="#3b82f6" />
                                <p className="text-main" style={{ marginTop: '10px' }}>Subiendo...</p>
                            </div>
                        ) : success ? (
                            <div className="status-icon">
                                <CheckCircle2 size={32} color="#10b981" />
                                <p className="text-main" style={{ marginTop: '10px' }}>¡Listo!</p>
                            </div>
                        ) : null}
                    </div>
                )}

                {!previewUrl && (
                    <>
                        <div className="icon-wrapper">
                            <Upload size={24} />
                        </div>
                        <span className="text-main">
                            {entityType === 'USER' ? 'Cambia tu avatar' : 'Sube fotos del restaurante'}
                        </span>
                        <span className="text-sub">Arrastra y suelta o haz clic para buscar</span>
                    </>
                )}
            </div>

            {error && (
                <div className="error-message">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
