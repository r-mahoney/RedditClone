import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Post, postState, postVote } from "../atoms/postAtom";
import { deleteObject, ref } from "firebase/storage";
import { auth, firestore, storage } from "../firebase/clientApp";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    writeBatch,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { communityState } from "../atoms/communitiesAtom";

const usePost = () => {
    const [postStateValue, setPostStateValue] = useRecoilState(postState);
    const [user] = useAuthState(auth);
    const communityStateValue = useRecoilValue(communityState);

    const onVote = async (post: Post, vote: number, communityId: string) => {
        if (!user?.uid) {
            setAuthModalState({ open: true, view: "login" });
            return;
        }

        const { voteStatus } = post;
        // const existingVote = post.currentUserVoteStatus;
        const existingVote = postStateValue.postVotes.find(
            (vote) => vote.postId === post.id
        );

        // is this an upvote or a downvote?
        // has this user voted on this post already? was it up or down?

        try {
            let voteChange = vote;
            const batch = writeBatch(firestore);

            const updatedPost = { ...post };
            const updatedPosts = [...postStateValue.posts];
            let updatedPostVotes = [...postStateValue.postVotes];

            // New vote
            if (!existingVote) {
                //add/subtract 1 to post.voteStatus
                const postVoteRef = doc(
                    collection(firestore, "users", `${user?.uid}/postVotes`)
                );
                //create new postVote document
                const newVote: postVote = {
                    id: postVoteRef.id,
                    postId: post.id,
                    communityId,
                    voteValue: vote,
                };

                batch.set(postVoteRef, newVote);

                updatedPost.voteStatus = voteStatus + vote;
                updatedPostVotes = [...updatedPostVotes, newVote];
            }
            //existing vote
            else {
                const postVoteRef = doc(
                    firestore,
                    "users",
                    `${user.uid}/postVotes/${existingVote.id}`
                );
                //removing vote: upvote to neutral
                //or downvote to neutral
                if (existingVote.voteValue === vote) {
                    voteChange *= -1;
                    updatedPost.voteStatus = voteStatus - vote;
                    updatedPostVotes = updatedPostVotes.filter(
                        (vote) => vote.id !== existingVote.id
                    );
                    batch.delete(postVoteRef);
                }
                //upvote to downvote or vice versa
                else {
                    //add/subtract 2 to post.voteStatus since +1 to -1 is a change of 2
                    voteChange = 2 * vote;
                    updatedPost.voteStatus = voteStatus + 2 * vote;
                    const voteIndex = postStateValue.postVotes.findIndex(
                        (vote) => vote.id === existingVote.id
                    );

                    if (voteIndex !== -1) {
                        updatedPostVotes[voteIndex] = {
                            ...existingVote,
                            voteValue: vote,
                        };
                    }
                    batch.update(postVoteRef, {
                        voteValue: vote,
                    });
                }
            }
            let updatedState = {
                ...postStateValue,
                postVotes: updatedPostVotes,
            };
            //update existing postVote doc
            const postIndex = postStateValue.posts.findIndex(
                (item) => item.id === post.id
            );
            updatedPosts[postIndex] = updatedPost;
            updatedState = {
                ...updatedState,
                posts: updatedPosts,
            };
            setPostStateValue(updatedState);

            const postRef = doc(firestore, "posts", post.id);
            batch.update(postRef, { voteStatus: voteStatus + voteChange });
            await batch.commit();
            //take modified copies to update state
        } catch (error: any) {
            console.log("voting error", error.message);
        }
    };

    const onSelectPost = () => {};

    const onDeletePost = async (post: Post): Promise<boolean> => {
        try {
            //check if image
            if (post.imageURL) {
                //delete from firebase storace
                const imageRef = ref(storage, `posts/${post.id}/image`);
                await deleteObject(imageRef);
            }
            //delete post doc from firestore
            const postDocRef = doc(firestore, "posts", post.id);
            await deleteDoc(postDocRef);
            //update recoil state
            setPostStateValue((prev) => ({
                ...prev,
                posts: prev.posts.filter((item) => item.id !== post.id),
            }));
            return true;
        } catch (error) {
            return false;
        }
    };

    const getCommunityPostVotes = async (communityId: string) => {
        const postVotesQuery = query(
            collection(firestore, `users/${user?.uid}/postVotes`),
            where("communityId", "==", communityId)
        );

        const PostVoteDocs = await getDocs(postVotesQuery);

        const postVotes = PostVoteDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setPostStateValue((prev) => ({
            ...prev,
            postVotes: postVotes as postVote[],
        }));
    };
    useEffect(() => {
        if (!user?.uid || !communityStateValue.currentCommunity) return;
        console.log(communityStateValue.currentCommunity.id);
        getCommunityPostVotes(communityStateValue.currentCommunity.id);
    }, [user, communityStateValue.currentCommunity]);

    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onDeletePost,
        onSelectPost,
    };
};
export default usePost;
function setAuthModalState(arg0: { open: boolean; view: string }) {
    throw new Error("Function not implemented.");
}
