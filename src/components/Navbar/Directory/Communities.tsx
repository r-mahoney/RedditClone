import React, { useState } from "react";
import CreateCommunityModal from "../../Modal/CreateCommunity/CreateCommunityModal";
import { Flex, Icon, MenuItem } from "@chakra-ui/react";
import { GrAdd } from "react-icons/gr";
import useCommunityData from "@/src/hooks/useCommunityData";
import { FaRedditAlien } from "react-icons/fa";
import { useRouter } from "next/router";

type CommunitiesProps = {};

const Communities: React.FC<CommunitiesProps> = () => {
    const [open, setOpen] = useState(false);
    const { communityStateValue } = useCommunityData();
    const router = useRouter()

    return (
        <>
            <CreateCommunityModal
                open={open}
                handleClose={() => setOpen(false)}
            />
            {communityStateValue.mySnippets.map((snippet) => (
                <MenuItem
                    width="100%"
                    fontSize="10px"
                    _hover={{ bg: "gray.100" }}
                    onClick={() => {
                        router.push(`/r/${snippet.communityId}`);
                    }}
                    key={snippet.communityId}
                >
                    <Flex align="center">
                        <Icon as={FaRedditAlien} fontSize={20} mr={2} />
                        {snippet.communityId}
                    </Flex>
                </MenuItem>
            ))}
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
        </>
    );
};
export default Communities;
