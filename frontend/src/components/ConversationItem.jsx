import styles from "../pages/conversation.module.css"

function ConversationItem({ conversation, onClick }) {
    const currentUserId = Number(localStorage.getItem("userId"));

    function getDisplayName() {
        if (conversation.conversation.isGroup) {
            return conversation.conversation.name;
        }
        const otherParticipant = conversation.conversation.participants.find(
            p => p.userId !== currentUserId
        );
        return otherParticipant ? otherParticipant.user.name : `Conversation #${conversation.conversation.id}`;
    }

    return (
        <>
            <div className={styles.item} onClick={() => onClick(conversation)}>
                <h3 className={styles.conversationName}>
                    {getDisplayName()}
                </h3>
            </div>
        </>
    );
}

export default ConversationItem;