import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { type NavigateFunction } from "react-router-dom";
import supabase from "./supabase-client.ts";

import "./App.css";
import "./Auth.css";
import {
  Card,
  Container,
  Stack,
  Paper,
  Text,
  Button,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import "@mantine/core/styles.css";

function LoginPage(): React.JSX.Element {
  const [isLogin] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userPasswordConfirm, setUserPasswordConfirm] = useState("");

  const navHook: NavigateFunction = useNavigate();
  async function handleSignUp(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (isLogin) {
      const { error }: { error: Error | null } = await signInUser(
        userEmail,
        userPassword,
      );
      if (error) {
        return;
      }
      navHook("/MyProfile");
    } else {
      if (userPassword !== userPasswordConfirm) {
        console.warn("Two passwords dont match");
        return;
      }
      const { error }: { error: Error | null } = await signUpNewUser(
        userEmail,
        userPassword,
      );
      if (error) {
        return;
      }
    }
    setUserEmail("");
    setUserPassword("");
    setUserPasswordConfirm("");
  }
  return (
    <Container size="lg" py="xl">
      <Paper withBorder radius="lg" shadow="sm" p="lg">
        <Stack gap="lg">
          <form onSubmit={handleSignUp}>
            <h1 className="heading"> LOGIN </h1>

            <TextInput
              label="Email"
              id="email"
              name="email"
              type="email"
              value={userEmail}
              onChange={(event) => setUserEmail(event.currentTarget.value)}
            />

            <PasswordInput
              label="Password"
              id="password"
              name="password"
              value={userPassword}
              onChange={(event) => setUserPassword(event.currentTarget.value)}
            />
            <br></br>
            <Button type="submit">Login</Button>
          </form>

          <Card>
            <Text> Do not have an account? Sign Up </Text>
            <Button component={Link} to={`/SignupPage`} mt="md" radius="md">
              Sign Up
            </Button>
          </Card>
        </Stack>
      </Paper>
    </Container>
  );
}

async function signUpNewUser(
  email: string,
  password: string,
): Promise<{ error: Error | null }> {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    console.error("signUp failed", error);
    return { error: error };
  }

  console.log("signUp succeeded", data);
  return { error: null };
}

async function signInUser(
  email: string,
  password: string,
): Promise<{ error: Error | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error("login failed", error);
    return { error };
  }

  console.log("login succeeded", data);

  return { error: null };
}

export default LoginPage;
