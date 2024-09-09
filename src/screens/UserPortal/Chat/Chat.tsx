import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown } from 'react-bootstrap';
import { SearchOutlined, Search } from '@mui/icons-material';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import ContactCard from 'components/UserPortal/ContactCard/ContactCard';
import ChatRoom from 'components/UserPortal/ChatRoom/ChatRoom';
import useLocalStorage from 'utils/useLocalstorage';
import { ReactComponent as NewChat } from 'assets/svgs/newChat.svg';
import styles from './Chat.module.css';
import UserSidebar from 'components/UserPortal/UserSidebar/UserSidebar';
import {
  CHATS_LIST,
  GROUP_CHAT_LIST,
  UNREAD_CHAT_LIST,
} from 'GraphQl/Queries/PlugInQueries';
import CreateGroupChat from '../../../components/UserPortal/CreateGroupChat/CreateGroupChat';
import CreateDirectChat from 'components/UserPortal/CreateDirectChat/CreateDirectChat';
import { MARK_CHAT_MESSAGES_AS_READ } from 'GraphQl/Mutations/OrganizationMutations';

interface InterfaceContactCardProps {
  id: string;
  title: string;
  image: string;
  selectedContact: string;
  setSelectedContact: React.Dispatch<React.SetStateAction<string>>;
  isGroup: boolean;
  unseenMessages: number;
  lastMessage: any;
}

export default function chat(): JSX.Element {
  const { t } = useTranslation('translation', {
    keyPrefix: 'chat',
  });
  const { t: tCommon } = useTranslation('common');

  const [hideDrawer, setHideDrawer] = useState<boolean | null>(null);
  const [chats, setChats] = useState<any>([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchName, setsearchName] = useState('');
  const { getItem } = useLocalStorage();
  const userId = getItem('userId');

  const handleResize = (): void => {
    if (window.innerWidth <= 820) {
      setHideDrawer(!hideDrawer);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  React.useEffect(() => {
    if (filterType === 'all') {
      chatsListRefetch();
      if (chatsListData && chatsListData.chatsByUserId) {
        const chatList = chatsListData.chatsByUserId.map((chat: any) => {
          const parsedChat = {
            ...chat,
            unseenMessagesByUsers: JSON.parse(chat.unseenMessagesByUsers),
          };
          return parsedChat;
        });
        setChats(chatList);
      }
    } else if (filterType === 'unread') {
      unreadChatListRefetch();
      if (unreadChatListData && unreadChatListData.getUnreadChatsByUserId) {
        const chatList = unreadChatListData.getUnreadChatsByUserId.map(
          (chat: any) => {
            const parsedChat = {
              ...chat,
              unseenMessagesByUsers: JSON.parse(chat.unseenMessagesByUsers),
            };
            return parsedChat;
          },
        );
        setChats(chatList);
      }
      console.log(unreadChatListData);
    } else if (filterType === 'group') {
      groupChatListRefetch();
      console.log(groupChatListData);
      if (groupChatListData && groupChatListData.getGroupChatsByUserId) {
        const chatList = groupChatListData.getGroupChatsByUserId.map(
          (chat: any) => {
            const parsedChat = {
              ...chat,
              unseenMessagesByUsers: JSON.parse(chat.unseenMessagesByUsers),
            };
            return parsedChat;
          },
        );
        setChats(chatList);
      }
    }
  }, [filterType]);

  const [createDirectChatModalisOpen, setCreateDirectChatModalisOpen] =
    useState(false);

  function openCreateDirectChatModal(): void {
    setCreateDirectChatModalisOpen(true);
  }

  const toggleCreateDirectChatModal = /* istanbul ignore next */ (): void =>
    setCreateDirectChatModalisOpen(!createDirectChatModalisOpen);

  const [createGroupChatModalisOpen, setCreateGroupChatModalisOpen] =
    useState(false);

  function openCreateGroupChatModal(): void {
    setCreateGroupChatModalisOpen(true);
  }

  const toggleCreateGroupChatModal = /* istanbul ignore next */ (): void => {
    setCreateGroupChatModalisOpen(!createGroupChatModalisOpen);
  };

  const {
    data: chatsListData,
    loading: chatsListLoading,
    refetch: chatsListRefetch,
  } = useQuery(CHATS_LIST, {
    variables: {
      id: userId,
      searchString: 'l',
    },
  });

  const {
    data: groupChatListData,
    loading: groupChatListLoading,
    refetch: groupChatListRefetch,
  } = useQuery(GROUP_CHAT_LIST);

  const {
    data: unreadChatListData,
    loading: unreadChatListLoading,
    refetch: unreadChatListRefetch,
  } = useQuery(UNREAD_CHAT_LIST);

  const [markChatMessagesAsRead] = useMutation(MARK_CHAT_MESSAGES_AS_READ, {
    variables: {
      chatId: selectedContact,
      userId: userId,
    },
  });

  useEffect(() => {
    markChatMessagesAsRead().then(() => {
      chatsListRefetch({ id: userId });
    });
  }, [selectedContact]);

  React.useEffect(() => {
    if (chatsListData && chatsListData?.chatsByUserId.length) {
      console.log('Unseeen Messages', chatsListData.chatsByUserId);
      const chatList = chatsListData.chatsByUserId.map((chat: any) => {
        const parsedChat = {
          ...chat,
          unseenMessagesByUsers: JSON.parse(chat.unseenMessagesByUsers),
        };
        return parsedChat;
      });
      console.log('Chat LIST ', chatList);
      setChats(chatList);
    }
  }, [chatsListData]);

  const handleSearch = (value: string): void => {
    setsearchName(value);
    chatsListRefetch();
  };
  const handleSearchByEnter = (e: any): void => {
    if (e.key === 'Enter') {
      const { value } = e.target;
      handleSearch(value);
    }
  };
  const handleSearchByBtnClick = (): void => {
    const value =
      (document.getElementById('searchChats') as HTMLInputElement)?.value || '';
    handleSearch(value);
  };

  return (
    <>
      {/* {hideDrawer ? (
        <Button
          className={styles.opendrawer}
          onClick={(): void => {
            setHideDrawer(!hideDrawer);
          }}
          data-testid="openMenu"
        >
          <i className="fa fa-angle-double-right" aria-hidden="true"></i>
        </Button>
      ) : (
        <Button
          className={styles.collapseSidebarButton}
          onClick={(): void => {
            setHideDrawer(!hideDrawer);
          }}
          data-testid="closeMenu"
        >
          <i className="fa fa-angle-double-left" aria-hidden="true"></i>
        </Button>
      )} */}
      {/* <UserSidebar hideDrawer={hideDrawer} setHideDrawer={setHideDrawer} /> */}
      <div className={`d-flex flex-row ${styles.containerHeight}`}>
        <div data-testid="chat" className={`${styles.mainContainer}`}>
          <div className={styles.contactContainer}>
            <div
              className={`d-flex justify-content-between ${styles.addChatContainer}`}
            >
              <h4>Messages</h4>
              <Dropdown style={{ cursor: 'pointer' }}>
                <Dropdown.Toggle
                  className={styles.customToggle}
                  data-testid={'dropdown'}
                >
                  <NewChat />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={openCreateDirectChatModal}
                    data-testid="newDirectChat"
                  >
                    New Chat
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={openCreateGroupChatModal}
                    data-testid="newGroupChat"
                  >
                    New Group Chat
                  </Dropdown.Item>
                  <Dropdown.Item href="#/action-3">
                    Starred Messages
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className={styles.contactListContainer}>
              {chatsListLoading ? (
                <div className={`d-flex flex-row justify-content-center`}>
                  <HourglassBottomIcon /> <span>Loading...</span>
                </div>
              ) : (
                <>
                  <div className={styles.filters}>
                    {/* three buttons to filter unread, all and group chats. All selected by default. */}
                    <Button
                      onClick={() => {
                        setFilterType('all');
                      }}
                      className={[
                        styles.filterButton,
                        filterType === 'all' && styles.selectedBtn,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      All
                    </Button>
                    <Button
                      onClick={() => {
                        setFilterType('unread');
                      }}
                      className={[
                        styles.filterButton,
                        filterType === 'unread' && styles.selectedBtn,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      Unread
                    </Button>
                    <Button
                      onClick={() => {
                        setFilterType('group');
                      }}
                      className={[
                        styles.filterButton,
                        filterType === 'group' && styles.selectedBtn,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      Groups
                    </Button>
                  </div>

                  <div
                    data-testid="contactCardContainer"
                    className={styles.contactCardContainer}
                  >
                    {!!chats.length &&
                      chats.map((chat: any) => {
                        const cardProps: InterfaceContactCardProps = {
                          id: chat._id,
                          title: !chat.isGroup
                            ? chat.users[0]?._id === userId
                              ? `${chat.users[1]?.firstName} ${chat.users[1]?.lastName}`
                              : `${chat.users[0]?.firstName} ${chat.users[0]?.lastName}`
                            : chat.name,
                          image: chat.isGroup
                            ? chat.image
                            : userId
                              ? chat.users[1]?.image
                              : chat.users[0]?.image,
                          setSelectedContact,
                          selectedContact,
                          isGroup: chat.isGroup,
                          unseenMessages: chat.unseenMessagesByUsers[userId],
                          lastMessage:
                            chat.messages[chat.messages.length - 1]
                              ?.messageContent,
                        };
                        return (
                          <ContactCard
                            data-testid="chatContact"
                            {...cardProps}
                            key={chat._id}
                          />
                        );
                      })}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className={styles.chatContainer} id="chat-container">
            <ChatRoom
              chatListRefetch={chatsListRefetch}
              selectedContact={selectedContact}
            />
          </div>
        </div>
      </div>
      {createGroupChatModalisOpen && (
        <CreateGroupChat
          toggleCreateGroupChatModal={toggleCreateGroupChatModal}
          createGroupChatModalisOpen={createGroupChatModalisOpen}
          chatsListRefetch={chatsListRefetch}
        ></CreateGroupChat>
      )}
      {createDirectChatModalisOpen && (
        <CreateDirectChat
          toggleCreateDirectChatModal={toggleCreateDirectChatModal}
          createDirectChatModalisOpen={createDirectChatModalisOpen}
          chatsListRefetch={chatsListRefetch}
        ></CreateDirectChat>
      )}
    </>
  );
}
