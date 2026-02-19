import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthTitle from "../components/ui/AuthTitle";
import InputField from "../components/ui/InputField";
import { validateSignup } from "../utils/validate";
import Button from "../components/ui/Button";

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
                // replace with actual API call
                await new Promise((res) => setTimeout(res, 2000)); // remove once I have an API
                navigate("/");
            // eslint-disable-next-line no-unused-vars
            } catch (err) {
                // handle errors
                setLoading(false);
            }
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-bg-primary">
            <div className="w-full max-w-md p-4">
                <AuthTitle
                    title="Create Account"
                    description={<>Please Sign up to continue<br />your journey</>}
                />

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8 mt-6">
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
                            value=""
                            className="w-4 h-4 border-[1.5px] border-deep-teal rounded-md bg-bg-secondary focus:ring-2 focus:ring-deep-teal cursor-pointer accent-deep-teal" />
                        <label
                            htmlFor="link-checkbox"
                            className="select-none ms-2 text-sm font-medium text-text-body">
                            Agree with{" "}
                            <Link
                                to="/"
                                className="text-deep-teal hover:underline">
                                Terms & Conditions
                            </Link>
                        </label>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            text="Sign Up"
                            type="submit"
                            variant="primary"
                            loading={loading}
                        />

                        <Button
                            text="Continue as a Guest"
                            variant="outline"
                            onClick={() => navigate("/")}
                            disabled={loading}
                            className="mt-0"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
