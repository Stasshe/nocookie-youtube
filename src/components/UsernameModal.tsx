'use client';

import { useState } from 'react';
import Modal from 'react-modal';

interface UsernameModalProps {
  isOpen: boolean;
  onSubmit: (username: string) => void;
}

export default function UsernameModal({ isOpen, onSubmit }: UsernameModalProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
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
          ユーザー名を入力してください
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            autoFocus
            required
          />
          <button
            type="submit"
            className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-lg font-medium"
          >
            開始
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          管理者の場合は「Admin_Manager」と入力してください
        </p>
      </div>
    </Modal>
  );
}
