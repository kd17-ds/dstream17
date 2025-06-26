import React, { useState, useEffect } from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";

export default function Authentication({ formType }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [formState, setFormState] = useState(formType === "signup" ? 1 : 0);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname === "/signup") setFormState(1);
        else if (location.pathname === "/login") setFormState(0);
    }, [location.pathname]);

    const handleToggle = (state) => {
        setFormState(state);
        navigate(state === 0 ? "/login" : "/signup");
    };

    const handleAuth = async () => {
        try {
            if (formState === 0) {
                // Simulate login
                if (username === "admin" && password === "admin") {
                    setMessage("Login successful!");
                    setError("");
                    setOpen(true);
                } else {
                    throw new Error("Invalid login credentials");
                }
            }
            if (formState === 1) {
                // Simulate registration
                setMessage("Registration successful!");
                setUsername("");
                setPassword("");
                setName("");
                setError("");
                setOpen(true);
                setFormState(0);
            }
        } catch (err) {
            const message = err.message || "An error occurred";
            setError(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 lg:pb-0 pb-13 pb:sm-13">
            <div className="w-full max-w-md bg-white p-8 rounded shadow">
                <div className="flex flex-col items-center">
                    <div className="bg-sec text-white p-4 rounded-full mb-4">
                        <LockOutlinedIcon className="w-6 h-6" />
                    </div>
                    <div className="flex space-x-4 mb-6">
                        <button
                            onClick={() => handleToggle(0)}
                            className={`px-4 py-2 font-medium ${formState === 0 ? "bg-sec text-white" : "bg-gray-200 text-black"
                                } rounded hover:cursor-pointer`}
                        >
                            Sign In
                        </button>

                        <button
                            onClick={() => handleToggle(1)}
                            className={`px-4 py-2 font-medium ${formState === 1 ? "bg-sec text-white" : "bg-gray-200 text-black"
                                } rounded hover:cursor-pointer`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form className="w-full space-y-4">
                        {formState === 1 && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        )}

                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                        />

                        {error && <p className="text-red-600 text-sm">{error}</p>}

                        <button
                            type="button"
                            onClick={handleAuth}
                            className="w-full bg-sec text-white py-2 rounded hover:bg-purple-700 transition hover:cursor-pointer"
                        >
                            {formState === 0 ? "Login" : "Register"}
                        </button>
                    </form>

                    {open && (
                        <div className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
