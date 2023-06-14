import { Community, communityState } from "@/src/atoms/communitiesAtom";
import { auth, firestore, storage } from "@/src/firebase/clientApp";
import useSelectFile from "@/src/hooks/useSelectFile";
import {
    Box,
    Button,
    Divider,
    Flex,
    Image,
    Icon,
    Stack,
    Text,
    Spinner,
} from "@chakra-ui/react";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiCakeLine } from "react-icons/ri";
import { useSetRecoilState } from "recoil";

type AboutProps = {
    communityData: Community;
};

const About: React.FC<AboutProps> = ({ communityData }) => {
    const router = useRouter();
    const [user] = useAuthState(auth);
    const selectedFileRef = useRef<HTMLInputElement>(null);
    const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState("");
    const setCommunityStateValue = useSetRecoilState(communityState);

    const onUpdateImage = async () => {
        if (!selectedFile) return;
        setUploadingImage(true);
        try {
            const imageRef = ref(
                storage,
                `communities/${communityData.id}/image`
            );
            await uploadString(imageRef, selectedFile, "data_url");
            const downloadURL = await getDownloadURL(imageRef);
            await updateDoc(doc(firestore, "communities", communityData.id), {
                imageURL: downloadURL,
            });

            setCommunityStateValue((prev) => ({
                ...prev,
                currentCommunity: {
                    ...prev.currentCommunity,
                    imageURL: downloadURL,
                } as Community,
            }));
        } catch (error: any) {
            console.log("updateImage error", error);
            setError(error.message);
        }
        setUploadingImage(false);
        setSelectedFile("")
    };

    return (
        <Box position="sticky" top="14px">
            <Flex
                backgroundColor="blue.500"
                justify="space-between"
                color="white"
                p={3}
                borderRadius="4px 4px 0 0"
            >
                <Text fontSize="10pt" fontWeight={700}>
                    About r/{communityData.id}
                </Text>
                <Icon as={HiOutlineDotsHorizontal} />
            </Flex>
            <Flex
                bg="white"
                borderRadius=" 0 0 4px 4px"
                direction="column"
                p={3}
            >
                <Stack>
                    <Flex width="100%" p={2} fontSize="10pt" fontWeight={700}>
                        <Flex direction="column" flexGrow={1}>
                            <Text>
                                {communityData.numberOfMembers.toLocaleString()}
                            </Text>
                            <Text>
                                {communityData.numberOfMembers < 2
                                    ? "Member"
                                    : "Members"}
                            </Text>
                        </Flex>
                        <Flex direction="column" flexGrow={1}>
                            <Text>1</Text>
                            <Text>Online</Text>
                        </Flex>
                    </Flex>
                    <Divider />
                    <Flex
                        align="center"
                        width="100%"
                        p={1}
                        fontWeight={500}
                        fontSize="10pt"
                    >
                        <Icon as={RiCakeLine} mr={2} />
                        {communityData.createdAt && (
                            <Text>
                                Created at{" "}
                                {moment(
                                    new Date(
                                        communityData.createdAt.seconds * 1000
                                    )
                                ).format("MMM DD YYYY")}
                            </Text>
                        )}
                    </Flex>
                    <Link href={`/r/${router.query.communityId}/submit`}>
                        <Button mt={3} height="30px" width="100%">
                            Create Post
                        </Button>
                    </Link>
                    {user?.uid === communityData.creatorId && (
                        <>
                            <Divider />
                            <Stack spacing={1} fontSize="10pt">
                                <Text fontWeight={600}>Admin</Text>
                                <Flex align="center" justify="space-between">
                                    <Button
                                        height="30px"
                                        width="60%"
                                        cursor="pointer"
                                        variant='outline'
                                        onClick={() =>
                                            selectedFileRef.current?.click()
                                        }
                                    >
                                        Change Image
                                    </Button>
                                    {communityData.imageURL || selectedFile ? (
                                        <Image
                                            src={
                                                selectedFile ||
                                                communityData.imageURL
                                            }
                                            borderRadius="full"
                                            boxSize="40px"
                                            alt="Community Image"
                                        />
                                    ) : (
                                        <Image
                                            src={"/images/default_image.png"}
                                            borderRadius="full"
                                            boxSize="40px"
                                            alt="Community Image"
                                        />
                                    )}
                                </Flex>
                                {selectedFile &&
                                    (uploadingImage ? (
                                        <Spinner />
                                    ) : (
                                        <Button
                                            height="30px"
                                            width="60%"
                                            cursor="pointer"
                                            onClick={onUpdateImage}
                                        >
                                            Save Changes
                                        </Button>
                                    ))}
                                <input
                                    ref={selectedFileRef}
                                    type="file"
                                    hidden
                                    onChange={onSelectFile}
                                />
                            </Stack>
                        </>
                    )}
                </Stack>
            </Flex>
        </Box>
    );
};
export default About;
