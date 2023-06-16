import { Community, communityState } from "@/src/atoms/communitiesAtom";
import CreatePostLink from "@/src/components/Community/CreatePostLink";
import Header from "@/src/components/Community/Header";
import CommunityNotFound from "@/src/components/Community/NotFound";
import PageContent from "@/src/components/Layout/PageContent";
import Posts from "@/src/components/Posts/Posts";
import { firestore } from "@/src/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";
import { GetServerSidePropsContext } from "next";
import React, { useEffect } from "react";
import safeJsonStringify from "safe-json-stringify";
import { useSetRecoilState } from "recoil";
import About from "@/src/components/Community/About";

type CommunityPageProps = {
    communityData: Community;
};

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
    const setCommunityStateValue = useSetRecoilState(communityState);

    if (!communityData) {
        return <CommunityNotFound />;
    }

    useEffect(() => {
        setCommunityStateValue(prev => ({
            ...prev,
            currentCommunity: communityData
        }))
    }, [communityData]);

    return (
        <>
            <Header communityData={communityData} />
            <PageContent>
                <>
                    <CreatePostLink />
                    <Posts communityData={communityData} />
                </>
                <>
                    <About communityData={communityData}/>
                </>
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
