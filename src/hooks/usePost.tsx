import React from 'react';
import { useRecoilState } from 'recoil';
import { Post, postState } from '../atoms/postAtom';
import { deleteObject, ref } from 'firebase/storage';
import { firestore, storage } from '../firebase/clientApp';
import { deleteDoc, doc } from 'firebase/firestore';

const usePost= () => {
    const [postStateValue, setPostStateValue] = useRecoilState(postState);

    const onVote = async() => {};

    const onSelectPost = () => {};

    const onDeletePost = async(post: Post): Promise<boolean> => {
        try {
            //check if image
            if(post.imageURL) {
                //delete from firebase storace
                const imageRef = ref(storage, `posts/${post.id}/image`);
                await deleteObject(imageRef);
            }
            //delete post doc from firestore
            const postDocRef = doc(firestore, 'posts', post.id);
            await deleteDoc(postDocRef)
            //update recoil state
            setPostStateValue(prev => ({
                ...prev,
                posts: prev.posts.filter(item => item.id !== post.id)
            }))
            return true;
        } catch (error) {
            return false
        }
    };
    
    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onDeletePost,
        onSelectPost
    }
}
export default usePost;