import useDirectory from "@/src/hooks/useDirectory";
import { Flex, MenuItem, Image, Icon } from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons/lib";

type MenuListItemProps = {
    displayText: string;
    link: string;
    icon: IconType;
    iconColor: string;
    imageURL?: string;
};

const MenuListItem: React.FC<MenuListItemProps> = ({
    displayText,
    link,
    icon,
    iconColor,
    imageURL,
}) => {
    const { onSelectMenuItem, toggleMenuOpen } = useDirectory();

    return (
        <MenuItem
            width="100%"
            fontSize="10pt"
            _hover={{ bg: "gray.100" }}
            onClick={() =>
                onSelectMenuItem({
                    displayText,
                    link,
                    icon,
                    iconColor,
                    imageURL,
                })
            }
        >
            <Flex align="center">
                {imageURL ? (
                    <Image
                        src={imageURL}
                        borderRadius="full"
                        blockSize="18px"
                        mr={2}
                    />
                ) : (
                    <Icon as={icon} fontSize={20} color={iconColor} />
                )}
                {displayText}
            </Flex>
        </MenuItem>
    );
};
export default MenuListItem;
