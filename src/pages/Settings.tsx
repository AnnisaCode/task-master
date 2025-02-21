import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Shield, Globe, Palette, Mail, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  id: string;
  email_notifications: boolean;
  desktop_notifications: boolean;
  two_factor_auth: boolean;
  language: string;
  created_at: string;
  updated_at: string;
}

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    full_name: '',
    avatar_url: null,
    phone: '',
    created_at: '',
    updated_at: ''
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    id: '',
    email_notifications: false,
    desktop_notifications: false,
    two_factor_auth: false,
    language: 'en',
    created_at: '',
    updated_at: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not found');

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Set formData with user and profile data
      setFormData({
        email: user.email || '',
        newPassword: '', // Pastikan ini kosong saat memuat data
        confirmPassword: '', // Pastikan ini kosong saat memuat data
        fullName: profileData?.full_name || '',
        phone: profileData?.phone || ''
      });

      // Load preferences
      let preferencesResult = await supabase
        .from('user_preferences')
        .select('*')
        .eq('id', user.id)
        .single();

      // Jika preferences belum ada, buat baru
      if (!preferencesResult.data) {
        const newPreferences = {
          id: user.id,
          email_notifications: false,
          desktop_notifications: false,
          two_factor_auth: false,
          language: 'en'
        };

        preferencesResult = await supabase
          .from('user_preferences')
          .insert([newPreferences])
          .select()
          .single();

        if (preferencesResult.error) throw preferencesResult.error;
      }

      if (profileData) setProfile(profileData);
      if (preferencesResult.data) setPreferences(preferencesResult.data);

    } catch (error: Error | unknown) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleChangePassword = async () => {
    try {
      if (oldPassword.trim() === '' || formData.newPassword.trim() === '' || formData.confirmPassword.trim() === '') {
        throw new Error('Please fill in all password fields');
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Verifikasi password lama
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: formData.email, // Pastikan email diisi
        password: oldPassword,
      });

      if (verifyError) throw new Error('Old password is incorrect');

      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      // Reset password fields
      setFormData({
        ...formData,
        newPassword: '',
        confirmPassword: ''
      });
      setOldPassword(''); // Reset password lama
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not found');

      // Update email dengan verifikasi
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        if (emailError) throw emailError;

        // Update email di tabel profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            email: formData.email // Update email di tabel profiles
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        toast({
          title: "Email Update",
          description: "Please check your new email for verification",
        });
      }

      // Update auth user data
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName
        }
      });

      if (authError) throw authError;

      // Update profile (termasuk phone)
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileUpdateError) throw profileUpdateError;

      // Update preferences
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .update({
          email_notifications: preferences.email_notifications,
          desktop_notifications: preferences.desktop_notifications,
          two_factor_auth: preferences.two_factor_auth,
          language: preferences.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (preferencesError) throw preferencesError;

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handlePreferencesChange = (field: keyof Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your profile</p>
        </div>

        {/* Profile Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Profile Settings</h2>
          <Card className="p-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
                <p className="text-sm text-muted-foreground">
                  Changing email requires verification
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+628123456789"
                  pattern="^\+[1-9]\d{1,14}$"
                  title="Please enter phone number in international format (e.g. +628123456789)"
                />
                <p className="text-sm text-muted-foreground">
                  Enter phone number in international format (e.g. +628123456789)
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Appearance Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Appearance</h2>
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  <Label>Dark Mode</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Toggle dark mode theme
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </Card>
        </div>

        {/* Notification Settings */}
        {/* <div className="space-y-4">
          <h2 className="text-xl font-semibold">Notification Settings</h2>
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label>Email Notifications</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => handlePreferencesChange('email_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Label>Desktop Notifications</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Show desktop notifications for activities
                </p>
              </div>
              <Switch
                checked={preferences.desktop_notifications}
                onCheckedChange={(checked) => handlePreferencesChange('desktop_notifications', checked)}
              />
            </div>
          </Card>
        </div> */}

        {/* Security Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Security Settings</h2>
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Old Password</Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                />
                <Button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 border-none bg-transparent hover:bg-transparent"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? (
                    <EyeOff className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  ) : (
                    <Eye className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 border-none bg-transparent hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  ) : (
                    <Eye className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  )}
                </Button>
              </div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 border-none bg-transparent hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  ) : (
                    <Eye className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  )}
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleChangePassword}>Change Password</Button>
          </Card>
        </div>

        {/* Language Settings */}
        {/* <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <Label>Language</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose your preferred language
            </p>
          </div>
          <Select
            value={preferences.language}
            onValueChange={(value) => handlePreferencesChange('language', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={loadUserData} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
