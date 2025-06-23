'use client';

import { useState } from 'react';
import Modal from 'react-modal';

interface AdminKeyModalProps {
  isOpen: boolean;
  onSubmit: (key: string) => void;
  onCancel: () => void;
}

export default function AdminKeyModal({ isOpen, onSubmit, onCancel }: AdminKeyModalProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSubmit(key.trim());
    }
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      className="modal-content"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="bg-white rounded-lg p-8 w-96 max-w-full mx-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          管理者キーを入力してください
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={key}
            onChange={handleKeyChange}
            placeholder="管理者キー"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-black"
            autoFocus
            required
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
          <div className="flex space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-lg font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-lg font-medium"
            >
              認証
            </button>
          </div>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          正しい管理者キーを入力してアクセスしてください
        </p>
      </div>
    </Modal>
  );
}
