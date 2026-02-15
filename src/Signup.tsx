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

function SignupPage(): React.JSX.Element {

  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userPasswordConfirm, setUserPasswordConfirm] = useState("");

  const navHook: NavigateFunction = useNavigate();
  async function handleSignUp(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

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
    navHook("/LoginPage");
  
    setUserEmail("");
    setUserPassword("");
    setUserPasswordConfirm("");
  }
  return (
    <Container size="lg" py="xl">
      <Paper withBorder radius="lg" shadow="sm" p="lg">
        <Stack gap="lg">
          <form onSubmit={handleSignUp}>

            <h1 className="heading"> Sign Up </h1>

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
            <PasswordInput
              label="passwordConfirm"
              id="passwordConfirm"
              name="passwordConfirm"
              value={userPasswordConfirm}
              onChange={(event) => setUserPasswordConfirm(event.target.value)}
            />
            <br></br>
            <Button type="submit" mt="md" radius="md">
              Sign Up
            </Button>
          </form>

          <Card>
            <Text> Do you have an account? </Text>
            <Button component={Link} to={`/LoginPage`} mt="md" radius="md">
              Back to Login
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

export default SignupPage;
