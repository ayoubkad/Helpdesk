import TicketCard from "./TicketCard";
function TicketList(){
    const tickets= [
        {
            id :1,
            titre : "connection impossible",
            description : " l'utilisateur ne peut pas acceder a son compte",
            priority : "Haute",
            status : "en attent",
            date : "4/08/2026"
        },
        {
            id : 2,
            titre : "imprimante en panne",
            description : "l'imprimante de bureau ne repond plus ",
            priority : "moyenne",
            status : "en cours",
            date : "02/08/2026"
        },
        {
            id: 3,
            titre: "Erreur Outlook",
            description: "Impossible d'envoyer des emails.",
            priority: "Faible",
            status: "Résolu",
            date: "02/08/2026",
        }
            
    ];
    return(
        <div>
            {tickets.map((ticket)   => (<TicketCard key = {ticket.id}
            ticket = {ticket} /> ))}
        </div>
    );

    
}
export default TicketList;