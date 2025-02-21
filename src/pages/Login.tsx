import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Mohon isi semua field");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Login berhasil!");
        navigate("/");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Terjadi kesalahan saat login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Masuk</h1>
          <p className="text-muted-foreground mt-2">Masuk ke akun Anda</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Masukkan email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Masuk..." : "Masuk"}
          </Button>
        </form>
        <p className="text-center mt-4 text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Daftar
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
