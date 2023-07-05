import { communityState } from "@/src/atoms/communitiesAtom";
import { Post, postVote } from "@/src/atoms/postAtom";
import CreatePostLink from "@/src/components/Community/CreatePostLink";
import PersonalHome from "@/src/components/Community/PersonalHome";
import Recommendations from "@/src/components/Community/Recommendations";
import PageContent from "@/src/components/Layout/PageContent";
import PostItem from "@/src/components/Posts/PostItem";
import PostLoader from "@/src/components/Posts/PostLoader";
import { auth, firestore } from "@/src/firebase/clientApp";
import useCommunityData from "@/src/hooks/useCommunityData";
import usePost from "@/src/hooks/usePost";
import { Stack } from "@chakra-ui/react";
import {
    collection,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Home() {
    const [user, loadingUser] = useAuthState(auth);
    const [loading, setLoading] = useState(false);
    const {
        setPostStateValue,
        postStateValue,
        onDeletePost,
        onSelectPost,
        onVote,
    } = usePost();
    const { communityStateValue } = useCommunityData();

    const buildUserHomeFeed = async () => {
        setLoading(true);
        try {
            if (communityStateValue.mySnippets.length) {
                //get posts from users communities
                const myCommunityIds = communityStateValue.mySnippets.map(
                    (snippet) => snippet.communityId
                );

                const postQuery = query(
                    collection(firestore, "posts"),
                    where("communityId", "in", myCommunityIds),
                    limit(10)
                );
                const postDocs = await getDocs(postQuery);
                const posts = postDocs.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPostStateValue((prev) => ({
                    ...prev,
                    posts: posts as Post[],
                }));
            } else {
                buildNoUserHomeFeed();
            }
        } catch (error: any) {
            console.log("buildUserHomeFeed error", error.message);
        }
        setLoading(false);
    };

    const buildNoUserHomeFeed = async () => {
        setLoading(true);
        try {
            const postQuery = query(
                collection(firestore, "posts"),
                orderBy("voteStatus", "desc"),
                limit(10)
            );
            const postDocs = await getDocs(postQuery);
            const posts = postDocs.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPostStateValue((prev) => ({
                ...prev,
                posts: posts as Post[],
            }));
        } catch (error: any) {
            console.log("buildNoUserHomeFeed error", error.message);
        }
        setLoading(false);
    };

    const getUserPostVotes = async () => {
        try {
            const postIds = postStateValue.posts.map((post) => post.id);
            const postVotesQuery = query(
                collection(firestore, `users/${user?.uid}/postVotes`),
                where("postId", "in", postIds)
            );
            const postVoteDocs = await getDocs(postVotesQuery);
            const postVotes = postVoteDocs.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPostStateValue((prev) => ({
                ...prev,
                postVotes: postVotes as postVote[],
            }));
        } catch (error: any) {
            console.log("getUserPostVotes error", error.message);
        }
    };

    useEffect(() => {
        //want to know if user is logged in
        //or service is attempting to get authed user
        if (!user && !loadingUser) buildNoUserHomeFeed();
    }, [user, loadingUser]);

    useEffect(() => {
        if (communityStateValue.snippetsFetched) buildUserHomeFeed();
    }, [communityStateValue.snippetsFetched]);

    useEffect(() => {
        if (user && postStateValue.posts.length) getUserPostVotes();

        return () => {
            setPostStateValue((prev) => ({
                ...prev,
                postVotes: [],
            }));
        };
    }, [user, postStateValue.posts]);

    return (
        <PageContent>
            <>
                {/* <CreatePostLink /> */}
                {loading ? (
                    <PostLoader />
                ) : (
                    <Stack>
                        {postStateValue.posts.map((item) => (
                            <PostItem
                                post={item}
                                userIsCreator={user?.uid === item.creatorId}
                                userVoteValue={
                                    postStateValue.postVotes.find(
                                        (vote) => vote.postId === item.id
                                    )?.voteValue
                                }
                                onDeletePost={onDeletePost}
                                onVote={onVote}
                                onSelectPost={onSelectPost}
                                key={item.id}
                                homePage
                            />
                        ))}
                    </Stack>
                )}
            </>

            <Stack spacing={5}>
                <Recommendations />
                <PersonalHome />
            </Stack>
        </PageContent>
    );
}
