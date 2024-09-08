import { Paper, TableBody } from '@mui/material';
import React, { useRef, useState } from 'react';
import { Button, Form, ListGroup, Modal } from 'react-bootstrap';
import styles from './GroupChatDetails.module.css';
import type { ApolloQueryResult } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client';
import useLocalStorage from 'utils/useLocalstorage';
import {
  ADD_USER_TO_GROUP_CHAT,
  UPDATE_CHAT,
} from 'GraphQl/Mutations/OrganizationMutations';
import Table from '@mui/material/Table';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';
import type { InterfaceQueryUserListItem } from 'utils/interfaces';
import { USERS_CONNECTION_LIST } from 'GraphQl/Queries/Queries';
import Loader from 'components/Loader/Loader';
import { Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Avatar from 'components/Avatar/Avatar';
import { ReactComponent as AddIcon } from 'assets/svgs/add.svg';
import { FiEdit } from 'react-icons/fi';
import { FaCheck, FaX } from 'react-icons/fa6';
import convertToBase64 from 'utils/convertToBase64';

interface InterfaceGoroupChatDetailsProps {
  toggleGroupChatDetailsModal: () => void;
  groupChatDetailsModalisOpen: boolean;
  chat: any;
  chatRefetch: (
    variables?:
      | Partial<{
          id: string;
          searchString: string;
        }>
      | undefined,
  ) => Promise<ApolloQueryResult<any>>;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: ['#31bb6b', '!important'],
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const { getItem } = useLocalStorage();

export default function groupChatDetails({
  toggleGroupChatDetailsModal,
  groupChatDetailsModalisOpen,
  chat,
  chatRefetch,
}: InterfaceGoroupChatDetailsProps): JSX.Element {
  const { t } = useTranslation('translation', {
    keyPrefix: 'userChat',
  });

  const [userName, setUserName] = useState('');

  const [editChatTitle, setEditChatTitle] = useState<boolean>(false);
  const [chatName, setChatName] = useState<string>(chat.name);

  const [addUser] = useMutation(ADD_USER_TO_GROUP_CHAT);

  const [addUserModalisOpen, setAddUserModalisOpen] = useState(false);

  function openAddUserModal(): void {
    setAddUserModalisOpen(true);
  }

  const toggleAddUserModal = (): void =>
    setAddUserModalisOpen(!addUserModalisOpen);

  const {
    data: allUsersData,
    loading: allUsersLoading,
    refetch: allUsersRefetch,
  } = useQuery(USERS_CONNECTION_LIST, {
    variables: {
      firstName_contains: '',
      lastName_contains: '',
    },
  });

  const addUserToGroupChat = async (userId: string): void => {
    await addUser({
      variables: {
        userId,
        chatId: chat._id,
      },
    });
  };

  const handleUserModalSearchChange = (e: React.FormEvent): void => {
    e.preventDefault();
    /* istanbul ignore next */
    const [firstName, lastName] = userName.split(' ');

    const newFilterData = {
      firstName_contains: firstName || '',
      lastName_contains: lastName || '',
    };

    allUsersRefetch({
      ...newFilterData,
    });
  };

  const [selectedImage, setSelectedImage] = useState('');

  const [updateChat] = useMutation(UPDATE_CHAT, {
    variables: {
      input: {
        _id: chat._id,
        image: selectedImage ? selectedImage : '',
        name: chatName,
      },
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = (): void => {
    fileInputRef?.current?.click();
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setSelectedImage(base64);
      await updateChat();
      await chatRefetch();
      setSelectedImage('');
    }
  };

  return (
    <>
      <Modal
        data-testid="createDirectChatModal"
        show={groupChatDetailsModalisOpen}
        onHide={toggleGroupChatDetailsModal}
        contentClassName={styles.modalContent}
      >
        <Modal.Header closeButton data-testid="createDirectChat">
          <Modal.Title>Group info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }} // Hide the input
            onChange={handleImageChange}
          />
          <div className={styles.groupInfo}>
            {chat?.image ? (
              <img className={styles.chatImage} src={chat?.image} alt="" />
            ) : (
              <Avatar avatarStyle={styles.groupImage} name={chat.name} />
            )}
            <button onClick={handleImageClick} className={styles.editImgBtn}>
              <FiEdit />
            </button>

            {editChatTitle ? (
              <div className={styles.editChatNameContainer}>
                <input
                  type="text"
                  value={chatName}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setChatName(e.target.value);
                  }}
                />
                <FaCheck
                  className={styles.checkIcon}
                  onClick={async () => {
                    await updateChat();
                    setChatName(chat.name);
                    setEditChatTitle(false);
                    await chatRefetch();
                  }}
                />
                <FaX
                  className={styles.cancelIcon}
                  onClick={() => {
                    setEditChatTitle(false);
                    setChatName(chat.name);
                  }}
                />
              </div>
            ) : (
              <div className={styles.editChatNameContainer}>
                <h3>{chat?.name}</h3>
                <FiEdit
                  onClick={() => {
                    setEditChatTitle(true);
                  }}
                />
              </div>
            )}

            <p>{chat?.users.length} Members</p>
            <p>{chat?.description}</p>
          </div>

          <div>
            <h5>{chat.users.length} members</h5>
            <ListGroup className={styles.memberList} variant="flush">
              <ListGroup.Item
                className={styles.listItem}
                onClick={() => {
                  openAddUserModal();
                }}
              >
                <AddIcon /> Add member
              </ListGroup.Item>
              {chat.users.map((user: any) => (
                <ListGroup.Item className={styles.listItem} key={user._id}>
                  <Avatar
                    avatarStyle={styles.membersImage}
                    name={user.firstName + ' ' + user.lastName}
                  />
                  {user.firstName} {user.lastName}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        data-testid="addExistingUserModal"
        show={addUserModalisOpen}
        onHide={toggleAddUserModal}
        contentClassName={styles.modalContent}
      >
        <Modal.Header closeButton data-testid="pluginNotificationHeader">
          <Modal.Title>{'Chat'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {allUsersLoading ? (
            <>
              <Loader />
            </>
          ) : (
            <>
              <div className={styles.input}>
                <Form onSubmit={handleUserModalSearchChange}>
                  <Form.Control
                    type="name"
                    id="searchUser"
                    data-testid="searchUser"
                    placeholder="searchFullName"
                    autoComplete="off"
                    className={styles.inputFieldModal}
                    value={userName}
                    onChange={(e): void => {
                      const { value } = e.target;
                      setUserName(value);
                    }}
                  />
                  <Button
                    type="submit"
                    data-testid="submitBtn"
                    className={`position-absolute z-10 bottom-10 end-0  d-flex justify-content-center align-items-center `}
                  >
                    <Search />
                  </Button>
                </Form>
              </div>

              <TableContainer className={styles.userData} component={Paper}>
                <Table aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>#</StyledTableCell>
                      <StyledTableCell align="center">{'user'}</StyledTableCell>
                      <StyledTableCell align="center">{'Chat'}</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allUsersData &&
                      allUsersData.users.length > 0 &&
                      allUsersData.users.map(
                        (
                          userDetails: InterfaceQueryUserListItem,
                          index: number,
                        ) => (
                          <StyledTableRow
                            data-testid="user"
                            key={userDetails.user._id}
                          >
                            <StyledTableCell component="th" scope="row">
                              {index + 1}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {userDetails.user.firstName +
                                ' ' +
                                userDetails.user.lastName}
                              <br />
                              {userDetails.user.email}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Button
                                onClick={async () => {
                                  await addUserToGroupChat(
                                    userDetails.user._id,
                                  );
                                  toggleAddUserModal();
                                  chatRefetch({ id: chat._id });
                                }}
                                data-testid="addBtn"
                              >
                                Add
                              </Button>
                            </StyledTableCell>
                          </StyledTableRow>
                        ),
                      )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}