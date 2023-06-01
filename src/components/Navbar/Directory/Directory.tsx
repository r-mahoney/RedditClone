import { ChevronDownIcon } from "@chakra-ui/icons";
import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Icon,
    Flex,
    MenuDivider,
    Text,
} from "@chakra-ui/react";
import { User, signOut } from "firebase/auth";
import React from "react";
import { FaRedditSquare } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { IoSparkles } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { MdOutlineLogin } from "react-icons/md";
import { auth } from "@/src/firebase/clientApp";
import { authModalState } from "@/src/atoms/authModalAtom";
import { useSetRecoilState } from "recoil";

const UserMenu: React.FC = () => {
    const setAuthModalState = useSetRecoilState(authModalState);
    return (
        <Menu>
            <MenuButton
                cursor="pointer"
                padding="0px 6px"
                borderRadius={4}
                _hover={{ outline: "1px solid", outlineColor: "gray.200" }}
            >
                <Flex align="center">
                    <Flex align="center">
                        <ChevronDownIcon />
                    </Flex>
                </Flex>
            </MenuButton>
            <MenuList></MenuList>
        </Menu>
    );
};
export default UserMenu;
