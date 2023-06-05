import { Button, Flex, Link } from "@chakra-ui/react";
import React from "react";

const CommunityNotFound: React.FC = () => {
    return (
        <Flex
            direction="column"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
        >
            Sorry, that community has been banned or does not exist.
            <Link href='/'>
                <Button mt={4}>Go Home</Button>
            </Link>
        </Flex>
    );
};
export default CommunityNotFound;
