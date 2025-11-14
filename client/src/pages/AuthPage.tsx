import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth';
import { SocialButtons } from '../components/auth/SocialButtons';

type LoginFormValues = {
  identifier: string;
  password: string;
};

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

export const AuthPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCredentials, user } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginFormValues>();
  const registerForm = useForm<RegisterFormValues>();

  useEffect(() => {
    if (user) {
      navigate('/floorplan');
    }
  }, [user, navigate]);

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    setServerMessage(null);
    try {
      const { data } = await api.post('/auth/login', values);
      setCredentials({ user: data.user, token: data.token });
      navigate('/floorplan');
    } catch (error: unknown) {
      setServerMessage('Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setLoading(true);
    setServerMessage(null);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'string') {
          formData.append(key, value);
        }
      });
      await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setServerMessage('Registration successful! Check email to verify before login.');
      setMode('login');
    } catch (error: unknown) {
      setServerMessage('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: string) => {
    try {
      const { data } = await api.post('/auth/oauth', {
        provider,
        email: `demo+${provider}@example.com`,
        firstName: provider === 'apple' ? 'Apple' : provider.charAt(0).toUpperCase() + provider.slice(1),
        lastName: 'User',
        oauthId: crypto.randomUUID(),
      });
      setCredentials({ user: data.user, token: data.token });
      navigate('/floorplan');
    } catch {
      setServerMessage(`${provider} login failed (mock).`);
    }
  };

  const activeForm =
    mode === 'login' ? (
      <form
        className="space-y-4"
        onSubmit={loginForm.handleSubmit(handleLogin)}
        noValidate
      >
        <div>
          <label className="block text-sm font-medium text-white">
            {t('auth.email')} / {t('auth.phone')}
          </label>
          <input
            type="text"
            {...loginForm.register('identifier', { required: true })}
            className="mt-1 w-full rounded-md px-3 py-2 bg-[#3C3C3C] text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">
            {t('auth.password')}
          </label>
          <input
            type="password"
            {...loginForm.register('password', { required: true })}
            className="mt-1 w-full rounded-md px-3 py-2 bg-[#3C3C3C] text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-white py-2 text-black shadow hover:bg-slate-800"
        >
          {loading ? '...' : t('auth.login')}
        </button>
      </form>
    ) : (
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={registerForm.handleSubmit(handleRegister)}
        noValidate
      >
        {(['firstName', 'lastName', 'email', 'phone', 'password'] as const).map((field) => (
          <div key={field} className={field === 'password' ? 'sm:col-span-2' : ''}>
            <label className="block text-sm font-medium text-white">
              {t(`auth.${field}` as const)}
            </label>
            <input
              type={field === 'password' ? 'password' : 'text'}
              {...registerForm.register(field, { required: true })}
              className="mt-1 w-full rounded-md bg-[#3C3C3C] px-3 py-2 text-white"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-2 rounded-lg bg-white py-2 text-black shadow hover:bg-gray-200"
        >
          {loading ? '...' : t('auth.register')}
        </button>
      </form>
    );

  return (
    <section className="w-[100dvw] min-h-[100dvh] flex justify-center items-center bg-cover" style={{ backgroundImage: 'url(/bg.png)' }}>
    <section className="grid max-w-4xl xl:max-w-6xl bg-[#1A1A1B] text-slate-900 lg:grid-cols-2 border border-[#838383]/70 rounded-3xl shadow-2xl shadow-white/50">
      <div className="relative hidden overflow-hidden lg:flex rounded-3xl">
        <img
          src='/login.png'
          alt="Upscale dining room placeholder"
          className="absolute inset-0 h-full w-full object-cover rounded-3xl"
        />
        <div className="relative z-10 flex h-full w-full flex-col justify-end bg-gradient-to-b from-transparent to-black/70 rounded-3xl">
          <div className="flex items-center justify-between bg-black/90 px-6 py-4 text-white">
            <img
              src='/guestit.png'
              alt="Upscale dining room placeholder"
              className="h-10 w-auto"
            />
             <img
              src='/client.png'
              alt="Upscale dining room placeholder"
              className="h-10 w-auto"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center bg-[#1A1A1B] px-6 py-10 sm:px-16 rounded-3xl">
        <div className="w-full max-w-md space-y-8 text-white">
          <h1 className='text-center'>Welcome!</h1>
          <div className="space-y-">
            
            {serverMessage && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                {serverMessage}
              </div>
            )}
            <div>
              {activeForm}
            </div>
          </div>
          <div>
            <SocialButtons onSelect={handleSocial} />
            {mode === 'register' && (
              <div className="mt-4 text-center text-sm text-slate-200">
                <span>Already have an account?</span>{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="ml-2 rounded-md bg-white px-5 py-2 text-sm font-semibold text-black shadow hover:bg-gray-200"
                >
                  Login here
                </button>
              </div>
            ) }
            {mode === 'login' && (
              <div className="mt-6 text-center text-sm text-slate-200">
                <span>Don't have an account?</span>{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="ml-2 rounded-md bg-white px-5 py-2 text-sm font-semibold text-black shadow hover:bg-gray-200"
                >
                  Register here
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
    </section>
  );
};

