import type React from 'react';
import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type AuthMode = 'login' | 'register';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className='auth-page'>
      <div className='auth-container'>
        <div
          className='auth-logo'
          style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
        >
          <img
            src='/images/default/batibot_logo-removebg-preview.png'
            alt='BATIBOT Logo'
            style={{ width: '80px', height: '80px' }}
          />
          <div>
            <h1>BATIBOT</h1>
            <p>Cross-Game Trading Platform</p>
          </div>
        </div>
        {mode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setMode('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  );
};
