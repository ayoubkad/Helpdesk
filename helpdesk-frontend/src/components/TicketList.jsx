import { useState, useEffect } from "react";
import axios from "axios";
import TicketCard from "./TicketCard";

function TicketList() {

    const [tickets, setTickets] = useState([]);

    const getTickets = async () => {
        try {
            const response = await axios.get("http://localhost:8081/api/tickets");
            setTickets(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getTickets();
    }, []);

    return (
        <div>
            {tickets.map((ticket) => (
                <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                />
            ))}
        </div>
    );
}

export default TicketList;