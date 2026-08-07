
function TicketCard ({ticket}){
    return (
        <div className="ticket-card">
            <h3>{ticket.titre}</h3>
            <p>{ticket.description}</p>
            <p> <strong>priority</strong> {ticket.priority}</p>
            <p> <strong>statu</strong> {ticket.status}</p>
            <p> <strong>date</strong> {ticket.date}</p>
            <button> voir details </button>
        </div>
    );
}
export default TicketCard;