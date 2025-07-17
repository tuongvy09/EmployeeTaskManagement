import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInForm from '../../Components/SignInForm/SignInForm';
import { requestAccessCode } from '../../Contexts/api';

const SignIn = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (values) => {
        setLoading(true);
        try {
            const res = await requestAccessCode(values.phone);
            navigate('/verify-code', {
                state: {
                    phone: values.phone,
                },
            });
        } catch (err) {
            console.error('Lỗi:', err.response?.data || err.message);
        } finally {
            setLoading(false);
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
                footerLinkHref="#"
                onSubmit={handleSendCode}
                loading={loading}
            />
        </>
    );
};

export default SignIn;
