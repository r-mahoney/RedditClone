import { Community } from "@/src/atoms/communitiesAtom";
import Header from "@/src/components/Community/Header";
import CommunityNotFound from "@/src/components/Community/NotFound";
import PageContent from "@/src/components/Layout/PageContent";
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
    return (
        <>
            <Header communityData={communityData} />
            <PageContent>
                <><div>Left hand side</div></>
                <><div>Right hand side</div></>
            </PageContent>
        </>
    );
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
                communityData: communityDoc.exists()
                    ? JSON.parse(
                          safeJsonStringify({
                              id: communityDoc.id,
                              ...communityDoc.data(),
                          })
                      )
                    : "",
            },
        };
    } catch (error) {
        //can add error page here
        console.log("get server side props error", error);
    }
}
export default CommunityPage;
