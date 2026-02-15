import React, { useState, useEffect } from "react";

import type { Database } from "./supabase-database.ts";

import type { UserResponse } from "@supabase/supabase-js";
import { ListCardCreator } from "./Components/Cards.tsx";
import supabase from "./supabase-client.ts";
import type { PostgrestError } from "@supabase/supabase-js";
import {
  Container,
  Stack,
  Flex,
  Paper,
  Text,
  Button,
  TextInput 
} from "@mantine/core";
import "@mantine/core/styles.css";

type ListUserMediaRow = Database["public"]["Tables"]["list_entry"]["Row"];
type ListUserMediaInsert = Database["public"]["Tables"]["list_entry"]["Insert"];
type UserRow = Database["public"]["Tables"]["profile"]["Row"];
type ListWithCreator = ListUserMediaRow & {
  profile: Pick<UserRow, "user_id" | "username"> | null;
};

function ListMyList(): React.JSX.Element {
  const [list, setList] = useState<ListWithCreator[]>([]);
  const [textSearch, setTextSearch] = useState<string>("");
  
  async function GetListsWithCreators(): Promise<ListWithCreator[]> {
    const userID: string = await getUserID();
    const response: {
      data: ListWithCreator[] | null;
      error: PostgrestError | null;
    } = await supabase
      .from("list_entry")
      .select("*, profile (user_id, username)")
      .eq("list_creator", userID);

    if (response.error) {
      throw response.error;
    }
    setList(response.data ?? []);
    return response.data ?? [];
  }
  //todo when called build a new list and refresh using getListWithCreators
    async function BuildNewList(): Promise<void> {
        const userID: string = await getUserID();
        const newUserMediaList : ListUserMediaInsert = 
        {
            list_creator: userID,
        };
        const response: {
            data: ListWithCreator[] | null;
            error: PostgrestError | null;
        } = await supabase
        .from("list_entry")
        .insert(newUserMediaList);
        console.log(response);
    }
  //todo finish useEffect
  useEffect(() => {
    async function run(): Promise<void> {
      console.log("response");
      await GetListsWithCreators();
    }

    void run();
  }, []);
  
  return (
    <Container size="lg" py="xl">

      <Paper withBorder radius="lg" shadow="sm" p="lg">
        <Stack gap="lg">

          <TextInput
            label="Search My List"
            placeholder="Enter List to Search"
            value={textSearch}
            onChange={(event) => setTextSearch(event.target.value)}
          />
          <Flex align="center" justify="space-between">
            <Text size="xl">Add New Media</Text>
            <Button type="button" onClick={BuildNewList} mt="md" radius="md">
              Create New List
            </Button>
          </Flex>

          <Paper withBorder radius="lg" shadow="sm" p="lg">
            <Stack>
              {/* {error ? <p className="error">{error}</p> : null} */}

              {renderListCards(list)}
            </Stack>
          </Paper>

        </Stack>
      </Paper>
    </Container>

  );


}

function renderListCards(lists: ListWithCreator[]): React.JSX.Element[] {
  return lists.map((listRow: ListWithCreator) => (
    <ListCardCreator key={listRow.list_id} {...listRow} />
    
  ));
}

async function getUserID(): Promise<string> {
  const {
    data: { user },
    error,
  }: UserResponse = await supabase.auth.getUser();
  if (error) {
    console.log(error.message);
    return "ERROR";
  }
  if (!user) {
    console.log("Not logged in");
    return "Not logged in";
  } else {
    if (user.id !== undefined) {
      return user.id;
    } else {
      return "ERROR";
    }
  }
}
export default ListMyList;
