import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "react-router-dom";
import classes from "./AuthPage.module.css";
import tokenSevice from "../../Utils/tokenService";
import { useContext, useEffect, useRef, useState } from "react";
import NotificationCTX from "../../Context/NotificationCTX";
import authFetch from "../../Utils/authFetch";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [notification, setNotification] = useState();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const notify = useContext(NotificationCTX);

  const [inputErrors, setInputErrors] = useState({});

  const mode = searchParams.get("mode");
  const isSubmitting = navigation.state === "submitting";

  const actionData = useActionData();

  const emailInput = useRef();
  const passwordInput = useRef();

  let title = "";

  switch (mode) {
    case "login":
      title = "Login to your account!";
      break;
    case "forgotPassword":
      title = "Reset your password";
      break;
    default:
      title = "Sign in to connect with your friends";
  }

  useEffect(() => {
    emailInput.current.value = "";
    if (mode !== "forgotPassword") {
      passwordInput.current.value = "";
    }
  }, [searchParams]);

  useEffect(() => {
    if (actionData) {
      if (actionData.notification) {
        notify(actionData.notification);
        navigate("?mode=login");
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
              placeholder="Email address"
              name="email"
              disabled={isSubmitting}
              required
              ref={emailInput}
            />
            {actionData
              ? inputErrors?.email && <p>{inputErrors.email}</p>
              : null}
          </div>
          {mode !== "forgotPassword" && (
            <div>
              <input
                type="password"
                placeholder="Password"
                name="password"
                disabled={isSubmitting}
                required
                ref={passwordInput}
              />
              {actionData
                ? inputErrors?.password && <p>{inputErrors.password}</p>
                : null}
            </div>
          )}
          {mode !== "login" && mode !== "forgotPassword" && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Full name"
                  name="fullname"
                  disabled={isSubmitting}
                  required
                />
                {actionData
                  ? inputErrors?.fullname && <p>{inputErrors.fullname}</p>
                  : null}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  name="username"
                  disabled={isSubmitting}
                  required
                />
                {actionData
                  ? inputErrors?.username && <p>{inputErrors.username}</p>
                  : null}
              </div>
            </>
          )}
        </div>
        <div className={classes.links}>
          {mode === "login" ? (
            <Link to="?mode=register">Haven&apos;t got an account?</Link>
          ) : (
            <Link to="?mode=login">
              {mode === "forgotPassword"
                ? "Back to login?"
                : "Existing account?"}
            </Link>
          )}
          {mode === "login" && (
            <Link to="?mode=forgotPassword">Forgot password?</Link>
          )}
        </div>
        <button className="btn1">
          {mode === "login"
            ? isSubmitting
              ? "Logging in..."
              : "Login"
            : isSubmitting
            ? "Registering..."
            : mode !== "forgotPassword"
            ? "Register"
            : "Send request"}
        </button>
      </Form>
    </main>
  );
}

export async function loader() {
  const response = await authFetch("http://localhost:3000/auth/user", {
    credentials: "include",
  });

  if (response.ok) {
    return redirect("/");
  } else {
    return null;
  }
}

export async function action({ request }) {
  const fd = await request.formData();

  const searchParams = new URL(request.url).searchParams;

  const user = {
    username: fd.get("username"),
    fullname: fd.get("fullname"),
    email: fd.get("email"),
    password: fd.get("password"),
  };

  if (searchParams.get("mode") === "login") {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${tokenSevice.getToken()}`,
      },
      credentials: "include",
      body: JSON.stringify(user),
    });

    console.log(response.status);

    if (response.ok) {
      return redirect("/");
    } else {
      return response;
    }
  } else if (searchParams.get("mode") === "forgotPassword") {
    const response = await fetch("http://localhost:3000/auth/forgotPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(user),
    });

    if (response.ok) {
      return { notification: "Reset password request was sent to your email!" };
    } else {
      return response;
    }
  } else {
    const response = await fetch("http://localhost:3000/auth/signUp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(user),
    });
    if (response.ok) {
      return { notification: "Account created successfully!" };
    } else {
      return response;
    }
  }
}
