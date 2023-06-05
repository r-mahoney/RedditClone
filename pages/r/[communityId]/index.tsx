import { Community } from "@/src/atoms/communitiesAtom";
import CommunityNotFound from "@/src/components/Community/NotFound";
import { firestore } from "@/src/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";
import { GetServerSidePropsContext } from "next";
import React from "react";
import safeJsonStringify from "safe-json-stringify";

type CommunityPageProps = {
    communityData: Community;
};

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
    if (!communityData) {
        return <CommunityNotFound />;
    }
    return <div>Welcome to {communityData.id}</div>;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
    //get community data and pass to client
    try {
        const communityDocRef = doc(
            firestore,
            "communities",
            context.query.communityId as string
        );
        const communityDoc = await getDoc(communityDocRef);

        return {
            props: {
                communityData: communityDoc.exists() ? JSON.parse(
                    safeJsonStringify({
                        id: communityDoc.id,
                        ...communityDoc.data(),
                    })
                ) : "",
            },
        };
    } catch (error) {
        //can add error page here
        console.log("get server side props error", error);
    }
}
export default CommunityPage;
