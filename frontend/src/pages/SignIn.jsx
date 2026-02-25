import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthTitle from "../components/ui/AuthTitle";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { validateLogin } from "../utils/validate";
import SocialAuth from "../components/ui/SocialAuth";
import SignInImg from '../assets/images/signIn.png'
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
    const [values, setValues] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    function handleChange(e) {
        const { name, value } = e.target;
        const updated = { ...values, [name]: value };
        setValues(updated);
        if (submitted) setErrors(validateLogin(updated));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
        const errs = validateLogin(values);
        setErrors(errs);
        if (Object.keys(errs).length === 0) {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: values.email,
                        // password: values.password,
                    })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                // read name and createdAt saved during registration
                const savedName = localStorage.getItem('userName')
                const savedCreatedAt = localStorage.getItem('userCreatedAt')

                login({
                    email: values.email,
                    name: savedName ?? values.email.split('@')[0],
                    createdAt: savedCreatedAt ?? new Date().toISOString()
                }, data.token);
                navigate('/');
            } catch (err) {
                setErrors({ general: err.message });
                setLoading(false);
            }
        }
    }

    return (
        <div className="flex h-screen bg-bg-primary overflow-hidden justify-center">
            <div className="flex w-full max-w-[1440px] h-full">

                <div className="hidden md:block w-[45%] shrink-0 p-6">
                    <img
                        src={SignInImg}
                        alt="Skincare store"
                        className="h-full w-full object-cover rounded-3xl"
                    />
                </div>

                <div className="flex flex-1 items-center justify-center px-6 md:px-16 overflow-y-auto">
                    <div className="w-full max-w-md">
                        <AuthTitle
                            title="Welcome Back!"
                            description="Sign in to start scanning safely"
                        />

                        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 mt-6">
                            <InputField
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="example@gmail.com"
                                value={values.email}
                                onChange={handleChange}
                                error={errors.email}
                            />
                            <InputField
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="••••••••••"
                                value={values.password}
                                onChange={handleChange}
                                error={errors.password}
                            />
                            <div className="flex justify-end -mt-2">
                                <a href="/forgot-password" className="text-sm text-deep-teal hover:text-primary hover:underline transition-colors">
                                    Forgot password?
                                </a>
                            </div>

                            {errors.general && (
                                <p className="text-sm text-danger text-center -mt-2">{errors.general}</p>
                            )}

                            <Button
                                text="Sign In"
                                type="submit"
                                variant="primary"
                                loading={loading}
                                loadingText="Signing In..."
                                className="mt-5"
                            />
                        </form>

                        <SocialAuth
                            auth="Sign In"
                            redirectTo="/register"
                            alternateLink="Sign Up"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}