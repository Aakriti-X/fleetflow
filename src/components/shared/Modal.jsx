import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, width = '600px' }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h3 className="modal__title">{title}</h3>
                    <button className="modal__close" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="modal__body">{children}</div>
            </div>
        </div>
    );
}
