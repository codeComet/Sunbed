import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
    const modalOverlayStyle = isOpen ? 'block' : 'hidden';
    const modalStyle = isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';

    return (
        <div style={{zIndex: 9999}} className={`fixed inset-0 overflow-y-auto ${modalOverlayStyle} bg-gray-500 bg-opacity-50 flex justify-center items-center transition-opacity`}>
            <div className={`bg-white p-4 rounded-lg max-h-[70%] w-[80%] overflow-y-scroll shadow-lg transition-transform ${modalStyle}`}>
                <div className="flex justify-end">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="mt-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
