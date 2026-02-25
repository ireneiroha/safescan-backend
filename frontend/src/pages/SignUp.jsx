import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthTitle from "../components/ui/AuthTitle";
import InputField from "../components/ui/InputField";
import { validateSignup } from "../utils/validate";
import Button from "../components/ui/Button";
import SocialAuth from "../components/ui/SocialAuth";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
    const [values, setValues] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    function handleChange(e) {
        const { name, value } = e.target;
        const updated = { ...values, [name]: value };
        setValues(updated);
        if (submitted) setErrors(validateSignup(updated));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
        const errs = validateSignup(values);
        setErrors(errs);
        if (Object.keys(errs).length === 0) {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: values.email,
                        password: values.password,
                        consent_given: true
                    })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                // register returns no token so immediately login
                const loginRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: values.email,
                        password: values.password,
                    })
                });
                const loginData = await loginRes.json();
                if (!loginRes.ok) throw new Error(loginData.error);

                login({ email: values.email, name: values.fullName }, loginData.token);
                navigate('/scan-home');
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
                        src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&q=80"
                        alt="Skincare products"
                        className="h-full w-full object-cover rounded-3xl"
                    />
                </div>

                <div className="flex flex-1 items-center justify-center px-6 md:px-16 overflow-y-auto py-8">
                    <div className="w-full max-w-md">
                        <AuthTitle
                            title="Create Account"
                            description={<>Please Sign up to continue<br />your journey</>}
                        />

                        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 mt-6">
                            <InputField
                                label="Full Name"
                                name="fullName"
                                placeholder="eg. Agbo Emmanuel"
                                value={values.fullName}
                                onChange={handleChange}
                                error={errors.fullName}
                            />
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
                            <InputField
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••••"
                                value={values.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                            />

                            <div className="flex items-center">
                                <input
                                    id="link-checkbox"
                                    type="checkbox"
                                    className="w-4 h-4 border-[1.5px] border-deep-teal rounded-md bg-bg-secondary focus:ring-2 focus:ring-deep-teal cursor-pointer accent-deep-teal"
                                />
                                <label htmlFor="link-checkbox" className="select-none ms-2 text-sm font-medium text-text-body">
                                    Agree with{" "}
                                    <Link to="/" className="text-deep-teal hover:underline">
                                        Terms & Conditions
                                    </Link>
                                </label>
                            </div>

                            {errors.general && (
                                <p className="text-sm text-danger text-center -mt-2">{errors.general}</p>
                            )}

                            <div className="flex flex-col gap-4">
                                <Button
                                    text="Sign Up"
                                    type="submit"
                                    variant="primary"
                                    loading={loading}
                                    loadingText="Signing Up..."
                                />
                                <Button
                                    text="Continue as a Guest"
                                    variant="outline"
                                    onClick={() => navigate("/scan-home")}
                                    disabled={loading}
                                />
                            </div>
                        </form>

                        <SocialAuth
                            auth="Sign Up"
                            redirectTo="/login"
                            alternateLink="Sign In"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}