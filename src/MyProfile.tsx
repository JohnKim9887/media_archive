import { useState, useEffect } from "react";

import "./App.css";
import supabase from "./supabase-client.ts";
import { type User } from "@supabase/supabase-js";

import {
  Card,
  Container,
  Stack,
  Group,
  Flex,
  Paper,
  FileButton,
  Button,
  TextInput,
  PasswordInput,
  Avatar,
  Center,
} from "@mantine/core";
import "@mantine/core/styles.css";

function MyProfile(): React.JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userScore, setUserScore] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string>("invalid");

  useEffect(() => {
    async function loadUser(): Promise<void> {
      const user: User | null = await GetUser();
      setCurrentUser(user);
      const { data } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", user?.id)
        .single();
      const { count } = await supabase
        .from("media_review_entry")
        .select("*", { head: true, count: "exact" })
        .eq("user_id", user?.id ?? "");
      setNewUsername(data?.username);
      setUserEmail(user?.email ?? "");
      setUserScore(count ?? 0);
    }

    async function run(): Promise<void> {
      await loadUser();
    }

    void run();
  }, [userEmail]);
  useEffect(() => {
    async function setImage(): Promise<void> {
      console.log("SET IMAGEEEEEEEEEEEEEEEEEEEEEEEEEEE");
      const { data } = supabase.storage
        .from("private_user_content")
        .getPublicUrl(`${currentUser?.id}/profile.jpg`);
      console.log(data);
      setImageURL(data?.publicUrl);
    }

    async function run(): Promise<void> {
      await setImage();
    }

    void run();
  }, [currentUser]);

  async function submitImage(avatarFile: File | null): Promise<void> {
    if (currentUser === undefined || currentUser?.id === undefined) {
      console.log("currentUser cannot be null");
      return;
    }
    if (avatarFile === null) {
      console.log("The File is NULL");
      return;
    }

    const { data, error } = await supabase.storage
      .from("private_user_content")
      .upload(`${currentUser?.id}/profile.jpg`, avatarFile);
    console.log(data);
    console.log(error);
  }
  if (currentUser === null) {
    return <div>Loading...</div>;
  } else {
    return (
      <Container size="lg" py="xl">
        <Paper withBorder radius="lg" shadow="sm" p="lg">
          <Flex align="center" justify="space-between">
            <Stack gap="lg">
              <h1 className="H1">My Profile</h1>
              <Group gap="xl" align="end" wrap="nowrap" pl="xl">
                <TextInput
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  value={userEmail}
                  onChange={(event) => setUserEmail(event.currentTarget.value)}
                  miw={260}
                />
                <Button onClick={() => updateUserEmail(userEmail)}>
                  Update Email
                </Button>
              </Group>
              <Group gap="xl" align="end" wrap="nowrap" pl="xl">
                <TextInput
                  label="username"
                  id="username"
                  name="username"
                  type="username"
                  value={newUsername}
                  onChange={(event) => setNewUsername(event.target.value)}
                  miw={260}
                />

                <Button
                  onClick={() => {
                    void UpdateUsername(newUsername);
                  }}
                >
                  Update Username
                </Button>
              </Group>
              <Group gap="xl" align="end" wrap="nowrap" pl="xl">
                <PasswordInput
                  label="Password"
                  id="password"
                  name="password"
                  value={userPassword}
                  onChange={(event) =>
                    setUserPassword(event.currentTarget.value)
                  }
                  miw={260}
                />
                <Button onClick={UpdatePassword}>Update Password</Button>
              </Group>
              <h3>User Score is : {userScore}</h3>
            </Stack>
            <Paper withBorder radius="lg" shadow="sm" p="lg">
              <Card
                withBorder
                shadow="sm"
                padding="lg"
                radius="md"
                style={{ width: 400, height: 400 }}
              >
                

                <FileButton onChange={setFile} accept="image/png,image/jpeg">
                  {(props) => <Button {...props}>Upload image</Button>}
                </FileButton>
                <Center p = "lg">
                  <Avatar src={imageURL} radius="xl" size={200} />
                </Center>
                {imageURL}
                <Button onClick={() => submitImage(file)}>
                  Submit image
                </Button>
              </Card>
            </Paper>
          </Flex>
        </Paper>
      </Container>
    );
  }
}
async function updateUserEmail(email: string): Promise<void> {
  void email;
  console.error("Not Implemented Yet");
}
async function UpdateUsername(newUsername: string): Promise<void> {
  const user: User | null = await GetUser();
  const { data, error } = await supabase
    .from("profile")
    .update({ username: newUsername })
    .eq("user_id", user?.id);
  console.log(data);
  console.log(error);
}

async function GetUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function UpdatePassword(): void {
  throw new Error("Function not implemented.");
}

export default MyProfile;
