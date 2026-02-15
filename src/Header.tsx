import "./App.css";
import "./Header.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import supabase from "./supabase-client.ts";
import type { User } from "@supabase/supabase-js";
import type { Database } from "./supabase-database";
import type { PostgrestError } from "@supabase/supabase-js";

import {
  Card,
  Container,
  Stack,
  Group,
  Flex,
  Paper,
  Text,
  Button
} from "@mantine/core";
import "@mantine/core/styles.css";
type HeaderProps = {
  user: User | null;
};
type ProfileRow = Database["public"]["Tables"]["profile"]["Row"];

function Header(prop : HeaderProps): React.JSX.Element {

  const [userName, setUserName] = useState<string | undefined>();
  useEffect(() => {
    async function loadUser(): Promise<void> {
      if (prop?.user?.id) {
        setUserName(await getUserNameWithUserId(prop.user.id));
      } else {
        setUserName(undefined);
      }
    }

    async function run(): Promise<void> {
      await loadUser();
    }

    void run();
  }, [prop?.user?.id]);

  return (

    

    
    <Paper withBorder  shadow="sm"  px="lg">
      <Container size="xl" px="md">
      <Stack gap ="0">
        <Flex align="center" justify="space-between">
           <Link to="/">Media Archive</Link>
          {(prop.user === undefined || prop.user?.id === undefined) ? (
            <>
              <Link to="/LoginPage">
                Please Login
              </Link>
            </>
          ) : (
            <Group> 
              <Text>Welcome {userName ?? "Loading"}</Text>
              <Card>
                <Link to="/MyProfile">My Profile</Link>
              </Card>
              <Button onClick={() =>signOut()}>
                Sign Out
              </Button>
            </Group>
          )}
        </Flex>
        <Flex align="center" justify="center" px="md" gap="md">
          <Card style={{ flex: 1 }}>
          <Link to="/">Home</Link>
          </Card>
          <Card style={{ flex: 1 }}>
          <Link to="/MediaBrowse">Browse Media</Link>
          </Card>
          <Card style={{ flex: 1 }}>
          <Link to="/TagBrowse">Browse Tag</Link>
          </Card>
          <Card style={{ flex: 1 }}>
          <Link to="/ListBrowse"> Browse Lists </Link>
          </Card>
          <Card style={{ flex: 1 }}>
          <Link to="/ListMyList"> My Lists </Link>
          </Card>
          <Card style={{ flex: 1 }}>
          <Link to="/FindMediaPage">Find Media Page</Link>
          </Card>
        </Flex>
      </Stack>
      </Container>
    </Paper>


  );
}
//Todo
async function getUserNameWithUserId(userID: string): Promise<string | undefined> {
  const {
    data,
    error,
  }: { data: ProfileRow[] | null; error: PostgrestError | null } =
    await supabase.from("profile").select("*").eq("user_id", userID);
  if (error) {
    console.log(Error);
    return undefined;
  }
  if (data === null) {
    return undefined;
  }
  if (data?.length === 0) {
    return undefined;
  }
  const username: string | null = data[0].username;
  if (username === null) {
    return undefined;
  }
  console.log(username);
  return username;
}
async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  console.log("attempt sign out");
  console.log(error);
}
export default Header;
