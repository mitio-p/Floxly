import { Form, Link, redirect, useActionData, useNavigate, useNavigation, useSearchParams } from 'react-router-dom';
import classes from './AuthPage.module.css';
import tokenSevice from '../../Utils/tokenService';
import { useContext, useEffect, useRef, useState } from 'react';
import NotificationCTX from '../../Context/NotificationCTX';
import authFetch from '../../Utils/authFetch';
import { getLocale } from '../../Utils/localization';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [notification, setNotification] = useState();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const notify = useContext(NotificationCTX);

  const [inputErrors, setInputErrors] = useState({});

  const mode = searchParams.get('mode');
  const isSubmitting = navigation.state === 'submitting';

  const actionData = useActionData();

  const emailInput = useRef();
  const passwordInput = useRef();

  let title = '';

  switch (mode) {
    case 'login':
      title = getLocale('login_to_account');
      break;
    case 'forgotPassword':
      title = getLocale('reset_password');
      break;
    default:
      title = getLocale('sign_in_suggest');
  }

  useEffect(() => {
    emailInput.current.value = '';
    if (mode !== 'forgotPassword') {
      passwordInput.current.value = '';
    }
  }, [searchParams]);

  useEffect(() => {
    if (actionData) {
      if (actionData.notification) {
        notify(actionData.notification);
        navigate('?mode=login');
      }
      if (actionData.errors) {
        setInputErrors(actionData.errors);
      }
    }
  }, [actionData]);

  return (
    <main className={classes.formContainer}>
      <Form method="POST" className={classes.authForm}>
        <h2>FLOXLY</h2>
        <p>{title}</p>
        <div className={classes.fieldsContainer}>
          <div>
            <input
              type="email"
              placeholder={getLocale('email_address')}
              name="email"
              disabled={isSubmitting}
              required
              ref={emailInput}
            />
            {actionData ? inputErrors?.email && <p>{inputErrors.email}</p> : null}
          </div>
          {mode !== 'forgotPassword' && (
            <div>
              <input
                type="password"
                placeholder={getLocale('password')}
                name="password"
                disabled={isSubmitting}
                required
                ref={passwordInput}
              />
              {actionData ? inputErrors?.password && <p>{inputErrors.password}</p> : null}
            </div>
          )}
          {mode !== 'login' && mode !== 'forgotPassword' && (
            <>
              <div>
                <input
                  type="text"
                  placeholder={getLocale('full_name')}
                  name="fullname"
                  disabled={isSubmitting}
                  required
                />
                {actionData ? inputErrors?.fullname && <p>{inputErrors.fullname}</p> : null}
              </div>
              <div>
                <input
                  type="text"
                  placeholder={getLocale('username')}
                  name="username"
                  disabled={isSubmitting}
                  required
                />
                {actionData ? inputErrors?.username && <p>{inputErrors.username}</p> : null}
              </div>
            </>
          )}
        </div>
        <div className={classes.links}>
          {mode === 'login' ? (
            <Link to="?mode=register">{getLocale('have_no_account')}</Link>
          ) : (
            <Link to="?mode=login">
              {mode === 'forgotPassword' ? getLocale('back_to_login') : getLocale('existing_account')}
            </Link>
          )}
          {mode === 'login' && <Link to="?mode=forgotPassword">{getLocale('forgot_password')}</Link>}
        </div>
        <button className="btn1">
          {mode === 'login'
            ? isSubmitting
              ? 'Logging in...'
              : getLocale('login')
            : isSubmitting
            ? 'Registering...'
            : mode !== 'forgotPassword'
            ? getLocale('register')
            : getLocale('send_request')}
        </button>
      </Form>
    </main>
  );
}

export async function loader() {
  const response = await authFetch('http://localhost:3000/auth/user', {
    credentials: 'include',
  });

  if (response.ok) {
    return redirect('/');
  } else {
    return null;
  }
}

export async function action({ request }) {
  const fd = await request.formData();

  const searchParams = new URL(request.url).searchParams;

  const user = {
    username: !fd.get('username') ? undefined : fd.get('username').trim(),
    fullname: !fd.get('fullname') ? undefined : fd.get('fullname').trim(),
    email: !fd.get('email') ? undefined : fd.get('email').trim(),
    password: !fd.get('password') ? undefined : fd.get('password').trim(),
  };

  if (searchParams.get('mode') === 'login') {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(user),
    });

    if (response.ok) {
      return redirect('/');
    } else {
      return response;
    }
  } else if (searchParams.get('mode') === 'forgotPassword') {
    const response = await fetch('http://localhost:3000/auth/forgotPassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(user),
    });

    if (response.ok) {
      return { notification: 'Reset password request was sent to your email!' };
    } else {
      return response;
    }
  } else {
    const response = await fetch('http://localhost:3000/auth/signUp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(user),
    });
    if (response.ok) {
      return { notification: 'Account created successfully!' };
    } else {
      return response;
    }
  }
}
