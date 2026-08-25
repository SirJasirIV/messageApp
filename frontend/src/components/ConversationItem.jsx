import styles from "../pages/conversation.module.css"

function ConversationItem({ conversation, onClick }) {
    return (
    <>
        <div className={styles.item} onClick={() => onClick(conversation)}>
                <h3 className={styles.conversationName}>
        {conversation.conversation.isGroup
            ? conversation.conversation.name
            : `Conversation #${conversation.conversation.id}`}
    </h3>
       </div>

    </>
    );
}

export default ConversationItem;