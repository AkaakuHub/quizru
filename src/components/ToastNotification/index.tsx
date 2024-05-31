// toastコンポーネント
// 引数として、メッセージ、残留時間、スタイルを受け取る

import React from 'react';
import { useState, useEffect } from 'react';
import './index.css';

interface ToastNotificationProps {
  message: string;
  duration: number;
  style?: React.CSSProperties;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, duration, style }) => {
  const [show, setShow] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className={`toast-notification ${show ? 'show' : ''}`} style={style}>
      <p>{message}</p>
    </div>
  );
};

export default ToastNotification;