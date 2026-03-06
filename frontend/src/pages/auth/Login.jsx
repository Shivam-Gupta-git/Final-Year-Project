import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userLogin } from "../../features/auth/authSlice";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, loginSuccess} = useSelector((state) => state.auth)

  const handelChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handelFormSubmit = (event) => {
    event.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      error("All fields are required");
      return;
    }
    dispatch(userLogin({ email, password }))
  };

  useEffect(() => {
   if(loginSuccess){
    navigate("/")
   }
  }, [loginSuccess, navigate])
  return (
    <div className="w-full flex items-center justify-center min-h-screen">
      <div className="w-100 border p-6 rounded-lg shadow-lg">
        <form
          onSubmit={handelFormSubmit}
          className="flex flex-col gap-4"
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handelChange}
            className="border p-2"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handelChange}
            className="border p-2"
          />

          <button
            type="submit"
            className="border p-2 bg-blue-500 text-white"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
