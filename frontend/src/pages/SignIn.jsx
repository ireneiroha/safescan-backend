import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthTitle from "../components/ui/AuthTitle";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { validateLogin } from "../utils/validate";
import SocialAuth from "../components/ui/SocialAuth";
// import { useAuth } from "../context/AuthContext";

export default function SignIn() {
    const [values, setValues] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    // const { login } = useAuth()

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
                // replace with actual API call
                // const res = await fetch('/api/auth/login', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(values)
                // })
                // const data = await res.json()
                // login(data.user, data.token)
                await new Promise((res) => setTimeout(res, 2000)); // remove once I have an API

                navigate("/home");
                // eslint-disable-next-line no-unused-vars
            } catch (err) {
                setLoading(false);
            }
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-bg-primary">
            <div className="w-full max-w-md p-4">
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
    )
}