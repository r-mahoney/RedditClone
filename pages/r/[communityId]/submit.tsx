import PageContent from '@/src/components/Layout/PageContent';
import NewPost from '@/src/components/Posts/NewPost';
import { auth } from '@/src/firebase/clientApp';
import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

const SubmitPostPage:React.FC = () => {
    const [user] = useAuthState(auth)
    
    return (
        <PageContent>
            <>
            <Box
            p='14px 0'
            borderBottom='1px solid'
            borderColor='white'
            >
                <Text>
                    Create A Post
                </Text>
            </Box>
            {user && <NewPost user={user}/>}
            </>
            <>
            {/* <About /> */}
            </>
        </PageContent>
    )
}
export default SubmitPostPage;