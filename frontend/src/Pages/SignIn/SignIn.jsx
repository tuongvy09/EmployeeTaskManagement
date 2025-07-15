import { useNavigate } from 'react-router-dom';
import SignInForm from '../../Components/SignInForm/SignInForm';
import { requestAccessCode } from '../../Contexts/api';

const SignIn = () => {
    const navigate = useNavigate();

    const handleSendCode = async (values) => {
        try {
            const res = await requestAccessCode(values.phone);
            navigate('/verify-code', {
                state: {
                    phone: values.phone,
                },
            });
        } catch (err) {
            console.error('Lỗi:', err.response?.data || err.message);
        }
    };

    return (
        <>
            <SignInForm
                title="Sign In"
                subtitle="Please enter your phone to sign in or email to receive a code"
                placeholder="Your Phone Number or Email"
                buttonText="Next"
                note="passwordless authentication methods."
                footerText="Don't having account?"
                footerLinkText="Sign up"
                footerLinkHref="#"
                onSubmit={handleSendCode}
            />
        </>
    );
};

export default SignIn;
