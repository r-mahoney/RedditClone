import { communityState } from "@/src/atoms/communitiesAtom";
import { Box, Flex, Icon, MenuItem, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { GrAdd } from "react-icons/gr";
import { useRecoilValue } from "recoil";
import CreateCommunityModal from "../../Modal/CreateCommunity/CreateCommunityModal";
import MenuListItem from "./MenuListItem";
import { FaReddit } from "react-icons/fa";

type CommunitiesProps = {};

const Communities: React.FC<CommunitiesProps> = () => {
    const [open, setOpen] = useState(false);
    const mySnippets = useRecoilValue(communityState).mySnippets;
    const router = useRouter();

    return (
        <>
            <CreateCommunityModal
                open={open}
                handleClose={() => setOpen(false)}
            />
            <Box mt={3} mb={4}>
                <Text
                    pl={3}
                    mb={1}
                    fontSize="7pt"
                    fontWeight={500}
                    color="gray.500"
                >
                    MODERATING
                </Text>
            </Box>
            {mySnippets
                .filter((snippet) => snippet.isModerator)
                .map((snippet) => (
                    <MenuListItem
                        key={snippet.communityId}
                        icon={FaReddit}
                        displayText={`r/${snippet.communityId}`}
                        link={`/r/${snippet.communityId}`}
                        iconColor="brand.100"
                        imageURL={snippet.imageURL}
                    />
                ))}
            <Box mt={3} mb={4}>
                <Text
                    pl={3}
                    mb={1}
                    fontSize="7pt"
                    fontWeight={500}
                    color="gray.500"
                >
                    MY COMMUNITIES
                </Text>
            </Box>
            <MenuItem
                width="100%"
                fontSize="10px"
                _hover={{ bg: "gray.100" }}
                onClick={() => {
                    setOpen(true);
                }}
            >
                <Flex align="center">
                    <Icon as={GrAdd} fontSize={20} mr={2} />
                    Create Community
                </Flex>
            </MenuItem>
            {mySnippets.map((snippet) => (
                <MenuListItem
                    key={snippet.communityId}
                    icon={FaReddit}
                    displayText={`r/${snippet.communityId}`}
                    link={`/r/${snippet.communityId}`}
                    iconColor="blue.500"
                    imageURL={snippet.imageURL}
                />
            ))}
        </>
    );
};
export default Communities;
