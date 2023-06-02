import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Box,
    Divider,
    Text,
    Input,
    Stack,
    Checkbox,
    Flex,
    Icon,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { HiLockClosed } from "react-icons/hi";
import { BsFillEyeFill, BsFillPersonFill } from "react-icons/bs";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/src/firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";

type CreateCommunityModalProps = {
    open: boolean;
    handleClose: () => void;
};

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
    open,
    handleClose,
}) => {
    const [communityName, setCommunityName] = useState("");
    const [charsRemaining, setCharsRemaining] = useState(21);
    const [communityType, setCommunityType] = useState("public");
    const [error, setError] = useState("");
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(error) setError("")
        if (event.target.value.length > 21) return;
        setCommunityName(event.target.value);
        setCharsRemaining(21 - event.target.value.length);
    };

    const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCommunityType(event.target.name);
    };

    const handleCreateCommunity = async () => {
        //validate community name. 3-20 characters and unique community name
        const format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;

        if (format.test(communityName) || communityName.length < 3) {
            setError(
                "Community names must be between 3 and 20 characters and can only contain letters, numbers, and underscores"
            );
            return;
        }

        setLoading(true);
        //if valid create community doc in firestore db
        try {
            const communityDocRef = doc(
                firestore,
                "communities",
                communityName
            );
            const communityDoc = await getDoc(communityDocRef);

            if (communityDoc.exists()) {
                throw new Error(`Sorry, r/${communityName} is already taken.`);
            }

            //create community
            await setDoc(communityDocRef, {
                //creatorId, createdAt, numberOfMembers, privacyType
                creatorId: user?.uid,
                createdAt: serverTimestamp(),
                numberOfMembers: 1,
                privacyType: communityType,
            });
            handleClose();
            setCommunityName("")
        } catch (error: any) {
            console.log('handleCreateCommunity error', error)
            setError(error.message)
        }
        setLoading(false);
    };

    return (
        <>
            <Modal isOpen={open} onClose={handleClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        display="flex"
                        flexDirection="column"
                        fontSize={15}
                        padding={3}
                    >
                        Create A Community
                    </ModalHeader>
                    <Box pl={3} pr={3}>
                        <Divider />
                        <ModalCloseButton />
                        <ModalBody
                            display="flex"
                            flexDirection="column"
                            padding="10px 0"
                        >
                            <Text fontWeight={600} fontSize={15}>
                                Name
                            </Text>
                            <Text color="gray.500" fontSize={11}>
                                Communtiy names including capitilization can not
                                be changed
                            </Text>
                            <Text
                                position="relative"
                                top="28px"
                                left="10px"
                                width="20px"
                                color="gray.400"
                            >
                                r/
                            </Text>
                            <Input
                                position="relative"
                                value={communityName}
                                size="sm"
                                pl="22px"
                                onChange={handleChange}
                            />
                            <Text
                                fontSize="9pt"
                                color={charsRemaining === 0 ? "red" : "gray"}
                            >
                                {charsRemaining} characters remaining
                            </Text>
                            {error && (
                                <Text fontSize="9pt" color="red" pt={1}>
                                    {error}
                                </Text>
                            )}
                            <Box mt={4} mb={4}>
                                <Text fontSize={15} fontWeight={600}>
                                    Community Type
                                </Text>
                                <Stack spacing={2}>
                                    <Checkbox
                                        name="public"
                                        isChecked={communityType === "public"}
                                        onChange={handleTypeChange}
                                    >
                                        <Flex align="center">
                                            <Icon
                                                as={BsFillPersonFill}
                                                color="gray.500"
                                                mr={2}
                                            />
                                            <Text fontSize="10pt" mr={1}>
                                                Public
                                            </Text>
                                            <Text
                                                fontSize="8pt"
                                                color="gray.500"
                                                padding={1}
                                            >
                                                Anyone can view, post, and
                                                comment to this community
                                            </Text>
                                        </Flex>
                                    </Checkbox>
                                    <Checkbox
                                        name="restricted"
                                        isChecked={
                                            communityType === "restricted"
                                        }
                                        onChange={handleTypeChange}
                                    >
                                        <Flex align="center">
                                            <Icon
                                                as={BsFillEyeFill}
                                                color="gray.500"
                                                mr={2}
                                            />

                                            <Text fontSize="10pt" mr={1}>
                                                Restricted
                                            </Text>
                                            <Text
                                                fontSize="8pt"
                                                color="gray.500"
                                                padding={1}
                                            >
                                                Anyone can view this community,
                                                but only approved users can post
                                            </Text>
                                        </Flex>
                                    </Checkbox>
                                    <Checkbox
                                        name="private"
                                        isChecked={communityType === "private"}
                                        onChange={handleTypeChange}
                                    >
                                        <Flex align="center">
                                            <Icon
                                                as={HiLockClosed}
                                                color="gray.500"
                                                mr={2}
                                            />
                                            <Text fontSize="10pt" mr={1}>
                                                Private
                                            </Text>
                                            <Text
                                                fontSize="8pt"
                                                color="gray.500"
                                                padding={1}
                                            >
                                                Only approved users can view and
                                                submit to this community
                                            </Text>
                                        </Flex>
                                    </Checkbox>
                                </Stack>
                            </Box>
                        </ModalBody>
                    </Box>

                    <ModalFooter bg="gray.100" borderRadius="0 0 10px 10px">
                        <Button
                            variant="outline"
                            height="30px"
                            mr={3}
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button height="30px" onClick={handleCreateCommunity} isLoading={loading}>
                            Create Community
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
export default CreateCommunityModal;
