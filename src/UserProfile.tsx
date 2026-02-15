import { useState, useEffect } from "react";

import "./App.css";

import { useParams } from "react-router-dom";
import supabase from "./supabase-client.ts";
import type { User } from "@supabase/supabase-js";
import {
  Container,
  Stack,
  Paper,
} from "@mantine/core";
import "@mantine/core/styles.css";

function Profile(): React.JSX.Element {
  const { UserName: userUsername } = useParams<{ UserName: string }>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userDescription, setUserDescription] = useState<string>("");
  async function GetEntry(): Promise<void> {
    const { data } = await supabase
      .from("profile")
      .select("*")
      .eq("username", userUsername)
      .single();

    setUserDescription(data?.description ?? "");
    // const testData =
    // await supabase.from("profile").select("*");
    // console.log(testData);

    return;
  }

  useEffect(() => {
    async function loadUser(): Promise<void> {
      const user: User | null = await GetUser();
      setCurrentUser(user);
    }

    async function run(): Promise<void> {
      void GetEntry();
      void loadUser();
    }

    void run();
  }, []);
  if (currentUser === null) {
    return <div>Loading...</div>;
  } else {
    return (
      <Container size="lg" py="xl">
        <Paper withBorder radius="lg" shadow="sm" p="lg">
          <Stack gap="lg">
            <h1 className="heading">Username </h1>
            <h2>{userUsername}</h2>
            <Paper withBorder radius="lg" shadow="sm" p="lg">
              <div className="descriptionBox">
                <h2> Description </h2>
                <h2>{userDescription}</h2>
              </div>
            </Paper>
            <Paper withBorder radius="lg" shadow="sm" p="lg">
              <h3>Public List </h3>
            </Paper>
            <Paper withBorder radius="lg" shadow="sm" p="lg">
              <h3>Public Reviews </h3>
            </Paper>
          </Stack>
        </Paper>
      </Container>
    );
  }
}

async function GetUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export default Profile;
