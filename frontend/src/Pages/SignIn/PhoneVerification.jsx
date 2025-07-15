import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import SignInForm from '../../Components/SignInForm/SignInForm';
import enums from '../../constant/enum';
import { validateAccessCode } from '../../Contexts/api';
import { loginSuccess } from '../../redux/slice/auth';

const PhoneVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();


    const phone = location.state?.phone;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phone);

    const handleSendCode = async (values) => {
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
                footerLinkHref="#"
                onSubmit={handleSendCode}
            />
        </>
    );
};

export default PhoneVerification;
