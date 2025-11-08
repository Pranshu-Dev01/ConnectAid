import React, { useState, useEffect } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { useAuth } from '../hooks/useAuth';

type AuthMode = 'signin' | 'signup';
type LoginMethod = 'options' | 'email' | 'phone';
type PhoneStep = 'number' | 'otp';


const GoogleSignInPopup = ({ onAuthSuccess }: { onAuthSuccess: (user: { name: string; contact: string }) => void }) => {
    useEffect(() => {
        const popupWidth = 450;
        const popupHeight = 600;
        const left = window.screenX + (window.outerWidth - popupWidth) / 2;
        const top = window.screenY + (window.outerHeight - popupHeight) / 2;

        const popup = window.open('', 'google-signin', `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`);
        if (!popup) {
            alert('Popup blocked. Please allow popups for this site to sign in with Google.');
            return;
        }

        const popupHTML = `
            <html>
                <head>
                    <title>Sign in - Google Accounts</title>
                    <style>
                        body { font-family: 'Google Sans', 'Roboto', Arial, sans-serif; margin: 0; display: flex; align-items: center; justify-content: center; background-color: #f5f5f5; }
                        .container { background-color: white; border: 1px solid #ccc; border-radius: 8px; padding: 48px 40px 36px; width: 100%; max-width: 450px; box-sizing: border-box; }
                        .logo { width: 75px; height: 24px; margin: 0 auto 16px; display: block; }
                        h1 { font-size: 24px; font-weight: 400; text-align: center; margin: 0 0 8px; }
                        p { font-size: 16px; text-align: center; margin: 0 0 24px; }
                        .form-group { margin-bottom: 24px; }
                        .input-wrapper { position: relative; }
                        input { width: 100%; padding: 13px 15px; font-size: 16px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
                        input:focus { border-color: #1a73e8; outline: none; box-shadow: 0 0 0 1px #1a73e8; }
                        label { position: absolute; top: 14px; left: 16px; font-size: 16px; color: #5f6368; pointer-events: none; transition: all 0.15s ease-out; }
                        input:focus + label, input:not(:placeholder-shown) + label { top: -9px; left: 10px; font-size: 12px; color: #1a73e8; background-color: white; padding: 0 4px; }
                        .btn-container { display: flex; justify-content: flex-end; }
                        button { background-color: #1a73e8; color: white; border: none; border-radius: 4px; padding: 8px 24px; font-size: 14px; font-weight: 500; cursor: pointer; }
                        button:hover { background-color: #186bd6; box-shadow: 0 1px 3px 1px rgba(0,0,0,0.15); }
                        .email-display { font-size: 14px; padding: 8px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <svg class="logo" viewBox="0 0 75 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M72.413 9.475c0-1.282-.12-2.45-.333-3.617h-11.41v6.866h6.533c-.28 2.19-1.187 3.867-2.587 4.96-.92.747-2.56 1.4-4.813 1.4-5.24 0-8.867-3.64-8.867-8.853s3.627-8.853 8.867-8.853c2.92 0 4.693 1.253 5.773 2.293l-2.48 2.44c-.72-.693-1.853-1.28-3.293-1.28-3.56 0-6.173 2.627-6.173 6.4s2.613 6.4 6.173 6.4c3.027 0 4.28-1.787 4.52-2.92h-4.52v-4.133h7.24c.12.653.187 1.347.187 2.12 0 4.893-2.68 8.4-7.427 8.4-4.973 0-9-4.013-9-9s4.027-9 9-9c2.787 0 5.107 1.027 6.8 2.653l2.8-2.787C67.613 1.4 64.44.025 60.67.025c-7.4 0-13.333 5.92-13.333 13.333s5.933 13.333 13.333 13.333c7.813 0 12.827-5.12 12.827-12.867.000-.933-.08-1.92-.227-2.853z" fill="#4285F4"></path><path d="M43.61.353v26.026h-4.24V.353h4.24z" fill="#34A853"></path><path d="M34.332 13.358c0-7.4-5.386-13.333-12.893-13.333-7.507 0-12.893 5.933-12.893 13.333s5.386 13.333 12.893 13.333c7.507 0 12.893-5.933 12.893-13.333zm-4.494 0c0 4.96-3.134 8.213-8.399 8.213s-8.4-3.253-8.4-8.213c0-4.96 3.133-8.213 8.4-8.213s8.4 3.253 8.4 8.213z" fill="#FBBC05"></path><path d="M.23.353v4.133h4.24V.353H.23zM.23 8.858v17.52h4.24V8.858H.23z" fill="#EA4335"></path></svg>
                        <h1>Sign in</h1>
                        <p>Use your Google Account</p>
                        <form id="google-form">
                            <div id="email-step">
                                <div class="form-group">
                                    <div class="input-wrapper">
                                        <input type="email" id="email" name="email" placeholder=" " required />
                                        <label for="email">Email or phone</label>
                                    </div>
                                </div>
                                <div class="btn-container">
                                    <button type="button" id="next-btn">Next</button>
                                </div>
                            </div>
                             <div id="password-step" style="display:none;">
                                <p class="email-display" id="user-email"></p>
                                <div class="form-group">
                                    <div class="input-wrapper">
                                        <input type="password" id="password" name="password" placeholder=" " required />
                                        <label for="password">Enter your password</label>
                                    </div>
                                </div>
                                <div class="btn-container">
                                    <button type="submit">Sign In</button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <script>
                        const form = document.getElementById('google-form');
                        const nextBtn = document.getElementById('next-btn');
                        const emailStep = document.getElementById('email-step');
                        const passwordStep = document.getElementById('password-step');
                        const emailInput = document.getElementById('email');
                        const userEmailDisplay = document.getElementById('user-email');

                        nextBtn.addEventListener('click', () => {
                            if (emailInput.value) {
                                userEmailDisplay.textContent = emailInput.value;
                                emailStep.style.display = 'none';
                                passwordStep.style.display = 'block';
                                document.getElementById('password').focus();
                            }
                        });

                        form.addEventListener('submit', (e) => {
                            e.preventDefault();
                            const email = emailInput.value;
                            // In a real scenario, you'd verify password. Here, we just proceed.
                            const name = email.split('@')[0].replace('.', ' ').replace(/(?:^|\\s)\\S/g, a => a.toUpperCase()); // Create a name from email
                            window.opener.postMessage({ type: 'google-auth-success', payload: { email, name } }, '*');
                            window.close();
                        });
                    </script>
                </body>
            </html>
        `;
        popup.document.write(popupHTML);
        popup.document.close();

        const handleMessage = (event: MessageEvent) => {
            if (event.source !== popup) return;
            if (event.data.type === 'google-auth-success') {
                const { email, name } = event.data.payload;
                onAuthSuccess({ name, contact: email });
                window.removeEventListener('message', handleMessage);
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
            if (popup && !popup.closed) {
                popup.close();
            }
        };

    }, [onAuthSuccess]);

    return null; // This component only manages the popup
};


export const LoginPage: React.FC<{ onLogin: ReturnType<typeof useAuth> }> = ({ onLogin }) => {
    const { speak } = useSpeech('en-US');
    const { register, login, loginWithGoogle } = onLogin;
    
    const [authMode, setAuthMode] = useState<AuthMode>('signin');
    const [loginMethod, setLoginMethod] = useState<LoginMethod>('options');
    const [isGoogleFlowActive, setIsGoogleFlowActive] = useState(false);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [phoneStep, setPhoneStep] = useState<PhoneStep>('number');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        speak("Welcome to ConnectAid AI. Please sign in or sign up to continue.");
    }, [speak]);

    const handleGoogleAuthSuccess = (googleUser: { name: string; contact: string }) => {
        setIsGoogleFlowActive(false); // Close the flow/component
        loginWithGoogle(googleUser);
    };

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        let result;

        try {
            if (authMode === 'signup') {
                if (loginMethod === 'email') {
                    if (!name) { setError("Name is required for sign up."); setLoading(false); return; }
                    result = await register({ name, contact: email, password, loginMethod });
                } else if (loginMethod === 'phone') {
                    if (!name) { setError("Name is required for sign up."); setLoading(false); return; }
                    result = await register({ name, contact: phone, loginMethod });
                }
            } else { // signin
                if (loginMethod === 'email') {
                    result = await login(email, password);
                } else if (loginMethod === 'phone') {
                    result = await login(phone);
                }
            }
            if (result && !result.success) {
                setError(result.message);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };
    
    const handlePhoneFlow = (e: React.FormEvent) => {
        e.preventDefault();
        if (phoneStep === 'number' && phone.trim()) {
            if (authMode === 'signup' && !name.trim()) {
                setError("Please enter your name to sign up.");
                return;
            }
            setPhoneStep('otp');
            setError('');
        } else if (phoneStep === 'otp') {
            if (otp === '123456') {
                handleAuthSubmit(e);
            } else {
                setError('Invalid OTP. Please try again.');
            }
        }
    };

    const resetState = (newAuthMode?: AuthMode) => {
        setLoginMethod('options');
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setOtp('');
        setPhoneStep('number');
        setError('');
        if (newAuthMode) {
            setAuthMode(newAuthMode);
        }
    };
    
    const renderForm = () => {
        const isSignUp = authMode === 'signup';
        switch (loginMethod) {
            case 'email':
                return (
                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                        {isSignUp && <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required className="input-field" />}
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required className="input-field" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="input-field" />
                        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}</button>
                    </form>
                );
            case 'phone':
                return (
                     <form onSubmit={handlePhoneFlow} className="space-y-4">
                        {phoneStep === 'number' ? (
                            <>
                                {isSignUp && <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required className="input-field" />}
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" required className="input-field" />
                                <button type="submit" className="btn-primary w-full">Send OTP</button>
                            </>
                        ) : (
                            <>
                                <p className="text-center text-gray-300">Enter the OTP sent to {phone}.</p>
                                <p className="text-center text-sm text-gray-500">(Hint: The code is 123456)</p>
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-Digit OTP" required className="input-field text-center tracking-[0.5em]" maxLength={6}/>
                                <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Processing...' : 'Verify & Continue'}</button>
                            </>
                        )}
                    </form>
                );
            default:
                return (
                    <div className="space-y-4">
                        <button onClick={() => setLoginMethod('email')} className="btn-secondary w-full">Continue with Email</button>
                        <button onClick={() => setLoginMethod('phone')} className="btn-secondary w-full">Continue with Phone</button>
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-600"></div>
                            <span className="flex-shrink mx-4 text-gray-400">OR</span>
                            <div className="flex-grow border-t border-gray-600"></div>
                        </div>
                        <button onClick={() => setIsGoogleFlowActive(true)} className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                             <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.35 6.48C12.73 13.72 17.94 9.5 24 9.5z"></path><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.02c4.51-4.18 7.09-10.36 7.09-17.67z"></path><path fill="#FBBC05" d="M10.91 28.19c-.38-.99-.6-2.06-.6-3.19s.22-2.2.6-3.19l-8.35-6.48C.73 17.64 0 20.7 0 24c0 3.3.73 6.36 2.56 8.81l8.35-6.62z"></path><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6.02c-2.18 1.45-4.96 2.3-8.16 2.3-6.06 0-11.27-4.22-13.09-9.92l-8.35 6.48C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                            {authMode === 'signin' ? 'Sign In with Google' : 'Sign Up with Google'}
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-aid-dark text-aid-light flex flex-col items-center justify-center p-4">
            {isGoogleFlowActive && <GoogleSignInPopup onAuthSuccess={handleGoogleAuthSuccess} />}
            <style>{`
                .input-field { width: 100%; padding: 0.75rem 1rem; background-color: #1a202c; border: 1px solid #4a5568; border-radius: 0.5rem; color: white; }
                .input-field:focus { outline: none; border-color: #2b6cb0; box-shadow: 0 0 0 2px rgba(43, 108, 176, 0.5); }
                .btn-primary { padding: 0.75rem 1.5rem; background-color: #2b6cb0; color: white; font-weight: bold; border-radius: 0.5rem; transition: background-color 0.2s; border: 1px solid transparent; }
                .btn-primary:hover { background-color: #2c5282; }
                .btn-primary:disabled { background-color: #4a5568; cursor: not-allowed; }
                .btn-secondary { padding: 0.75rem 1.5rem; background-color: transparent; color: white; font-weight: bold; border-radius: 0.5rem; transition: background-color 0.2s; border: 1px solid #4a5568; }
                .btn-secondary:hover { background-color: #2d3748; }
            `}</style>
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                     <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">ConnectAid <span className="text-aid-blue">AI</span></h1>
                    <p className="text-lg text-gray-400 mt-2">Your AI-powered emergency assistant.</p>
                </div>
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
                    {loginMethod !== 'options' && (
                        <button onClick={() => resetState()} className="text-sm text-aid-blue hover:underline mb-4">&larr; Back to options</button>
                    )}
                    <div className="flex justify-center border-b border-gray-600 mb-4">
                        <button onClick={() => resetState('signin')} className={`px-4 py-2 text-lg font-semibold ${authMode === 'signin' ? 'text-white border-b-2 border-aid-blue' : 'text-gray-400'}`}>Sign In</button>
                        <button onClick={() => resetState('signup')} className={`px-4 py-2 text-lg font-semibold ${authMode === 'signup' ? 'text-white border-b-2 border-aid-blue' : 'text-gray-400'}`}>Sign Up</button>
                    </div>
                    {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}
                    {renderForm()}
                </div>
            </div>
        </div>
    );
};