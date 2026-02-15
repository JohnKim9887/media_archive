import React, { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Link } from "react-router-dom";
import type { PostgrestError } from "@supabase/supabase-js";

import supabase from "../supabase-client.ts";
import type { Database } from "../supabase-database.ts";

import "./CardStyle.css";
import { Card, Stack, Flex, Text, Button, Textarea } from "@mantine/core";
import "@mantine/core/styles.css";

// List cards
type ListUserMediaRow = Database["public"]["Tables"]["list_entry"]["Row"];
type UserRow = Database["public"]["Tables"]["profile"]["Row"];

type ListWithCreator = ListUserMediaRow & {
  profile: Pick<UserRow, "user_id" | "username"> | null;
};

export function ListCardPublic(props: ListWithCreator): React.JSX.Element {
  return (
    <Card>
      <Flex justify="space-between">
        <Link
          to={`/ListInfo/${props.list_id}`}
          style={{ flex: 1, textDecoration: "none" }}
        >
          <Stack>
            <Text>List Name: {props.list_name}</Text>

          </Stack>
        </Link>

        <Stack>
          <Link to={`/UserProfile/${props.profile?.username}`}>
            <p> Creator : {props.profile?.username}</p>
          </Link>
          <Text>Is Public? {props.is_public ? "Yes" : "No"}</Text>
        </Stack>
      </Flex>
    </Card>
  );
}

export function ListCardCreator(props: ListWithCreator): React.JSX.Element {
  return (
    <Card>
      <Flex justify="space-between">
        <Link
          to={`/ListBuilder/${props.list_id}`}
          style={{ flex: 1, textDecoration: "none" }}
        >
          <Stack>
            <Text>Edit your list {props.list_name}</Text>
          </Stack>
        </Link>

        <Stack>
          <Link to={`/ListInfo/${props.list_id}`}>View</Link>
          <Text>Is Public? {props.is_public ? "Yes" : "No"}</Text>        </Stack>
      </Flex>
    </Card>
  );
}
type ListMediaEntry = Database["public"]["Tables"]["list_media_entry"]["Row"];

export function ListMediaCard(props: ListMediaEntry): React.JSX.Element {
  return (
    <Card>
      <Stack>
        <Link className="newCardLink" to={`/ListInfo/${props.list_id}`}>
          <div className="card">
            <p>{props.media_id}</p>
            <p>{props.list_id}</p>
            <p>{props.description}</p>
          </div>
        </Link>
      </Stack>
    </Card>
  );
}

// Edit review card
export type MediaInfoReview = {
  created_at: string;
  description: string | null;
  list_id: string;
  media_id: string;
  rank: number | null;
  media_entry: { title: string } | null;
};

function replaceDescriptionByMediaId(
  reviews: MediaInfoReview[],
  mediaId: string,
  mediaDescription: string,
): MediaInfoReview[] {
  return reviews.map((review: MediaInfoReview) => {
    if (review.media_id === mediaId) {
      return { ...review, description: mediaDescription };
    }
    return review;
  });
}

type NoArgFunction = () => void;

type EditReviewCardProps = {
  review: MediaInfoReview;
  draft: MediaInfoReview[];
  removeFromDraft: NoArgFunction;
  setDraft: Dispatch<SetStateAction<MediaInfoReview[]>>;
};

export function EditReviewCard(props: EditReviewCardProps): React.JSX.Element {
  
  return (
    <Card>
      <Stack>
        <Button
          variant="filled"
          color="red"
          onClick={props.removeFromDraft}
          mt="md"
          radius="md"
        >
          Remove From List
        </Button>
        <p>{props.review.media_id}</p>
        <p>{props.review.media_entry?.title}</p>

        <Textarea
          className="descriptionInput"
          id={props.review.media_id}
          name={props.review.media_id}
          value={props.review.description ?? "Error"}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            props.setDraft(
              replaceDescriptionByMediaId(
                props.draft,
                props.review.media_id,
                event.target.value,
              ),
            )
          }
        />
      </Stack>
    </Card>
  );
}

// Media review cards
type ProfileRow = Database["public"]["Tables"]["profile"]["Row"];
type MediaReviewEntry =
  Database["public"]["Tables"]["media_review_entry"]["Row"];
type MediaReviewInsert =
  Database["public"]["Tables"]["media_review_entry"]["Insert"];

type ReviewEditGroupProp = {
  user_id: string | undefined;
  media_id: string;
  reviews: MediaReviewEntryWithUsername[];
};

type MediaReviewEntryWithUsername = MediaReviewEntry & {
  profile: { username: string } | null;
};

export function MediaReviewGroup(
  props: ReviewEditGroupProp,
): React.JSX.Element {
  console.log("props");
  console.log(props);
  return (
    <Card>
      <Stack>
        {props.user_id === undefined ? (
          <h1>Login To create Review</h1>
        ) : (
          <>{MyReview(props.user_id, props.media_id, props.reviews)}</>
        )}

        {buildReviewCards(props.user_id, props.reviews)}
      </Stack>
    </Card>
  );
}


export function MyReview(
  userId: string,
  mediaId: string,
  reviews: MediaReviewEntryWithUsername[],
): React.JSX.Element {
  const [reviewText, setReviewText] = useState<string>("");
  const [username, setUsername] = useState<string>();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const matches: MediaReviewEntryWithUsername[] = reviews.filter(
    (review: MediaReviewEntryWithUsername) =>
      review.user_id === userId,
  );

  const onlyReview: MediaReviewEntryWithUsername | undefined = matches[0];
  const hasReview: boolean = Boolean(onlyReview);

  if (matches.length > 1) {
    throw new Error(`More than one review, got ${matches.length}`);
  }

  useEffect(() => {
    let isActive: boolean = true;

    async function run(): Promise<void> {
      if (!isEditing) {
        setReviewText(onlyReview?.review_text ?? "");
      }
      const returnVal: string = await GetUserNameWithUserID(userId);
      if (!isActive) {
        return;
      }
      setUsername(returnVal);
    }

    void run();
    return () => {
      isActive = false;
    };
  }, [onlyReview?.review_text, isEditing, userId]);

  async function handleDelete(): Promise<void> {
    await supabase
      .from("media_review_entry")
      .delete()
      .eq("user_id", userId)
      .eq("media_id", mediaId);
    setReviewText("");
    setIsEditing(false);
  }

  return (
    <Card>
      <Stack>
        <Flex align="center" justify="space-between">
          {username ? (
            <Link to={`/UserProfile/${username}`}>{username}</Link>
          ) : (
            <Text>My Profile</Text>
          )}
          <Flex gap="xs">
            {hasReview && !isEditing ? (
              <Button size="xs" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : null}
            {hasReview ? (
              <Button size="xs" color="red" onClick={handleDelete}>
                Delete
              </Button>
            ) : null}
          </Flex>
        </Flex>

        {hasReview && !isEditing ? (
          <Text size="sm">
            {reviewText.trim().length > 0 ? reviewText : "No review yet."}
          </Text>
        ) : (
          <Stack gap="xs">
            <Textarea
              placeholder="Write your review..."
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              autosize
              minRows={3}
              maxRows={6}
            />
            <Flex justify="flex-end" gap="xs">
              {hasReview ? (
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => {
                    setReviewText(onlyReview?.review_text ?? "");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              ) : null}
              <Button
                size="xs"
                onClick={() => {
                  void submitReview(userId, mediaId, reviewText);
                  setIsEditing(false);
                }}
              >
                {hasReview ? "Save Review" : "Post Review"}
              </Button>
            </Flex>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

async function submitReview(
  userId: string,
  mediaId: string,
  reviewText: string,
): Promise<void> {
  const insertReview = toInsert(userId, mediaId, reviewText);
  const { data, error } = await supabase
    .from("media_review_entry")
    .upsert(insertReview)
    .select("*");
  console.log(data);
  console.log(error);
}

function toInsert(
  userId: string,
  mediaId: string,
  reviewText: string,
): MediaReviewInsert {
  return {
    media_id: mediaId,
    review_text: reviewText,
    user_id: userId,
  };
}

function buildReviewCards(
  myId: string | undefined,
  reviews: MediaReviewEntryWithUsername[],
): React.JSX.Element {
  return (
    <Stack gap="sm">
      {reviews
        .filter(
          (review: MediaReviewEntryWithUsername) =>
            review.user_id !== myId,
        )
        .map(
          (review: MediaReviewEntryWithUsername) => (
            <Card
              key={`${review.user_id}-${review.media_id}`}
              withBorder
              radius="md"
              padding="sm"
              shadow="sm"
            >
              <Stack gap={4}>
                <Text fw={600}>{review.profile?.username ?? "Unknown"}</Text>
                <Text size="sm">{review.review_text ?? "No review yet."}</Text>
              </Stack>
            </Card>
          ),
        )}
    </Stack>
  );
}

async function GetUserNameWithUserID(userID: string): Promise<string> {
  const {
    data,
    error,
  }: { data: ProfileRow[] | null; error: PostgrestError | null } =
    await supabase.from("profile").select("*").eq("user_id", userID);
  console.log(data);
  console.log(userID);
  if (error) {
    console.log(Error);
    return "Error";
  }
  if (data === null) {
    return "ITS NULL";
  }
  if (data?.length === 0) {
    return "Length is Zero";
  }
  const username: string | null = data[0].username;
  if (username === null) {
    return "Username is null";
  }
  console.log(username);
  return username;
}

// Tag cards
type VoidFunction = () => void;
type TagEntryRow = Database["public"]["Tables"]["tag_entry"]["Row"];

type RemoveToMediaDraftTagProps = {
  tagProp: TagEntryRow;
  removeTheTag: VoidFunction;
};

export function SmallTag(tagProp: TagEntryRow): React.JSX.Element {
  return (
    <Card key={tagProp.tag_id}>
      <Stack>
        <Link
          key={tagProp.tag_id}
          className="newCardLink"
          to={`/TagInfo/${tagProp.tag_id}`}
        >
          {tagProp.tag_name}
        </Link>
      </Stack>
    </Card>
  );
}

export function SmallTagForMedia(
  draftProps: RemoveToMediaDraftTagProps,
): React.JSX.Element {
  return (
    <Card>
      <Stack>
        <p>{draftProps.tagProp.tag_name}</p>
        <button onClick={() => draftProps.removeTheTag()}></button>
      </Stack>
    </Card>
  );
}
