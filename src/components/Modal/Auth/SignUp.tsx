import { authModalState } from "@/src/atoms/authModalAtom";
import { auth } from "@/src/firebase/clientApp";
import { Button, Flex, Text } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { FIREBASE_ERRORS } from "@/src/firebase/errors";

const SignUp: React.FC = () => {
    const [signUpForm, setSignUpForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [createUserWithEmailAndPassword, user, loading, userError] =
        useCreateUserWithEmailAndPassword(auth);

    const [error, setError] = useState("");

    const setAuthModalState = useSetRecoilState(authModalState);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSignUpForm((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    };

    //firebase logic
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (error) setError("");
        if (signUpForm.password !== signUpForm.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        createUserWithEmailAndPassword(signUpForm.email, signUpForm.password);
    };
    return (
        <form onSubmit={handleSubmit}>
            <Input
                required
                name="email"
                placeholder="email"
                type="email"
                mb={2}
                onChange={handleChange}
                fontSize="10pt"
                _placeholder={{ color: "gray.500" }}
                _hover={{
                    bg: "white",
                    border: "1px solid",
                    borderColor: "blue.500",
                }}
                _focus={{
                    outline: "white",
                    bg: "white",
                    border: "1px solid",
                    borderColor: "blue.500",
                }}
                bg="gray.50"
            />
            <Input
                required
                name="password"
                placeholder="password"
                type="password"
                mb={2}
                onChange={handleChange}
                fontSize="10pt"
                _placeholder={{ color: "gray.500" }}
                _hover={{
                    bg: "white",
                    border: "1px solid",
                    borderColor: "blue.500",
                }}
                _focus={{
                    outline: "white",
                    bg: "white",
                    border: "1px solid",
                    borderColor: "blue.500",
                }}
                bg="gray.50"
            />
            <Input
                required
                name="confirmPassword"
                placeholder="confirm password"
                type="password"
                onChange={handleChange}
                fontSize="10pt"
                _placeholder={{ color: "gray.500" }}
                _hover={{
                    bg: "white",
                    border: "1px solid",
                    borderColor: "blue.500",
                }}
                _focus={{
                    outline: "white",
                    bg: "white",
                    border: "1px solid",
                    borderColor: "blue.500",
                }}
                bg="gray.50"
            />
            {/* {(error || userError) && ( */}
                <Text textAlign="center" color="red" fontSize="10pt">
                    {error || FIREBASE_ERRORS[userError?.message as keyof typeof FIREBASE_ERRORS]}
                </Text>
            {/* )} */}
            <Button
                type="submit"
                width="100%"
                height="36px"
                mt={2}
                mb={2}
                isLoading={loading}
            >
                Sign Up
            </Button>
            <Flex fontSize="9pt" justifyContent="center">
                <Text mr={1}>Already Have an Account?</Text>
                <Text
                    color="blue.500"
                    fontWeight={700}
                    cursor="pointer"
                    onClick={() => {
                        setAuthModalState((prev) => ({
                            ...prev,
                            view: "login",
                        }));
                    }}
                >
                    Log In
                </Text>
            </Flex>
        </form>
    );
};
export default SignUp;
