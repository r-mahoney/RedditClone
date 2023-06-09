import { Flex, Button, Image, Stack } from "@chakra-ui/react";
import React, { useRef } from "react";

type ImageUploadProps = {
    selectedFile?: string;
    onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setSelectedTab: (value: string) => void;
    setSelectedFile: (value: string) => void;
};

const ImageUpload: React.FC<ImageUploadProps> = ({
    selectedFile,
    setSelectedFile,
    setSelectedTab,
    onSelectImage,
}) => {
    const selectedFileRef = useRef<HTMLInputElement>(null);
    return (
        <Flex justify="center" align="center" width="100%" direction='column'>
            {selectedFile ? (
                <>
                <Image src={selectedFile} maxHeight="400px" maxWidth="400px" />
                <Stack direction='row' mt={4}>
                    <Button height='28px' onClick={() => setSelectedTab("Post")}>Back to Post</Button>
                    <Button height='28px' variant='outline' onClick={() => setSelectedFile('')}>Remove</Button>
                </Stack>
                </>
            ) : (
                <Flex
                    justify="center"
                    align="center"
                    p={20}
                    border="1px dashed"
                    borderColor="gray.300"
                    width="100%"
                    borderRadius={4}
                >
                    <Button
                        variant="outline"
                        height="28px"
                        onClick={() => selectedFileRef.current?.click()}
                    >
                        Upload
                    </Button>
                    <input
                        ref={selectedFileRef}
                        type="file"
                        hidden
                        onChange={onSelectImage}
                    />
                </Flex>
            )}
        </Flex>
    );
};
export default ImageUpload;
