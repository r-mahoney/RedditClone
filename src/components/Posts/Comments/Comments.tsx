import { Post, postState } from "@/src/atoms/postAtom";
import {
    Box,
    Flex,
    SkeletonCircle,
    SkeletonText,
    Stack,
    Text,
} from "@chakra-ui/react";
import { User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import CommentInput from "./CommentInput";
import {
    collection,
    doc,
    getDocs,
    increment,
    orderBy,
    query,
    serverTimestamp,
    where,
    writeBatch,
} from "firebase/firestore";
import { firestore } from "@/src/firebase/clientApp";
import { Timestamp } from "@google-cloud/firestore";
import { useSetRecoilState } from "recoil";
import CommentItem, { Comment } from "./CommentItem";

type CommentsProps = {
    user: User;
    selectedPost: Post | null;
    communityId: string;
};

const Comments: React.FC<CommentsProps> = ({
    user,
    selectedPost,
    communityId,
}) => {
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [createLoading, setCeateLoading] = useState(false);
    const [loadingDeleteId, setLoadingDeleteId] = useState("");
    const setPostState = useSetRecoilState(postState);

    const onCreateComment = async (commentText: string) => {
        //create comment doc
        setCeateLoading(true);
        try {
            const batch = writeBatch(firestore);

            const commentDocRef = doc(collection(firestore, "comments"));
            const newComment: Comment = {
                id: commentDocRef.id,
                creatorId: user.uid,
                creatorDisplayText: user.email!.split("@")[0],
                communityId,
                postId: selectedPost!.id,
                postTitle: selectedPost!.title,
                text: commentText,
                createdAt: serverTimestamp() as Timestamp,
            };

            batch.set(commentDocRef, newComment);

            newComment.createdAt = { seconds: Date.now() / 1000 } as Timestamp;
            //update post numberOfComments
            const postDocRef = doc(firestore, "posts", selectedPost?.id!);
            batch.update(postDocRef, {
                numberOfComments: increment(1),
            });

            await batch.commit();
            //update client recoil state
            setCommentText("");
            setComments((prev) => [newComment, ...prev]);
            setPostState((prev) => ({
                ...prev,
                selectedPost: {
                    ...prev.selectedPost,
                    numberOfComments: prev.selectedPost?.numberOfComments! + 1,
                } as Post,
            }));
        } catch (error: any) {
            console.log("createComment error", error.message);
        }
        setCeateLoading(false);
    };

    const onDeleteComment = async (comment: any) => {
        setLoadingDeleteId(comment.id);
        //delete comment doc
        try {
            const batch = writeBatch(firestore);

            const commentDocRef = doc(firestore, "comments", comment.id);
            batch.delete(commentDocRef);
            //update post number of comments
            const postDocRef = doc(firestore, "posts", selectedPost?.id!);
            batch.update(postDocRef, {
                numberOfComments: increment(-1),
            });

            await batch.commit();
            //update recoil state to update comment number
            setPostState((prev) => ({
                ...prev,
                selectedPost: {
                    ...prev.selectedPost,
                    numberOfComments: prev.selectedPost?.numberOfComments! - 1,
                } as Post,
            }));
            setComments((prev) =>
                prev.filter((item) => item.id !== comment.id)
            );
        } catch (error: any) {
            console.log("onDelete comment error", error.message);
        }
        setLoadingDeleteId("");
    };

    const getPostComments = async () => {
        try {
            const commentsQuery = query(
                collection(firestore, "comments"),
                where("postId", "==", selectedPost?.id),
                orderBy("createdAt", "desc")
            );
            const commentDocs = await getDocs(commentsQuery);
            const comments = commentDocs.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setComments(comments as Comment[]);
        } catch (error: any) {
            console.log("fetchComments error", error.message);
        }
        setFetchLoading(false);
    };

    useEffect(() => {
        if (!selectedPost) return;
        getPostComments();
    }, [selectedPost]);

    return (
        <Box bg="white" borderRadius="0 0 4px 4px" p={2}>
            <Flex
                direction="column"
                pl={10}
                pr={4}
                mb={6}
                fontSize="10pt"
                width="100%"
            >
                {!fetchLoading && (
                    <CommentInput
                        commentText={commentText}
                        setCommentText={setCommentText}
                        user={user}
                        createLoading={createLoading}
                        onCreateComment={onCreateComment}
                    />
                )}
            </Flex>
            <Stack spacing={6} padding={2}>
                {fetchLoading ? (
                    <>
                        {[0, 1, 2].map((item) => (
                            <Box key={item} padding="6" bg="white">
                                <SkeletonCircle size="10" />
                                <SkeletonText
                                    mt="4"
                                    noOfLines={2}
                                    spacing="4"
                                />
                            </Box>
                        ))}
                    </>
                ) : (
                    <>
                        {comments.length === 0 ? (
                            <Text fontWeight={700} opacity={0.3}>
                                No Comments Yet
                            </Text>
                        ) : (
                            <>
                                {comments.map((item) => (
                                    <CommentItem
                                        key={item.id}
                                        comment={item}
                                        onDeleteComment={onDeleteComment}
                                        loadingDelete={loadingDeleteId===item.id}
                                        userId={user?.uid}
                                    />
                                ))}
                            </>
                        )}
                    </>
                )}
            </Stack>
        </Box>
    );
};
export default Comments;
