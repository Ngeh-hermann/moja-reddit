import { auth, firestore } from '@/firebase/clientApp';
import useDirectory from '@/hooks/useDirectory';
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Box, Divider, Text, Input, Stack, Checkbox, Flex, Icon, useToast } from '@chakra-ui/react';
import { doc, getDoc, runTransaction, serverTimestamp, setDoc, Transaction } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BsFillEyeFill, BsFillPersonFill } from 'react-icons/bs'
import { HiLockClosed } from 'react-icons/hi'

type CreateCommunityModalProps = {
    open: boolean;
    handleClose: () => void
};

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ open, handleClose }) => {

    const [user] = useAuthState(auth)
    const [communityName, setCommunityName] = useState('')
    const [charsRemaining, setCharsRemaining] = useState(21)
    const [communityType, setCommunityType] = useState('public')
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter();
    const { toggleMenuOpen } = useDirectory()
    const toast = useToast();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length > 21) return;
        setCommunityName(event.target.value);
        // recalculate characters remaining
        setCharsRemaining(21 - event.target.value.length)

    }

    const onCommunityTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCommunityType(event.target.name)
    }

    const handleCreateCommunity = async () => {
        if (error) setError("")
        // validate community name
        const format = /[ `!@#$^&*()_+\[\]{};':"\\|,.<>\/?~]/;
        if (format.test(communityName) || communityName.length < 3) {
            setError(
                "Community names must be between 3-21 characters, and can only caontain letters, numbers and underscores"
            );
            return
        }

        setLoading(true)

        try {

            const communityDocRef = doc(firestore, 'communities', communityName);

            await runTransaction(firestore, async (transaction) => {

                //check if community exist in db
                const communityDoc = await transaction.get(communityDocRef);
                if (communityDoc.exists()) {
                    throw new Error(`Sorry, r/${communityName} is taken. Try another!`);
                }

                //create a community
                transaction.set(communityDocRef, {
                    creatorId: user?.uid,
                    createdAt: serverTimestamp(),
                    numberOfMembers: 1,
                    privacyType: communityType,

                });

                //create community snippet of that user
                transaction.set(
                    doc(firestore, `users/${user?.uid}/communitySnippets`, communityName),
                    {
                        communityId: communityName,
                        isModerator: true,
                    }
                );
            });

            handleClose();
            toggleMenuOpen();
            router.push(`r/${communityName}`);
            toast({
                title: `Community ${communityName} created`,
                duration: 6000,
                isClosable: true,
                position: 'top',
                status: 'success',
            })

        } catch (error: any) {
            console.log('handleCreateCommunity error', error)
            setError(error.message)
            toast({
                title: `Error while creating communnity please try again !`,
                duration: 6000,
                isClosable: true,
                position: 'top',
                status: 'error',
            })
        }
        setLoading(false)
    }

    return (
        <>
            <Modal isOpen={open} onClose={handleClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        display='flex'
                        flexDirection='column'
                        fontSize={15}
                        padding={3}
                    >
                        Create a community
                    </ModalHeader>
                    <Box pl={3} pr={3}>
                        <Divider />
                        <ModalCloseButton />
                        <ModalBody
                            display='flex'
                            flexDirection='column'
                            padding="10px 0px">
                            <Text fontSize={15} fontWeight={700}>
                                name
                            </Text>
                            <Text fontSize={11} color="gray.500">
                                Community name including capitalization cannot be changed
                            </Text>
                            <Text
                                position='relative'
                                top='28px' left='10px' width='20px' color='gray.400'>
                                r/
                            </Text>
                            <Input
                                position='relative'
                                value={communityName}
                                size="sm" pl='22px'
                                onChange={handleChange}
                            />
                            <Text
                                fontSize='9pt'
                                color={charsRemaining === 0 ? 'red' : 'gray.500'}
                            >
                                {charsRemaining}  {charsRemaining > 1 ? 'Characters' : 'Character'} remaining.
                            </Text>
                            <Text fontSize='9pt' color='red' pt={1}>{error}</Text>
                            <Box mt={4} mb={4}>
                                <Text fontWeight={600} fontSize={15}>Community Type</Text>
                                <Stack spacing={2}>
                                    <Checkbox name="public" isChecked={communityType === 'public'}
                                        onChange={onCommunityTypeChange}>
                                        <Flex align='center'>
                                            <Icon as={BsFillPersonFill} color="gray.500" mr={2} />
                                            <Text fontSize='10pt' mr={1}>Public</Text>
                                            <Text fontSize={8} color='gray.500' pt={1}>
                                                Anyone can view, post and comment to this community.
                                            </Text>
                                        </Flex>
                                    </Checkbox>
                                    <Checkbox name="restricted" isChecked={communityType === 'restricted'}
                                        onChange={onCommunityTypeChange}>
                                        <Flex align='center'>
                                            <Icon as={BsFillEyeFill} color="gray.500" mr={2} />

                                            <Text fontSize='10pt' mr={1}>Restricted</Text>
                                            <Text fontSize={8} color='gray.500' pt={1}>
                                                Anyone can view this community, but only approved users can post.
                                            </Text>
                                        </Flex>
                                    </Checkbox>
                                    <Checkbox name="private" isChecked={communityType === 'private'}
                                        onChange={onCommunityTypeChange}>
                                        <Flex align='center'>
                                            <Icon as={HiLockClosed} color="gray.500" mr={2} />

                                            <Text fontSize='10pt' mr={1}>Private</Text>
                                            <Text fontSize={8} color='gray.500' pt={1}>
                                                Only approved users can view and submit to this community.
                                            </Text>
                                        </Flex>
                                    </Checkbox>
                                </Stack>
                            </Box>
                        </ModalBody>
                    </Box>

                    <ModalFooter bg="gray.100" borderRadius='0px 0px 10px 10px'>
                        <Button variant='outline' height='30px' mr={3} onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            height='30px'
                            onClick={handleCreateCommunity}
                            isLoading={loading}
                        >
                            Create Community
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
export default CreateCommunityModal;