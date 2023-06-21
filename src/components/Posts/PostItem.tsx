import { Post } from "@/src/atoms/postAtom";
import {
    Alert,
    AlertIcon,
    AlertTitle,
    Flex,
    Icon,
    Image,
    Link,
    Skeleton,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { BsChat } from "react-icons/bs";
import {
    IoArrowDownCircleOutline,
    IoArrowDownCircleSharp,
    IoArrowRedoOutline,
    IoArrowUpCircleOutline,
    IoArrowUpCircleSharp,
    IoBookmarkOutline,
} from "react-icons/io5";

type PostItemProps = {
    post: Post;
    userIsCreator: boolean;
    userVoteValue?: number;
    onVote: (
        event: React.MouseEvent<SVGElement, MouseEvent>,
        post: Post,
        vote: number,
        communityId: string
    ) => void;
    onDeletePost: (post: Post) => Promise<boolean>;
    onSelectPost?: (post: Post) => void;
};

const PostItem: React.FC<PostItemProps> = ({
    post,
    userIsCreator,
    userVoteValue,
    onDeletePost,
    onSelectPost,
    onVote,
}) => {
    const [loadingImage, setLoadingImage] = useState(true);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [error, setError] = useState("");
    const singlePostPage = !onSelectPost;
    const router = useRouter();
    const { communityId } = router.query;
    const handleDelete = async (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.stopPropagation();
        setLoadingDelete(true);
        try {
            const success = await onDeletePost(post);

            if (!success) {
                throw new Error("Failed to delete the post");
            }
            console.log("Post successfully deleted");
            if (singlePostPage) {
                router.push(`/r/${post.communityId}`);
            }
        } catch (error: any) {
            console.log("handleDelete error", error.message);
            setError(error.message);
        }
        setLoadingDelete(false);
    };
    return (
        <Flex
            border="1px solid"
            bg="white"
            borderRadius={singlePostPage ? "4px 4px 0 0 " : 4}
            borderColor={singlePostPage ? "white" : "gray.300"}
            _hover={{
                borderColor: singlePostPage ? "none" : "gray.500",
            }}
            cursor={singlePostPage ? "unset" : "pointer"}
            onClick={() => onSelectPost && onSelectPost(post)}
        >
            <Flex
                direction="column"
                align="center"
                bg={singlePostPage ? "none" : "gray.100"}
                p={2}
                width="40px"
                borderRadius={singlePostPage ? 0 : "3px 0 0 3px"}
            >
                <Icon
                    as={
                        userVoteValue === 1
                            ? IoArrowUpCircleSharp
                            : IoArrowUpCircleOutline
                    }
                    color={userVoteValue === 1 ? "brand.100" : "gray.400"}
                    fontSize={22}
                    onClick={(event) =>
                        onVote(event, post, 1, post.communityId)
                    }
                    cursor="pointer"
                />
                <Text>{post.voteStatus}</Text>
                <Icon
                    as={
                        userVoteValue === -1
                            ? IoArrowDownCircleSharp
                            : IoArrowDownCircleOutline
                    }
                    color={userVoteValue === -1 ? "blue.500" : "gray.400"}
                    fontSize={22}
                    onClick={(event) =>
                        onVote(event, post, -1, post.communityId)
                    }
                    cursor="pointer"
                />
            </Flex>
            <Flex direction="column" width="100%">
                {error && (
                    <Alert status="error">
                        <AlertIcon />
                        <AlertTitle>{error}</AlertTitle>
                    </Alert>
                )}
                <Stack spacing={1} p="10px">
                    <Stack
                        direction="row"
                        spacing={0.6}
                        align="center"
                        fontSize="9pt"
                    >
                        {/* home page check */}
                        {singlePostPage ? (
                            <Flex direction="column">
                                <Text fontWeight={600}>
                                    <Link href={`/r/${communityId}`}>
                                        {communityId}
                                    </Link>{" "}
                                    <span style={{ fontWeight: "200" }}>
                                        {moment(
                                            new Date(
                                                post.createdAt.seconds * 1000
                                            )
                                        ).fromNow()}
                                    </span>
                                </Text>
                                <Text>by u/{post.userDisplayText}</Text>
                            </Flex>
                        ) : (
                            <Text>
                                Posted by u/{post.userDisplayText}{" "}
                                {moment(
                                    new Date(post.createdAt.seconds * 1000)
                                ).fromNow()}
                            </Text>
                        )}
                    </Stack>
                    <Text fontSize="12pt" fontWeight={600}>
                        {post.title}
                    </Text>
                    <Text fontSize="10pt">{post.body}</Text>
                    {post.imageURL && (
                        <Flex justify="center" align="center" p={2}>
                            {loadingImage && (
                                <Skeleton
                                    height="200px"
                                    width="100%"
                                    borderRadius={4}
                                />
                            )}
                            <Image
                                src={post.imageURL}
                                maxHeight="460px"
                                alt="Image on the post"
                                display={loadingImage ? "none" : "unset"}
                                onLoad={() => setLoadingImage(false)}
                            />
                        </Flex>
                    )}
                </Stack>
                <Flex ml={1} mb={0.5} color="gray.500" fontWeight={600}>
                    <Flex
                        align="center"
                        p="8px 10px"
                        borderRadius={4}
                        _hover={{
                            bg: "gray.200",
                        }}
                        cursor="pointer"
                    >
                        <Icon as={BsChat} mr={2} />
                        <Text fontSize="9pt">{post.numberOfComments}</Text>
                    </Flex>
                    <Flex
                        align="center"
                        p="8px 10px"
                        borderRadius={4}
                        _hover={{
                            bg: "gray.200",
                        }}
                        cursor="pointer"
                    >
                        <Icon as={IoArrowRedoOutline} mr={2} />
                        <Text fontSize="9pt">Share</Text>
                    </Flex>
                    <Flex
                        align="center"
                        p="8px 10px"
                        borderRadius={4}
                        _hover={{
                            bg: "gray.200",
                        }}
                        cursor="pointer"
                    >
                        <Icon as={IoBookmarkOutline} mr={2} />
                        <Text fontSize="9pt">Save</Text>
                    </Flex>
                    {userIsCreator && (
                        <Flex
                            align="center"
                            p="8px 10px"
                            borderRadius={4}
                            _hover={{
                                bg: "gray.200",
                            }}
                            cursor="pointer"
                            onClick={handleDelete}
                        >
                            {loadingDelete ? (
                                <Spinner size="sm" />
                            ) : (
                                <>
                                    <Icon as={AiOutlineDelete} mr={2} />
                                    <Text fontSize="9pt">Delete</Text>
                                </>
                            )}
                        </Flex>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
};
export default PostItem;
