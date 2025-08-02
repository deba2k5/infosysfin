import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  Shield, 
  Leaf,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
// Mock translation function
const useTranslation = () => ({
  t: (key: string) => key,
  i18n: { language: 'en' }
});
// Mock components
const SpeakButton: React.FC<{ textKey: string }> = () => null;
const ReadPageButton: React.FC = () => null;
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
// Mock password reset function
const sendPasswordResetEmail = async (auth: any, email: string) => {
  // Mock implementation
  console.log('Password reset email sent to:', email);
  return Promise.resolve();
};

const Auth = () => {
  const { t } = useTranslation();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    farmerId: '',
    location: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await signIn(loginData.email, loginData.password);
      setSuccess('Login successful! Redirecting...');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (signupData.password !== signupData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      await signUp(signupData.email, signupData.password);
      setSuccess('Account created successfully! Please check your email for verification.');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (form: 'login' | 'signup', field: string, value: string) => {
    if (form === 'login') {
      setLoginData(prev => ({ ...prev, [field]: value }));
    } else {
      setSignupData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Redirect to dashboard after login/signup using useEffect
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">
              Krishi Sure
            </h1>
            <SpeakButton textKey="authentication" />
          </div>
          <p className="text-green-700 dark:text-green-300">
            {t('welcomeToKrishiSure')}
          </p>
          <ReadPageButton text={t('authentication')} />
        </div>

        <Card className="bg-white/90 dark:bg-gray-800/90 border-green-200 dark:border-green-700 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-green-800 dark:text-green-200">
              {isLogin ? t('welcomeBack') : t('createAccount')}
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              {isLogin ? t('loginToAccess') : t('joinKrishiSure')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={isLogin ? "login" : "signup"} onValueChange={(value) => setIsLogin(value === "login")}> 
              <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-gray-800/80 border border-green-200 dark:border-green-700">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  {t('login')}
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  {t('signup')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                {forgotPasswordMode ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-green-800 dark:text-green-200">
                        {t('email')}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder={t('enterEmail')}
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    {error && (
                      <Alert className="border-red-300 bg-red-100 dark:bg-red-900/30">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert className="border-green-300 bg-green-100 dark:bg-green-900/30">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                          {success}
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                      {loading ? <span className="flex items-center justify-center"><span className="loader mr-2"></span>{t('sending')}</span> : t('sendResetLink')}
                    </Button>
                    <Button type="button" variant="link" className="w-full text-green-600 hover:text-green-700" onClick={() => { setForgotPasswordMode(false); setResetSent(false); setError(''); setSuccess(''); }} disabled={loading}>
                      {t('backToLogin')}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-green-800 dark:text-green-200">
                        {t('email')}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder={t('enterEmail')}
                          value={loginData.email}
                          onChange={(e) => handleInputChange('login', 'email', e.target.value)}
                          className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-green-800 dark:text-green-200">
                        {t('password')}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t('enterPassword')}
                          value={loginData.password}
                          onChange={(e) => handleInputChange('login', 'password', e.target.value)}
                          className="pl-10 pr-10 border-green-300 focus:border-green-500 focus:ring-green-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-green-600 hover:text-green-700"
                          tabIndex={-1}
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remember"
                          className="rounded border-green-300 text-green-600 focus:ring-green-500"
                          disabled={loading}
                        />
                        <Label htmlFor="remember" className="text-sm text-green-700 dark:text-green-300">
                          {t('rememberMe')}
                        </Label>
                      </div>
                      <Button type="button" variant="link" className="text-green-600 hover:text-green-700 p-0 h-auto" onClick={() => { setForgotPasswordMode(true); setError(''); setSuccess(''); }} disabled={loading}>
                        {t('forgotPassword')}
                      </Button>
                    </div>
                    {error && (
                      <Alert className="border-red-300 bg-red-100 dark:bg-red-900/30">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert className="border-green-300 bg-green-100 dark:bg-green-900/30">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                          {success}
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                      {loading ? <span className="flex items-center justify-center"><span className="loader mr-2"></span>{t('loggingIn')}</span> : t('login')}
                    </Button>
                  </form>
                )}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-green-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-green-700 dark:text-green-300">
                      {t('orContinueWith')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                    Google
                  </Button>
                  <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                    Facebook
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-green-800 dark:text-green-200">
                      {t('fullName')}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                                              <Input
                          id="signup-name"
                          type="text"
                          placeholder={t('enterFullName')}
                          value={signupData.name}
                          onChange={(e) => handleInputChange('signup', 'name', e.target.value)}
                          className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
                          required
                          disabled={loading}
                        />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-green-800 dark:text-green-200">
                        {t('email')}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder={t('enterEmail')}
                          value={signupData.email}
                          onChange={(e) => handleInputChange('signup', 'email', e.target.value)}
                          className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="text-green-800 dark:text-green-200">
                        {t('phoneNumber')}
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder={t('enterPhone')}
                          value={signupData.phone}
                          onChange={(e) => handleInputChange('signup', 'phone', e.target.value)}
                          className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-farmer-id" className="text-green-800 dark:text-green-200">
                        {t('farmerId')}
                      </Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                        <Input
                          id="signup-farmer-id"
                          type="text"
                          placeholder={t('enterFarmerId')}
                          value={signupData.farmerId}
                          onChange={(e) => handleInputChange('signup', 'farmerId', e.target.value)}
                          className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-location" className="text-green-800 dark:text-green-200">
                        {t('location')}
                      </Label>
                      <div className="relative">
                        <Leaf className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                        <Input
                          id="signup-location"
                          type="text"
                          placeholder={t('enterLocation')}
                          value={signupData.location}
                          onChange={(e) => handleInputChange('signup', 'location', e.target.value)}
                          className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-green-800 dark:text-green-200">
                        {t('password')}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t('enterPassword')}
                          value={signupData.password}
                          onChange={(e) => handleInputChange('signup', 'password', e.target.value)}
                          className="pl-10 pr-10 border-green-300 focus:border-green-500 focus:ring-green-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-green-600 hover:text-green-700"
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-green-800 dark:text-green-200">
                        {t('confirmPassword')}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                        <Input
                          id="signup-confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t('confirmPassword')}
                          value={signupData.confirmPassword}
                          onChange={(e) => handleInputChange('signup', 'confirmPassword', e.target.value)}
                          className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="rounded border-green-300 text-green-600 focus:ring-green-500"
                      required
                      disabled={loading}
                    />
                    <Label htmlFor="terms" className="text-sm text-green-700 dark:text-green-300">
                      {t('agreeToTerms')}
                    </Label>
                  </div>

                  {error && (
                    <Alert className="border-red-300 bg-red-100 dark:bg-red-900/30">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-300 bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={loading}
                  >
                    {loading ? <span className="flex items-center justify-center"><span className="loader mr-2"></span>{t('creatingAccount')}</span> : t('createAccount')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;