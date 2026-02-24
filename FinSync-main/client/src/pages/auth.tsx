import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogoText } from "@/components/ui/logo";
import { InteractiveBackground } from "@/components/ui/interactive-background";
import { Mail, Lock, User, Building, Eye, EyeOff, Check, AlertCircle, Loader2, Shield, Zap, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AuthPageProps {
  onLoginSuccess?: () => void;
  onSignupSuccess?: () => void;
}

export default function AuthPage({ onLoginSuccess = () => {}, onSignupSuccess = () => {} }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  // Only clear auth data if user explicitly logs out
  // Don't clear on page load to preserve sessions
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    company: ""
  });
  const { login, register } = useAuth();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const dynamicTexts = [
    "Enterprise GST\nCompliance Suite",
    "AI-Powered\nTax Automation",
    "Real-time\nCompliance Tracking",
    "Smart Invoice\nProcessing"
  ];

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);

    // Dynamic text rotation
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % dynamicTexts.length);
    }, 4000);

    return () => clearInterval(textInterval);
  }, []);

  // Real-time validation
  const validateField = (field: string, value: string) => {
    const errors: {[key: string]: string} = {};
    
    switch (field) {
      case 'email':
        if (!value) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Invalid email format';
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }
        break;
      case 'name':
        if (!isLogin && !value) {
          errors.name = 'Full name is required';
        }
        break;
      case 'company':
        if (!isLogin && !value) {
          errors.company = 'Company name is required';
        }
        break;
    }
    
    setFormErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  // Check if field is valid
  const isFieldValid = (field: string, value: string) => {
    switch (field) {
      case 'email':
        return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'password':
        return value && value.length >= 6;
      case 'name':
        return !isLogin ? value.length > 0 : true;
      case 'company':
        return !isLogin ? value.length > 0 : true;
      default:
        return false;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate all fields
    const emailValid = validateField('email', formData.email);
    const passwordValid = validateField('password', formData.password);
    const nameValid = isLogin || validateField('name', formData.name);
    const companyValid = isLogin || validateField('company', formData.company);
    
    if (!emailValid || !passwordValid || !nameValid || !companyValid) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (isLogin) {
        await login(formData.email, formData.password);
        toast({
          title: "Login Successful",
          description: "Welcome to FinSync Enterprise",
        });
        // Call the onLoginSuccess callback if provided
        onLoginSuccess?.();
      } else {
        await register(formData.email, formData.password, formData.name, formData.company, undefined);
        // After successful registration, the user is automatically logged in
        // Call the onSignupSuccess callback if provided
        onSignupSuccess?.();
        toast({
          title: "Registration Successful", 
          description: "Welcome to FinSync! Redirecting to your dashboard...",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear previous error and validate
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation for better UX
    if (value) {
      validateField(field, value);
    }
  };

  const handleFieldFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleFieldBlur = (field: string, value: string) => {
    setFocusedField(null);
    validateField(field, value);
  };

  return (
    <div className="h-screen relative overflow-hidden" ref={containerRef}>
      {/* Full Screen Interactive Financial Network Background */}
      <InteractiveBackground className="z-0" />
      
      {/* Right Side Login Panel */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
        <div className="w-[450px] bg-black/20 backdrop-blur-sm relative overflow-hidden shadow-2xl rounded-2xl border border-cyan-400/30">
          {/* Transparent Glass Panel Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-blue-900/20 to-cyan-900/15 backdrop-blur-sm rounded-2xl"></div>
          
          {/* Subtle Glow Effects */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <motion.div 
              className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/15 rounded-full blur-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-br from-blue-400/15 to-cyan-400/10 rounded-full blur-2xl"
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 p-6"
            data-testid="auth-page"
          >
        {/* Modern Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg border border-cyan-400/30">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl font-bold text-white mb-2 tracking-tight drop-shadow-lg"
          >
            {isLogin ? "Welcome Back" : "Join FinSync"}
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-cyan-200 text-base font-light"
          >
            {isLogin 
              ? "Access your dashboard" 
              : "Start your journey"
            }
          </motion.p>
        </div>

        {/* Modern Authentication Form */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-black/10 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-cyan-400/20"
        >
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">

            <Tabs value={isLogin ? "login" : "register"} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-black/60 p-1 rounded-2xl border border-cyan-400/40 backdrop-blur-sm shadow-lg">
                <TabsTrigger 
                  value="login" 
                  onClick={() => setIsLogin(true)}
                  data-testid="login-tab"
                  className="text-cyan-300/80 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 rounded-xl py-3 transition-all duration-300 data-[state=active]:border data-[state=active]:border-cyan-400/60 hover:text-cyan-200"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  onClick={() => setIsLogin(false)}
                  data-testid="register-tab"
                  className="text-cyan-300/80 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 rounded-xl py-3 transition-all duration-300 data-[state=active]:border data-[state=active]:border-cyan-400/60 hover:text-cyan-200"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Registration fields */}
                {!isLogin && (
                  <>
                    <motion.div 
                      className="space-y-2"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <Label htmlFor="name" className="text-sm text-cyan-200 aesthetic-body mb-2 block flex items-center justify-between">
                        Full Name
                        {formData.name && isFieldValid('name', formData.name) && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-emerald-500"
                          >
                            <Check className="w-4 h-4" />
                          </motion.div>
                        )}
                      </Label>
                      <div className="relative group">
                        <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                          focusedField === 'name' ? 'text-blue-500' : 
                          formErrors.name ? 'text-red-500' : 
                          isFieldValid('name', formData.name) ? 'text-emerald-500' : 'text-gray-400'
                        }`} />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          onFocus={() => handleFieldFocus('name')}
                          onBlur={(e) => handleFieldBlur('name', e.target.value)}
                          className={`pl-11 py-3 rounded-xl transition-all duration-300 font-medium bg-black/20 backdrop-blur-sm border-2 text-white placeholder-cyan-300/70 ${
                            focusedField === 'name' ? 'border-blue-400 ring-4 ring-blue-400/10 shadow-lg transform scale-[1.02]' :
                            formErrors.name ? 'border-red-400 ring-4 ring-red-400/10' :
                            isFieldValid('name', formData.name) ? 'border-emerald-400 ring-4 ring-emerald-400/10' :
                            'border-cyan-400/30 hover:border-gray-300'
                          }`}
                          required={!isLogin}
                          data-testid="name-input"
                        />
                        {formErrors.name && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          </motion.div>
                        )}
                      </div>
                      <AnimatePresence>
                        {formErrors.name && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-red-500 mt-1 aesthetic-light"
                          >
                            {formErrors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div 
                      className="space-y-2"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <Label htmlFor="company" className="text-sm text-cyan-200 aesthetic-body mb-2 block flex items-center justify-between">
                        Company Name
                        {formData.company && isFieldValid('company', formData.company) && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-emerald-500"
                          >
                            <Check className="w-4 h-4" />
                          </motion.div>
                        )}
                      </Label>
                      <div className="relative group">
                        <Building className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                          focusedField === 'company' ? 'text-blue-500' : 
                          formErrors.company ? 'text-red-500' : 
                          isFieldValid('company', formData.company) ? 'text-emerald-500' : 'text-gray-400'
                        }`} />
                        <Input
                          id="company"
                          type="text"
                          placeholder="Enter your company name"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          onFocus={() => handleFieldFocus('company')}
                          onBlur={(e) => handleFieldBlur('company', e.target.value)}
                          className={`pl-11 py-3 rounded-xl transition-all duration-300 font-medium bg-black/20 backdrop-blur-sm border-2 text-white placeholder-cyan-300/70 ${
                            focusedField === 'company' ? 'border-blue-400 ring-4 ring-blue-400/10 shadow-lg transform scale-[1.02]' :
                            formErrors.company ? 'border-red-400 ring-4 ring-red-400/10' :
                            isFieldValid('company', formData.company) ? 'border-emerald-400 ring-4 ring-emerald-400/10' :
                            'border-cyan-400/30 hover:border-gray-300'
                          }`}
                          required={!isLogin}
                          data-testid="company-input"
                        />
                        {formErrors.company && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          </motion.div>
                        )}
                      </div>
                      <AnimatePresence>
                        {formErrors.company && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-red-500 mt-1 aesthetic-light"
                          >
                            {formErrors.company}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </>
                )}

                {/* Email field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: isLogin ? 0.7 : 0.9 }}
                >
                  <Label htmlFor="email" className="text-sm text-cyan-200 aesthetic-body mb-2 block flex items-center justify-between">
                    Email Address
                    {formData.email && isFieldValid('email', formData.email) && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-emerald-500"
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </Label>
                  <div className="relative group">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                      focusedField === 'email' ? 'text-blue-500' : 
                      formErrors.email ? 'text-red-500' : 
                      isFieldValid('email', formData.email) ? 'text-emerald-500' : 'text-gray-400'
                    }`} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onFocus={() => handleFieldFocus('email')}
                      onBlur={(e) => handleFieldBlur('email', e.target.value)}
                      className={`pl-11 py-3 rounded-xl transition-all duration-300 font-medium bg-black/20 backdrop-blur-sm border-2 text-white placeholder-cyan-300/70 ${
                        focusedField === 'email' ? 'border-blue-400 ring-4 ring-blue-400/10 shadow-lg transform scale-[1.02]' :
                        formErrors.email ? 'border-red-400 ring-4 ring-red-400/10' :
                        isFieldValid('email', formData.email) ? 'border-emerald-400 ring-4 ring-emerald-400/10' :
                        'border-cyan-400/30 hover:border-gray-300'
                      }`}
                      required
                      data-testid="email-input"
                    />
                    {formErrors.email && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </motion.div>
                    )}
                  </div>
                  <AnimatePresence>
                    {formErrors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-red-500 mt-1 aesthetic-light"
                      >
                        {formErrors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: isLogin ? 0.8 : 1.0 }}
                >
                  <Label htmlFor="password" className="text-sm text-cyan-200 aesthetic-body mb-2 block flex items-center justify-between">
                    Password
                    {formData.password && isFieldValid('password', formData.password) && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-emerald-500"
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </Label>
                  <div className="relative group">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                      focusedField === 'password' ? 'text-blue-500' : 
                      formErrors.password ? 'text-red-500' : 
                      isFieldValid('password', formData.password) ? 'text-emerald-500' : 'text-gray-400'
                    }`} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      onFocus={() => handleFieldFocus('password')}
                      onBlur={(e) => handleFieldBlur('password', e.target.value)}
                      className={`pl-11 pr-20 py-3 rounded-xl transition-all duration-300 font-medium bg-black/20 backdrop-blur-sm border-2 text-white placeholder-cyan-300/70 ${
                        focusedField === 'password' ? 'border-blue-400 ring-4 ring-blue-400/10 shadow-lg transform scale-[1.02]' :
                        formErrors.password ? 'border-red-400 ring-4 ring-red-400/10' :
                        isFieldValid('password', formData.password) ? 'border-emerald-400 ring-4 ring-emerald-400/10' :
                        'border-cyan-400/30 hover:border-gray-300'
                      }`}
                      required
                      data-testid="password-input"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                      {formErrors.password && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </motion.div>
                      )}
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        data-testid="toggle-password"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </motion.button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {formErrors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-red-500 mt-1 aesthetic-light"
                      >
                        {formErrors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Submit button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-8 py-5 text-lg font-bold transition-all duration-300 transform rounded-2xl bg-gradient-to-r from-cyan-600 via-cyan-700 to-blue-600 hover:from-cyan-700 hover:via-cyan-800 hover:to-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl shadow-cyan-500/20 text-white relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed border border-cyan-400/30"
                    data-testid="submit-button"
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center justify-center space-x-2"
                        >
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="text"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center justify-center space-x-2"
                        >
                          <span>{isLogin ? "Sign In" : "Create Account"}</span>
                          <motion.div
                            className="w-5 h-5 rounded-full bg-white/20"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    
                    {/* Ripple effect on click */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                  </Button>
                </motion.div>
              </form>

              {/* Footer */}
              <motion.div 
                className="mt-8 text-center text-sm text-gray-600 aesthetic-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                {isLogin ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      data-testid="switch-to-register"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      data-testid="switch-to-login"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </motion.div>
            </Tabs>
          </CardContent>
        </Card>
        </motion.div>

        {/* Enhanced Security notice */}
        <motion.div 
          className="mt-10 text-center text-xs text-cyan-300 aesthetic-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-3">
            <motion.div 
              className="flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
            >
              <Shield className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-600 font-medium">SSL Secured</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="w-3 h-3 text-blue-500" />
              <span className="text-blue-600 font-medium">256-bit Encryption</span>
            </motion.div>
          </div>
          <p className="tracking-wide text-gray-400">🔒 Enterprise-grade security • GDPR compliant • ISO 27001 certified</p>
        </motion.div>
        
        {/* Professional Progress Indicator */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
        />
      </motion.div>
        </div>
      </div>
    </div>
  );
}