import ConversationItem from "./ConversationItem.jsx";


function ConversationList({ conversations = [], onSelect, unread = {} }) {
    return conversations.map((conversation) => (
        <ConversationItem
            key={conversation.conversation.id}
            conversation={conversation}
            unread={unread[conversation.conversation.id] || 0}
            onClick={() => onSelect(conversation)}
        />
    ));
}
export default ConversationList;