import { useEffect, useState } from "react";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import supabase from "./supabase-client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "./Popup.css";

import Header from "./Header.tsx";
import Home from "./Home.tsx";
import LoginPage from "./LoginPage.tsx";
import SignupPage from "./Signup.tsx";

import UserProfile from "./UserProfile.tsx";
import MyProfile from "./MyProfile.tsx";

import ListBuilder from "./ListBuilder.tsx";
import ListMyList from "./ListMyList.tsx";
import ListInfo from "./ListInfo.tsx";
import ListBrowse from "./ListBrowse.tsx";
//
import MediaBrowse from "./MediaBrowse.tsx";
import MediaInfoAdd from "./MediaInfoAdd.tsx";
import MediaInfo from "./MediaInfo.tsx";
import MediaInfoEdit from "./MediaInfoEdit.tsx";
//
import TagBrowse from "./TagBrowse.tsx";
import TagInfoAdd from "./TagInfoAdd.tsx";
import TagInfo from "./TagInfo.tsx";
import TagInfoEdit from "./TagInfoEdit.tsx";
//
import FindMediaPage from "./FindMediaPage.tsx";

//
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { AppShell, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

const theme = createTheme({
  fontFamily: "Open Sans, sans-serif",
  primaryColor: "cyan",
});
function App(): React.JSX.Element {
  const { user } = useSupabaseAuth();

  const [opened, { toggle }] = useDisclosure();
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <BrowserRouter>
        <AppShell header={{ height: 100 }} padding="md" px = "lg">
          <AppShell.Header>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Header user={user} />
          </AppShell.Header>
          <AppShell.Main>
          {/* <AppShell.Navbar>Navbar</AppShell.Navbar> */}

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/LoginPage" element={<LoginPage />} />
              <Route path="/SignupPage" element={<SignupPage />} />
              <Route path="/UserProfile/:UserName" element={<UserProfile />} />
              <Route path="/MyProfile" element={<MyProfile />} />
              {/* List Pages */}
              <Route path="/ListBrowse" element={<ListBrowse />} />
              <Route path="/ListMyList" element={<ListMyList />} />
              <Route path="/ListInfo/:ListID" element={<ListInfo />} />
              <Route path="/ListBuilder/:ListID" element={<ListBuilder />} />

              {/* Media Info */}
              <Route path="/MediaBrowse" element={<MediaBrowse />} />
              <Route path="/AddMedia" element={<MediaInfoAdd />} />
              <Route path="/MediaInfo/:MediaID" element={<MediaInfo />} />
              <Route
                path="/MediaInfoEdit/:MediaID"
                element={<MediaInfoEdit />}
              />
              {/* Tag Info */}
              <Route path="/TagBrowse" element={<TagBrowse />} />
              <Route path="/TagInfoAdd" element={<TagInfoAdd />} />
              <Route path="/TagInfo/:TagID" element={<TagInfo />} />
              <Route path="/TagInfoEdit/:TagID" element={<TagInfoEdit />} />
              
              {/* Find Media with tags */}
              <Route path="/FindMediaPage" element={<FindMediaPage />} />
            </Routes>
          </AppShell.Main>

        </AppShell>
        
      </BrowserRouter>
    </MantineProvider>
  );
}

function useSupabaseAuth(): { user: User | null; userId: string | undefined } {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    async function loadInitialUser(): Promise<void> {
      const { data, error }: { data: { user: User | null }; error: Error | null } =
        await supabase.auth.getUser();

      if (error) {
        setUser(null);
        setUserId(undefined);
        return;
      }

      setUser(data.user);
      setUserId(data.user?.id);
    }

    async function run(): Promise<void> {
      void loadInitialUser();

      const {
        data: { subscription: createdSubscription },
      }: {
        data: { subscription: { unsubscribe: () => void } };
      } = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          if (event === "SIGNED_OUT" || session === null) {
            setUser(null);
            setUserId(undefined);
            return;
          }
          setUser(session.user);
          setUserId(session.user.id);
        },
      );
      subscription = createdSubscription;
    }

    void run();
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  return { user, userId };
}

export default App;
