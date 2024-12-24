import { Form, Link, useActionData, useLoaderData, useLocation, useNavigate, useNavigation } from 'react-router-dom';
import classes from './ResetPasswordPage.module.css';
import { useContext, useEffect } from 'react';
import NotificationCTX from '../../Context/NotificationCTX';

export default function ResetPasswordPage() {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isReseting = navigation.state === 'submitting';
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const notificationCTX = useContext(NotificationCTX);
  useEffect(() => {
    if (actionData?.isSucceed) {
      notificationCTX('Your password is successfully changed!');
      navigate('/auth?mode=login');
    }
  }, [actionData]);
  return (
    <main className={classes.formContainer}>
      <Form method="POST" className={classes.authForm}>
        <h2>Floxly</h2>
        <p>Reset your password</p>
        {loaderData ? (
          <div className={classes.invalidTokenContainer}>
            <h3>{loaderData.message}</h3>
          </div>
        ) : (
          <div className={classes.fieldsContainer}>
            <div>
              <input type="password" name="password" placeholder="Create password" />
              {actionData?.errors?.password && <p>{actionData?.errors?.password}</p>}
            </div>
            <div>
              <input type="password" name="confPassword" placeholder="Confirm password" />
              {actionData?.errors?.confPassword && <p>{actionData?.errors?.confPassword}</p>}
            </div>
          </div>
        )}
        <div className={classes.links}>
          <Link to="/auth?mode=login">Back to login</Link>
        </div>
        {!loaderData && <button>{!isReseting ? 'Reset password' : 'Resetting password...'}</button>}
      </Form>
    </main>
  );
}

export async function loader({ request }) {
  const searchParams = new URL(request.url).searchParams;
  if (searchParams.get('t')) {
    const response = await fetch('http://localhost:3000/auth/checkForgotPasswordToken', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ token: searchParams.get('t') }),
    });
    if (response.ok) {
      return null;
    } else {
      return response;
    }
  } else {
    return { message: 'Invalid token!' };
  }
}

export async function action({ request }) {
  const fd = await request.formData();
  const password = fd.get('password');
  const confPassword = fd.get('confPassword');
  const searchParams = new URL(request.url).searchParams;

  if (password === confPassword) {
    const response = await fetch('http://localhost:3000/auth/resetPassword', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ token: searchParams.get('t'), password: password }),
    });
    if (response.ok) {
      return { isSucceed: true };
    } else {
      return { errors: response };
    }
  } else {
    return { errors: { confPassword: "Passwords doesn't match!" } };
  }
}
