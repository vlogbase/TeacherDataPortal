import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/use-user";
import type { InsertUser } from "@db/schema";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";

function generateSecurePassword() {
  const length = 16;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

function calculatePasswordStrength(password: string): number {
  if (!password) return 0;
  let strength = 0;

  // Length check
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;

  // Character variety checks
  if (/[a-z]/.test(password)) strength += 10;
  if (/[A-Z]/.test(password)) strength += 10;
  if (/[0-9]/.test(password)) strength += 10;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

  return Math.min(strength, 100);
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { login, register } = useUser();
  const form = useForm<InsertUser>();

  const onSubmit = async (data: InsertUser) => {
    try {
      if (isLogin) {
        await login(data);
      } else {
        await register(data);
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strength = calculatePasswordStrength(e.target.value);
    setPasswordStrength(strength);
    form.setValue("password", e.target.value);
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    form.setValue("password", newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  return (
    <div className="min-h-screen bg-[#2D6A4F] flex flex-col items-center justify-center relative p-4">
      {/* Decorative elements */}
      <div className="absolute top-8 right-8 flex gap-2">
        <div className="w-4 h-4 rounded-full bg-[#95D5B2] opacity-50"></div>
        <div className="w-4 h-4 rounded-full bg-[#95D5B2] opacity-75"></div>
      </div>
      <div className="absolute bottom-8 left-8">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/40"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="text-center mb-8 text-white">
        <h1 className="text-4xl font-bold mb-4">Teachers Digitisation Project</h1>
        <p className="text-lg text-[#B7E4C7]">
          A secure online portal for Academic and Non-Academic Staff in Niger State
        </p>
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#2D6A4F]">
            {isLogin ? "Sign In" : "Create Account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                className="border-[#2D6A4F]/20"
                {...form.register("username", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="border-[#2D6A4F]/20 pr-10"
                    {...form.register("password", { required: true })}
                    onChange={handlePasswordChange}
                  />
                  {!isLogin && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={handleGeneratePassword}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!isLogin && (
                  <div className="space-y-1">
                    <Progress value={passwordStrength} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {passwordStrength < 40 && "Weak"}
                      {passwordStrength >= 40 && passwordStrength < 75 && "Medium"}
                      {passwordStrength >= 75 && "Strong"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white"
            >
              {isLogin ? "Sign In" : "Register"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[#2D6A4F]"
            >
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Sign In"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}