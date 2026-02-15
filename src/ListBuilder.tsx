import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import supabase from "./supabase-client.ts";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "./supabase-database.ts";
import { EditReviewCard } from "./Components/Cards.tsx";

import "./ListBuilder.css";

import {
  Container,
  Stack,
  Group,
  Flex,
  Space,
  Paper,
  Text,
  Button,
  TextInput,
  Switch,
} from "@mantine/core";
import "@mantine/core/styles.css";

type MediaEntryRow = Database["public"]["Tables"]["media_entry"]["Row"];
type ListEntryRow = Database["public"]["Tables"]["list_entry"]["Row"];
type ListEntryInsert =
  Database["public"]["Tables"]["list_media_entry"]["Insert"];

type MediaInfoReview = {
  created_at: string;
  description: string | null;
  list_id: string;
  media_id: string;
  rank: number | null;
  media_entry: { title: string } | null;
};

type NoArgFunction = () => void;

function ListBuilder(): React.JSX.Element {
  const [textSearch, setTextSearch] = useState<string>("");
  const [searchCards, setSearchCards] = useState<MediaEntryRow[]>([]);
  const [listName, setListName] = useState<string>("loading");
  const [listInfo, setListInfo] = useState<ListEntryRow>();
  const [isPublic, setIsPublic] = useState<boolean>();
  const { ListID: listID } = useParams<{ ListID: string }>();
  const navigate = useNavigate();
  //Drafts for insert
  const [draftList, setDraft] = useState<MediaInfoReview[]>([]);

  function suggestedMedia(
    newSelected: MediaEntryRow,
    addFunction: NoArgFunction,
  ): React.JSX.Element {
    return (
      <li key={newSelected.media_id}>
        <button type="button" onClick={() => addFunction()}>
          {newSelected.title}
        </button>
      </li>
    );
  }
  async function setVisibility(
    listId: string,
    setToPublic: boolean,
  ): Promise<void> {
    setIsPublic(setToPublic);
    const updateResponse = await supabase
      .from("list_entry")
      .update({ is_public: setToPublic })
      .eq("list_id", listId);

    if (updateResponse.error) throw updateResponse.error;
  }
  async function getListInfo(listId: string): Promise<void> {
    const { data }: { data: ListEntryRow | null } =
      await supabase
        .from("list_entry")
        .select("*")
        .eq("list_id", listId)
        .single();
    if (data) {
      setIsPublic(data.is_public);
      setListInfo(data);
    } else {
      console.error("error on getListName");
    }
  }
  async function getListName(listId: string): Promise<void> {
    const { data }: { data: ListEntryRow | null } =
      await supabase
        .from("list_entry")
        .select("*")
        .eq("list_id", listId)
        .single();
    if (data) {
      setListName(data?.list_name);
    } else {
      console.error("error on getListName");
    }
  }
  async function addMediaToDraft(
    mediaRow: MediaEntryRow,
    listDraft: MediaInfoReview[],
  ): Promise<void> {
    if (listID === undefined) {
      console.error("Invalid ListId");
      return;
    }
    const newMediaReview: MediaInfoReview = {
      created_at: "",
      description: "",
      list_id: listID,
      media_id: mediaRow.media_id,
      rank: null,
      media_entry: {
        title: mediaRow.title,
      },
    };
    const alreadyExists: boolean = listDraft.some(
      (mediaInfo: MediaInfoReview) =>
        mediaInfo.media_id === newMediaReview.media_id,
    );

    if (alreadyExists) {
      console.log("Entry already exists!");
    } else {
      const appended: MediaInfoReview[] = [...listDraft, newMediaReview];
      setDraft(appended);
    }
    console.log(draftList);
  }

  async function removeListFromDraft(
    tagEntry: MediaInfoReview,
    draftTags: MediaInfoReview[],
  ): Promise<void> {
    const removed: MediaInfoReview[] = draftTags.filter(
      (list: MediaInfoReview) => list.list_id !== tagEntry.list_id,
    );
    setDraft(removed);
    console.log(draftList);
  }

  async function getAllListEntries(): Promise<void> {
    const { data }: { data: MediaInfoReview[] | null } =
      await supabase
        .from("list_media_entry")
        .select("*, media_entry (title)")
        .eq("list_id", listID);
    setDraft(data ?? []);
  }
  useEffect(() => {
    async function run(): Promise<void> {
      if (listID) {
        void getListName(listID);
        void getAllListEntries();
        void getListInfo(listID);
      } else {
        console.error("List ID is invalid");
      }
    }

    void run();
  }, []);
  useEffect(() => {
    let isMounted = true;

    async function search(): Promise<void> {
      await new Promise<void>((resolve: () => void) =>
        setTimeout(resolve, 100),
      );

      const {
        data,
        error,
      }: { data: MediaEntryRow[] | null; error: PostgrestError | null } =
        textSearch.length === 0
          ? await supabase.from("media_entry").select("*")
          : await supabase
              .from("media_entry")
              .select("*")
              .textSearch("title || description", textSearch);
      console.log(data);
      console.log(error);
      if (!isMounted) {
        return;
      }
      if (error) {
        console.error(error.message);
        return;
      }

      const items: MediaEntryRow[] = (data ?? []).map((row) => ({
        media_id: row.media_id ?? "",
        title: row.title ?? "",
        created_at: row.title ?? "",
        media_description: row.title ?? "",
      }));
      setSearchCards(items);
    }

    async function run(): Promise<void> {
      console.log(searchCards);
      await search();
    }

    void run();

    return () => {
      isMounted = false;
    };
  }, [textSearch]);
  if (listInfo && listID) {
    //
  } else {
    return (
      <Container size="lg" py="xl">
        <Paper withBorder radius="lg" shadow="sm" p="lg">
          <Stack gap="lg">
            <Text> LOADING OR NOT VALID </Text>
          </Stack>
        </Paper>
      </Container>
    );
  }
  return (
    <Container size="lg" py="xl">
      <Paper withBorder radius="lg" shadow="sm" p="lg">
        <Stack gap="lg">
          <Flex align="center" justify="space-between">
            <Group>
              <Text>Name of the list :</Text>
              <TextInput
                placeholder="Name Of This List"
                value={listName}
                onChange={(event) => setListName(event.target.value)}
              />
            </Group>

            <Space />
            <Space />
            <Space />
            <Space />
            <Space />
            <Switch
              checked={Boolean(isPublic)}
              label={listInfo.is_public ? "Public" : "Private"}
              onChange={async (event) => {
                const nextValue: boolean = event.currentTarget.checked;

                if (nextValue) {
                  await setVisibility(listInfo.list_id, true);
                } else {
                  await setVisibility(listInfo.list_id, false);
                }
              }}
            />
            <Button
              radius="md"
              mt="md"
              onClick={async () => {
                await SubmitList(listID, listInfo, draftList);
                navigate(`/ListInfo/${listID}`);
              }}
            >
              Submit the list
            </Button>
            <Button
              color="grey"
              component={Link}
              to={`/ListMyList`}
              mt="md"
              radius="md"
            >
              Back to My List
            </Button>
          </Flex>
          <TextInput
            label="Search Media To Add"
            placeholder="Search Media To Add"
            value={textSearch}
            onChange={(event) => setTextSearch(event.target.value)}
          />
          <div className="suggestSearch">
            <ul>
              {searchCards.map((selectedCard) =>
                suggestedMedia(selectedCard, () =>
                  addMediaToDraft(selectedCard, draftList),
                ),
              )}
            </ul>
          </div>

          {draftList.map((review: MediaInfoReview) => (
            <EditReviewCard
              key={review.media_id}
              review={review}
              draft={draftList}
              removeFromDraft={() => removeListFromDraft(review, draftList)}
              setDraft={setDraft}
            />
          ))}
        </Stack>
      </Paper>
    </Container>
  );
}
async function SubmitList(
  listId: string,
  listInfoDraft: ListEntryInsert,
  draft: MediaInfoReview[],
): Promise<void> {
  const listEntriesToInsert: ListEntryInsert[] = draft.map(
    (card: MediaInfoReview) => ({
      list_id: listId,
      media_id: card.media_id,
      description: card.description,
      rank: card.rank,
    }),
  );
  const response = await supabase
    .from("list_media_entry")
    .upsert(listEntriesToInsert);
  console.log(response);

  const response2 = await supabase
    .from("list_entry")
    .update(listInfoDraft)
    .eq("list_creator", listId);
  console.log(response2);
}

export default ListBuilder;
