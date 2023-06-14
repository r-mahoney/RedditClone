import { Community } from "@/src/atoms/communitiesAtom";
import { Post } from "@/src/atoms/postAtom";
import { auth, firestore } from "@/src/firebase/clientApp";
import usePost from "@/src/hooks/usePost";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import PostItem from "./PostItem";
import { useAuthState } from "react-firebase-hooks/auth";
import { Stack } from "@chakra-ui/react";
import PostLoader from "./PostLoader";

type PostsProps = {
    communityData: Community;
};

const Posts: React.FC<PostsProps> = ({ communityData }) => {
    const [user] = useAuthState(auth);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const {
        postStateValue,
        setPostStateValue,
        onDeletePost,
        onSelectPost,
        onVote,
    } = usePost();

    const getPosts = async () => {
        setLoading(true)
        try {
            const postQuery = query(
                collection(firestore, "posts"),
                where("communityId", "==", communityData.id),
                orderBy("createdAt", "desc")
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
            console.log("getPosts error", error.message);
            setError(error);
        }
        setLoading(false)
    };

    useEffect(() => {
        getPosts();
    }, [communityData]);
    return (
        <>
            {loading ? (
                <PostLoader />
            ) : (
                <Stack>
                    {postStateValue.posts.map((item) => (
                        <PostItem
                            post={item}
                            userIsCreator={user?.uid === item.creatorId}
                            userVoteValue={undefined}
                            onDeletePost={onDeletePost}
                            onVote={onVote}
                            onSelectPost={onSelectPost}
                            key={item.id}
                        />
                    ))}
                </Stack>
            )}
        </>
    );
};
export default Posts;
