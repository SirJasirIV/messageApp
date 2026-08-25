import ConversationItem from "./ConversationItem.jsx";


function ConversationList({ conversations, onSelect }){
    return (
conversations.map(conversation => (
    <ConversationItem
        key={conversation.conversation.id}
        conversation={conversation}
        onClick={() => onSelect(conversation)}
    />
)))
}

export default ConversationList;