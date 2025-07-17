import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import SignInForm from '../../Components/SignInForm/SignInForm';
import enums from '../../constant/enum';
import { requestAccessCode, validateAccessCode } from '../../Contexts/api';
import { loginSuccess } from '../../redux/slice/auth';

const PhoneVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);

    const phone = location.state?.phone;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phone);

    const handleSendCode = async (values) => {
        setLoading(true);
        try {
            const res = await validateAccessCode(!isEmail ? phone : null,
                isEmail ? phone : null, values.phone);
            const { accessToken, refreshToken, user } = res.data;
            dispatch(loginSuccess({
                accessToken,
                refreshToken,
                user,
                role: user.role,
            }));
            localStorage.setItem("auth", JSON.stringify({
                accessToken,
                refreshToken,
                user,
                role: user.role,
            }));

            if (user.role === enums.ROLES.OWNER) {
                navigate("/dashboard");
            } else if (user.role === enums.ROLES.EMPLOYEE) {
                navigate("/home");
            } else {
                navigate("/");
            }

        } catch (err) {
            console.error('Lỗi:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReSendCode = async (values) => {
        setLoading(true);
        try {
            const res = await requestAccessCode(!isEmail ? phone : null,
                isEmail ? phone : null, values.phone);
        } catch (err) {
            console.error('Lỗi:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SignInForm
                showBack
                title="Phone or Email Verification"
                subtitle="Please enter your code that was sent to your phone or email"
                placeholder="Enter your code"
                buttonText="Submit"
                footerText="Code not received?"
                footerLinkText="Resend"
                loading={loading}
                handleFooterLinkClick={handleReSendCode}
                onSubmit={handleSendCode}
            />
        </>
    );
};

export default PhoneVerification;
