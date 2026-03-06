import { useDispatch, useSelector } from "react-redux";
import { verifyEmail } from "../../features/auth/authSlice";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Verify() {

  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, verifySuccess, error } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (token) {
      dispatch(verifyEmail(token));
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (verifySuccess) {
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    }
  }, [verifySuccess, navigate]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-blue-100">

      <div className="bg-white p-8 rounded-xl shadow-md text-center">

        {loading && <p>Verifying your email...</p>}

        {verifySuccess && (
          <p className="text-green-600">
            Email verified successfully. Redirecting...
          </p>
        )}

        {error && (
          <p className="text-red-600">{error}</p>
        )}

      </div>

    </div>
  );
}

export default Verify;