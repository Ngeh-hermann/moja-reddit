import { AuthModalState } from '@/atoms/authModalAtom';
import { auth } from '@/firebase/clientApp';
import { FIREBASE_ERRORS } from '@/firebase/errors';
import { Input, Button, Flex, Text, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useAuthState, useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { useSetRecoilState } from 'recoil'

type LoginProps = {

};

const Login: React.FC<LoginProps> = () => {
    const setAuthModalState = useSetRecoilState(AuthModalState)
    const toast = useToast();
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
    })

    const [
        signInWithEmailAndPassword,
        user,
        loading,
        error,
    ] = useSignInWithEmailAndPassword(auth);

    // Firebase logic
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        signInWithEmailAndPassword(loginForm.email, loginForm.password)
        toast({
            title: `Welcome back ${loginForm.email?.split("@")[0]}`,
            status: 'success',
            isClosable: true,
            duration: 4000,
            position: 'top',
        })
    }

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // update form state
        setLoginForm((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }))
    }

    return (
        <>
            <form onSubmit={onSubmit}>
                <Input
                    required
                    name='email'
                    placeholder='email'
                    type='email'
                    mb={2}
                    onChange={onChange}
                    fontSize='10pt'
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{
                        bg: 'white',
                        border: '1px solid',
                        borderColor: 'blue.500',
                    }}
                    _focus={{
                        outline: 'none',
                        bg: 'white',
                        border: '1px solid',
                        borderColor: 'blue.500',
                    }}
                    bg='gray.50'
                />
                <Input
                    required
                    name='password'
                    placeholder='Password'
                    type='password'
                    mb={2}
                    onChange={onChange}
                    fontSize='10pt'
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{
                        bg: 'white',
                        border: '1px solid',
                        borderColor: 'blue.500',
                    }}
                    _focus={{
                        outline: 'none',
                        bg: 'white',
                        border: '1px solid',
                        borderColor: 'blue.500',
                    }}
                    bg='gray.50'
                />
                <Text textAlign='center' color='red' fontSize='10pt'>
                    {FIREBASE_ERRORS[error?.message as keyof typeof FIREBASE_ERRORS]}
                </Text>
                <Button width='100%' height='36px' mt={2} mb={2} type='submit' isLoading={loading}>Log In</Button>
                <Flex justifyContent="center" mb={2}>
                    <Text fontSize="9pt" mr={1}>
                        Forgot your password ?
                    </Text>
                    <Text
                        fontSize="9pt"
                        color="blue.500"
                        cursor="pointer"
                        fontWeight="700"
                        onClick={() =>
                            setAuthModalState((prev) => ({
                                ...prev,
                                view: 'resetPassword'
                            }))
                        }
                    >
                        RESET
                    </Text>
                </Flex>
                <Flex fontSize='9pt' justifyContent='center'>
                    <Text mr={1}>New here ?</Text>
                    <Text
                        color='blue.500'
                        fontWeight={700}
                        cursor='pointer'
                        onClick={() =>
                            setAuthModalState((prev) => ({
                                ...prev,
                                view: 'signup',
                            }))
                        }
                    >
                        SIGN UP</Text>
                </Flex>
            </form>
        </>
    )
}
export default Login;