import { Post } from "@/src/atoms/postAtom";
import { Flex, Icon } from "@chakra-ui/react";
import React, { useState } from "react";
import { BiPoll } from "react-icons/bi";
import { BsLink45Deg, BsMic } from "react-icons/bs";
import { IoDocumentText, IoImageOutline } from "react-icons/io5";
import ImageUpload from "./PostForm/ImageUpload";
import TextInputs from "./PostForm/TextInputs";
import TabItem from "./TabItem";
import { User } from "firebase/auth";
import { useRouter } from "next/router";
import {
    Timestamp,
    addDoc,
    collection,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { firestore, storage } from "@/src/firebase/clientApp";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import {
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from "@chakra-ui/react";
import { MdError } from "react-icons/md";

type NewPostProps = {
    user: User;
};

const formTabs: tabItem[] = [
    {
        title: "Post",
        icon: IoDocumentText,
    },
    {
        title: "Images & Video",
        icon: IoImageOutline,
    },
    {
        title: "Link",
        icon: BsLink45Deg,
    },
    {
        title: "Poll",
        icon: BiPoll,
    },
    {
        title: "Talk",
        icon: BsMic,
    },
];

export type tabItem = {
    title: string;
    icon: typeof Icon.arguments;
};

const NewPost: React.FC<NewPostProps> = ({ user }) => {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState(formTabs[0].title);
    const [error, setError] = useState("");
    const [textInputs, setTextInputs] = useState({
        title: "",
        body: "",
    });
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string>();

    const handleCreatePost = async () => {
        setLoading(true);
        const { title, body } = textInputs;
        const { communityId } = router.query;
        try {
            const postDocRef = await addDoc(collection(firestore, "posts"), {
                communityId: communityId as string,
                creatorId: user.uid,
                userDisplayText: user.email!.split("@")[0],
                title,
                body,
                numberOfComments: 0,
                voteStatus: 0,
                createdAt: serverTimestamp(),
                editedAt: serverTimestamp(),
            });

            // // check if selectedFile exists, if it does, do image processing
            if (selectedFile) {
                const imageRef = ref(storage, `posts/${postDocRef.id}/image`);
                await uploadString(imageRef, selectedFile, "data_url");
                const downloadURL = await getDownloadURL(imageRef);
                await updateDoc(postDocRef, {
                    imageURL: downloadURL,
                });
            }

            // Clear the cache to cause a refetch of the posts
            router.back();
        } catch (error) {
            console.log("createPost error", error);
            setError("Error creating post");
        }
        setLoading(false);
    };

    const onTextChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setError("")
        const {
            target: { name, value },
        } = event;

        setTextInputs((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const reader = new FileReader();

        if (event.target.files?.[0]) {
            reader.readAsDataURL(event.target.files[0]);
        }

        reader.onload = (readerEvent) => {
            if (readerEvent.target?.result) {
                setSelectedFile(readerEvent.target?.result as string);
            }
        };
    };
    return (
        <>
            <Flex direction="column" bg="white" borderRadius={4} mt={2}>
                <Flex width="100%">
                    {formTabs.map((item) => (
                        <TabItem
                            item={item}
                            selected={item.title === selectedTab}
                            setSelectedTab={setSelectedTab}
                            key={item.title}
                        />
                    ))}
                </Flex>
                <Flex p={4}>
                    {selectedTab === "Post" && (
                        <TextInputs
                            textInputs={textInputs}
                            handleCreatePost={handleCreatePost}
                            onChange={onTextChange}
                            loading={loading}
                        />
                    )}
                    {selectedTab === "Images & Video" && (
                        <ImageUpload
                            selectedFile={selectedFile}
                            onSelectImage={onSelectImage}
                            setSelectedTab={setSelectedTab}
                            setSelectedFile={setSelectedFile}
                        />
                    )}
                </Flex>
                {error && (
                    <Alert status="error">
                        <AlertIcon />
                        <AlertTitle>{error}</AlertTitle>
                    </Alert>
                )}
            </Flex>
        </>
    );
};
export default NewPost;
