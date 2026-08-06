import "./Dashboard.css";
import TicketList from "../components/TicketList";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar"
function Dashboard(){
    return(
        <>

<div className="dashboard-container">
    
    <main className="dashboard-content">
    <h2> Dashboard </h2>
    <p>welcome to Helpdesk</p>
    
    
    <input type="text" placeholder="rechercher un ticket..." className="search-bar">
    </input>
    <div className="stat-container">
        <div className="stat-card">
            <h3> Total </h3>
            <p>24</p>
        
        </div>
        <div className="stat-card">
            <h3>en attente</h3>
            <p>10</p>

        </div>
        <div className="stat-card">
            <h3>en cours</h3>
            <p>8</p>
        </div>
        <div className="stat-card">
            <h3>resolus</h3>
            <p>6</p>
        </div>

     </div>

     <button className="create-btn"> créer un ticket</button>
     <TicketList/>
     </main>
     </div>
     </>
    );
}
export default Dashboard ;