import { useState } from "react";
import styles from "./chat.module.css";
import { getChatContacts,getConversationMessages,} from "../../api/api";
import { useEffect } from "react";
import { useRef } from "react";



function Chat() {
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
const messagesEndRef = useRef(null);
  const [patientProfile, setPatientProfile] = useState({
    name: "",
    id: "",
    picture: "",
    conditions: [],
    nextAppointment: {
      date: "",
      time: ""
    },
    documents: []
  });
  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);
  useEffect(() => {
    fetchConversations();
    }, []);
 const handleConversationClick =
  async (conversation) => {
    try {
      setSelectedConversation(conversation);

      const data =
        await getConversationMessages(
          conversation.id
        );

      console.log(data);

    const formattedMessages = (
  data.data || []
).map((msg) => ({
  id: msg.id,
  text: msg.message || msg.text || "",
  timestamp:
    msg.createdAt ||
    msg.timestamp ||
    "",

  isSentByMe:
    msg.sender_type === "doctor",

  senderName:
    msg.sender_name || "Patient",

  senderAvatar:
    msg.sender_avatar || "",
}));

setMessages(formattedMessages);
    } catch (error) {
      console.error(error);
    }
  };
const fetchConversations = async () => {
  try {
    setLoading(true);

    const data =
      await getChatContacts();

    console.log(data);

  const formattedConversations = (
  data.data || []
).map((conv) => ({
  id: conv.id,
  name:
    conv.name ||
    conv.patient_name ||
    "Unknown",

  avatar:
    conv.avatar ||
    conv.patient_avatar ||
    "",

  lastMessage:
    conv.latest_message ||
    "No messages",

  lastMessageTime:
    conv.updatedAt || "",

  unreadCount:
    conv.unread_count || 0,

  isOnline:
    conv.is_online || false,
}));

setConversations(
  formattedConversations
);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

 const handleSendMessage = () => {
  if (!newMessage.trim()) return;

  const tempMessage = {
    id: Date.now(),
    text: newMessage,
    timestamp: new Date().toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    ),
    isSentByMe: true,
    isPending: true,
  };

  setMessages((prev) => [
    ...prev,
    tempMessage,
  ]);

  setNewMessage("");

  // tomorrow websocket here
};

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFileUpload = (e) => {
    console.log("File selected:", e.target.files);
  };

  const handleDownloadDocument = (docId) => {
   
    console.log("Download document:", docId);
  };

  const handleViewAllDocuments = () => {

    console.log("View all documents");
  };

  const handleOpenPatientFile = () => {

    console.log("Open patient file for:", patientProfile.name);
  };

  const handleVideoCall = () => {
   
    console.log("Start video call with:", selectedConversation?.name);
  };

  const handleVoiceCall = () => {
    
    console.log("Start voice call with:", selectedConversation?.name);
  };

  const handleNewConversation = () => {
    
    console.log("Start new conversation");
  };


  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.chatContainer}>
      <div className={styles.threePane}>

        {/* Left Pane: Conversation List */}
        <aside className={styles.convList}>
          <div className={styles.convSearch}>
            <div className={styles.searchWrap}>
              <span className="material-symbols-outlined">search</span>
              <input 
                type="text" 
                placeholder="Search patients..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className={styles.convScroll}>
            {loading && <div className={styles.loading}>Loading conversations...</div>}
            
            {filteredConversations.map((conversation) => (
              <div 
                key={conversation.id}
                className={`${styles.convItem} ${selectedConversation?.id === conversation.id ? styles.active : ''}`}
                onClick={() => handleConversationClick(conversation)}
              >
                <div className={styles.convAvatar}>
                  <img alt={conversation.name} src={conversation.avatar || "https://via.placeholder.com/48"}/>
                  {conversation.isOnline && <div className={styles.onlineDot}></div>}
                  {!conversation.isOnline && conversation.isOnline === false && <div className={styles.offlineDot}></div>}
                  {conversation.unreadCount > 0 && (
                    <div className={styles.unreadBadge}>{conversation.unreadCount}</div>
                  )}
                </div>
                <div className={styles.convMeta}>
                  <div className={styles.convRow}>
                    <span className={styles.convName}>{conversation.name}</span>
                    <span className={styles.convTime}>{conversation.lastMessageTime}</span>
                  </div>
                  <p className={`${styles.convPreview} ${conversation.isTyping ? styles.typing : ''}`}>
                    {conversation.isTyping ? "Typing..." : conversation.lastMessage}
                  </p>
                </div>
              </div>
            ))}
            
            {!loading && filteredConversations.length === 0 && (
              <div className={styles.noResults}>No conversations found</div>
            )}
          </div>

          <div className={styles.newConvFooter}>
            <button className={styles.newConvBtn} onClick={handleNewConversation}>
              <span className="material-symbols-outlined">add</span>
              New Conversation
            </button>
          </div>
        </aside>

        {/* Center Pane: Chat Window */}
        <main className={styles.chatMain}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderLeft}>
                  <div className={styles.chatAvatarIcon}>
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <h2 className={styles.chatName}>{selectedConversation.name}</h2>
                    <div className={styles.chatStatus}>
                      <span className={styles.statusDot}></span>
                      <span className={styles.statusLabel}>
                        {selectedConversation.isOnline ? "Active Secure Session" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.chatHeaderActions}>
                  <button className={styles.iconBtnMuted} onClick={handleVideoCall}>
                    <span className="material-symbols-outlined">videocam</span>
                  </button>
                  <button className={styles.iconBtnMuted} onClick={handleVoiceCall}>
                    <span className="material-symbols-outlined">call</span>
                  </button>
                  <div className={styles.dividerV}></div>
                  <button className={styles.iconBtnMuted}>
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
              </div>

              {/* Message Feed */}
              <div className={styles.msgFeed}>
                <div className={styles.encBanner}>
                  <div className={styles.encPill}>
                    <span className="material-symbols-outlined">encrypted</span>
                    <span className={styles.text}>Messages are end-to-end encrypted</span>
                  </div>
                </div>

            {messages.map((message) => (
  message.isSentByMe ? (
    <div key={message.id} className={styles.msgOut}>
      <div className={styles.msgOutBody}>
        <div className={styles.bubbleOut}>
          <p>{message.text}</p>
        </div>

        <div className={styles.msgOutMeta}>
          <span className={styles.msgTime}>
            {message.timestamp}
          </span>

          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings:
                "'FILL' 1",
            }}
          >
            {message.isPending
              ? "schedule"
              : "check_circle"}
          </span>
        </div>
      </div>
    </div>
  ) : (
              <div key={message.id} className={styles.msgIn}>
                <img
                  className={styles.msgInAvatar}
                  alt={message.senderName}
                  src={
                    message.senderAvatar ||
                    "https://via.placeholder.com/32"
                  }
                />

                <div className={styles.msgInBody}>
                  <div className={styles.bubbleIn}>
                    <p>{message.text}</p>
                  </div>

                  <span className={styles.msgTime}>
                    {message.timestamp}
                  </span>
                </div>
              </div>
            )
          ))}

          <div ref={messagesEndRef}></div>
              </div>

              {/* Input Console */}
              <div className={styles.inputConsole}>
                <div className={styles.inputWrap}>
                  <button className={styles.inputAttach}>
                    <span className="material-symbols-outlined">add</span>
                    <input type="file" hidden onChange={handleFileUpload} />
                  </button>
                  <input 
                    className={styles.msgInput} 
                    type="text" 
                    placeholder="Type a secure message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {if (e.key === "Enter") {handleSendMessage();}}}
                  />
                  <div className={styles.inputActions}>
                    <button className={styles.emojiBtn}>
                      <span className="material-symbols-outlined">mood</span>
                    </button>
                    <button className={styles.sendBtn} onClick={handleSendMessage}>
                      <span>Send</span>
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.noConversationSelected}>
              <span className="material-symbols-outlined">chat</span>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </main>

        {/* Right Pane: Patient Context Sidebar */}
        <aside className={styles.patientSidebar}>
          {selectedConversation ? (
            <>
              <div className={styles.patientProfile}>
                <img className={styles.patientProfilePic} alt={patientProfile.name} src={patientProfile.picture || "https://via.placeholder.com/96"}/>
                <h3 className={styles.patientName}>{patientProfile.name}</h3>
                <p className={styles.patientId}>ID: {patientProfile.id}</p>
                <div className={styles.conditionTags}>
                  {patientProfile.conditions?.map((condition, index) => (
                    <span key={index} className={index % 2 === 0 ? styles.badgeBlue : styles.badgePurple}>
                      {condition}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.patientDetails}>
                <section>
                  <p className={styles.detailSectionTitle}>Upcoming Event</p>
                  <div className={styles.apptCard}>
                    <div className={styles.apptInner}>
                      <div className={styles.apptIcon}>
                        <span className="material-symbols-outlined">calendar_today</span>
                      </div>
                      <div>
                        <p className={styles.apptTitle}>Next Appointment</p>
                        <p className={styles.apptDate}>
                          {patientProfile.nextAppointment?.date} • {patientProfile.nextAppointment?.time}
                        </p>
                        <button className={styles.apptManage}>Manage Schedule</button>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className={styles.detailSectionHeader}>
                    <p className={styles.detailSectionTitle} style={{ marginBottom: 0 }}>Shared Documents</p>
                    <span className={styles.viewAll} onClick={handleViewAllDocuments}>View All</span>
                  </div>
                  <div className={styles.docList}>
                    {patientProfile.documents?.map((doc, index) => (
                      <div key={index} className={styles.docItem} onClick={() => handleDownloadDocument(doc.id)}>
                        <div className={`${styles.docIcon} ${doc.type === 'pdf' ? styles.docIconPdf : styles.docIconImg}`}>
                          <span className="material-symbols-outlined">
                            {doc.type === 'pdf' ? 'picture_as_pdf' : 'image'}
                          </span>
                        </div>
                        <div className={styles.docMeta}>
                          <p className={styles.docName}>{doc.name}</p>
                          <p className={styles.docSize}>{doc.size} • {doc.date}</p>
                        </div>
                        <span className={`material-symbols-outlined ${styles.docDl}`}>download</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className={styles.patientFooter}>
                <button className={styles.openFileBtn} onClick={handleOpenPatientFile}>
                  <span className="material-symbols-outlined">medical_information</span>
                  Open Patient File
                </button>
              </div>
            </>
          ) : (
            <div className={styles.noPatientSelected}>
              <span className="material-symbols-outlined">medical_information</span>
              <p>Select a patient to view details</p>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}

export default Chat;