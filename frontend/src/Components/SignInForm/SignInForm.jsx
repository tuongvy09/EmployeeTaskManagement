import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography } from 'antd';
import './SignInForm.css';

const { Title, Text, Link } = Typography;

const SignInForm = ({
    showBack,
    title,
    subtitle,
    placeholder,
    buttonText,
    note,
    footerText,
    footerLinkText,
    footerLinkHref,
    onSubmit,
}) => {
    return (
        <div className="signin-container">
            <Card className="signin-card">
                {showBack && (
                    <div className="signin-back">
                        <ArrowLeftOutlined style={{ marginRight: 8 }} />
                        <Text strong>Back</Text>
                    </div>
                )}

                {title && (
                    <Title level={2} className="signin-title">
                        {title}
                    </Title>
                )}

                {subtitle && (
                    <Text type="secondary" className="signin-subtitle">
                        {subtitle}
                    </Text>
                )}

                <Form onFinish={onSubmit} layout="vertical">
                    <Form.Item
                        name="phone"
                        rules={[{ required: true, message: 'Please enter your phone number' }]}
                    >
                        <Input placeholder={placeholder || ''} />
                    </Form.Item>

                    {buttonText && (
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                {buttonText}
                            </Button>
                        </Form.Item>
                    )}
                </Form>

                {note && (
                    <Text type="secondary" className="signin-note">
                        {note}
                    </Text>
                )}

                {(footerText || footerLinkText) && (
                    <div className="signin-footer">
                        {footerText && <Text type="secondary">{footerText} </Text>}
                        {footerLinkText && <Link href={footerLinkHref || '#'}>{footerLinkText}</Link>}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SignInForm;
