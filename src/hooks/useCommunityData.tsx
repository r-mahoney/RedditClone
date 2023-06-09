import {
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalState } from "../atoms/authModalAtom";
import {
    Community,
    CommunitySnippet,
    communityState,
} from "../atoms/communitiesAtom";
import { auth, firestore } from "../firebase/clientApp";
import { useRouter } from "next/router";

const useCommunityData = () => {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [communityStateValue, setCommunityStateValue] =
        useRecoilState(communityState);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const setAuthModalState = useSetRecoilState(authModalState);

    const onJoinOrLeaveCommunity = (
        communityData: Community,
        isJoined: boolean
    ) => {
        //is user signed in? if not open auth modal
        if (!user) {
            setAuthModalState({ open: true, view: "login" });
            return;
        }

        if (isJoined) {
            leaveCommunity(communityData.id);
            return;
        }

        joinCommunity(communityData);
    };

    const getMySnippets = async () => {
        setLoading(true);
        try {
            //get user snippets
            const snippetDocs = await getDocs(
                collection(firestore, `users/${user?.uid}/communitySnippets`)
            );
            const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: snippets as CommunitySnippet[],
                snippetsFetched: true,
            }));
        } catch (error: any) {
            console.log("get my snippets error", error);
            setError(error.message);
        }
        setLoading(false);
    };

    const joinCommunity = async (communityData: Community) => {
        //batch write
        //create a new community snippet
        //update the number of members in the community(1)

        try {
            const batch = writeBatch(firestore);
            const newSnippet: CommunitySnippet = {
                communityId: communityData.id,
                imageURL: communityData.imageURL || "",
                isModerator: user?.uid === communityData.creatorId,
            };

            batch.set(
                doc(
                    firestore,
                    `users/${user?.uid}/communitySnippets`,
                    communityData.id
                ),
                newSnippet
            );
            batch.update(doc(firestore, "communities", communityData.id), {
                numberOfMembers: increment(1),
            });

            await batch.commit();
            //update recoil state communityState.mySnippets
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: [...prev.mySnippets, newSnippet],
            }));
        } catch (error: any) {
            console.log("join community error", error);
            setError(error.message);
        }
        setLoading(false);
    };

    const leaveCommunity = async (communityId: string) => {
        //batch write
        //remove community from users snippet
        //update number of members (-1)
        try {
            const batch = writeBatch(firestore);
            batch.delete(
                doc(
                    firestore,
                    `users/${user?.uid}/communitySnippets`,
                    communityId
                )
            );
            batch.update(doc(firestore, "communities", communityId), {
                numberOfMembers: increment(-1),
            });
            await batch.commit();
            //update communityState.mySnippets
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: prev.mySnippets.filter(
                    (item) => item.communityId !== communityId
                ),
            }));
        } catch (error: any) {
            console.log("leave community error", error);
            setError(error.message);
        }
        setLoading(false);
    };

    const getCommunityData = async (communityId: string) => {
        try {
            const communityDocRef = doc(firestore, "communities", communityId);
            const communityDoc = await getDoc(communityDocRef);

            setCommunityStateValue((prev) => ({
                ...prev,
                currentCommunity: {
                    id: communityDoc.id,
                    ...communityDoc.data(),
                } as Community,
            }));
        } catch (error: any) {
            console.log("getCommunity error", error.message);
        }
    };

    useEffect(() => {
        if (!user) {
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: [],
            }));
            return;
        }
        getMySnippets();
    }, [user]);

    useEffect(() => {
        const { communityId } = router.query;
        if (communityId && !communityStateValue.currentCommunity) {
            getCommunityData(communityId as string);
        }
    }, [router.query, communityStateValue.currentCommunity]);

    return {
        //data and functions to be accessed by other components
        communityStateValue,
        onJoinOrLeaveCommunity,
        loading,
    };
};
export default useCommunityData;
