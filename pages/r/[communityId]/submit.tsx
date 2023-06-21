import About from "@/src/components/Community/About";
import PageContent from "@/src/components/Layout/PageContent";
import NewPost from "@/src/components/Posts/NewPost";
import { auth } from "@/src/firebase/clientApp";
import useCommunityData from "@/src/hooks/useCommunityData";
import { Box, Text } from "@chakra-ui/react";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const SubmitPostPage: React.FC = () => {
    const [user] = useAuthState(auth);
    const { communityStateValue } = useCommunityData();

    return (
        <PageContent>
            <>
                <Box p="14px 0" borderBottom="1px solid" borderColor="white">
                    <Text>Create A Post</Text>
                </Box>
                {user && <NewPost user={user} />}
            </>
            <>
                {communityStateValue.currentCommunity && (
                    <About
                        communityData={communityStateValue.currentCommunity}
                    />
                )}
            </>
        </PageContent>
    );
};
export default SubmitPostPage;
