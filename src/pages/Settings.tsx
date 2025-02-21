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
import { Bell, Shield, Globe, Palette, Mail, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
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
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    full_name: '',
    avatar_url: null,
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

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not found');

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

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
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (value: string) => {
    setProfile(prev => ({
      ...prev,
      full_name: value
    }));
  };

  const handlePreferencesChange = (field: keyof Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ''}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              {/* Avatar URL field could be added here if needed */}
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
        <div className="space-y-4">
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
        </div>

        {/* Security Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Security Settings</h2>
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <Label>Two-Factor Authentication</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={preferences.two_factor_auth}
                onCheckedChange={(checked) => handlePreferencesChange('two_factor_auth', checked)}
              />
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">Change Password</Button>
            </div>
          </Card>
        </div>

        {/* Language Settings */}
        <div className="flex items-center justify-between">
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
        </div>

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
