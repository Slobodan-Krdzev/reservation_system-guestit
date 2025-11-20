import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
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
      setCredentials({ user: data.user, token: data.token, refreshToken: data.refreshToken });
      navigate('/floorplan');
    } catch {
      setServerMessage('Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setLoading(true);
    setServerMessage(null);
    try {
      // Send as JSON since we're not uploading an avatar anymore
      await api.post('/auth/register', values);
      setServerMessage('Registration successful! Check email to verify before login.');
      setMode('login');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        setServerMessage(axiosError.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        setServerMessage('Registration failed. Please try again.');
      }
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
      setCredentials({ user: data.user, token: data.token, refreshToken: data.refreshToken || '' });
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
            {t('auth.email')} 
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
        {(['firstName', 'lastName'] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-white">
              {t(`auth.${field}` as const)}
            </label>
            <input
              type="text"
              {...registerForm.register(field, { required: true })}
              className="mt-1 w-full rounded-md bg-[#3C3C3C] px-3 py-2 text-white"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-white">
            {t('auth.email')}
          </label>
          <input
            type="email"
            {...registerForm.register('email', { required: true })}
            className="mt-1 w-full rounded-md bg-[#3C3C3C] px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">
            {t('auth.phone')}
          </label>
          <div className="mt-1 relative">
            <Controller
              name="phone"
              control={registerForm.control}
              rules={{ required: true }}
              render={({ field }) => (
                <PhoneInput
                  {...field}
                  international
                  defaultCountry="US"
                  className="phone-input-wrapper"
                />
              )}
            />
          </div>
          <style>{`
            .phone-input-wrapper {
              position: relative;
            }
            .phone-input-wrapper .PhoneInput {
              display: flex;
              align-items: center;
              position: relative;
            }
            .phone-input-wrapper .PhoneInputCountry {
              position: absolute;
              left: 0.75rem;
              top: 50%;
              transform: translateY(-50%);
              z-index: 2;
              display: flex;
              align-items: center;
            }
            .phone-input-wrapper .PhoneInputCountrySelect {
              background: transparent;
              border: none;
              outline: none;
              padding: 0;
              cursor: pointer;
              display: flex;
              align-items: center;
              transition: opacity 0.2s;
            }
            .phone-input-wrapper .PhoneInputCountrySelect:hover {
              opacity: 0.8;
            }
            .phone-input-wrapper .PhoneInputCountrySelect:focus {
              outline: none;
              border: none;
            }
            .phone-input-wrapper .PhoneInputCountryIcon {
              
              border: none;
              outline: none;
              
            }
            .phone-input-wrapper .PhoneInputCountrySelectArrow {
              display: none;
            }
            .phone-input-wrapper .PhoneInputInput {
              width: 100%;
              background-color: #3C3C3C;
              color: white;
              border: none;
              outline: none;
              padding: 0.5rem 0.75rem 0.5rem 2.75rem;
              border-radius: 0.375rem;
            }
            .phone-input-wrapper .PhoneInputInput::placeholder {
              color: rgba(255, 255, 255, 0.5);
            }
            .phone-input-wrapper .PhoneInputInput:focus {
              outline: 2px solid rgba(255, 255, 255, 0.3);
              outline-offset: 2px;
            }
            .phone-input-wrapper select.PhoneInputCountrySelect {
              appearance: none;
              -webkit-appearance: none;
              -moz-appearance: none;
              border: none;
              outline: none;
            }
          `}</style>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-white">
            {t('auth.password')}
          </label>
          <input
            type="password"
            {...registerForm.register('password', { required: true })}
            className="mt-1 w-full rounded-md bg-[#3C3C3C] px-3 py-2 text-white"
          />
        </div>
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

